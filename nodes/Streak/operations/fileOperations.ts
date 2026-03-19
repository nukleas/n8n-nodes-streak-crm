import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters, handlePagination } from './utils';

/**
 * Handle file-related operations for the Streak API
 */
export async function handleFileOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'listFilesInBox') {
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
				`/boxes/${boxKey}/files`,
				apiKey,
				true,
				itemIndex,
				100,
				{},
				'v1',
			);
		} else {
			const response = await makeStreakRequest.call(
				this,
				'GET',
				`/boxes/${boxKey}/files`,
				apiKey,
				itemIndex,
				undefined,
				{ limit },
				'v1',
			);
			return Array.isArray(response) ? response : [response];
		}
	} else if (operation === 'getFile') {
		const fileKey = this.getNodeParameter('fileKey', itemIndex) as string;

		validateParameters.call(this, { fileKey }, ['fileKey'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'GET',
			`/files/${fileKey}`,
			apiKey,
			itemIndex,
			undefined,
			undefined,
			'v1',
		);
	} else if (operation === 'getFileContents') {
		const fileKey = this.getNodeParameter('fileKey', itemIndex) as string;

		validateParameters.call(this, { fileKey }, ['fileKey'], itemIndex);

		return await makeStreakRequest.call(
			this,
			'GET',
			`/files/${fileKey}/contents`,
			apiKey,
			itemIndex,
			undefined,
			undefined,
			'v1',
		);
	} else if (operation === 'addFileToBox') {
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const driveFileId = this.getNodeParameter('driveFileId', itemIndex) as string;

		validateParameters.call(
			this,
			{ boxKey, driveFileId },
			['boxKey', 'driveFileId'],
			itemIndex,
		);

		return await makeStreakRequest.call(
			this,
			'POST',
			'/files/',
			apiKey,
			itemIndex,
			{ driveFileId, driveBoxKey: boxKey },
			undefined,
			'v2',
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The file operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
