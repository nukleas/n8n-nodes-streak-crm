import type { INodeProperties } from 'n8n-workflow';

export const searchProperties: INodeProperties[] = [
	// Search Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		default: 'search',
		options: [
			{
				name: 'Search',
				value: 'search',
				description: 'Search across boxes, contacts, and organizations',
				action: 'Search streak data',
			},
		],
	},

	// Search Query
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		description: 'The search query string',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['search'],
			},
		},
	},
];
