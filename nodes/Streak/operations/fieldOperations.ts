import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';
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
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		const fieldsService = new FieldsService(apiKey, pipelineKey, this);
		return await fieldsService.query();
	} else if (operation === 'getField') {
		// Get Field operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;

		validateParameters.call(
			this,
			{ pipelineKey, fieldKey },
			['pipelineKey', 'fieldKey'],
			itemIndex,
		);

		const fieldsService = new FieldsService(apiKey, pipelineKey, this);
		return await fieldsService.get(fieldKey);
	} else if (operation === 'createField') {
		// Create Field operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const fieldName = this.getNodeParameter('fieldName', itemIndex) as string;
		const fieldType = this.getNodeParameter('fieldType', itemIndex) as string;
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		validateParameters.call(
			this,
			{ pipelineKey, fieldName, fieldType },
			['pipelineKey', 'fieldName', 'fieldType'],
			itemIndex,
		);

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
		if (fieldType === 'DROPDOWN') {
			if (
				!additionalFields.enumValues ||
				(Array.isArray(additionalFields.enumValues) && additionalFields.enumValues.length === 0)
			) {
				throw new NodeOperationError(
					this.getNode(),
					'Dropdown Values are required for DROPDOWN field type',
					{ itemIndex },
				);
			}
			fieldParams.enumValues = additionalFields.enumValues;
		}

		const fieldsService = new FieldsService(apiKey, pipelineKey, this);
		return await fieldsService.create(fieldParams);
	} else if (operation === 'updateField') {
		// Update Field operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		validateParameters.call(
			this,
			{ pipelineKey, fieldKey },
			['pipelineKey', 'fieldKey'],
			itemIndex,
		);

		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be specified',
				{ itemIndex },
			);
		}

		const fieldsService = new FieldsService(apiKey, pipelineKey, this);
		return await fieldsService.update(fieldKey, updateFields);
	} else if (operation === 'deleteField') {
		// Delete Field operation
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;

		validateParameters.call(
			this,
			{ pipelineKey, fieldKey },
			['pipelineKey', 'fieldKey'],
			itemIndex,
		);

		const fieldsService = new FieldsService(apiKey, pipelineKey, this);
		await fieldsService.delete(fieldKey);
		return { success: true };
	} else if (operation === 'listFieldValues') {
		// List Field Values operation
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		return await makeStreakRequest.call(this, 'GET', `/boxes/${boxKey}/fields`, apiKey, itemIndex);
	} else if (operation === 'getFieldValue') {
		// Get Field Value operation
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
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
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;
		const fieldValue = this.getNodeParameter('fieldValue', itemIndex) as
			| string
			| number
			| boolean
			| IDataObject;

		validateParameters.call(this, { boxKey, fieldKey }, ['boxKey', 'fieldKey'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'POST',
			`/boxes/${boxKey}/fields/${fieldKey}`,
			apiKey,
			itemIndex,
			{ value: fieldValue },
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The field operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
