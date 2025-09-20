import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	NodeApiError,
} from 'n8n-workflow';
import { getApiVersionForEndpoint } from '../operations/utils';

/**
 * Interface for Pipeline data returned from Streak API
 */
export interface IStreakPipeline {
	key: string;
	name: string;
	description?: string;
	orgWide: boolean;
	creatorKey: string;
	teamKey?: string;
	aclEntries?: IDataObject[];
	fields?: IDataObject[];
	stages?: IStreakStage[];
	[key: string]: any;
}

/**
 * Interface for Stage data returned from Streak API
 */
export interface IStreakStage {
	key: string;
	name: string;
	pipelineKey: string;
	[key: string]: any;
}

/**
 * Interface for Team data returned from Streak API
 */
export interface IStreakTeam {
	key: string;
	name: string;
	[key: string]: any;
}

/**
 * Interface for Box (Deal) data returned from Streak API
 */
export interface IStreakBox {
	key: string;
	name: string;
	notes?: string;
	stageKey?: string;
	pipelineKey: string;
	creatorKey: string;
	[key: string]: any;
}

/**
 * Interface for Search Response data returned from Streak API
 */
export interface IStreakSearchResponse {
	results: {
		boxes: IStreakBox[];
		[key: string]: any;
	};
	[key: string]: any;
}

/**
 * Service class for interacting with the Streak API
 * Centralizes all API calls and provides consistent error handling
 */
export class StreakApiService {
	/**
	 * Base URL for the Streak API (version will be determined per endpoint)
	 */
	private static readonly BASE_URL = 'https://api.streak.com/api';

	/**
	 * Fetch all pipelines from the Streak API
	 * @param context - The n8n execution or load options context
	 * @param apiKey - Streak API key for authentication
	 * @returns Array of pipeline objects
	 */
	public static async getPipelines(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
	): Promise<IStreakPipeline[]> {
		return this.makeRequest(context, 'GET', '/pipelines', apiKey) as Promise<IStreakPipeline[]>;
	}

	/**
	 * Fetch all teams from the Streak API
	 * @param context - The n8n execution or load options context
	 * @param apiKey - Streak API key for authentication
	 * @returns Array of team objects or raw response
	 */
	public static async getTeams(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
	): Promise<IDataObject | IDataObject[]> {
		return this.makeRequest(context, 'GET', '/users/me/teams', apiKey);
	}

	/**
	 * Get details for a specific pipeline
	 * @param context - The n8n execution or load options context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Key of the pipeline to fetch
	 * @returns Pipeline object with full details
	 */
	public static async getPipeline(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
		pipelineKey: string,
	): Promise<IStreakPipeline> {
		return this.makeRequest(
			context,
			'GET',
			`/pipelines/${pipelineKey}`,
			apiKey,
		) as Promise<IStreakPipeline>;
	}

	/**
	 * Create a new pipeline
	 * @param context - The n8n execution context
	 * @param apiKey - Streak API key for authentication
	 * @param name - Name of the pipeline to create
	 * @param teamKey - Team key to assign the pipeline to
	 * @param stageNames - Optional comma-separated string of stage names
	 * @param teamWide - Optional boolean indicating if pipeline is team-wide
	 * @param fieldNames - Optional comma-separated string of field names
	 * @param fieldTypes - Optional comma-separated string of field types
	 * @returns The newly created pipeline object
	 */
	public static async createPipeline(
		context: IExecuteFunctions,
		apiKey: string,
		name: string,
		teamKey: string,
		stageNames?: string,
		teamWide?: boolean,
		fieldNames?: string,
		fieldTypes?: string,
	): Promise<IStreakPipeline> {
		const body: IDataObject = {
			name,
			teamKey,
		};

		// Add optional parameters if provided
		if (stageNames && stageNames.trim() !== '') {
			body.stageNames = stageNames;
		}

		if (teamWide !== undefined) {
			body.teamWide = teamWide;
		}

		if (fieldNames && fieldNames.trim() !== '') {
			body.fieldNames = fieldNames;
		}

		if (fieldTypes && fieldTypes.trim() !== '') {
			body.fieldTypes = fieldTypes;
		}

		return this.makeRequestForm(
			context,
			'PUT',
			'/pipelines',
			apiKey,
			body,
		) as Promise<IStreakPipeline>;
	}

