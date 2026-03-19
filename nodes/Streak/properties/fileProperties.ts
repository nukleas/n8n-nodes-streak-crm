import type { INodeProperties } from 'n8n-workflow';

export const fileProperties: INodeProperties[] = [
	// File Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
		default: 'listFilesInBox',
		options: [
			{
				name: 'Add File to Box',
				value: 'addFileToBox',
				description: 'Adds a Google Drive file to a box',
				action: 'Add a file to a box',
			},
			{
				name: 'Get File Contents',
				value: 'getFileContents',
				description:
					'Gets the contents of a file (only works for GMAIL_API file types)',
				action: 'Get file contents',
			},
			{
				name: 'Get File Metadata',
				value: 'getFile',
				description: 'Gets metadata for a specific file',
				action: 'Get file metadata',
			},
			{
				name: 'List Files in Box',
				value: 'listFilesInBox',
				description: 'Lists all files associated with a box',
				action: 'List files in a box',
			},
		],
	},

	// File Key (for get/getContents)
	{
		displayName: 'File Key',
		name: 'fileKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the file',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getFile', 'getFileContents'],
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
				resource: ['file'],
				operation: ['listFilesInBox', 'addFileToBox'],
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
				resource: ['file'],
				operation: ['listFilesInBox', 'addFileToBox'],
			},
		},
	},

	// Drive File ID (for add)
	{
		displayName: 'Google Drive File ID',
		name: 'driveFileId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Google Drive file ID to add to the box',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['addFileToBox'],
			},
		},
	},
];
