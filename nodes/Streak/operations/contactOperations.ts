import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

/**
 * Handle contact-related operations for the Streak API
 */
export async function handleContactOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle contact operations
	if (operation === 'getContact') {
		// Get Contact operation
		const contactKey = this.getNodeParameter('contactKey', itemIndex) as string;
		
		validateParameters.call(this, { contactKey }, ['contactKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/contacts/${contactKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createContact') {
		// Create Contact operation
		const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
		const contactEmail = this.getNodeParameter('email', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { teamKey, contactEmail }, ['teamKey', 'contactEmail'], itemIndex);
		
		const body: IDataObject = {
			email: contactEmail,
		};
		
		if (additionalFields.firstName) {
			body.firstName = additionalFields.firstName;
		}
		
		if (additionalFields.lastName) {
			body.lastName = additionalFields.lastName;
		}
		
		if (additionalFields.fullName) {
			body.fullName = additionalFields.fullName;
		}
		
		if (additionalFields.phones && (additionalFields.phones as string[]).length > 0) {
			body.phones = additionalFields.phones;
		}
		
		if (additionalFields.organization) {
			body.organization = additionalFields.organization;
		}
		
		if (additionalFields.title) {
			body.title = additionalFields.title;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/teams/${teamKey}/contacts`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'updateContact') {
		// Update Contact operation
		const contactKey = this.getNodeParameter('contactKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { contactKey }, ['contactKey'], itemIndex);
		
		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be specified',
				{ itemIndex },
			);
		}
		
		const body: IDataObject = {};
		
		if (updateFields.email) {
			body.email = updateFields.email;
		}
		
		if (updateFields.firstName) {
			body.firstName = updateFields.firstName;
		}
		
		if (updateFields.lastName) {
			body.lastName = updateFields.lastName;
		}
		
		if (updateFields.fullName) {
			body.fullName = updateFields.fullName;
		}
		
		if (updateFields.phones && (updateFields.phones as string[]).length > 0) {
			body.phones = updateFields.phones;
		}
		
		if (updateFields.organization) {
			body.organization = updateFields.organization;
		}
		
		if (updateFields.title) {
			body.title = updateFields.title;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/contacts/${contactKey}`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'deleteContact') {
		// Delete Contact operation
		const contactKey = this.getNodeParameter('contactKey', itemIndex) as string;
		
		validateParameters.call(this, { contactKey }, ['contactKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'DELETE',
			`/contacts/${contactKey}`,
			apiKey,
			itemIndex,
		);
	}

	throw new NodeOperationError(this.getNode(), `The contact operation "${operation}" is not supported!`, { itemIndex });
}
