import type { INodeProperties } from 'n8n-workflow';

export const taskProperties: INodeProperties[] = [
	// Task Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		default: 'getTask',
		options: [
			{
				name: 'Create Task in a Box',
				value: 'createTask',
				description: 'Creates a new task for a box',
				action: 'Create a task in a box',
			},
			{
				name: 'Delete Task',
				value: 'deleteTask',
				description: 'Deletes a task',
				action: 'Delete a task',
			},
			{
				name: 'Get Task',
				value: 'getTask',
				description: 'Gets a specific task',
				action: 'Get a task',
			},
			{
				name: 'Get Tasks in a Box',
				value: 'getTasksInBox',
				description: 'Gets all tasks associated with a box',
				action: 'Get tasks in a box',
			},
			{
				name: 'Update Task',
				value: 'updateTask',
				description: 'Updates an existing task',
				action: 'Update a task',
			},
		],
	},

	// Task Key (for task operations)
	{
		displayName: 'Task Key',
		name: 'taskKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the task',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['getTask', 'updateTask', 'deleteTask'],
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
				resource: ['task'],
				operation: ['getTasksInBox', 'createTask'],
			},
		},
	},

	// Box Key (for task operations)
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
				resource: ['task'],
				operation: ['getTasksInBox', 'createTask'],
			},
		},
	},

	// Task Text (for createTask)
	{
		displayName: 'Task Text',
		name: 'text',
		type: 'string',
		default: '',
		required: true,
		description: 'The text content of the task',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['createTask'],
			},
		},
	},

	// Additional Fields (for createTask)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['createTask'],
			},
		},
		options: [
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'The due date of the task',
			},
			{
				displayName: 'Assignee Emails',
				name: 'assignees',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'Email addresses of assignees',
			},
		],
	},

	// Update Fields (for updateTask)
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['updateTask'],
			},
		},
		options: [
			{
				displayName: 'Assignees',
				name: 'assignees',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'Email addresses of assignees',
			},
			{
				displayName: 'Completed',
				name: 'completed',
				type: 'boolean',
				default: false,
				description: 'Whether the task is completed',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'New due date for the task',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				description: 'New text content for the task',
			},
		],
	},
];
