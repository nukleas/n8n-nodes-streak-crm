import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

/**
 * Handle stage-related operations for the Streak API
 */
export async function handleStageOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle stage operations
	if (operation === 'listStages') {
		// List Stages operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'GET',
			`/pipelines/${pipelineKey}/stages`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'getStage') {
		// Get Stage operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const stageKeyParam = this.getNodeParameter('stageKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam.value;

		validateParameters.call(
			this,
			{ pipelineKey, stageKey },
			['pipelineKey', 'stageKey'],
			itemIndex,
		);

		return await makeStreakRequest.call(
			this,
			'GET',
			`/pipelines/${pipelineKey}/stages/${stageKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createStage') {
		// Create Stage operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const stageName = this.getNodeParameter('stageName', itemIndex) as string;
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		validateParameters.call(
			this,
			{ pipelineKey, stageName },
			['pipelineKey', 'stageName'],
			itemIndex,
		);

		const body: IDataObject = {
			name: stageName,
		};

		if (additionalFields.color) {
			body.color = additionalFields.color;
		}

		return await makeStreakRequest.call(
			this,
			'PUT',
			`/pipelines/${pipelineKey}/stages`,
			apiKey,
			itemIndex,
		);

		// Prepare url-encoded body (required by Streak API)
		const formParams = new URLSearchParams();
		formParams.append('name', stageName);

		if (additionalFields.color) {
			formParams.append('color', additionalFields.color as string);
		}

		// Use direct HTTP request with url-encoded format
		try {
			const response = await this.helpers.httpRequest({
				method: 'PUT',
				url: `https://api.streak.com/api/v1/pipelines/${pipelineKey}/stages`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Accept: 'application/json',
				},
				auth: {
					username: apiKey,
					password: '',
				},
				body: formParams.toString(),
			});

			return response;
		} catch (error) {
			// Handle specific error cases with user-friendly messages
			// Try to get the actual response body that contains the error message
			let apiErrorMessage = '';
			try {
				const responseData = error.response?.data || error.response?.body;
				if (responseData && typeof responseData === 'object' && responseData.error) {
					apiErrorMessage = responseData.error;
				} else if (responseData && typeof responseData === 'string') {
					const parsed = JSON.parse(responseData);
					apiErrorMessage = parsed.error || responseData;
				}
			} catch (e) {
				// If we can't parse the response, use the original error message
				apiErrorMessage = error.message || 'Unknown error';
			}

			// Handle common error cases with user-friendly messages
			if (apiErrorMessage.includes('stage name already exists')) {
				throw new NodeOperationError(
					this.getNode(),
					`Stage name "${stageName}" already exists in this pipeline. Please choose a different name.`,
					{ itemIndex },
				);
			}

			// For other errors, provide a clear message
			throw new NodeOperationError(this.getNode(), `Failed to create stage: ${apiErrorMessage}`, {
				itemIndex,
			});
		}
	} else if (operation === 'updateStage') {
		// Update Stage operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const stageKeyParam = this.getNodeParameter('stageKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam.value;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		validateParameters.call(
			this,
			{ pipelineKey, stageKey },
			['pipelineKey', 'stageKey'],
			itemIndex,
		);

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

		if (updateFields.color) {
			body.color = updateFields.color;
		}

		return await makeStreakRequest.call(
			this,
			'POST',
			`/pipelines/${pipelineKey}/stages/${stageKey}`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'deleteStage') {
		// Delete Stage operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const stageKeyParam = this.getNodeParameter('stageKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam.value;

		validateParameters.call(
			this,
			{ pipelineKey, stageKey },
			['pipelineKey', 'stageKey'],
			itemIndex,
		);

		return await makeStreakRequest.call(
			this,
			'DELETE',
			`/pipelines/${pipelineKey}/stages/${stageKey}`,
			apiKey,
			itemIndex,
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The stage operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
