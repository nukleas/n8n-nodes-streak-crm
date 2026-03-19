import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters, handlePagination } from './utils';

/**
 * Handle newsfeed-related operations for the Streak API
 */
export async function handleNewsfeedOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getPipelineNewsfeed') {
		const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
		const detailLevel = this.getNodeParameter('detailLevel', itemIndex, 'ALL') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);

		if (returnAll) {
			return await handlePagination.call(
				this,
				`/pipelines/${pipelineKey}/newsfeed`,
				apiKey,
				true,
				itemIndex,
				100,
				{ detailLevel },
			);
		} else {
			const response = await makeStreakRequest.call(
				this,
				'GET',
				`/pipelines/${pipelineKey}/newsfeed`,
				apiKey,
				itemIndex,
				undefined,
				{ detailLevel, limit },
			);
			return Array.isArray(response) ? response : [response];
		}
	} else if (operation === 'getBoxNewsfeed') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const detailLevel = this.getNodeParameter('detailLevel', itemIndex, 'ALL') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		if (returnAll) {
			return await handlePagination.call(
				this,
				`/boxes/${boxKey}/newsfeed`,
				apiKey,
				true,
				itemIndex,
				100,
				{ detailLevel },
			);
		} else {
			const response = await makeStreakRequest.call(
				this,
				'GET',
				`/boxes/${boxKey}/newsfeed`,
				apiKey,
				itemIndex,
				undefined,
				{ detailLevel, limit },
			);
			return Array.isArray(response) ? response : [response];
		}
	} else if (operation === 'getAllNewsfeed') {
		const detailLevel = this.getNodeParameter('detailLevel', itemIndex, 'ALL') as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		if (returnAll) {
			return await handlePagination.call(
				this,
				'/newsfeed',
				apiKey,
				true,
				itemIndex,
				100,
				{ detailLevel },
			);
		} else {
			const response = await makeStreakRequest.call(
				this,
				'GET',
				'/newsfeed',
				apiKey,
				itemIndex,
				undefined,
				{ detailLevel, limit },
			);
			return Array.isArray(response) ? response : [response];
		}
	}

	throw new NodeOperationError(
		this.getNode(),
		`The newsfeed operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
