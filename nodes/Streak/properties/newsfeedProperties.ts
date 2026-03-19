import type { INodeProperties } from 'n8n-workflow';

export const newsfeedProperties: INodeProperties[] = [
	// Newsfeed Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['newsfeed'],
			},
		},
		default: 'getAllNewsfeed',
		options: [
			{
				name: 'Get All Newsfeed',
				value: 'getAllNewsfeed',
				description: 'Gets activity across all pipelines',
				action: 'Get all newsfeed',
			},
			{
				name: 'Get Box Newsfeed',
				value: 'getBoxNewsfeed',
				description: 'Gets activity history for a specific box',
				action: 'Get box newsfeed',
			},
			{
				name: 'Get Pipeline Newsfeed',
				value: 'getPipelineNewsfeed',
				description: 'Gets activity history for a pipeline and its boxes',
				action: 'Get pipeline newsfeed',
			},
		],
	},

	// Pipeline Key (for pipeline newsfeed)
	{
		displayName: 'Pipeline Key',
		name: 'pipelineKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the pipeline',
		displayOptions: {
			show: {
				resource: ['newsfeed'],
				operation: ['getPipelineNewsfeed'],
			},
		},
	},

	// Box Key (for box newsfeed)
	{
		displayName: 'Box',
		name: 'boxKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The box to get the newsfeed for',
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
				resource: ['newsfeed'],
				operation: ['getBoxNewsfeed'],
			},
		},
	},

	// Detail Level
	{
		displayName: 'Detail Level',
		name: 'detailLevel',
		type: 'options',
		default: 'ALL',
		description: 'The level of detail for newsfeed items',
		options: [
			{
				name: 'All',
				value: 'ALL',
			},
			{
				name: 'Condensed',
				value: 'CONDENSED',
			},
		],
		displayOptions: {
			show: {
				resource: ['newsfeed'],
				operation: ['getAllNewsfeed', 'getBoxNewsfeed', 'getPipelineNewsfeed'],
			},
		},
	},
];
