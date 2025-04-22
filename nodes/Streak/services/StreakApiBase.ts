import { IDataObject, IExecuteFunctions, IHttpRequestMethods, ILoadOptionsFunctions, NodeApiError } from 'n8n-workflow';

/**
 * Base service class for interacting with the Streak API
 * Centralizes request handling, error management, and authentication
 */
export class StreakApiBase {
	protected static readonly BASE_URL = 'https://api.streak.com/api/v1';

	/**
	 * Make a request to the Streak API with proper error handling
	 * @param context - The n8n execution or load options context
	 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
	 * @param endpoint - API endpoint (will be appended to base URL)
	 * @param apiKey - Streak API key for authentication
	 * @param body - Optional request body for methods like POST, PUT
	 * @param query - Optional query parameters
	 * @returns Response data from the API
	 */
	public static async makeRequest(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		method: IHttpRequestMethods,
		endpoint: string,
		apiKey: string,
		body?: IDataObject,
		query?: IDataObject,
	): Promise<IDataObject | IDataObject[]> {
		try {
			const headers: Record<string, string> = {
				'Accept': 'application/json',
			};

			// Add Content-Type header only when sending data
			if (['POST', 'PUT', 'PATCH'].includes(method)) {
				headers['Content-Type'] = 'application/json';
			}

			const options = {
				method,
				url: `${this.BASE_URL}${endpoint}`,
				headers,
				auth: {
					username: apiKey,
					password: '',
				},
				qs: query,
				body,
				json: true,
			};

			// Use the appropriate helper based on context type
			if ('getNode' in context && 'getCredentials' in context) {
				// IExecuteFunctions context
				return await (context as IExecuteFunctions).helpers.httpRequest(options);
			} else {
				// ILoadOptionsFunctions context
				return await (context as ILoadOptionsFunctions).helpers.httpRequest(options);
			}
		} catch (error) {
			// Create a properly formatted error with more context
			if ('getNode' in context) {
				const executionContext = context as IExecuteFunctions;
				throw new NodeApiError(executionContext.getNode(), error, {
					message: `Streak API Error: ${error.message}`,
					description: `Error when calling ${method} ${endpoint}`,
					httpCode: error.statusCode,
				});
			} else {
				// For load options functions, return empty data instead of throwing
				// This prevents dropdowns from breaking when API errors occur
				if (method === 'GET') {
					return [];
				}
				throw error;
			}
		}
	}

	/**
	 * Handle pagination for list endpoints
	 * @param context - The n8n execution context
	 * @param apiKey - Streak API key
	 * @param endpoint - API endpoint
	 * @param returnAll - Whether to return all results
	 * @param limit - Limit for single page results
	 * @returns All paginated results or single page results
	 */
	public static async handlePagination(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		endpoint: string,
		apiKey: string,
		returnAll: boolean = false,
		limit: number = 50,
	): Promise<IDataObject[]> {
		if (!returnAll) {
			// Return just a single page
			return this.makeRequest(
				context,
				'GET',
				endpoint,
				apiKey,
				undefined,
				{ limit },
			) as Promise<IDataObject[]>;
		}

		// Handle pagination for returnAll
		let allResults: IDataObject[] = [];
		let page = 1;
		let hasMoreResults = true;
		
		while (hasMoreResults) {
			// Add page parameter for pagination
			const queryParams: IDataObject = {
				page,
				limit,
			};
			
			// Make request for current page
			const response = await this.makeRequest(
				context,
				'GET',
				endpoint,
				apiKey,
				undefined,
				queryParams,
			) as IDataObject[];
			
			// If we got results, add them to our array
			if (response && Array.isArray(response) && response.length > 0) {
				allResults = [...allResults, ...response];
				
				// Check if we need to fetch more pages
				if (response.length < limit) {
					hasMoreResults = false;
				}
			} else {
				// No more results
				hasMoreResults = false;
			}
			
			// Move to next page
			page++;
		}
		
		return allResults;
	}
}
