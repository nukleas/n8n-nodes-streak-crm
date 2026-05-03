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
				name: 'Create Box in a Pipeline',
				value: 'createBox',
				description: 'Creates a new box in a pipeline',
				action: 'Create a box in a pipeline',
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
				operation: ['getBox', 'updateBox', 'deleteBox', 'getTimeline'],
			},
		},
	},

	// Timeline Filters (for getTimeline)
	{
		displayName: 'Filters',
		name: 'timelineFilters',
		type: 'multiOptions',
		default: [],
		description: 'Entity types to include in the timeline. If none are selected, all types are included.',
		options: [
			{ name: 'Box Creation/Move', value: 'NEWSFEED_BOX_CREATION_MOVE' },
			{ name: 'Box Edit', value: 'NEWSFEED_BOX_EDIT' },
			{ name: 'Call Logs', value: 'CALL_LOGS' },
			{ name: 'Comments', value: 'COMMENTS' },
			{ name: 'Emails', value: 'EMAILS' },
			{ name: 'Files', value: 'FILES' },
			{ name: 'Hangouts Chat', value: 'HANGOUTS_CHAT' },
			{ name: 'Meeting Notes', value: 'MEETING_NOTES' },
		],
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['getTimeline'],
			},
		},
	},

	// Timeline Start Timestamp (for getTimeline)
	{
		displayName: 'Start Timestamp',
		name: 'startTimestamp',
		type: 'dateTime',
		default: '',
		description: 'Return entries starting from this point. Descending returns entries before this time, Ascending returns entries after. Leave empty for no filter.',
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['getTimeline'],
			},
		},
	},

	// Timeline Direction (for getTimeline)
	{
		displayName: 'Direction',
		name: 'direction',
		type: 'options',
		default: 'Descending',
		description: 'Descending returns newest first (entries before Start Timestamp). Ascending returns oldest first (entries after Start Timestamp).',
		options: [
			{
				name: 'Descending',
				value: 'Descending',
			},
			{
				name: 'Ascending',
				value: 'Ascending',
			},
		],
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['getTimeline'],
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
				operation: ['listBoxes', 'createBox'],
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

	// Search Query (for listBoxes filtering)
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		default: '',
		placeholder: 'e.g., "John Doe", "Acme Corp", "urgent"',
		description: 'Search for boxes by name, notes, or other fields (leave empty for no search)',
		displayOptions: {
			show: {
				resource: ['box'],
				operation: ['listBoxes'],
			},
		},
	},

	// Sort By (for listBoxes)
	{
		displayName: 'Sort By',
		name: 'sortBy',
		type: 'options',
		default: 'lastUpdatedTimestamp',
		description: 'What order to sort the boxes by (descending)',
		options: [
			{
				name: 'Last Updated',
				value: 'lastUpdatedTimestamp',
			},
			{
				name: 'Creation Date',
				value: 'creationTimestamp',
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
				displayName: 'Assigned To (Emails)',
				name: 'assignedToSharingEntries',
				type: 'multiOptions',
				default: [],
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
				description: 'Select team members or use an expression to set emails programmatically. Assigned users must have access to the pipeline. Replaces all current assignees — include existing ones to keep them.',
				typeOptions: {
					loadOptionsMethod: 'getTeamMemberEmailOptions',
				},
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
				displayName: 'Assigned To (Emails)',
				name: 'assignedToSharingEntries',
				type: 'multiOptions',
				default: [],
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
				description: 'Select team members or use an expression to set emails programmatically. Assigned users must have access to the pipeline. Replaces all current assignees — include existing ones to keep them.',
				typeOptions: {
					loadOptionsMethod: 'getTeamMemberEmailOptions',
				},
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Custom field values to update on the box',
				options: [
					{
						displayName: 'Text / Numeric Field',
						name: 'field',
						values: [
							{
								displayName: 'Field',
								name: 'key',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								description: 'The custom field to update',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'getFieldOptions',
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										type: 'string',
										placeholder: 'e.g. 1007',
									},
								],
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value to set for the custom field',
							},
						],
					},
					{
						displayName: 'Checkbox Field',
						name: 'checkboxField',
						values: [
							{
								displayName: 'Field',
								name: 'key',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								description: 'The checkbox field to update',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'getCheckboxFieldOptions',
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										type: 'string',
										placeholder: 'e.g. 1007',
									},
								],
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'boolean',
								default: false,
								description: 'Whether the checkbox field should be checked',
							},
						],
					},
					{
						displayName: 'Date Field',
						name: 'dateField',
						values: [
							{
								displayName: 'Field',
								name: 'key',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								description: 'The date field to update',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'getDateFieldOptions',
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										type: 'string',
										placeholder: 'e.g. 1007',
									},
								],
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'dateTime',
								default: '',
								description: 'The value to set for the date field',
							},
						],
					},
					{
						displayName: 'Dropdown Field',
						name: 'dropdownField',
						values: [
							{
								displayName: 'Field',
								name: 'key',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								description: 'The dropdown field to update',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'getDropdownFieldOptions',
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										type: 'string',
										placeholder: 'e.g. 1007',
									},
								],
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								description: 'The dropdown option to set',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'getDropdownValueOptions',
										},
									},
									{
										displayName: 'By Value',
										name: 'id',
										type: 'string',
										placeholder: 'e.g. Option name or key',
									},
								],
							},
						],
					},
					{
						displayName: 'Tag Field',
						name: 'tagField',
						values: [
							{
								displayName: 'Field',
								name: 'key',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								description: 'The tag field to update',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'getTagFieldOptions',
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										type: 'string',
										placeholder: 'e.g. 1007',
									},
								],
							},
							{
								displayName: 'Tag Names or IDs',
								name: 'value',
								type: 'multiOptions',
								default: [],
								description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
								typeOptions: {
									loadOptionsMethod: 'getTagValues',
								},
							},
						],
					},
				],
			},
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
				displayName: 'Stage',
				name: 'stageKey',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				description: 'The stage to move the box to',
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
			},
		],
	},
];
