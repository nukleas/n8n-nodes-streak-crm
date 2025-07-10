import type { INodeProperties } from 'n8n-workflow';

export const resourceSelector: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'user',
	options: [
		{
			name: 'Box',
			value: 'box',
			description: 'Operate on Streak boxes (deals/opportunities)',
		},
		{
			name: 'Contact',
			value: 'contact',
			description: 'Operate on Streak contacts',
		},
		{
			name: 'Field',
			value: 'field',
			description: 'Operate on Streak fields and field values',
		},
		{
			name: 'Organization',
			value: 'organization',
			description: 'Operate on Streak organizations',
		},
		{
			name: 'Pipeline',
			value: 'pipeline',
			description: 'Operate on Streak pipelines',
		},
		{
			name: 'Stage',
			value: 'stage',
			description: 'Operate on Streak pipeline stages',
		},
		{
			name: 'Task',
			value: 'task',
			description: 'Operate on Streak tasks',
		},
		{
			name: 'Team',
			value: 'team',
			description: 'Operate on Streak teams',
		},
		{
			name: 'User',
			value: 'user',
			description: 'Operate on Streak users',
		},
	],
};