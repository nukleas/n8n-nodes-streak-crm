import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

/**
 * Handle user-related operations for the Streak API
 */
export async function handleUserOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle user operations
	if (operation === 'getCurrentUser') {
		// Get Current User operation
		return await makeStreakRequest.call(this, 'GET', '/users/me', apiKey, itemIndex);
	} else if (operation === 'getUser') {
		// Get User operation
		const userKey = this.getNodeParameter('userKey', itemIndex) as string;

		validateParameters.call(this, { userKey }, ['userKey'], itemIndex);

		return await makeStreakRequest.call(this, 'GET', `/users/${userKey}`, apiKey, itemIndex);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The user operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
