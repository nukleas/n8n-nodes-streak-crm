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
			name: 'Comment',
			value: 'comment',
			description: 'Operate on Streak comments',
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
			name: 'File',
			value: 'file',
			description: 'Operate on Streak files',
		},
		{
			name: 'Meeting',
			value: 'meeting',
			description: 'Operate on Streak meetings',
		},
		{
			name: 'Newsfeed',
			value: 'newsfeed',
			description: 'View Streak activity newsfeeds',
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
			name: 'Search',
			value: 'search',
			description: 'Search across Streak data',
		},
		{
			name: 'Snippet',
			value: 'snippet',
			description: 'Operate on Streak snippets',
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
			name: 'Thread',
			value: 'thread',
			description: 'Operate on Streak email threads',
		},
		{
			name: 'User',
			value: 'user',
			description: 'Operate on Streak users',
		},
	],
};