	/**
	 * Create a stage in a pipeline
	 * @param context - The n8n execution context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Key of the pipeline to create stage in
	 * @param stageName - Name of the stage to create
	 * @returns The newly created stage object
	 */
	public static async createStage(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		stageName: string,
	): Promise<IStreakStage> {
		return this.makeRequestForm(context, 'PUT', `/pipelines/${pipelineKey}/stages`, apiKey, {
			name: stageName,
		}) as Promise<IStreakStage>;
	}

	/**
	 * Update an existing pipeline
	 * @param context - The n8n execution context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Key of the pipeline to update
	 * @param name - New name for the pipeline
	 * @returns The updated pipeline object
	 */
	public static async updatePipeline(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		name: string,
	): Promise<IStreakPipeline> {
		return this.makeRequest(context, 'POST', `/pipelines/${pipelineKey}`, apiKey, {
			name,
		}) as Promise<IStreakPipeline>;
	}

	/**
	 * Update an existing pipeline with multiple fields
	 * @param context - The n8n execution context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Key of the pipeline to update
	 * @param updateData - Object containing fields to update
	 * @returns The updated pipeline object
	 */
	public static async updatePipelineWithData(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		updateData: IDataObject,
	): Promise<IStreakPipeline> {
		return this.makeRequest(
			context,
			'POST',
			`/pipelines/${pipelineKey}`,
			apiKey,
			updateData,
		) as Promise<IStreakPipeline>;
	}

	/**
	 * Delete a pipeline
	 * @param context - The n8n execution context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Key of the pipeline to delete
	 * @returns Success response
	 */
	public static async deletePipeline(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
	): Promise<IDataObject> {
		return this.makeRequest(
			context,
			'DELETE',
			`/pipelines/${pipelineKey}`,
			apiKey,
		) as Promise<IDataObject>;
	}

	/**
	 * Move boxes between pipelines
	 * @param context - The n8n execution context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Source pipeline key
	 * @param targetPipelineKey - Target pipeline key
	 * @param boxKeys - Array of box keys to move
	 * @returns Response with details about moved boxes
	 */
	public static async moveBoxesBatch(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		targetPipelineKey: string,
		boxKeys: string[],
	): Promise<IDataObject | IDataObject[]> {
		// Transform the input to match Streak API v2 requirements
		// API expects: [{ key: "boxKey", boxKey: "boxKey", pipelineKey: "targetPipelineKey" }, ...]
		const requestBody = boxKeys.map((boxKey) => ({
			key: boxKey,
			boxKey: boxKey,
			pipelineKey: targetPipelineKey,
		}));

		return this.makeRequest(
			context,
			'POST',
			`/pipelines/${pipelineKey}/boxes/batch`,
			apiKey,
			requestBody,
		);
	}

	/**
	 * Get all stages for a pipeline
	 * @param context - The n8n execution or load options context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Pipeline key to get stages for
	 * @returns Array of stage objects or raw response
	 */
	public static async getStages(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
		pipelineKey: string,
	): Promise<IDataObject | IDataObject[]> {
		const endpoint = `/pipelines/${pipelineKey}/stages`;

		const result = await this.makeRequest(context, 'GET', endpoint, apiKey);

		return result;
	}

	/**
	 * List boxes in a pipeline
	 * @param context - The n8n execution or load options context
	 * @param apiKey - Streak API key for authentication
	 * @param pipelineKey - Pipeline key to list boxes from
	 * @param limit - Optional limit on number of results
	 * @param page - Optional page number for pagination
	 * @returns Array of box objects in the pipeline
	 */
	public static async listBoxes(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
		pipelineKey: string,
		limit?: number,
		page?: number,
	): Promise<IStreakBox[]> {
		const query: IDataObject = {};

		if (limit !== undefined) {
			query.limit = limit;
		}

		if (page !== undefined) {
			query.page = page;
		}

		return this.makeRequest(
			context,
			'GET',
			`/pipelines/${pipelineKey}/boxes`,
			apiKey,
			undefined,
			query,
		) as Promise<IStreakBox[]>;
	}

