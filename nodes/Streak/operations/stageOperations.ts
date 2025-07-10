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
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		
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
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const stageKeyParam = this.getNodeParameter('stageKey', itemIndex) as string | { mode: string; value: string };
		const stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam.value;
		
		validateParameters.call(this, { pipelineKey, stageKey }, ['pipelineKey', 'stageKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/pipelines/${pipelineKey}/stages/${stageKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createStage') {
		// Create Stage operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const stageName = this.getNodeParameter('stageName', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { pipelineKey, stageName }, ['pipelineKey', 'stageName'], itemIndex);
		 
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
			body,
		);
	} else if (operation === 'updateStage') {
		// Update Stage operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const stageKeyParam = this.getNodeParameter('stageKey', itemIndex) as string | { mode: string; value: string };
		const stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam.value;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { pipelineKey, stageKey }, ['pipelineKey', 'stageKey'], itemIndex);
		
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
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const stageKeyParam = this.getNodeParameter('stageKey', itemIndex) as string | { mode: string; value: string };
		const stageKey = typeof stageKeyParam === 'string' ? stageKeyParam : stageKeyParam.value;
		
		validateParameters.call(this, { pipelineKey, stageKey }, ['pipelineKey', 'stageKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'DELETE',
			`/pipelines/${pipelineKey}/stages/${stageKey}`,
			apiKey,
			itemIndex,
		);
	}

	throw new NodeOperationError(this.getNode(), `The stage operation "${operation}" is not supported!`, { itemIndex });
}
