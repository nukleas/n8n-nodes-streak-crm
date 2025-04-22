import { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { StreakApiBase } from '../StreakApiBase';
import { IStreakBox } from '../interfaces';

/**
 * Service for managing Box resources in Streak API
 */
export class BoxService extends StreakApiBase {
	/**
	 * List boxes in a pipeline with pagination support
	 */
	public static async listBoxes(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		returnAll: boolean = false,
		limit: number = 50,
	): Promise<IStreakBox[]> {
		if (returnAll) {
			return this.handlePagination(
				context,
				`/pipelines/${pipelineKey}/boxes`,
				apiKey,
				returnAll,
				limit,
			) as Promise<IStreakBox[]>;
		} else {
			const response = await this.makeRequest(
				context,
				'GET',
				`/pipelines/${pipelineKey}/boxes`,
				apiKey,
				undefined,
				{ limit },
			);
			return response as IStreakBox[];
		}
	}

	/**
	 * Get a single box by key
	 */
	public static async getBox(
		context: IExecuteFunctions,
		apiKey: string,
		boxKey: string,
	): Promise<IStreakBox> {
		const response = await this.makeRequest(
			context,
			'GET',
			`/boxes/${boxKey}`,
			apiKey,
		);
		return response as IStreakBox;
	}

	/**
	 * Get multiple boxes in a batch operation
	 */
	public static async getMultipleBoxes(
		context: IExecuteFunctions,
		apiKey: string,
		boxKeys: string[],
	): Promise<IStreakBox[]> {
		const response = await this.makeRequest(
			context,
			'POST',
			'/boxes/batchGet',
			apiKey,
			{
				boxKeys,
			},
		);
		return response as IStreakBox[];
	}

	/**
	 * Create a new box in a pipeline
	 */
	public static async createBox(
		context: IExecuteFunctions,
		apiKey: string,
		pipelineKey: string,
		boxName: string,
		stageKey: string = '',
		additionalFields: IDataObject = {},
	): Promise<IStreakBox> {
		const body: IDataObject = {
			name: boxName,
		};
		
		if (stageKey) {
			body.stageKey = stageKey;
		}
		
		if (additionalFields.notes) {
			body.notes = additionalFields.notes;
		}
		
		if (additionalFields.assignedToTeamKeyOrUserKey) {
			body.assignedToTeamKeyOrUserKey = additionalFields.assignedToTeamKeyOrUserKey;
		}
		
		const response = await this.makeRequest(
			context,
			'POST',
			`/pipelines/${pipelineKey}/boxes`,
			apiKey,
			body,
		);
		return response as IStreakBox;
	}

	/**
	 * Update an existing box
	 */
	public static async updateBox(
		context: IExecuteFunctions,
		apiKey: string,
		boxKey: string,
		updateFields: IDataObject,
	): Promise<IStreakBox> {
		const response = await this.makeRequest(
			context,
			'POST',
			`/boxes/${boxKey}`,
			apiKey,
			updateFields,
		);
		return response as IStreakBox;
	}

	/**
	 * Delete a box
	 */
	public static async deleteBox(
		context: IExecuteFunctions,
		apiKey: string,
		boxKey: string,
	): Promise<IDataObject> {
		const response = await this.makeRequest(
			context,
			'DELETE',
			`/boxes/${boxKey}`,
			apiKey,
		);
		return response as IDataObject;
	}

	/**
	 * Get box timeline with pagination support
	 */
	public static async getBoxTimeline(
		context: IExecuteFunctions,
		apiKey: string,
		boxKey: string,
		returnAll: boolean = false,
		limit: number = 50,
	): Promise<IDataObject[]> {
		if (returnAll) {
			return this.handlePagination(
				context,
				`/boxes/${boxKey}/timeline`,
				apiKey,
				returnAll,
				limit,
			);
		} else {
			const response = await this.makeRequest(
				context,
				'GET',
				`/boxes/${boxKey}/timeline`,
				apiKey,
				undefined,
				{ limit },
			);
			return response as IDataObject[];
		}
	}
}
