import { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { StreakApiBase } from '../StreakApiBase';
import { IStreakOrganization } from '../interfaces';

/**
 * Service for managing Organization resources in Streak API
 */
export class OrganizationService extends StreakApiBase {
	/**
	 * Get all organizations
	 */
	public static async getOrganizations(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
	): Promise<IStreakOrganization[]> {
		const response = await this.makeRequest(
			context,
			'GET',
			'/organizations',
			apiKey,
		);
		return response as IStreakOrganization[];
	}

	/**
	 * Get a specific organization by key
	 */
	public static async getOrganization(
		context: IExecuteFunctions,
		apiKey: string,
		organizationKey: string,
	): Promise<IStreakOrganization> {
		const response = await this.makeRequest(
			context,
			'GET',
			`/organizations/${organizationKey}`,
			apiKey,
		);
		return response as IStreakOrganization;
	}

	/**
	 * Create a new organization
	 */
	public static async createOrganization(
		context: IExecuteFunctions,
		apiKey: string,
		name: string,
		additionalFields?: IDataObject,
	): Promise<IStreakOrganization> {
		const body: IDataObject = { name };

		if (additionalFields?.domains && (additionalFields.domains as string[]).length > 0) {
			body.domains = additionalFields.domains;
		}

		if (additionalFields?.relationships) {
			body.relationships = additionalFields.relationships;
		}

		const response = await this.makeRequest(
			context,
			'POST',
			'/organizations',
			apiKey,
			body,
		);
		return response as IStreakOrganization;
	}

	/**
	 * Check for existing organizations by name or domain
	 */
	public static async checkExistingOrganizations(
		context: IExecuteFunctions,
		apiKey: string,
		checkFields: IDataObject,
	): Promise<IStreakOrganization[]> {
		const queryParams: IDataObject = {};

		if (checkFields.name) {
			queryParams.name = checkFields.name;
		}

		if (checkFields.domain) {
			queryParams.domain = checkFields.domain;
		}

		const response = await this.makeRequest(
			context,
			'GET',
			'/organizations/search',
			apiKey,
			undefined,
			queryParams,
		);
		return response as IStreakOrganization[];
	}

	/**
	 * Update an existing organization
	 */
	public static async updateOrganization(
		context: IExecuteFunctions,
		apiKey: string, 
		organizationKey: string,
		updateFields: IDataObject,
	): Promise<IStreakOrganization> {
		const response = await this.makeRequest(
			context,
			'POST',
			`/organizations/${organizationKey}`,
			apiKey,
			updateFields,
		);
		return response as IStreakOrganization;
	}

	/**
	 * Delete an organization
	 */
	public static async deleteOrganization(
		context: IExecuteFunctions,
		apiKey: string,
		organizationKey: string,
	): Promise<IDataObject> {
		const response = await this.makeRequest(
			context,
			'DELETE',
			`/organizations/${organizationKey}`,
			apiKey,
		);
		return response as IDataObject;
	}
}
