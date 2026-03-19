import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters, handlePagination } from './utils';

/**
 * Handle comment-related operations for the Streak API
 */
export async function handleCommentOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'listCommentsInBox') {
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
				`/boxes/${boxKey}/comments`,
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
				`/boxes/${boxKey}/comments`,
				apiKey,
				itemIndex,
				undefined,
				{ limit },
			);
			return Array.isArray(response) ? response : [response];
		}
	} else if (operation === 'getComment') {
		const commentKey = this.getNodeParameter('commentKey', itemIndex) as string;

		validateParameters.call(this, { commentKey }, ['commentKey'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'GET',
			`/comments/${commentKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createComment') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const message = this.getNodeParameter('message', itemIndex) as string;

		validateParameters.call(this, { boxKey, message }, ['boxKey', 'message'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'POST',
			`/boxes/${boxKey}/comments`,
			apiKey,
			itemIndex,
			{ message },
		);
	} else if (operation === 'editComment') {
		const commentKey = this.getNodeParameter('commentKey', itemIndex) as string;
		const message = this.getNodeParameter('message', itemIndex) as string;

		validateParameters.call(this, { commentKey, message }, ['commentKey', 'message'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'POST',
			`/comments/${commentKey}`,
			apiKey,
			itemIndex,
			{ message },
		);
	} else if (operation === 'deleteComment') {
		const commentKey = this.getNodeParameter('commentKey', itemIndex) as string;

		validateParameters.call(this, { commentKey }, ['commentKey'], itemIndex);

		const response = await makeStreakRequest.call(
			this,
			'DELETE',
			`/comments/${commentKey}`,
			apiKey,
			itemIndex,
		);

		if (
			response === null ||
			response === undefined ||
			(typeof response === 'string' && response === '') ||
			(typeof response === 'object' && Object.keys(response as IDataObject).length === 0)
		) {
			return { success: true, message: 'Comment deleted successfully' };
		}

		return response;
	}

	throw new NodeOperationError(
		this.getNode(),
		`The comment operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
