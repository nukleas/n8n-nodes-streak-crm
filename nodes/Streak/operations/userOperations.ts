import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { streakApiRequest, validateParameters } from './utils';

/**
 * Handle user-related operations for the Streak API
 */
export async function handleUserOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	// Handle user operations
	if (operation === 'getCurrentUser') {
		// Get Current User operation
		return await streakApiRequest(this, 'GET', '/users/me');
	} else if (operation === 'getUser') {
		// Get User operation
		const userKey = this.getNodeParameter('userKey', itemIndex) as string;

		validateParameters.call(this, { userKey }, ['userKey'], itemIndex);

		return await streakApiRequest(this, 'GET', `/users/${userKey}`);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The user operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
