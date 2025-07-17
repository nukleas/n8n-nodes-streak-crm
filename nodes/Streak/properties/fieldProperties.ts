import type { INodeProperties } from 'n8n-workflow';

export const fieldProperties: INodeProperties[] = [
	// Field Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['field'],
			},
		},
		default: 'listFields',
		options: [
			{
				name: 'Create Field',
				value: 'createField',
				description: 'Creates a new field in a pipeline',
				action: 'Create a field',
			},
			{
				name: 'Delete Field',
				value: 'deleteField',
				description: 'Deletes a field',
				action: 'Delete a field',
			},
			{
				name: 'Get Field',
				value: 'getField',
				description: 'Gets a specific field by its key',
				action: 'Get a field',
			},
			{
				name: 'Get Field Value',
				value: 'getFieldValue',
				description: 'Gets a specific field value for a box',
				action: 'Get a field value',
			},
			{
				name: 'List Field Values',
				value: 'listFieldValues',
				description: 'Lists all field values for a box',
				action: 'List field values for a box',
			},
			{
				name: 'List Fields',
				value: 'listFields',
				description: 'Lists all fields in a pipeline',
				action: 'List fields in a pipeline',
			},
			{
				name: 'Update Field',
				value: 'updateField',
				description: 'Updates an existing field',
				action: 'Update a field',
			},
			{
				name: 'Update Field Value',
				value: 'updateFieldValue',
				description: 'Updates a field value for a box',
				action: 'Update a field value',
			},
		],
	},

	// Pipeline Key (for field operations)
	{
		displayName: 'Pipeline',
		name: 'pipelineKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The pipeline to operate on',
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
				resource: ['field'],
				operation: ['listFields', 'getField', 'createField', 'updateField', 'deleteField'],
			},
		},
	},

	// Pipeline Key (required for box dependency)
	{
		displayName: 'Pipeline',
		name: 'pipelineKey',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The pipeline containing the box',
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
				resource: ['field'],
				operation: ['listFieldValues', 'getFieldValue', 'updateFieldValue'],
			},
		},
	},

	// Box Key (for field value operations)
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
				resource: ['field'],
				operation: ['listFieldValues', 'getFieldValue', 'updateFieldValue'],
			},
		},
	},

	// Field Key (for field operations)
	{
		displayName: 'Field Key',
		name: 'fieldKey',
		type: 'string',
		default: '',
		required: true,
		description: 'The key of the field',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['getField', 'updateField', 'deleteField', 'getFieldValue', 'updateFieldValue'],
			},
		},
	},

	// Field Name (for createField)
	{
		displayName: 'Field Name',
		name: 'fieldName',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the field to create',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['createField'],
			},
		},
	},

	// Field Type (for createField)
	{
		displayName: 'Field Type',
		name: 'fieldType',
		type: 'options',
		options: [
			{
				name: 'Checkbox',
				value: 'CHECKBOX',
				description: 'Checkbox field (boolean)',
			},
			{
				name: 'Contact',
				value: 'CONTACT',
				description: 'Contact field',
			},
			{
				name: 'Date',
				value: 'DATE',
				description: 'Date field',
			},
			{
				name: 'Dropdown',
				value: 'DROPDOWN_ENUMERATION',
				description: 'Dropdown selection field',
			},
			{
				name: 'File',
				value: 'FILE',
				description: 'File attachment field',
			},
			{
				name: 'Number',
				value: 'NUMBER',
				description: 'Numeric field',
			},
			{
				name: 'Paragraph Text',
				value: 'TEXT_PARAGRAPH',
				description: 'Multi-line text field',
			},
			{
				name: 'Text',
				value: 'TEXT',
				description: 'Single line text field',
			},
		],
		default: 'TEXT',
		required: true,
		description: 'The type of field to create',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['createField'],
			},
		},
	},

	// Additional Fields (for createField)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['createField'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the field',
			},
			{
				displayName: 'Key Name',
				name: 'keyName',
				type: 'string',
				default: '',
				description: 'Key name for the field (use only if you need a specific key)',
			},
			{
				displayName: 'Dropdown Values',
				name: 'enumValues',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'Values for dropdown field type (required for dropdown fields)',
				displayOptions: {
					show: {
						'/fieldType': ['DROPDOWN_ENUMERATION'],
					},
				},
			},
		],
	},

	// Update Fields (for updateField)
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['updateField'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the field',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the field',
			},
			{
				displayName: 'Dropdown Values',
				name: 'enumValues',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: '',
				description: 'New values for dropdown field type',
			},
		],
	},

	// Field Value (for updateFieldValue)
	{
		displayName: 'Field Value',
		name: 'fieldValue',
		type: 'string',
		default: '',
		required: true,
		description: 'The value to set for the field',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['updateFieldValue'],
			},
		},
	},
];
