import { IDataObject } from 'n8n-workflow';

/**
 * Interface for Stage data returned from Streak API
 */
export interface IStreakStage extends IDataObject {
	key: string;
	name: string;
	pipelineKey: string;
	creatorKey?: string;
	orderNumber?: number;
}
