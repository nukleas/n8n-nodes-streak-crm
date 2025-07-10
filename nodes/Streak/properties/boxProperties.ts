import type { INodeProperties } from 'n8n-workflow';

export const boxProperties: INodeProperties[] = [
	// Box Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['box'],
			},
		},
		default: 'listBoxes',
		options: [
			{
				name: 'Create Box',
				value: 'createBox',
				description: 'Creates a new box in a pipeline',
				action: 'Create a box',
			},
			{
				name: 'Delete Box',
				value: 'deleteBox',
				description: 'Deletes a box',
				action: 'Delete a box',
			},
			{
				name: 'Get Box',
				value: 'getBox',
				description: 'Gets a specific box by its key',
				action: 'Get a box',
			},
			{
				name: 'Get Multiple Boxes',
				value: 'getMultipleBoxes',
				description: 'Gets multiple boxes by their keys',
				action: 'Get multiple boxes',
			},
			{
				name: 'Get Timeline',
				value: 'getTimeline',
				description: 'Gets the timeline of events for a box',
				action: 'Get timeline',
			},
			{
				name: 'List Boxes in Pipeline',
				value: 'listBoxes',
				description: 'Get all boxes (deals) in a pipeline',
				action: 'Get all boxes in a pipeline',
			},
			{
				name: 'Update Box',
				value: 'updateBox',
				description: 'Updates an existing box',
				action: 'Update a box',
			},
		],
	},

	// Box Key (for box operations)
	{
		displayName: 'Box Key',
		name: 'boxKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the box',
		displayOptions: {
			show: {
				resource: ['box'],
				operation: [
					'getBox',
					'updateBox',
					'deleteBox',
					'getTimeline',
				],
			},
		},
	},

	// Box Keys (for getMultipleBoxes)
	{
		displayName: 'Box Keys',
		name: 'boxKeys',
		type: 'string',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Box Key',
		},
		default: [],
		required: true,
		description: 'The keys of the boxes to get',
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['getMultipleBoxes'],
			},
		},
	},

	{
		displayName: 'Pipeline',
		name: 'pipelineKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The pipeline to get boxes from',
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
				resource: ['box'],
				operation: [
					'listBoxes',
					'createBox',
				],
			},
		},
	},

	// Stage Key (for listBoxes filtering)
	{
		displayName: 'Stage',
		name: 'stageKeyFilter',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description: 'The stage to filter boxes by (optional)',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getStageOptions',
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
				resource: ['box'],
				operation: ['listBoxes'],
			},
		},
	},

	// Box Name (for createBox)
	{
		displayName: 'Box Name',
		name: 'boxName',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the box to create',
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['createBox'],
			},
		},
	},

	// Stage Key (for createBox)
	{
		displayName: 'Stage',
		name: 'stageKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description: 'The stage to place the box in (optional)',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getStageOptions',
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
				resource: ['box'],
				operation: ['createBox'],
			},
		},
	},

	// Additional Fields (for createBox)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['createBox'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes to add to the box',
			},
			{
				displayName: 'Assigned To (Team/User Key)',
				name: 'assignedToTeamKeyOrUserKey',
				type: 'string',
				default: '',
				description: 'Team or user key to assign the box to',
			},
		],
	},

	// Update Fields (for updateBox)
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['updateBox'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the box',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'New notes for the box',
			},
			{
				displayName: 'Stage Key',
				name: 'stageKey',
				type: 'string',
				default: '',
				description: 'New stage key for the box (use expressions to get from stage dropdown)',
			},
			{
				displayName: 'Assigned To (Team/User Key)',
				name: 'assignedToTeamKeyOrUserKey',
				type: 'string',
				default: '',
				description: 'New team or user key to assign the box to',
			},
		],
	},
];