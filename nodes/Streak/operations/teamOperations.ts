import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { streakApiRequest, validateParameters } from './utils';

/**
 * Handle team-related operations for the Streak API
 */
export async function handleTeamOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	// Handle team operations
	if (operation === 'getMyTeams') {
		// Get My Teams operation
		return await streakApiRequest(this, 'GET', '/users/me/teams');
	} else if (operation === 'getTeam') {
		// Get Team operation
		const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;

		validateParameters.call(this, { teamKey }, ['teamKey'], itemIndex);

		return await streakApiRequest(this, 'GET', `/teams/${teamKey}`);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The team operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
