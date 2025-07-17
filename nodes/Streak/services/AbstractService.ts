import { URL } from 'url';

export abstract class AbstractService<T> {
	protected apiKey: string;
	protected baseUrl: string;

	constructor(apiKey: string, baseUrl: string) {
		this.apiKey = apiKey;

		this.baseUrl = baseUrl;
	}

	protected async request<R>(
		method: string,
		path: string,
		body?: any,
		queryParams?: Record<string, string>,
	): Promise<R> {
		const url = new URL(`${this.baseUrl}${path}`);

		if (queryParams) {
			Object.entries(queryParams).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
		};

		try {
			const response = await fetch(url.toString(), {
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					`API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
				);
			}

			const data = await response.json();
			return data as R;
		} catch (error) {
			console.error(`Request failed:`, error);
			throw error;
		}
	}

	abstract get(id: string): Promise<T>;

	abstract query(queryParams?: Record<string, string>): Promise<T[]>;

	abstract update(id: string, params: Partial<T>): Promise<T>;

	abstract create(params: Omit<T, 'id'>): Promise<T>;

	abstract delete(id: string): Promise<void>;
}
