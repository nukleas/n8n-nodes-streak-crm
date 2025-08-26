import { AbstractService } from './AbstractService';

/**
 * Interface for Streak Field data
 */
export interface IStreakField {
	key: string;
	name: string;
	type: string;
	description?: string;
	keyName?: string;
	enumValues?: string[];
	[key: string]: any;
}

/**
 * Interface for Streak Field Value data
 */
export interface IStreakFieldValue {
	key: string;
	value: string | number | boolean | Record<string, any>;
	[key: string]: any;
}

/**
 * Service for managing Streak CRM Fields.
 * Fields are custom data fields that can be added to pipelines and boxes.
 */
export class FieldsService extends AbstractService<IStreakField> {
	private pipelineKey: string;

	constructor(apiKey: string, pipelineKey: string) {
		super(apiKey, 'https://api.streak.com/api/v1');
		this.pipelineKey = pipelineKey;
	}

	/**
	 * Get a specific field by its key
	 * @param id The field key
	 * @returns The field object
	 */
	async get(id: string): Promise<IStreakField> {
		return this.request<IStreakField>('GET', `/pipelines/${this.pipelineKey}/fields/${id}`);
	}

	/**
	 * Query fields in a pipeline
	 * @param queryParams Optional query parameters for filtering results
	 * @returns Array of field objects
	 */
	async query(queryParams?: Record<string, string>): Promise<IStreakField[]> {
		return this.request<IStreakField[]>(
			'GET',
			`/pipelines/${this.pipelineKey}/fields`,
			undefined,
			queryParams,
		);
	}

	/**
	 * Update a field's properties
	 * @param id The field key
	 * @param params The properties to update
	 * @returns The updated field object
	 */
	async update(id: string, params: Partial<IStreakField>): Promise<IStreakField> {
		return this.request<IStreakField>(
			'POST',
			`/pipelines/${this.pipelineKey}/fields/${id}`,
			params,
		);
	}

	/**
	 * Create a new field
	 * @param params The field properties
	 * @returns The newly created field object
	 */
	async create(params: Omit<IStreakField, 'key'>): Promise<IStreakField> {
		// For field creation, we need to use form-encoded data
		const fieldData = {
			name: params.name,
			type: params.type,
			...(params.description && { description: params.description }),
			...(params.keyName && { keyName: params.keyName }),
			...(params.enumValues && { enumValues: params.enumValues }),
		};

		// Use special method for form-encoded request
		return this.requestFormEncoded<IStreakField>(
			'PUT',
			`/pipelines/${this.pipelineKey}/fields`,
			fieldData,
		);
	}

	/**
	 * Delete a field
	 * @param id The field key
	 */
	async delete(id: string): Promise<void> {
		await this.request('DELETE', `/pipelines/${this.pipelineKey}/fields/${id}`);
	}

	/**
	 * Get field values for a box
	 * @param boxKey The box key
	 * @returns Array of field value objects
	 */
	async getBoxFieldValues(boxKey: string): Promise<IStreakFieldValue[]> {
		return this.request<IStreakFieldValue[]>('GET', `/boxes/${boxKey}/fields`);
	}

	/**
	 * Get a specific field value for a box
	 * @param boxKey The box key
	 * @param fieldKey The field key
	 * @returns The field value object
	 */
	async getBoxFieldValue(boxKey: string, fieldKey: string): Promise<IStreakFieldValue> {
		return this.request<IStreakFieldValue>('GET', `/boxes/${boxKey}/fields/${fieldKey}`);
	}

	/**
	 * Update a field value for a box
	 * @param boxKey The box key
	 * @param fieldKey The field key
	 * @param value The new field value
	 * @returns The updated field value object
	 */
	async updateBoxFieldValue(
		boxKey: string,
		fieldKey: string,
		value: string | number | boolean | Record<string, any>,
	): Promise<IStreakFieldValue> {
		return this.request<IStreakFieldValue>('POST', `/boxes/${boxKey}/fields/${fieldKey}`, {
			value,
		});
	}
}
