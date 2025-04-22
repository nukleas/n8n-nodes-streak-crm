import { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { StreakApiBase } from '../StreakApiBase';
import { IStreakPipeline } from '../interfaces';

/**
 * Service for managing Pipeline resources in Streak API
 */
export class PipelineService extends StreakApiBase {
	/**
	 * Get all pipelines
	 */
	public static async getPipelines(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		apiKey: string,
	): Promise<IStreakPipeline[]> {
		const response = await this.makeRequest(
			context,
			'GET',
			'/pipelines',
			apiKey,
		);
		return response as IStreakPipeline[];
	}

	/**
	 * Get a specific pipeline by key
	 */
	public static async getPipeline(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
	): Promise<IStreakPipeline> {
		const response = await this.makeRequest(
			context,
			'GET',
			`/pipelines/${pipelineKey}`,
			apiKey,
		);
		return response as IStreakPipeline;
	}

	/**
	 * Create a new pipeline
	 */
	public static async createPipeline(
		context: IExecuteFunctions,
		apiKey: string,
		name: string,
	): Promise<IStreakPipeline> {
		const response = await this.makeRequest(
			context,
			'PUT',
			'/pipelines',
			apiKey,
			{
				name,
			},
		);
		return response as IStreakPipeline;
	}

	/**
	 * Update an existing pipeline
	 */
	public static async updatePipeline(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		name: string,
	): Promise<IStreakPipeline> {
		const response = await this.makeRequest(
			context,
			'POST',
			`/pipelines/${pipelineKey}`,
			apiKey,
			{
				name,
			},
		);
		return response as IStreakPipeline;
	}

	/**
	 * Delete a pipeline
	 */
	public static async deletePipeline(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
	): Promise<IDataObject> {
		const response = await this.makeRequest(
			context,
			'DELETE',
			`/pipelines/${pipelineKey}`,
			apiKey,
		);
		return response as IDataObject;
	}

	/**
	 * Move boxes from one pipeline to another in a batch operation
	 */
	public static async moveBoxesBatch(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		targetPipelineKey: string,
		boxKeys: string[],
	): Promise<IDataObject | IDataObject[]> {
		return this.makeRequest(
			context,
			'POST',
			`/pipelines/${pipelineKey}/moveBoxes`,
			apiKey,
			{
				targetPipelineKey,
				boxKeys,
			},
		);
	}
}
