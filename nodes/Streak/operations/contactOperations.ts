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

		return await makeStreakRequest.call(this, 'GET', `/contacts/${contactKey}`, apiKey, itemIndex);
	} else if (operation === 'createContact') {
		// Create Contact operation
		const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
		const emailAddresses = this.getNodeParameter('emailAddresses', itemIndex, []) as string[];
		const givenName = this.getNodeParameter('givenName', itemIndex, '') as string;
		const familyName = this.getNodeParameter('familyName', itemIndex, '') as string;
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		validateParameters.call(this, { teamKey }, ['teamKey'], itemIndex);

		// Check that at least one of name or email is provided (API requirement)
		const hasName = givenName || familyName;
		const hasEmail = emailAddresses && emailAddresses.length > 0;

		if (!hasName && !hasEmail) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one name (Given Name or Family Name) or email address must be provided',
				{ itemIndex },
			);
		}

		const body: IDataObject = {};

		// Add email addresses if provided
		if (hasEmail) {
			body.emailAddresses = emailAddresses;
		}

		// Add names if provided
		if (givenName) {
			body.givenName = givenName;
		}

		if (familyName) {
			body.familyName = familyName;
		}

		// Add additional fields
		if (additionalFields.title !== undefined) {
			body.title = additionalFields.title;
		}

		if (additionalFields.phoneNumbers !== undefined) {
			body.phoneNumbers = additionalFields.phoneNumbers;
		}

		if (additionalFields.addresses !== undefined) {
			body.addresses = additionalFields.addresses;
		}

		if (additionalFields.other !== undefined) {
			body.other = additionalFields.other;
		}

		if (additionalFields.twitterHandle !== undefined) {
			body.twitterHandle = additionalFields.twitterHandle;
		}

		if (additionalFields.facebookHandle !== undefined) {
			body.facebookHandle = additionalFields.facebookHandle;
		}

		if (additionalFields.linkedinHandle !== undefined) {
			body.linkedinHandle = additionalFields.linkedinHandle;
		}

		if (additionalFields.photoUrl !== undefined) {
			body.photoUrl = additionalFields.photoUrl;
		}

		return await makeStreakRequest.call(
			this,
			'POST',
			`/teams/${teamKey}/contacts/`,
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

		// Handle array fields - always include them if they're defined (even if empty)
		if (updateFields.emailAddresses !== undefined) {
			body.emailAddresses = updateFields.emailAddresses;
		}

		if (updateFields.phoneNumbers !== undefined) {
			body.phoneNumbers = updateFields.phoneNumbers;
		}

		if (updateFields.addresses !== undefined) {
			body.addresses = updateFields.addresses;
		}

		// Handle string fields - only include if not undefined
		if (updateFields.givenName !== undefined) {
			body.givenName = updateFields.givenName;
		}

		if (updateFields.familyName !== undefined) {
			body.familyName = updateFields.familyName;
		}

		if (updateFields.title !== undefined) {
			body.title = updateFields.title;
		}

		if (updateFields.other !== undefined) {
			body.other = updateFields.other;
		}

		if (updateFields.twitterHandle !== undefined) {
			body.twitterHandle = updateFields.twitterHandle;
		}

		if (updateFields.facebookHandle !== undefined) {
			body.facebookHandle = updateFields.facebookHandle;
		}

		if (updateFields.linkedinHandle !== undefined) {
			body.linkedinHandle = updateFields.linkedinHandle;
		}

		if (updateFields.photoUrl !== undefined) {
			body.photoUrl = updateFields.photoUrl;
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

	throw new NodeOperationError(
		this.getNode(),
		`The contact operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
