import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { validateParameters } from './utils';
import { StreakApiService } from '../services/StreakApiService';

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
		return await StreakApiService.getPipelines(this, apiKey);
	} else if (operation === 'getPipeline') {
		// Get Pipeline operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as string | { mode: string; value: string };
		const pipelineKey = typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		return await StreakApiService.getPipeline(this, apiKey, pipelineKey);
	} else if (operation === 'createPipeline') {
		// Create Pipeline operation
		const pipelineName = this.getNodeParameter('pipelineName', itemIndex) as string;

		validateParameters.call(this, { pipelineName }, ['pipelineName'], itemIndex);

		return await StreakApiService.createPipeline(this, apiKey, pipelineName);
	} else if (operation === 'updatePipeline') {
		// Update Pipeline operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as string | { mode: string; value: string };
		const pipelineKey = typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be specified',
				{ itemIndex },
			);
		}

		// Build update payload from updateFields
		const updateData: IDataObject = {};
		if (updateFields.name) updateData.name = updateFields.name;
		if (updateFields.description) updateData.description = updateFields.description;
		if (updateFields.orgWide !== undefined) updateData.orgWide = updateFields.orgWide;
		if (updateFields.teamKey) updateData.teamKey = updateFields.teamKey;

		return await StreakApiService.updatePipelineWithData(this, apiKey, pipelineKey, updateData);
	} else if (operation === 'deletePipeline') {
		// Delete Pipeline operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as string | { mode: string; value: string };
		const pipelineKey = typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		return await StreakApiService.deletePipeline(this, apiKey, pipelineKey);
	} else if (operation === 'moveBoxesBatch') {
		// Move Boxes (Batch) operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as string | { mode: string; value: string };
		const pipelineKey = typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		// Get boxKeys as string or string[] and ensure it's properly formatted as array
		let boxKeysInput: string[] = [];
		const rawInput = this.getNodeParameter('boxKeys', itemIndex);

		// Handle different possible formats coming from the n8n interface
		if (typeof rawInput === 'string') {
			// If it's a comma-separated string, split it
			boxKeysInput = rawInput
				.split(',')
				.map((key) => key.trim())
				.filter(Boolean);
		} else if (Array.isArray(rawInput)) {
			// If it's already an array, use it directly
			boxKeysInput = rawInput.map((item) => String(item)).filter(Boolean);
		}
		const targetPipelineKeyParam = this.getNodeParameter('targetPipelineKey', itemIndex) as string | { mode: string; value: string };
		const targetPipelineKey = typeof targetPipelineKeyParam === 'string' ? targetPipelineKeyParam : targetPipelineKeyParam.value;

		validateParameters.call(
			this,
			{ pipelineKey, boxKeysInput, targetPipelineKey },
			['pipelineKey', 'boxKeysInput', 'targetPipelineKey'],
			itemIndex,
		);

		return await StreakApiService.moveBoxesBatch(
			this,
			apiKey,
			pipelineKey,
			targetPipelineKey,
			boxKeysInput,
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The pipeline operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
