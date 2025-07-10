import type { INodeProperties } from 'n8n-workflow';

export const contactProperties: INodeProperties[] = [
	// Contact Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		default: 'getContact',
		options: [
			{
				name: 'Get Contact',
				value: 'getContact',
				description: 'Gets a specific contact',
				action: 'Get a contact',
			},
			{
				name: 'Create Contact',
				value: 'createContact',
				description: 'Creates a new contact',
				action: 'Create a contact',
			},
			{
				name: 'Update Contact',
				value: 'updateContact',
				description: 'Updates an existing contact',
				action: 'Update a contact',
			},
			{
				name: 'Delete Contact',
				value: 'deleteContact',
				description: 'Deletes a contact',
				action: 'Delete a contact',
			},
		],
	},

	// Contact Key (for contact operations)
	{
		displayName: 'Contact Key',
		name: 'contactKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: [
					'getContact',
					'updateContact',
					'deleteContact',
				],
			},
		},
	},

	// Email (for createContact)
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		required: true,
		description: 'The email address of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact'],
			},
		},
	},

	// Team Key (for createContact)
	{
		displayName: 'Team Name or ID',
		name: 'teamKey',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTeamOptions',
		},
		default: '',
		required: true,
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact'],
			},
		},
	},

	// Additional Fields (for createContact)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact'],
			},
		},
		options: [
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'The first name of the contact',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'The last name of the contact',
			},
			{
				displayName: 'Full Name',
				name: 'fullName',
				type: 'string',
				default: '',
				description: 'The full name of the contact',
			},
			{
				displayName: 'Phone Numbers',
				name: 'phones',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'Phone numbers for the contact',
			},
			{
				displayName: 'Organization',
				name: 'organization',
				type: 'string',
				default: '',
				description: 'The organization the contact belongs to',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The job title of the contact',
			},
		],
	},

	// Update Fields (for updateContact)
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['updateContact'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'New email address for the contact',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'New first name for the contact',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'New last name for the contact',
			},
			{
				displayName: 'Full Name',
				name: 'fullName',
				type: 'string',
				default: '',
				description: 'New full name for the contact',
			},
			{
				displayName: 'Phone Numbers',
				name: 'phones',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'New phone numbers for the contact',
			},
			{
				displayName: 'Organization',
				name: 'organization',
				type: 'string',
				default: '',
				description: 'New organization for the contact',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'New job title for the contact',
			},
		],
	},
];