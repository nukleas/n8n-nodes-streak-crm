import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

/**
 * Handle pipeline-related operations for the Streak API
 */
export async function handlePipelineOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle pipeline operations
	if (operation === 'listAllPipelines') {
		// List All Pipelines operation
		return await makeStreakRequest.call(
			this,
			'GET',
			'/pipelines',
			apiKey,
			itemIndex,
		);
	} else if (operation === 'getPipeline') {
		// Get Pipeline operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		
		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/pipelines/${pipelineKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createPipeline') {
		// Create Pipeline operation
		const pipelineName = this.getNodeParameter('pipelineName', itemIndex) as string;
		
		validateParameters.call(this, { pipelineName }, ['pipelineName'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'PUT',
			'/pipelines',
			apiKey,
			itemIndex,
			{
				name: pipelineName,
			},
		);
	} else if (operation === 'updatePipeline') {
		// Update Pipeline operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const pipelineName = this.getNodeParameter('pipelineName', itemIndex) as string;
		
		validateParameters.call(
			this, 
			{ pipelineKey, pipelineName }, 
			['pipelineKey', 'pipelineName'], 
			itemIndex,
		);
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/pipelines/${pipelineKey}`,
			apiKey,
			itemIndex,
			{
				name: pipelineName,
			},
		);
	} else if (operation === 'deletePipeline') {
		// Delete Pipeline operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		
		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'DELETE',
			`/pipelines/${pipelineKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'moveBoxesBatch') {
		// Move Boxes (Batch) operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const boxKeysInput = this.getNodeParameter('boxKeys', itemIndex) as string[];
		const targetPipelineKey = this.getNodeParameter('targetPipelineKey', itemIndex) as string;
		
		validateParameters.call(
			this, 
			{ pipelineKey, boxKeysInput, targetPipelineKey }, 
			['pipelineKey', 'boxKeysInput', 'targetPipelineKey'], 
			itemIndex,
		);
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/pipelines/${pipelineKey}/moveBoxes`,
			apiKey,
			itemIndex,
			{
				targetPipelineKey,
				boxKeys: boxKeysInput,
			},
		);
	}

	throw new NodeOperationError(this.getNode(), `The pipeline operation "${operation}" is not supported!`, { itemIndex });
}
