import {
	IExecuteFunctions,
	IDataObject,
	NodeOperationError,
	IHttpRequestMethods,
	JsonObject,
} from 'n8n-workflow';

/**
 * Helper function to make a request to the Streak API with proper error handling
 */
export async function makeStreakRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	apiKey: string,
	itemIndex = 0,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	try {
		// Build request options with proper content-type only when needed
		const headers: IDataObject = {
			Accept: 'application/json',
		};

		if (['POST', 'PUT', 'PATCH'].includes(method)) {
			headers['Content-Type'] = 'application/json';
		}

		return (await this.helpers.httpRequest({
			method,
			url: `https://api.streak.com/api/v2${endpoint}`,
			headers,
			auth: {
				username: apiKey,
				password: '',
			},
			qs: query,
			body,
			json: true,
		})) as JsonObject;
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Streak API Error: ${error.message || 'Unknown error'}`,
			{ itemIndex },
		);
	}
}

/**
 * Validate that required parameters are present
 */
export function validateParameters(
	this: IExecuteFunctions,
	parameters: Record<string, unknown>,
	requiredParams: string[],
	itemIndex = 0,
): void {
	for (const param of requiredParams) {
		if (parameters[param] === undefined || parameters[param] === '') {
			throw new NodeOperationError(
				this.getNode(),
				`Parameter ${param} is required for this operation`,
				{ itemIndex },
			);
		}
	}
}

/**
 * Handle pagination for list operations
 */
export async function handlePagination(
	this: IExecuteFunctions,
	endpoint: string,
	apiKey: string,
	returnAll: boolean,
	itemIndex = 0,
	limit = 100,
	additionalParams: IDataObject = {},
): Promise<IDataObject[]> {
	let responseData: IDataObject[] = [];

	if (returnAll) {
		// If returnAll is true, get all results by handling pagination
		let hasMore = true;
		let page = 0;

		while (hasMore) {
			const query: IDataObject = {
				...additionalParams,
				page,
				limit,
			};

			const response = await makeStreakRequest.call(
				this,
				'GET',
				endpoint,
				apiKey,
				itemIndex,
				undefined,
				query,
			);

			const results = Array.isArray(response) ? response : [response];
			responseData = [...responseData, ...results];

			// If we received fewer results than requested, we've reached the end
			if (results.length < limit) {
				hasMore = false;
			} else {
				page++;
			}
		}
	} else {
		// If returnAll is false, just get the first page of results
		const query: IDataObject = {
			...additionalParams,
			page: 0,
			limit,
		};

		const response = await makeStreakRequest.call(
			this,
			'GET',
			endpoint,
			apiKey,
			itemIndex,
			undefined,
			query,
		);

		responseData = Array.isArray(response) ? response : [response];
	}

	return responseData;
}
