import type { INodeProperties } from 'n8n-workflow';

export const webhookProperties: INodeProperties[] = [
	// Webhook Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		default: 'listWebhooks',
		options: [
			{
				name: 'Create Webhook',
				value: 'createWebhook',
				description: 'Creates a new webhook',
				action: 'Create a webhook',
			},
			{
				name: 'Delete Webhook',
				value: 'deleteWebhook',
				description: 'Deletes a webhook',
				action: 'Delete a webhook',
			},
			{
				name: 'Get Webhook',
				value: 'getWebhook',
				description: 'Gets a specific webhook',
				action: 'Get a webhook',
			},
			{
				name: 'List Webhooks',
				value: 'listWebhooks',
				description: 'Lists all webhooks for a pipeline or team',
				action: 'List webhooks',
			},
		],
	},

	// Webhook Key (for get/delete)
	{
		displayName: 'Webhook Key',
		name: 'webhookKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the webhook',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getWebhook', 'deleteWebhook'],
			},
		},
	},

	// Scope (for list and create)
	{
		displayName: 'Scope',
		name: 'scope',
		type: 'options',
		options: [
			{ name: 'Pipeline', value: 'pipeline' },
			{ name: 'Team', value: 'team' },
		],
		default: 'pipeline',
		description: 'Whether to scope the webhook to a pipeline or a team',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['listWebhooks', 'createWebhook'],
			},
		},
	},

	// Pipeline Key (when scope=pipeline)
	{
		displayName: 'Pipeline',
		name: 'pipelineKey',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipelineOptions',
		},
		default: '',
		required: true,
		description: 'The pipeline to scope the webhook to',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['listWebhooks', 'createWebhook'],
				scope: ['pipeline'],
			},
		},
	},

	// Team Key (when scope=team)
	{
		displayName: 'Team',
		name: 'teamKey',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTeamOptions',
		},
		default: '',
		required: true,
		description: 'The team to scope the webhook to',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['listWebhooks', 'createWebhook'],
				scope: ['team'],
			},
		},
	},

	// Event (for create)
	{
		displayName: 'Event',
		name: 'event',
		type: 'options',
		options: [
			{ name: 'Box Change Pipeline', value: 'BOX_CHANGE_PIPELINE' },
			{ name: 'Box Change Stage', value: 'BOX_CHANGE_STAGE' },
			{ name: 'Box Create', value: 'BOX_CREATE' },
			{ name: 'Box Delete', value: 'BOX_DELETE' },
			{ name: 'Box Edit', value: 'BOX_EDIT' },
			{ name: 'Box New Email Address', value: 'BOX_NEW_EMAIL_ADDRESS' },
			{ name: 'Comment Create', value: 'COMMENT_CREATE' },
			{ name: 'Contact Create', value: 'CONTACT_CREATE' },
			{ name: 'Contact Delete', value: 'CONTACT_DELETE' },
			{ name: 'Contact Update', value: 'CONTACT_UPDATE' },
			{ name: 'Meeting Create', value: 'MEETING_CREATE' },
			{ name: 'Meeting Update', value: 'MEETING_UPDATE' },
			{ name: 'Org Create', value: 'ORG_CREATE' },
			{ name: 'Org Delete', value: 'ORG_DELETE' },
			{ name: 'Org Update', value: 'ORG_UPDATE' },
			{ name: 'Stage Create', value: 'STAGE_CREATE' },
			{ name: 'Task Complete', value: 'TASK_COMPLETE' },
			{ name: 'Task Create', value: 'TASK_CREATE' },
			{ name: 'Task Due', value: 'TASK_DUE' },
			{ name: 'Task Updated', value: 'TASK_UPDATED' },
		],
		default: 'BOX_CREATE',
		required: true,
		description: 'The event to listen for',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['createWebhook'],
			},
		},
	},

	// Target URL (for create)
	{
		displayName: 'Target URL',
		name: 'targetUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The URL that will receive the webhook POST requests',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['createWebhook'],
			},
		},
	},
];
