import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

/**
 * Handle search-related operations for the Streak API
 */
export async function handleSearchOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'search') {
		const query = this.getNodeParameter('query', itemIndex) as string;

		validateParameters.call(this, { query }, ['query'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'GET',
			'/search',
			apiKey,
			itemIndex,
			undefined,
			{ query },
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The search operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
