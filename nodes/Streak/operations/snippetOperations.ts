import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters, handlePagination } from './utils';

/**
 * Handle snippet-related operations for the Streak API
 */
export async function handleSnippetOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'listSnippets') {
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

		if (returnAll) {
			return await handlePagination.call(
				this,
				'/snippets',
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
				'/snippets',
				apiKey,
				itemIndex,
				undefined,
				{ limit },
			);
			return Array.isArray(response) ? response : [response];
		}
	} else if (operation === 'getSnippet') {
		const snippetKey = this.getNodeParameter('snippetKey', itemIndex) as string;

		validateParameters.call(this, { snippetKey }, ['snippetKey'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'GET',
			`/snippets/${snippetKey}`,
			apiKey,
			itemIndex,
		);
	} else if (operation === 'createSnippet') {
		const snippetName = this.getNodeParameter('snippetName', itemIndex) as string;
		const snippetBody = this.getNodeParameter('snippetBody', itemIndex) as string;

		validateParameters.call(
			this,
			{ snippetName, snippetBody },
			['snippetName', 'snippetBody'],
			itemIndex,
		);

		return await makeStreakRequest.call(
			this,
			'PUT',
			'/snippets',
			apiKey,
			itemIndex,
			{ snippetName, snippetText: snippetBody },
		);
	} else if (operation === 'editSnippet') {
		const snippetKey = this.getNodeParameter('snippetKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

		validateParameters.call(this, { snippetKey }, ['snippetKey'], itemIndex);

		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be specified',
				{ itemIndex },
			);
		}

		const body: IDataObject = {};

		if (updateFields.snippetName) {
			body.snippetName = updateFields.snippetName;
		}

		if (updateFields.snippetBody) {
			body.snippetText = updateFields.snippetBody;
		}

		return await makeStreakRequest.call(
			this,
			'POST',
			`/snippets/${snippetKey}`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'deleteSnippet') {
		const snippetKey = this.getNodeParameter('snippetKey', itemIndex) as string;

		validateParameters.call(this, { snippetKey }, ['snippetKey'], itemIndex);

		const response = await makeStreakRequest.call(
			this,
			'DELETE',
			`/snippets/${snippetKey}`,
			apiKey,
			itemIndex,
		);

		if (
			response === null ||
			response === undefined ||
			(typeof response === 'string' && response === '') ||
			(typeof response === 'object' && Object.keys(response as IDataObject).length === 0)
		) {
			return { success: true, message: 'Snippet deleted successfully' };
		}

		return response;
	}

	throw new NodeOperationError(
		this.getNode(),
		`The snippet operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
