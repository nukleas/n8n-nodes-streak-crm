import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { validateParameters } from './utils';
import { StreakApiService } from '../services';

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
		
		return await StreakApiService.organization().getOrganization(this, apiKey, organizationKey);
	} else if (operation === 'getAll') {
		// Get all organizations
		return await StreakApiService.organization().getOrganizations(this, apiKey);
	} else if (operation === 'create') {
		// Create an organization
		const name = this.getNodeParameter('name', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { name }, ['name'], itemIndex);
		
		return await StreakApiService.organization().createOrganization(this, apiKey, name, additionalFields);
	} else if (operation === 'search') {
		// Search for organizations
		const searchFields = this.getNodeParameter('searchFields', itemIndex, {}) as IDataObject;
		
		if (!searchFields.name && !searchFields.domain) {
			throw new NodeOperationError(
				this.getNode(), 
				'At least one search parameter (name or domain) must be provided', 
				{
					itemIndex,
				}
			);
		}
		
		return await StreakApiService.organization().checkExistingOrganizations(this, apiKey, searchFields);
	} else if (operation === 'update') {
		// Update an organization
		const organizationKey = this.getNodeParameter('organizationKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { organizationKey }, ['organizationKey'], itemIndex);
		
		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be provided',
				{
					itemIndex,
				}
			);
		}
		
		return await StreakApiService.organization().updateOrganization(this, apiKey, organizationKey, updateFields);
	} else if (operation === 'delete') {
		// Delete an organization
		const organizationKey = this.getNodeParameter('organizationKey', itemIndex) as string;
		
		validateParameters.call(this, { organizationKey }, ['organizationKey'], itemIndex);
		
		return await StreakApiService.organization().deleteOrganization(this, apiKey, organizationKey);
	}

	throw new NodeOperationError(this.getNode(), `The organization operation "${operation}" is not supported!`, { itemIndex });
}
