import type { INodeProperties } from 'n8n-workflow';

export const sharedProperties: INodeProperties[] = [
	// Return All option for list operations
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['pipeline', 'box', 'field'],
				operation: ['listAllPipelines', 'listBoxes', 'getTimeline', 'listFields', 'listFieldValues'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['pipeline', 'box', 'field'],
				operation: ['listAllPipelines', 'listBoxes', 'getTimeline', 'listFields', 'listFieldValues'],
				returnAll: [false],
			},
		},
	},
];