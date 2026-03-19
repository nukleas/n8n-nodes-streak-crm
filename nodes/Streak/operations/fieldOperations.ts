import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { streakApiRequest, streakApiFormRequest, validateParameters } from './utils';

/**
 * Handle field-related operations for the Streak API
 */
export async function handleFieldOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	// Handle field operations
	if (operation === 'listFields') {
		const pipelineKeyParam = this.getNodeParameter('pipelineKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const pipelineKey =
			typeof pipelineKeyParam === 'string' ? pipelineKeyParam : pipelineKeyParam.value;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		return await streakApiRequest(this, 'GET', `/pipelines/${pipelineKey}/fields`);
	} else if (operation === 'getField') {
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

		return await streakApiRequest(this, 'GET', `/pipelines/${pipelineKey}/fields/${fieldKey}`);
	} else if (operation === 'createField') {
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

		return await streakApiFormRequest(
			this,
			'PUT',
			`/pipelines/${pipelineKey}/fields`,
			fieldParams,
		);
	} else if (operation === 'updateField') {
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

		return await streakApiRequest(
			this,
			'POST',
			`/pipelines/${pipelineKey}/fields/${fieldKey}`,
			updateFields,
		);
	} else if (operation === 'deleteField') {
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

		await streakApiRequest(this, 'DELETE', `/pipelines/${pipelineKey}/fields/${fieldKey}`);
		return { success: true };
	} else if (operation === 'listFieldValues') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		return await streakApiRequest(this, 'GET', `/boxes/${encodeURIComponent(boxKey)}/fields`);
	} else if (operation === 'getFieldValue') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const fieldKey = this.getNodeParameter('fieldKey', itemIndex) as string;

		validateParameters.call(this, { boxKey, fieldKey }, ['boxKey', 'fieldKey'], itemIndex);

		return await streakApiRequest(
			this,
			'GET',
			`/boxes/${encodeURIComponent(boxKey)}/fields/${encodeURIComponent(fieldKey)}`,
		);
	} else if (operation === 'updateFieldValue') {
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

		return await streakApiRequest(
			this,
			'POST',
			`/boxes/${encodeURIComponent(boxKey)}/fields/${encodeURIComponent(fieldKey)}`,
			{ value: fieldValue },
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The field operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
