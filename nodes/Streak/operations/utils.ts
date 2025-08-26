import {
	IExecuteFunctions,
	IDataObject,
	NodeOperationError,
	IHttpRequestMethods,
	JsonObject,
} from 'n8n-workflow';

/**
 * Mapping of endpoint patterns to their correct API versions
 * This ensures we use the correct API version for each endpoint
 */
const ENDPOINT_API_VERSIONS: Record<string, 'v1' | 'v2'> = {
	// v2 endpoints
	'/users/me/teams': 'v2',
	'/teams': 'v2',
	'/teams/': 'v2',
	'/contacts': 'v2',
	'/contacts/': 'v2',
	'/organizations': 'v2',
	'/organizations/': 'v2',
	'/tasks': 'v2',
	'/tasks/': 'v2',
	'/webhooks': 'v2',
	'/webhooks/': 'v2',
	'/comments': 'v2',
	'/comments/': 'v2',
	'/meetings': 'v2',
	'/meetings/': 'v2',
	'/timeline': 'v2',
	'/boxes/*/tasks': 'v2',
	'/boxes/batch': 'v2',
	'/boxes/*/timeline': 'v2', // Timeline for boxes uses v2
	'/pipelines/*/boxes/batch': 'v2',
	'/pipelines/*/boxes': 'v2', // Create box uses v2
	'/teams/*/contacts': 'v2', // Create contact uses v2
	'/teams/*/organizations': 'v2', // Create organization uses v2
};

/**
 * Determine the correct API version for an endpoint
 */
export function getApiVersionForEndpoint(endpoint: string): 'v1' | 'v2' {
	// Check for exact matches first
	if (ENDPOINT_API_VERSIONS[endpoint]) {
		return ENDPOINT_API_VERSIONS[endpoint];
	}

	// Check for pattern matches
	for (const [pattern, version] of Object.entries(ENDPOINT_API_VERSIONS)) {
		if (pattern.includes('*')) {
			// Convert pattern to regex
			const regexPattern = pattern.replace(/\*/g, '[^/]+');
			const regex = new RegExp(`^${regexPattern}`);
			if (regex.test(endpoint)) {
				return version;
			}
		} else if (endpoint.startsWith(pattern)) {
			return version;
		}
	}

	// Default to v1 for unknown endpoints
	return 'v1';
}

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
	apiVersion?: 'v1' | 'v2',
): Promise<IDataObject | IDataObject[]> {
	try {
		// Auto-determine API version if not provided
		const version = apiVersion || getApiVersionForEndpoint(endpoint);

		// Build request options with proper content-type only when needed
		const headers: IDataObject = {
			Accept: 'application/json',
		};
		const url = `https://api.streak.com/api/${version}${endpoint}`;
		if (['POST', 'PUT', 'PATCH'].includes(method)) {
			headers['Content-Type'] = 'application/json';
		}
		return (await this.helpers.httpRequest({
			method,
			url: url,
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
