import { IDataObject } from 'n8n-workflow';
import { IStreakStage } from './IStage';

/**
 * Interface for Pipeline data returned from Streak API
 */
export interface IStreakPipeline extends IDataObject {
	key: string;
	name: string;
	description?: string;
	orgWide?: boolean;
	teamKey?: string;
	creatorKey?: string;
	aclEntries?: IDataObject[];
	fields?: IDataObject[];
	stages?: IStreakStage[];
}
