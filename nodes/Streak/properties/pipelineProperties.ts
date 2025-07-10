import type { INodeProperties } from 'n8n-workflow';

export const pipelineProperties: INodeProperties[] = [
	// Pipeline Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
			},
		},
		default: 'listAllPipelines',
		options: [
			{
				name: 'Create Pipeline',
				value: 'createPipeline',
				description: 'Creates a new pipeline',
				action: 'Create a pipeline',
			},
			{
				name: 'Delete Pipeline',
				value: 'deletePipeline',
				description: 'Deletes a pipeline',
				action: 'Delete a pipeline',
			},
			{
				name: 'Get Pipeline',
				value: 'getPipeline',
				description: 'Gets a specific pipeline by its key',
				action: 'Get a pipeline',
			},
			{
				name: 'List All Pipelines',
				value: 'listAllPipelines',
				description: 'Lists all pipelines the user has access to',
				action: 'List all pipelines',
			},
			{
				name: 'Move Boxes (Batch)',
				value: 'moveBoxesBatch',
				description: 'Moves multiple boxes to a different pipeline',
				action: 'Move boxes between pipelines',
			},
			{
				name: 'Update Pipeline',
				value: 'updatePipeline',
				description: 'Updates an existing pipeline',
				action: 'Update a pipeline',
			},
		],
	},

	// Pipeline Key (for pipeline operations)
	{
		displayName: 'Pipeline Name or ID',
		name: 'pipelineKey',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipelineOptions',
		},
		default: '',
		required: true,
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: [
					'getPipeline',
					'updatePipeline',
					'deletePipeline',
					'moveBoxesBatch',
				],
			},
		},
	},

	// Pipeline Name (for create/update pipeline)
	{
		displayName: 'Pipeline Name',
		name: 'pipelineName',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the pipeline',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: [
					'createPipeline',
					'updatePipeline',
				],
			},
		},
	},

	// Box Keys (for moveBoxesBatch)
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
		description: 'The keys of the boxes to move',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['moveBoxesBatch'],
			},
		},
	},

	// Target Pipeline Key (for moveBoxesBatch operation)
	{
		displayName: 'Target Pipeline Name or ID',
		name: 'targetPipelineKey',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipelineOptions',
		},
		default: '',
		required: true,
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['moveBoxesBatch'],
			},
		},
	},
];