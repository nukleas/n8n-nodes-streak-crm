import type { INodeProperties } from 'n8n-workflow';

export const commentProperties: INodeProperties[] = [
	// Comment Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		default: 'listCommentsInBox',
		options: [
			{
				name: 'Create Comment',
				value: 'createComment',
				description: 'Creates a new comment on a box',
				action: 'Create a comment',
			},
			{
				name: 'Delete Comment',
				value: 'deleteComment',
				description: 'Deletes a comment',
				action: 'Delete a comment',
			},
			{
				name: 'Edit Comment',
				value: 'editComment',
				description: 'Edits an existing comment',
				action: 'Edit a comment',
			},
			{
				name: 'Get Comment',
				value: 'getComment',
				description: 'Gets a specific comment',
				action: 'Get a comment',
			},
			{
				name: 'List Comments in Box',
				value: 'listCommentsInBox',
				description: 'Lists all comments in a box',
				action: 'List comments in a box',
			},
		],
	},

	// Comment Key (for get/edit/delete)
	{
		displayName: 'Comment Key',
		name: 'commentKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the comment',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getComment', 'editComment', 'deleteComment'],
			},
		},
	},

	// Pipeline (optional, used to populate the box dropdown)
	{
		displayName: 'Pipeline',
		name: 'pipelineKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description: 'Optional. Select a pipeline to populate the Box dropdown below. Not needed if entering a Box ID directly.',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getPipelineOptions',
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
				resource: ['comment'],
				operation: ['listCommentsInBox', 'createComment'],
			},
		},
	},

	// Box Key (for list/create)
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
				resource: ['comment'],
				operation: ['listCommentsInBox', 'createComment'],
			},
		},
	},

	// Message (for create/edit)
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		description: 'The comment message text',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['createComment', 'editComment'],
			},
		},
	},
];
