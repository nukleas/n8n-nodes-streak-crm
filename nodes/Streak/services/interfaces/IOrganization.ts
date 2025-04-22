import { IDataObject } from 'n8n-workflow';

/**
 * Interface for Organization data returned from Streak API
 */
export interface IStreakOrganization extends IDataObject {
	key: string;
	name: string;
	domains?: string[];
	relationships?: IDataObject;
	creatorKey?: string;
}
