import type { INodeProperties } from 'n8n-workflow';

export const threadProperties: INodeProperties[] = [
	// Thread Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['thread'],
			},
		},
		default: 'listThreadsInBox',
		options: [
			{
				name: 'Add Thread to Box',
				value: 'addThreadToBox',
				description: 'Adds an email thread to a box',
				action: 'Add a thread to a box',
			},
			{
				name: 'Get Thread',
				value: 'getThread',
				description: 'Gets a specific email thread',
				action: 'Get a thread',
			},
			{
				name: 'List Threads in Box',
				value: 'listThreadsInBox',
				description: 'Lists all email threads in a box',
				action: 'List threads in a box',
			},
			{
				name: 'Remove Thread',
				value: 'removeThread',
				description: 'Removes an email thread from a box',
				action: 'Remove a thread',
			},
		],
	},

	// Thread Key (for get/remove)
	{
		displayName: 'Thread Key',
		name: 'threadKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the thread',
		displayOptions: {
			show: {
				resource: ['thread'],
				operation: ['getThread', 'removeThread'],
			},
		},
	},

	// Pipeline Key (required for box dependency)
	{
		displayName: 'Pipeline Key',
		name: 'pipelineKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the pipeline containing the box',
		displayOptions: {
			show: {
				resource: ['thread'],
				operation: ['listThreadsInBox', 'addThreadToBox'],
			},
		},
	},

	// Box Key (for list/add)
	{
		displayName: 'Box',
		name: 'boxKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The box to operate on',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getBoxOptions',
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'agxzfm1haWw...',
			},
		],
		displayOptions: {
			show: {
				resource: ['thread'],
				operation: ['listThreadsInBox', 'addThreadToBox'],
			},
		},
	},

	// Thread Gmail ID (for add)
	{
		displayName: 'Thread Gmail ID',
		name: 'threadGmailId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Gmail thread ID to add to the box',
		displayOptions: {
			show: {
				resource: ['thread'],
				operation: ['addThreadToBox'],
			},
		},
	},
];
