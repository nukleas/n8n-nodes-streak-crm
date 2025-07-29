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
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		return await StreakApiService.getPipeline(this, apiKey, pipelineKey);
	} else if (operation === 'createPipeline') {
		// Create Pipeline operation
		const pipelineName = this.getNodeParameter('pipelineName', itemIndex) as string;
		const teamKeyParam = this.getNodeParameter('teamKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const teamKey = typeof teamKeyParam === 'string' ? teamKeyParam : teamKeyParam.value;

		// Get stages from the fixedCollection input and convert to comma-separated string
		const stagesInput = this.getNodeParameter('stages', itemIndex, { stage: [] }) as {
			stage: Array<{ name: string }>;
		};
		const stageNames = stagesInput.stage
			.map((stage) => stage.name)
			.filter((name) => name.trim() !== '')
			.join(',');

		// Get additional options
		const additionalOptions = this.getNodeParameter(
			'additionalOptions',
			itemIndex,
			{},
		) as IDataObject;
		const teamWide = additionalOptions.teamWide as boolean | undefined;

		// Process custom fields if provided
		let fieldNames = '';
		let fieldTypes = '';

		if (additionalOptions.customFields) {
			const customFieldsInput = additionalOptions.customFields as {
				field: Array<{ name: string; type: string }>;
			};
			const fields = customFieldsInput.field.filter((field) => field.name.trim() !== '');

			if (fields.length > 0) {
				fieldNames = fields.map((field) => field.name).join(',');
				fieldTypes = fields.map((field) => field.type).join(',');
			}
		}

		validateParameters.call(
			this,
			{ pipelineName, teamKey },
			['pipelineName', 'teamKey'],
			itemIndex,
		);

		// Create pipeline with all optional parameters
		return await StreakApiService.createPipeline(
			this,
			apiKey,
			pipelineName,
			teamKey,
			stageNames || undefined,
			teamWide,
			fieldNames || undefined,
			fieldTypes || undefined,
		);
	} else if (operation === 'updatePipeline') {
		// Update Pipeline operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
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
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		return await StreakApiService.deletePipeline(this, apiKey, pipelineKey);
	} else if (operation === 'moveBoxesBatch') {
		// Move Boxes (Batch) operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
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
		const targetPipelineKeyParam = this.getNodeParameter('targetPipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const targetPipelineKey =
			typeof targetPipelineKeyParam === 'string'
				? targetPipelineKeyParam
				: targetPipelineKeyParam.value;

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
