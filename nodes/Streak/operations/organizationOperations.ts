import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

/**
 * Handle organization-related operations for the Streak API
 */
export async function handleOrganizationOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle organization operations
	if (operation === 'getOrganization') {
		// Get Organization operation
		const organizationKey = this.getNodeParameter('organizationKey', itemIndex) as string;
		
		validateParameters.call(this, { organizationKey }, ['organizationKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/organizations/${organizationKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createOrganization') {
		// Create Organization operation
		const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
		const name = this.getNodeParameter('name', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { teamKey, name }, ['teamKey', 'name'], itemIndex);
		
		const body: IDataObject = {
			name,
		};
		
		if (additionalFields.domains && (additionalFields.domains as string[]).length > 0) {
			body.domains = additionalFields.domains;
		}
		
		if (additionalFields.relationships) {
			body.relationships = additionalFields.relationships;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/teams/${teamKey}/organizations`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'checkExistingOrganizations') {
		// Check Existing Organizations operation
		const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
		const checkFields = this.getNodeParameter('checkFields', itemIndex) as IDataObject;
		
		validateParameters.call(this, { teamKey }, ['teamKey'], itemIndex);
		
		if (!checkFields.domain && !checkFields.name) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one of domain or name must be specified',
				{ itemIndex },
			);
		}
		
		const body: IDataObject = {};
		
		if (checkFields.domain) {
			body.domain = checkFields.domain;
		}
		
		if (checkFields.name) {
			body.name = checkFields.name;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/teams/${teamKey}/organizations?getIfExisting=true`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'updateOrganization') {
		// Update Organization operation
		const organizationKey = this.getNodeParameter('organizationKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { organizationKey }, ['organizationKey'], itemIndex);
		
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
		
		if (updateFields.domains && (updateFields.domains as string[]).length > 0) {
			body.domains = updateFields.domains;
		}
		
		if (updateFields.relationships) {
			body.relationships = updateFields.relationships;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/organizations/${organizationKey}`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'deleteOrganization') {
		// Delete Organization operation
		const organizationKey = this.getNodeParameter('organizationKey', itemIndex) as string;
		
		validateParameters.call(this, { organizationKey }, ['organizationKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'DELETE',
			`/organizations/${organizationKey}`,
			apiKey,
			itemIndex,
		);
	}

	throw new NodeOperationError(this.getNode(), `The organization operation "${operation}" is not supported!`, { itemIndex });
}