	/**
	 * Search for boxes using the dedicated search endpoint
	 * @param context - The n8n execution or load options context
	 * @param apiKey - Streak API key for authentication
	 * @param query - Search query string
	 * @param pipelineKey - Optional pipeline key to limit search scope
	 * @param stageKey - Optional stage key to limit search scope
	 * @returns Array of search results containing boxes
	 */
	public static async searchBoxes(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
		query: string,
		pipelineKey?: string,
		stageKey?: string,
	): Promise<IStreakBox[]> {
		// Build query parameters
		const searchParams: IDataObject = {};

		if (pipelineKey) {
			searchParams.pipelineKey = pipelineKey;
		}

		if (stageKey) {
			searchParams.stageKey = stageKey;
		}

		// Use the search endpoint with query in the URL path
		// Add the query to searchParams
		searchParams.query = query;

		// Use the search endpoint
		const response = (await this.makeRequest(
			context,
			'GET',
			'/search',
			apiKey,
			undefined,
			searchParams,
			'v1', // Force v1 API for search endpoint
		)) as IStreakSearchResponse;

		// Extract boxes from search response
		// Streak search API returns results.boxes array
		if (
			response &&
			response.results &&
			response.results.boxes &&
			Array.isArray(response.results.boxes)
		) {
			return response.results.boxes;
		}

		return [];
	}

	/**
	 * Make a request to the Streak API with proper error handling
	 * @param context - The n8n execution or load options context
	 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
	 * @param endpoint - API endpoint (will be appended to base URL)
	 * @param apiKey - Streak API key for authentication
	 * @param body - Optional request body for methods like POST, PUT
	 * @param query - Optional query parameters
	 * @param apiVersion - Optional API version override
	 * @returns Response data from the API
	 */
	private static async makeRequest(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		method: IHttpRequestMethods,
		endpoint: string,
		apiKey: string,
		body?: IDataObject | IDataObject[],
		query?: IDataObject,
		apiVersion?: 'v1' | 'v2',
	): Promise<IDataObject | IDataObject[]> {
		try {
			// Auto-determine API version if not provided
			const version = apiVersion || getApiVersionForEndpoint(endpoint);

			const headers: Record<string, string> = {
				Accept: 'application/json',
			};

			// Add Content-Type header only when sending data
			if (['POST', 'PUT', 'PATCH'].includes(method)) {
				headers['Content-Type'] = 'application/json';
			}

			const options = {
				method,
				url: `${this.BASE_URL}/${version}${endpoint}`,
				headers,
				qs: query,
				body,
				json: true,
			};

			// Use the built-in n8n helper for authenticated requests
			if ('getNode' in context && 'getCredentials' in context) {
				// IExecuteFunctions context
				return await (context as IExecuteFunctions).helpers.httpRequestWithAuthentication.call(
					context as IExecuteFunctions,
					'streakApi',
					options,
				);
			} else {
				// ILoadOptionsFunctions context
				return await (context as ILoadOptionsFunctions).helpers.httpRequestWithAuthentication.call(
					context as ILoadOptionsFunctions,
					'streakApi',
					options,
				);
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
	 * Make a form-encoded request to the Streak API with proper error handling
	 * @param context - The n8n execution or load options context
	 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
	 * @param endpoint - API endpoint (will be appended to base URL)
	 * @param apiKey - Streak API key for authentication
	 * @param body - Optional request body for methods like POST, PUT
	 * @param query - Optional query parameters
	 * @param apiVersion - Optional API version override
	 * @returns Response data from the API
	 */
	public static async makeRequestForm(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		method: IHttpRequestMethods,
		endpoint: string,
		apiKey: string,
		body?: IDataObject | IDataObject[],
		query?: IDataObject,
		apiVersion?: 'v1' | 'v2',
	): Promise<IDataObject | IDataObject[]> {
		try {
			// Auto-determine API version if not provided
			const version = apiVersion || getApiVersionForEndpoint(endpoint);

			const headers: Record<string, string> = {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			};

			// Manually encode form data
			let formBody = '';
			if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
				const params = new URLSearchParams();
				for (const [key, value] of Object.entries(body)) {
					if (value !== undefined && value !== null) {
						params.append(key, String(value));
					}
				}
				formBody = params.toString();
			}

			const options = {
				method,
				url: `${this.BASE_URL}/${version}${endpoint}`,
				headers,
				qs: query,
				body: formBody,
			};

			// Use the built-in n8n helper for authenticated requests
			if ('getNode' in context && 'getCredentials' in context) {
				// IExecuteFunctions context
				return await (context as IExecuteFunctions).helpers.httpRequestWithAuthentication.call(
					context as IExecuteFunctions,
					'streakApi',
					options,
				);
			} else {
				// ILoadOptionsFunctions context
				return await (context as ILoadOptionsFunctions).helpers.httpRequestWithAuthentication.call(
					context as ILoadOptionsFunctions,
					'streakApi',
					options,
				);
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
}
