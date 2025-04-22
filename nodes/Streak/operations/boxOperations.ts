import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { validateParameters } from './utils';
import { StreakApiService } from '../services';

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
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
		
		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);
		
		return await StreakApiService.box().listBoxes(this, apiKey, pipelineKey, returnAll, limit);
	} else if (operation === 'getBox') {
		// Get Box operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		
		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);
		
		return await StreakApiService.box().getBox(this, apiKey, boxKey);
	} else if (operation === 'getMultipleBoxes') {
		// Get Multiple Boxes operation
		const boxKeys = this.getNodeParameter('boxKeys', itemIndex) as string[];
		
		validateParameters.call(this, { boxKeys }, ['boxKeys'], itemIndex);
		
		return await StreakApiService.box().getMultipleBoxes(this, apiKey, boxKeys);
	} else if (operation === 'createBox') {
		// Create Box operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const boxName = this.getNodeParameter('boxName', itemIndex) as string;
		const stageKey = this.getNodeParameter('stageKey', itemIndex, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { pipelineKey, boxName }, ['pipelineKey', 'boxName'], itemIndex);
		
		return await StreakApiService.box().createBox(this, apiKey, pipelineKey, boxName, stageKey, additionalFields);
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
		
		return await StreakApiService.box().updateBox(this, apiKey, boxKey, updateFields);
	} else if (operation === 'deleteBox') {
		// Delete Box operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		
		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);
		
		return await StreakApiService.box().deleteBox(this, apiKey, boxKey);
	} else if (operation === 'getTimeline') {
		// Get Timeline operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
		
		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);
		
		return await StreakApiService.box().getBoxTimeline(this, apiKey, boxKey, returnAll, limit);
	}

	throw new NodeOperationError(this.getNode(), `The box operation "${operation}" is not supported!`, { itemIndex });
}
