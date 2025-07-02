import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters } from './utils';

/**
 * Handle team-related operations for the Streak API
 */
export async function handleTeamOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle team operations
	if (operation === 'getMyTeams') {
		// Get My Teams operation - teams are typically included in the user object
		// Since there's no direct /teams endpoint, we get the current user which includes team info
		const userResponse = await makeStreakRequest.call(
			this,
			'GET',
			'/users/me',
			apiKey,
			itemIndex,
			undefined,
			undefined,
			'v2',
		);
		
		// Extract teams from user response if available
		if (userResponse && typeof userResponse === 'object' && 'teams' in userResponse) {
			return userResponse.teams as IDataObject[];
		}
		
		// If teams not in user object, try alternative endpoint
		// Note: This might need adjustment based on actual API behavior
		return await makeStreakRequest.call(
			this,
			'GET',
			'/users/me/teams',
			apiKey,
			itemIndex,
			undefined,
			undefined,
			'v2',
		);
	} else if (operation === 'getTeam') {
		// Get Team operation - uses v2 API
		const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
		
		validateParameters.call(this, { teamKey }, ['teamKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/teams/${teamKey}`,
			apiKey,
			itemIndex,
			undefined,
			undefined,
			'v2',
		);
	}

	throw new NodeOperationError(this.getNode(), `The team operation "${operation}" is not supported!`, { itemIndex });
}
