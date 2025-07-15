import type { INodeProperties } from 'n8n-workflow';

export const teamProperties: INodeProperties[] = [
	// Team Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['team'],
			},
		},
		default: 'getMyTeams',
		options: [
			{
				name: 'Get My Teams',
				value: 'getMyTeams',
				description: 'List all teams the authenticated user belongs to',
				action: 'Get my teams',
			},
			{
				name: 'Get Team',
				value: 'getTeam',
				description: 'Get information about a specific team',
				action: 'Get a team',
			},
		],
	},

	// Team Key (only for getTeam operation)
	{
		displayName: 'Team Name or ID',
		name: 'teamKey',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTeamOptions',
		},
		default: '',
		required: true,
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['getTeam'],
			},
		},
	},
];