import type { INodeProperties } from 'n8n-workflow';

export const snippetProperties: INodeProperties[] = [
	// Snippet Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['snippet'],
			},
		},
		default: 'listSnippets',
		options: [
			{
				name: 'Create Snippet',
				value: 'createSnippet',
				description: 'Creates a new snippet',
				action: 'Create a snippet',
			},
			{
				name: 'Delete Snippet',
				value: 'deleteSnippet',
				description: 'Deletes a snippet',
				action: 'Delete a snippet',
			},
			{
				name: 'Edit Snippet',
				value: 'editSnippet',
				description: 'Edits an existing snippet',
				action: 'Edit a snippet',
			},
			{
				name: 'Get Snippet',
				value: 'getSnippet',
				description: 'Gets a specific snippet',
				action: 'Get a snippet',
			},
			{
				name: 'List Snippets',
				value: 'listSnippets',
				description: 'Lists all snippets for the current user',
				action: 'List snippets',
			},
		],
	},

	// Snippet Key (for get/edit/delete)
	{
		displayName: 'Snippet Key',
		name: 'snippetKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the snippet',
		displayOptions: {
			show: {
				resource: ['snippet'],
				operation: ['getSnippet', 'editSnippet', 'deleteSnippet'],
			},
		},
	},

	// Snippet Name (for create)
	{
		displayName: 'Name',
		name: 'snippetName',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the snippet',
		displayOptions: {
			show: {
				resource: ['snippet'],
				operation: ['createSnippet'],
			},
		},
	},

	// Snippet Body (for create)
	{
		displayName: 'Body',
		name: 'snippetBody',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		default: '',
		required: true,
		description: 'The body content of the snippet',
		displayOptions: {
			show: {
				resource: ['snippet'],
				operation: ['createSnippet'],
			},
		},
	},

	// Update Fields (for edit)
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['snippet'],
				operation: ['editSnippet'],
			},
		},
		options: [
			{
				displayName: 'Body',
				name: 'snippetBody',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'New body content for the snippet',
			},
			{
				displayName: 'Name',
				name: 'snippetName',
				type: 'string',
				default: '',
				description: 'New name for the snippet',
			},
		],
	},
];
