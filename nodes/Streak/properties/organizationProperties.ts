import type { INodeProperties } from 'n8n-workflow';

// Helper function to create team key property for different operations
function createTeamKeyProperty(operations: string[]): INodeProperties {
	return {
		displayName: 'Team Name or ID',
		name: 'teamKey',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTeamOptions',
		},
		default: '',
		required: true,
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: operations,
			},
		},
	};
}

export const organizationProperties: INodeProperties[] = [
	// Organization Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['organization'],
			},
		},
		default: 'getOrganization',
		options: [
			{
				name: 'Check Existing Organizations',
				value: 'checkExistingOrganizations',
				description: 'Checks for existing organizations by name or domain',
				action: 'Check existing organizations',
			},
			{
				name: 'Create Organization',
				value: 'createOrganization',
				description: 'Creates a new organization',
				action: 'Create an organization',
			},
			{
				name: 'Delete Organization',
				value: 'deleteOrganization',
				description: 'Deletes an organization',
				action: 'Delete an organization',
			},
			{
				name: 'Get Organization',
				value: 'getOrganization',
				description: 'Gets a specific organization',
				action: 'Get an organization',
			},
			{
				name: 'Update Organization',
				value: 'updateOrganization',
				description: 'Updates an existing organization',
				action: 'Update an organization',
			},
		],
	},

	// Organization Key (for organization operations)
	{
		displayName: 'Organization Key',
		name: 'organizationKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the organization',
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: [
					'getOrganization',
					'updateOrganization',
					'deleteOrganization',
				],
			},
		},
	},

	// Name (for createOrganization)
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the organization',
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: ['createOrganization'],
			},
		},
	},

	// Team Key (for createOrganization)
	createTeamKeyProperty(['createOrganization']),

	// Team Key (for checkExistingOrganizations)
	createTeamKeyProperty(['checkExistingOrganizations']),

	// Check Fields (for checkExistingOrganizations)
	{
		displayName: 'Check Fields',
		name: 'checkFields',
		type: 'collection',
		placeholder: 'Add Check Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: ['checkExistingOrganizations'],
			},
		},
		options: [
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				description: 'Domain to check for existing organizations',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name to check for existing organizations',
			},
		],
	},

	// Additional Fields (for createOrganization)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: ['createOrganization'],
			},
		},
		options: [
			{
				displayName: 'Domains',
				name: 'domains',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'Domains associated with the organization',
			},
			{
				displayName: 'Relationships',
				name: 'relationships',
				type: 'string',
				default: '',
				description: 'Relationships data for the organization (JSON string)',
			},
		],
	},

	// Update Fields (for updateOrganization)
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: ['updateOrganization'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the organization',
			},
			{
				displayName: 'Domains',
				name: 'domains',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'New domains for the organization',
			},
			{
				displayName: 'Relationships',
				name: 'relationships',
				type: 'string',
				default: '',
				description: 'New relationships data for the organization (JSON string)',
			},
		],
	},
];