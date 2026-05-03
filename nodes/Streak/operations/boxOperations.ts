import { IExecuteFunctions, IDataObject, NodeOperationError  } from 'n8n-workflow';
import { streakApiRequest, validateParameters, handlePagination } from './utils';

interface StreakFieldDef {
	key: string;
	name: string;
	type: string;
	dropdownSettings?: { items: Array<{ key: string; name: string }> };
	tagSettings?: { tags: Array<{ key: string; tag: string }> };
}

async function getFieldDef(
	context: IExecuteFunctions,
	boxKey: string,
	fieldKey: string,
): Promise<StreakFieldDef | undefined> {
	const box = (await streakApiRequest(context, 'GET', `/boxes/${boxKey}`)) as { pipelineKey: string };
	if (!box?.pipelineKey) return undefined;
	const fields = (await streakApiRequest(
		context, 'GET', `/pipelines/${box.pipelineKey}/fields`,
	)) as unknown as StreakFieldDef[];
	return fields.find((f) => f.key === fieldKey);
}

async function resolveDropdownValue(
	context: IExecuteFunctions,
	boxKey: string,
	fieldKey: string,
	value: string,
): Promise<string> {
	const field = await getFieldDef(context, boxKey, fieldKey);
	const items = field?.dropdownSettings?.items || [];
	// If value already matches a key, return as-is
	const byKey = items.find((i) => i.key === value);
	if (byKey) return value;
	// Otherwise try to match by display name
	const byName = items.find((i) => i.name.toLowerCase() === value.toLowerCase());
	return byName ? byName.key : value;
}


/**
 * Handle box-related operations for the Streak API
 */
