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
			throw new NodeOperationError(
				this.context.getNode(),
				`API request failed: ${error.message || 'Unknown error'}`,
			);
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
			throw new NodeOperationError(
				this.context.getNode(),
				`API request failed: ${error.message || 'Unknown error'}`,
			);
		}
	}

	abstract get(id: string): Promise<T>;

	abstract query(queryParams?: Record<string, string>): Promise<T[]>;

	abstract update(id: string, params: Partial<T>): Promise<T>;

	abstract create(params: Omit<T, 'id'>): Promise<T>;

	abstract delete(id: string): Promise<void>;
}
