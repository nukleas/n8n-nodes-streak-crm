import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { validateParameters, handlePagination } from './utils';

/**
 * Handle newsfeed-related operations for the Streak API
 */
export async function handleNewsfeedOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getPipelineNewsfeed') {
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const detailLevel = this.getNodeParameter('detailLevel', itemIndex, 'ALL') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		return await handlePagination(
			this,
			`/pipelines/${pipelineKey}/newsfeed`,
			returnAll,
			returnAll ? 100 : limit,
			{ detailLevel },
		);
	} else if (operation === 'getBoxNewsfeed') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const detailLevel = this.getNodeParameter('detailLevel', itemIndex, 'ALL') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		return await handlePagination(
			this,
			`/boxes/${boxKey}/newsfeed`,
			returnAll,
			returnAll ? 100 : limit,
			{ detailLevel },
		);
	} else if (operation === 'getAllNewsfeed') {
		const detailLevel = this.getNodeParameter('detailLevel', itemIndex, 'ALL') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		return await handlePagination(
			this,
			'/newsfeed',
			returnAll,
			returnAll ? 100 : limit,
			{ detailLevel },
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The newsfeed operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
