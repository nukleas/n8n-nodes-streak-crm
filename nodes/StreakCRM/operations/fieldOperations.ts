import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

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
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/pipelines/${pipelineKey}/fields`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'getField') {
		// Get Field operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		
		validateParameters.call(this, { pipelineKey, fieldKey }, ['pipelineKey', 'fieldKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/pipelines/${pipelineKey}/fields/${fieldKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createField') {
		// Create Field operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const fieldName = this.getNodeParameter('fieldName', itemIndex) as string;
		const fieldType = this.getNodeParameter('fieldType', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { pipelineKey, fieldName, fieldType }, ['pipelineKey', 'fieldName', 'fieldType'], itemIndex);
		
		const body: IDataObject = {
			name: fieldName,
			type: fieldType,
		};
		
		if (additionalFields.description) {
			body.description = additionalFields.description;
		}
		
		if (additionalFields.keyName) {
			body.keyName = additionalFields.keyName;
		}
		
		// Handle field-type specific properties
		if (fieldType === 'DROPDOWN_ENUMERATION' && additionalFields.enumValues) {
			body.enumValues = additionalFields.enumValues;
		}
		
		return await makeStreakRequest.call(
			this,
			'PUT',
			`/pipelines/${pipelineKey}/fields`,
			apiKey,
			itemIndex,
			body,
		);
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
		
		const body: IDataObject = {};
		
		if (updateFields.name) {
			body.name = updateFields.name;
		}
		
		if (updateFields.description) {
			body.description = updateFields.description;
		}
		
		if (updateFields.enumValues) {
			body.enumValues = updateFields.enumValues;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/pipelines/${pipelineKey}/fields/${fieldKey}`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'deleteField') {
		// Delete Field operation
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		
		validateParameters.call(this, { pipelineKey, fieldKey }, ['pipelineKey', 'fieldKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'DELETE',
			`/pipelines/${pipelineKey}/fields/${fieldKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'listFieldValues') {
		// List Field Values operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		
		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/boxes/${boxKey}/fields`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'getFieldValue') {
		// Get Field Value operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		
		validateParameters.call(this, { boxKey, fieldKey }, ['boxKey', 'fieldKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/boxes/${boxKey}/fields/${fieldKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'updateFieldValue') {
		// Update Field Value operation
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		const fieldValue = this.getNodeParameter('fieldValue', itemIndex) as string | number | boolean | IDataObject;
		
		validateParameters.call(this, { boxKey, fieldKey }, ['boxKey', 'fieldKey'], itemIndex);
		
		const body: IDataObject = {
			value: fieldValue,
		};
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/boxes/${boxKey}/fields/${fieldKey}`,
			apiKey,
			itemIndex,
			body,
		);
	}

	throw new NodeOperationError(this.getNode(), `The field operation "${operation}" is not supported!`, { itemIndex });
}
