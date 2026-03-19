import type { INodeProperties } from 'n8n-workflow';

export const meetingProperties: INodeProperties[] = [
	// Meeting Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['meeting'],
			},
		},
		default: 'createMeeting',
		options: [
			{
				name: 'Create Meeting',
				value: 'createMeeting',
				description: 'Creates a new meeting or call log for a box',
				action: 'Create a meeting',
			},
			{
				name: 'Delete Meeting',
				value: 'deleteMeeting',
				description: 'Deletes a meeting',
				action: 'Delete a meeting',
			},
			{
				name: 'Edit Meeting',
				value: 'editMeeting',
				description: 'Edits an existing meeting',
				action: 'Edit a meeting',
			},
		],
	},

	// Meeting Key (for edit/delete)
	{
		displayName: 'Meeting Key',
		name: 'meetingKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the meeting',
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['editMeeting', 'deleteMeeting'],
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
				resource: ['meeting'],
				operation: ['createMeeting'],
			},
		},
	},

	// Box Key (for create)
	{
		displayName: 'Box',
		name: 'boxKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The box to create the meeting in',
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
				resource: ['meeting'],
				operation: ['createMeeting'],
			},
		},
	},

	// Meeting Type (for create)
	{
		displayName: 'Meeting Type',
		name: 'meetingType',
		type: 'options',
		default: 'MEETING_NOTES',
		required: true,
		description: 'The type of meeting',
		options: [
			{
				name: 'Meeting Notes',
				value: 'MEETING_NOTES',
			},
			{
				name: 'Call Log',
				value: 'CALL_LOG',
			},
		],
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['createMeeting'],
			},
		},
	},

	// Start Timestamp (for create)
	{
		displayName: 'Start Time',
		name: 'startTimestamp',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'The start time of the meeting',
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['createMeeting'],
			},
		},
	},

	// Additional Fields (for create)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['meeting'],
				operation: ['createMeeting'],
			},
		},
		options: [
			{
				displayName: 'Duration (Minutes)',
				name: 'duration',
				type: 'number',
				default: 30,
				description: 'The duration of the meeting in minutes',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the meeting',
			},
		],
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
				resource: ['meeting'],
				operation: ['editMeeting'],
			},
		},
		options: [
			{
				displayName: 'Duration (Minutes)',
				name: 'duration',
				type: 'number',
				default: 30,
				description: 'The duration of the meeting in minutes',
			},
			{
				displayName: 'Meeting Type',
				name: 'meetingType',
				type: 'options',
				default: 'MEETING_NOTES',
				description: 'The type of meeting',
				options: [
					{
						name: 'Meeting Notes',
						value: 'MEETING_NOTES',
					},
					{
						name: 'Call Log',
						value: 'CALL_LOG',
					},
				],
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the meeting',
			},
			{
				displayName: 'Start Time',
				name: 'startTimestamp',
				type: 'dateTime',
				default: '',
				description: 'The start time of the meeting',
			},
		],
	},
];
