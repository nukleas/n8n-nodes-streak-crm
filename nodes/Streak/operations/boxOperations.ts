import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters, handlePagination } from './utils';
import { StreakApiService } from '../services/StreakApiService';
/**
 * Handle box-related operations for the Streak API
 */
export async function handleBoxOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
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
			const results = await StreakApiService.searchBoxes(
				this,
				apiKey,
				trimmedSearchQuery,
				pipelineKey,
				stageKeyFilter,
			);

			// Handle empty search results consistently with normal listing
			if (!results || (Array.isArray(results) && results.length === 0)) {
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
				return await handlePagination.call(
					this,
					`/pipelines/${pipelineKey}/boxes`,
					apiKey,
					returnAll,
					itemIndex,
					limit,
					queryParams,
				);
			} else {
				return await makeStreakRequest.call(
					this,
					'GET',
					`/pipelines/${pipelineKey}/boxes`,
					apiKey,
					itemIndex,
					undefined,
					queryParams,
				);
			}
		}
	} else if (operation === 'getBox') {
		// Get Box operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		return await makeStreakRequest.call(this, 'GET', `/boxes/${boxKey}`, apiKey, itemIndex);
	} else if (operation === 'getMultipleBoxes') {
		// Get Multiple Boxes operation
		const boxKeys = this.getNodeParameter('boxKeys', itemIndex) as string[];

		validateParameters.call(this, { boxKeys }, ['boxKeys'], itemIndex);

		// Make individual requests since Streak API doesn't have a true batch endpoint for specific box keys
		const boxes: IDataObject[] = [];
		for (const boxKey of boxKeys) {
			try {
				const response = await makeStreakRequest.call(
					this,
					'GET',
					`/boxes/${boxKey}`,
					apiKey,
					itemIndex,
				);
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

		return await makeStreakRequest.call(
			this,
			'POST',
			`/pipelines/${pipelineKey}/boxes`,
			apiKey,
			itemIndex,
			body,
		);
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
		return await makeStreakRequest.call(this, 'POST', `/boxes/${boxKey}`, apiKey, itemIndex, body);
	} else if (operation === 'deleteBox') {
		// Delete Box operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		return await makeStreakRequest.call(this, 'DELETE', `/boxes/${boxKey}`, apiKey, itemIndex);
	} else if (operation === 'getTimeline') {
		// Get Timeline operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		if (returnAll) {
			return await handlePagination.call(
				this,
				`/boxes/${boxKey}/timeline`,
				apiKey,
				returnAll,
				itemIndex,
				limit,
			);
		} else {
			return await makeStreakRequest.call(
				this,
				'GET',
				`/boxes/${boxKey}/timeline`,
				apiKey,
				itemIndex,
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