export async function handleBoxOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	// Handle box operations
	if (operation === 'listBoxes') {
		// List Boxes in Pipeline operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const stageKeyFilterParam = this.getNodeParameter('stageKeyFilter', itemIndex, '') as
			| string
			| { mode: string; value: string };
		const stageKeyFilter =
			typeof stageKeyFilterParam === 'string'
				? stageKeyFilterParam
				: stageKeyFilterParam?.value || '';
		const searchQuery = this.getNodeParameter('searchQuery', itemIndex, '') as string;
		const trimmedSearchQuery = searchQuery?.trim();
		const sortBy = this.getNodeParameter('sortBy', itemIndex, 'lastUpdatedTimestamp') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		// If search query is provided, use the search endpoint
		if (trimmedSearchQuery) {
			// Use the search endpoint for queries
			const searchParams: IDataObject = { query: trimmedSearchQuery };
			if (pipelineKey) {
				searchParams.pipelineKey = pipelineKey;
			}
			if (stageKeyFilter) {
				searchParams.stageKey = stageKeyFilter;
			}

			const searchResponse = (await streakApiRequest(
				this,
				'GET',
				'/search',
				undefined,
				searchParams,
				'v1',
			)) as IDataObject;

			// Extract boxes from search response
			let results: IDataObject[] = [];
			if (
				searchResponse?.results &&
				(searchResponse.results as IDataObject).boxes &&
				Array.isArray((searchResponse.results as IDataObject).boxes)
			) {
				results = (searchResponse.results as IDataObject).boxes as IDataObject[];
			}

			// Handle empty search results consistently with normal listing
			if (!results || results.length === 0) {
				return [];
			}

			// Apply limit if returnAll is false
			if (!returnAll && limit && results.length > limit) {
				return results.slice(0, limit);
			}

			return results;
		} else {
			// No search query - use regular list boxes endpoint (v1 supports page/limit/sortBy)
			const queryParams: IDataObject = {};
			if (stageKeyFilter) {
				queryParams.stageKey = stageKeyFilter;
			}
			if (sortBy) {
				queryParams.sortBy = sortBy;
			}

			return await handlePagination(
				this,
				`/pipelines/${pipelineKey}/boxes`,
				returnAll,
				returnAll ? 100 : limit,
				queryParams,
				'v1',
			);
		}
	} else if (operation === 'getBox') {
		// Get Box operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		return await streakApiRequest(this, 'GET', `/boxes/${boxKey}`);
	} else if (operation === 'getMultipleBoxes') {
		// Get Multiple Boxes operation
		const boxKeys = this.getNodeParameter('boxKeys', itemIndex) as string[];

		validateParameters.call(this, { boxKeys }, ['boxKeys'], itemIndex);

		// Make individual requests since Streak API doesn't have a true batch endpoint for specific box keys
		const boxes: IDataObject[] = [];
		for (const boxKey of boxKeys) {
			try {
				const response = await streakApiRequest(this, 'GET', `/boxes/${boxKey}`);
				// Normalize response to ensure it's an array of IDataObject
				const normalizedResponse = Array.isArray(response) ? response : [response];
				boxes.push(...normalizedResponse);
			} catch (error) {
				// Use n8n logger for consistent logging
				this.logger?.warn(`Failed to retrieve box ${boxKey}`, { error: error.message });
			}
		}

		// Ensure we always return an array
		return boxes;
	} else if (operation === 'createBox') {
		// Create Box operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const boxName = this.getNodeParameter('boxName', itemIndex) as string;
		const stageKeyParam = this.getNodeParameter('stageKey', itemIndex, '') as
			| string
			| { mode: string; value: string };
		const stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam?.value || '';
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		validateParameters.call(this, { pipelineKey, boxName }, ['pipelineKey', 'boxName'], itemIndex);

		const body: IDataObject = {
			name: boxName,
		};

		if (stageKey) {
			body.stageKey = stageKey;
		}

		if (additionalFields.notes) {
			body.notes = additionalFields.notes;
		}

		if (additionalFields.assignedToSharingEntries) {
			const entries = additionalFields.assignedToSharingEntries as string[];
			const list = (Array.isArray(entries) ? entries : [entries]).filter((e) => !!e);
			body.assignedToSharingEntries = JSON.stringify(list.map((email) => ({ email })));
		}

		return await streakApiRequest(this, 'POST', `/pipelines/${pipelineKey}/boxes`, body);
	} else if (operation === 'updateBox') {
		// Update Box operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		validateParameters.call(this, { boxKey, updateFields }, ['boxKey', 'updateFields'], itemIndex);

		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be specified',
				{ itemIndex },
			);
		}

		const body: IDataObject = {};

		if (updateFields.name) {
			body.name = updateFields.name;
		}

		if (updateFields.notes) {
			body.notes = updateFields.notes;
		}

		if (updateFields.stageKey) {
			// Handle resourceLocator format for stageKey
			const stageKeyParam = updateFields.stageKey as string | { mode: string; value: string };
			body.stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam.value;
		}

		if (updateFields.assignedToSharingEntries) {
			const entries = updateFields.assignedToSharingEntries as string[];
			const list = (Array.isArray(entries) ? entries : [entries]).filter((e) => !!e);
			body.assignedToSharingEntries = list;
		}

		// Handle custom fields
		const customFields = updateFields.customFields as IDataObject | undefined;
		if (customFields) {
			const fields: IDataObject = {};

			const extractRlocValue = (param: unknown): string => {
				if (typeof param === 'string') return param;
				const obj = param as { mode: string; value: string };
				return obj.value;
			};

			// Text / numeric fields
			if (customFields.field) {
				for (const entry of customFields.field as IDataObject[]) {
					fields[extractRlocValue(entry.key)] = entry.value;
				}
			}

			// Checkbox fields
			if (customFields.checkboxField) {
				for (const entry of customFields.checkboxField as IDataObject[]) {
					fields[extractRlocValue(entry.key)] = entry.value;
				}
			}

			// Date fields
			if (customFields.dateField) {
				for (const entry of customFields.dateField as IDataObject[]) {
					fields[extractRlocValue(entry.key)] = new Date(entry.value as string).getTime();
				}
			}

			// Dropdown fields — resolve display name to key if "By Value" mode
			if (customFields.dropdownField) {
				for (const entry of customFields.dropdownField as IDataObject[]) {
					const fieldKey = extractRlocValue(entry.key);
					let value = extractRlocValue(entry.value);

					const valueParam = entry.value as { mode?: string; value: string } | string;
					if (typeof valueParam === 'object' && valueParam.mode === 'id') {
						value = await resolveDropdownValue(this, boxKey, fieldKey, value);
					}

					fields[fieldKey] = value;
				}
			}

			// Tag fields — multiOptions returns an array of selected tag keys
			if (customFields.tagField) {
				for (const entry of customFields.tagField as IDataObject[]) {
					const fieldKey = extractRlocValue(entry.key);
					fields[fieldKey] = entry.value as string[];
				}
			}

			body.fields = fields;
		}

		return await streakApiRequest(this, 'POST', `/boxes/${boxKey}`, body);
	} else if (operation === 'deleteBox') {
		// Delete Box operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		return await streakApiRequest(this, 'DELETE', `/boxes/${boxKey}`);
	} else if (operation === 'getTimeline') {
		// Get Timeline operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const direction = this.getNodeParameter('direction', itemIndex, 'Descending') as string;
		const timelineFilters = this.getNodeParameter('timelineFilters', itemIndex, []) as string[];
		const startTimestampValue = this.getNodeParameter('startTimestamp', itemIndex, '') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		const baseQuery: IDataObject = { direction };
		if (timelineFilters.length > 0) {
			baseQuery.filters = timelineFilters;
		}
		if (startTimestampValue) {
			const ts = new Date(startTimestampValue).getTime();
			if (!isNaN(ts)) {
				baseQuery.startTimestamp = ts;
			}
		}

		if (returnAll) {
			let allResults: IDataObject[] = [];
			let nextPage: string | undefined;

			do {
				const query: IDataObject = nextPage
					? { nextPageToken: nextPage }
					: { ...baseQuery, limit: 100 };

				const response = (await streakApiRequest(
					this,
					'GET',
					`/boxes/${boxKey}/timeline`,
					undefined,
					query,
					undefined,
					{ arrayFormat: 'repeat' },
				)) as IDataObject;

				if (response?.entries && Array.isArray(response.entries)) {
					allResults = [...allResults, ...(response.entries as IDataObject[])];
				}

				nextPage = response?.nextPage as string | undefined;
			} while (nextPage);

			return allResults;
		} else {
			const query: IDataObject = { ...baseQuery, limit };

			const response = (await streakApiRequest(
				this,
				'GET',
				`/boxes/${boxKey}/timeline`,
				undefined,
				query,
				undefined,
				{ arrayFormat: 'repeat' },
			)) as IDataObject;

			if (response?.entries && Array.isArray(response.entries)) {
				return response.entries as IDataObject[];
			}

			return Array.isArray(response) ? response : [response];
		}
	}

	throw new NodeOperationError(
		this.getNode(),
		`The box operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
