import { IExecuteFunctions, IHttpRequestMethods, NodeOperationError } from 'n8n-workflow';

export abstract class AbstractService<T> {
	protected apiKey: string;
	protected baseUrl: string;
	protected context?: IExecuteFunctions;

	constructor(apiKey: string, baseUrl: string, context?: IExecuteFunctions) {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.context = context;
	}

	protected async request<R>(
		method: IHttpRequestMethods,
		path: string,
		body?: any,
		queryParams?: Record<string, string>,
	): Promise<R> {
		if (!this.context) {
			throw new Error(
				'Context is required for making HTTP requests. Please provide IExecuteFunctions context to the constructor.',
			);
		}

		const url = `${this.baseUrl}${path}`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		try {
			const response = await this.context.helpers.httpRequest({
				method,
				url,
				headers,
				auth: {
					username: this.apiKey,
					password: '',
				},
				qs: queryParams,
				body,
				json: true,
			});

			return response as R;
		} catch (error) {
			const errorDetails: string[] = [`API request failed: ${error.message || 'Unknown error'}`];

			// Extract HTTP status
			if (error.status || error.response?.status) {
				errorDetails.push(`Status: ${error.status || error.response?.status}`);
			}

			// Extract response body/data
			if (error.response?.data) {
				try {
					const data =
						typeof error.response.data === 'string'
							? error.response.data
							: JSON.stringify(error.response.data, null, 2);
					errorDetails.push(`Response: ${data}`);
				} catch {
					errorDetails.push(`Response: [Unable to stringify response data]`);
				}
			} else if (error.body) {
				try {
					const body =
						typeof error.body === 'string' ? error.body : JSON.stringify(error.body, null, 2);
					errorDetails.push(`Body: ${body}`);
				} catch {
					errorDetails.push(`Body: [Unable to stringify body]`);
				}
				const formBody = error.body ? new URLSearchParams(error.body).toString() : undefined;

				try {
					const response = await this.context.helpers.httpRequest({
						method,
						url,
						headers,
						auth: {
							username: this.apiKey,
							password: '',
						},
						qs: queryParams,
						body: formBody,
						json: false,
					});

					// Manually parse JSON response since json: false
					return (typeof response === 'string' ? JSON.parse(response) : response) as R;
				} catch (error) {
					// existing error handling…
					throw error;
				}
			}

			throw new NodeOperationError(this.context.getNode(), errorDetails.join('\n'), {
				description: error.description,
			});
		}
	}

	protected async requestFormEncoded<R>(
		method: IHttpRequestMethods,
		path: string,
		body?: any,
		queryParams?: Record<string, string>,
	): Promise<R> {
		if (!this.context) {
			throw new Error(
				'Context is required for making HTTP requests. Please provide IExecuteFunctions context to the constructor.',
			);
		}

		const url = `${this.baseUrl}${path}`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/x-www-form-urlencoded',
		};

		// Convert body to URL-encoded format
		const formBody = body ? new URLSearchParams(body).toString() : undefined;

		try {
			const response = await this.context.helpers.httpRequest({
				method,
				url,
				headers,
				auth: {
					username: this.apiKey,
					password: '',
				},
				qs: queryParams,
				body: formBody,
				json: true,
			});

			return response as R;
		} catch (error) {
			const errorDetails: string[] = [`API request failed: ${error.message || 'Unknown error'}`];

			// Extract HTTP status
			if (error.status || error.response?.status) {
				errorDetails.push(`Status: ${error.status || error.response?.status}`);
			}

			// Extract response body/data
			if (error.response?.data) {
				try {
					const data =
						typeof error.response.data === 'string'
							? error.response.data
							: JSON.stringify(error.response.data, null, 2);
					errorDetails.push(`Response: ${data}`);
				} catch {
					errorDetails.push(`Response: [Unable to stringify response data]`);
				}
			} else if (error.body) {
				try {
					const body =
						typeof error.body === 'string' ? error.body : JSON.stringify(error.body, null, 2);
					errorDetails.push(`Body: ${body}`);
				} catch {
					errorDetails.push(`Body: [Unable to stringify body]`);
				}
			}

			// Extract response headers
			if (error.response?.headers) {
				try {
					const headers = JSON.stringify(error.response.headers, null, 2);
					errorDetails.push(`Headers: ${headers}`);
				} catch {
					errorDetails.push(`Headers: [Unable to stringify headers]`);
				}
			}

			// Append stack trace
			if (error.stack) {
				errorDetails.push(`Stack: ${error.stack}`);
			}

			throw new NodeOperationError(this.context.getNode(), errorDetails.join('\n'), {
				description: error.description,
			});
		}
	}

	abstract get(id: string): Promise<T>;

	abstract query(queryParams?: Record<string, string>): Promise<T[]>;

	abstract update(id: string, params: Partial<T>): Promise<T>;

	abstract create(params: Omit<T, 'id'>): Promise<T>;

	abstract delete(id: string): Promise<void>;
}
