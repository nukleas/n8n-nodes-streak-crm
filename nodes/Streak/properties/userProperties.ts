import type { INodeProperties } from 'n8n-workflow';

export const userProperties: INodeProperties[] = [
	// User Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		default: 'getCurrentUser',
		options: [
			{
				name: 'Get Current User',
				value: 'getCurrentUser',
				description: 'Get information about the current user',
				action: 'Get current user',
			},
			{
				name: 'Get User',
				value: 'getUser',
				description: 'Get information about a specific user by their key',
				action: 'Get a user',
			},
		],
	},

	// User Key (only for getUser operation)
	{
		displayName: 'User Key',
		name: 'userKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the user to get information about',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUser'],
			},
		},
	},
];
