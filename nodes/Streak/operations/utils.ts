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
	apiVersion: 'v1' | 'v2' = 'v1',
): Promise<IDataObject | IDataObject[]> {
	try {
		// Build request options with proper content-type based on endpoint
		const headers: IDataObject = {
			Accept: 'application/json',
		};

		const url = `https://api.streak.com/api/${apiVersion}${endpoint}`;
		
		// Determine content type based on endpoint and method
		let useFormEncoded = false;
		let requestBody: any = body;
		
		if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
			// Check if this endpoint requires URL-encoded form data
			const urlEncodedEndpoints = [
				'/pipelines', // Create pipeline (PUT)
				'/stages', // Create stage (PUT)  
				'/fields', // Create field (PUT)
				// Note: v2 contacts (/teams/{key}/contacts/) and organizations (/teams/{key}/organizations) use JSON
			];
			
			// Check if endpoint matches any URL-encoded patterns
			useFormEncoded = urlEncodedEndpoints.some(pattern => 
				endpoint.includes(pattern) && method === 'PUT'
			);
			
			if (useFormEncoded) {
				// Use URL-encoded form data
				headers['Content-Type'] = 'application/x-www-form-urlencoded';
				// Convert JSON object to URL-encoded string
				requestBody = new URLSearchParams(body as Record<string, string>).toString();
			} else {
				// Use JSON
				headers['Content-Type'] = 'application/json';
				requestBody = body;
			}
		}

		const requestOptions = {
			method,
			url: url,
			headers,
			auth: {
				username: apiKey,
				password: '',
			},
			qs: query,
			body: requestBody,
			json: !useFormEncoded, // Only auto-parse JSON if we're not sending form data
		};

		const response = await this.helpers.httpRequest(requestOptions);
		
		// If we sent form data, we might need to parse JSON response manually
		if (useFormEncoded && typeof response === 'string') {
			try {
				return JSON.parse(response) as JsonObject;
			} catch {
				return response as unknown as JsonObject;
			}
		}
		
		return response as JsonObject;
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
	apiVersion: 'v1' | 'v2' = 'v1',
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
				apiVersion,
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
			apiVersion,
		);

		responseData = Array.isArray(response) ? response : [response];
	}

	return responseData;
}
