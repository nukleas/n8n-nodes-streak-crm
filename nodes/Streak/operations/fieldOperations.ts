import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { validateParameters } from './utils';
import { FieldsService } from '../services/Fields';

/**
 * Handle field-related operations for the Streak API
 */
export async function handleFieldOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle field operations
	if (operation === 'listFields') {
		// List Fields operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		
		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);
		
		const fieldsService = new FieldsService(apiKey, pipelineKey);
		return await fieldsService.query();
	} else if (operation === 'getField') {
		// Get Field operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		
		validateParameters.call(this, { pipelineKey, fieldKey }, ['pipelineKey', 'fieldKey'], itemIndex);
		
		const fieldsService = new FieldsService(apiKey, pipelineKey);
		return await fieldsService.get(fieldKey);
	} else if (operation === 'createField') {
		// Create Field operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const fieldName = this.getNodeParameter('fieldName', itemIndex) as string;
		const fieldType = this.getNodeParameter('fieldType', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { pipelineKey, fieldName, fieldType }, ['pipelineKey', 'fieldName', 'fieldType'], itemIndex);
		
		const fieldParams: IDataObject = {
			name: fieldName,
			type: fieldType,
		};
		
		if (additionalFields.description) {
			fieldParams.description = additionalFields.description;
		}
		
		if (additionalFields.keyName) {
			fieldParams.keyName = additionalFields.keyName;
		}
		
		// Handle field-type specific properties
		if (fieldType === 'DROPDOWN_ENUMERATION' && additionalFields.enumValues) {
			fieldParams.enumValues = additionalFields.enumValues;
		}
		
		const fieldsService = new FieldsService(apiKey, pipelineKey);
		return await fieldsService.create(fieldParams);
	} else if (operation === 'updateField') {
		// Update Field operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { pipelineKey, fieldKey }, ['pipelineKey', 'fieldKey'], itemIndex);
		
		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be specified',
				{ itemIndex },
			);
		}
		
		const fieldsService = new FieldsService(apiKey, pipelineKey);
		return await fieldsService.update(fieldKey, updateFields);
	} else if (operation === 'deleteField') {
		// Delete Field operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		
		validateParameters.call(this, { pipelineKey, fieldKey }, ['pipelineKey', 'fieldKey'], itemIndex);
		
		const fieldsService = new FieldsService(apiKey, pipelineKey);
		await fieldsService.delete(fieldKey);
		return { success: true };
	} else if (operation === 'listFieldValues') {
		// List Field Values operation
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as string | { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		
		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);
		
		const fieldsService = new FieldsService(apiKey, '');
		return await fieldsService.getBoxFieldValues(boxKey);
	} else if (operation === 'getFieldValue') {
		// Get Field Value operation
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as string | { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		
		validateParameters.call(this, { boxKey, fieldKey }, ['boxKey', 'fieldKey'], itemIndex);
		
		const fieldsService = new FieldsService(apiKey, '');
		return await fieldsService.getBoxFieldValue(boxKey, fieldKey);
	} else if (operation === 'updateFieldValue') {
		// Update Field Value operation
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as string | { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		const fieldValue = this.getNodeParameter('fieldValue', itemIndex) as string | number | boolean | IDataObject;
		
		validateParameters.call(this, { boxKey, fieldKey }, ['boxKey', 'fieldKey'], itemIndex);
		
		const fieldsService = new FieldsService(apiKey, '');
		return await fieldsService.updateBoxFieldValue(boxKey, fieldKey, fieldValue);
	}

	throw new NodeOperationError(this.getNode(), `The field operation "${operation}" is not supported!`, { itemIndex });
}
