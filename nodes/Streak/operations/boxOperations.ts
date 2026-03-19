import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { streakApiRequest, validateParameters, handlePagination } from './utils';
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
			// No search query - use regular list boxes endpoint
			const queryParams: IDataObject = { limit };
			if (stageKeyFilter) {
				queryParams.stageKey = stageKeyFilter;
			}

			if (returnAll) {
				return await handlePagination(
					this,
					`/pipelines/${pipelineKey}/boxes`,
					returnAll,
					limit,
					queryParams,
				);
			} else {
				return await streakApiRequest(
					this,
					'GET',
					`/pipelines/${pipelineKey}/boxes`,
					undefined,
					queryParams,
				);
			}
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

		if (additionalFields.assignedToTeamKeyOrUserKey) {
			body.assignedToTeamKeyOrUserKey = additionalFields.assignedToTeamKeyOrUserKey;
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

		if (updateFields.assignedToTeamKeyOrUserKey) {
			body.assignedToTeamKeyOrUserKey = updateFields.assignedToTeamKeyOrUserKey;
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
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		if (returnAll) {
			return await handlePagination(
				this,
				`/boxes/${boxKey}/timeline`,
				returnAll,
				limit,
			);
		} else {
			return await streakApiRequest(
				this,
				'GET',
				`/boxes/${boxKey}/timeline`,
				undefined,
				{ limit },
			);
		}
	}

	throw new NodeOperationError(
		this.getNode(),
		`The box operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
