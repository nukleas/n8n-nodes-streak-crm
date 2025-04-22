import { IDataObject } from 'n8n-workflow';

/**
 * Interface for Box data returned from Streak API
 */
export interface IStreakBox extends IDataObject {
	key: string;
	name: string;
	notes?: string;
	stageKey?: string;
	creatorKey?: string;
	pipelineKey: string;
	followers?: string[];
	fields?: Record<string, any>;
	assignedToTeamKeyOrUserKey?: string;
	creationTimestamp?: number;
	lastUpdatedTimestamp?: number;
}
