import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters, handlePagination } from './utils';

/**
 * Handle thread-related operations for the Streak API
 */
export async function handleThreadOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'listThreadsInBox') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);

		if (returnAll) {
			return await handlePagination.call(
				this,
				`/boxes/${boxKey}/threads`,
				apiKey,
				true,
				itemIndex,
				100,
				{},
			);
		} else {
			const response = await makeStreakRequest.call(
				this,
				'GET',
				`/boxes/${boxKey}/threads`,
				apiKey,
				itemIndex,
				undefined,
				{ limit },
			);
			return Array.isArray(response) ? response : [response];
		}
	} else if (operation === 'getThread') {
		const threadKey = this.getNodeParameter('threadKey', itemIndex) as string;

		validateParameters.call(this, { threadKey }, ['threadKey'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'GET',
			`/threads/${threadKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'getThreadByGmailId') {
		const hexGmailThreadId = this.getNodeParameter('hexGmailThreadId', itemIndex) as string;

		validateParameters.call(this, { hexGmailThreadId }, ['hexGmailThreadId'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'POST',
			'/threadinfo/',
			apiKey,
			itemIndex,
			undefined,
			{ hexGmailThreadId },
		);
	} else if (operation === 'addThreadToBox') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const threadGmailId = this.getNodeParameter('threadGmailId', itemIndex) as string;

		validateParameters.call(
			this,
			{ boxKey, threadGmailId },
			['boxKey', 'threadGmailId'],
			itemIndex,
		);

		return await makeStreakRequest.call(
			this,
			'PUT',
			`/boxes/${boxKey}/threads`,
			apiKey,
			itemIndex,
			{ boxKey, threadGmailId },
		);
	} else if (operation === 'removeThread') {
		const threadKey = this.getNodeParameter('threadKey', itemIndex) as string;

		validateParameters.call(this, { threadKey }, ['threadKey'], itemIndex);

		const response = await makeStreakRequest.call(
			this,
			'DELETE',
			`/threads/${threadKey}`,
			apiKey,
			itemIndex,
		);

		if (
			response === null ||
			response === undefined ||
			(typeof response === 'string' && response === '') ||
			(typeof response === 'object' && Object.keys(response as IDataObject).length === 0)
		) {
			return { success: true, message: 'Thread removed successfully' };
		}

		return response;
	}

	throw new NodeOperationError(
		this.getNode(),
		`The thread operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
