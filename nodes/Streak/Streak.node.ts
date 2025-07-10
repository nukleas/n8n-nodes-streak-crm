import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Import the Streak API service
import { StreakApiService } from './services/StreakApiService';

// Import operation handlers
import { handleUserOperations } from './operations/userOperations';
import { handleTeamOperations } from './operations/teamOperations';
import { handlePipelineOperations } from './operations/pipelineOperations';
import { handleBoxOperations } from './operations/boxOperations';
import { handleStageOperations } from './operations/stageOperations';
import { handleFieldOperations } from './operations/fieldOperations';
import { handleContactOperations } from './operations/contactOperations';
import { handleOrganizationOperations } from './operations/organizationOperations';
import { handleTaskOperations } from './operations/taskOperations';

export class Streak implements INodeType {
	// Define methods required by n8n for resource locators and dynamic data loading
	methods = {
		loadOptions: {
			// Load all pipelines for dropdown selection
			async getPipelineOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get API credentials
					const credentials = await this.getCredentials('streakApi');
					if (!credentials?.apiKey) {
						throw new NodeOperationError(this.getNode(), 'No API key provided');
					}
					const apiKey = credentials.apiKey as string;

					// Use the StreakApiService to get pipelines
					const pipelines = await StreakApiService.getPipelines(this, apiKey);

					// Map the response data to the format expected by n8n
					return pipelines
						.filter(pipeline => pipeline && pipeline.key) // Filter out invalid pipelines
						.map(pipeline => ({
							name: `${pipeline.name || 'Unnamed Pipeline'} (${pipeline.key || 'no-key'})`,
							value: pipeline.key || '',
						}));
				} catch (error) {
					// Just return an empty array on error - the UI will handle this gracefully
					return [];
				}
			},

			// Load all teams for dropdown selection
			async getTeamOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get API credentials
					const credentials = await this.getCredentials('streakApi');
					if (!credentials?.apiKey) {
						throw new NodeOperationError(this.getNode(), 'No API key provided');
					}
					const apiKey = credentials.apiKey as string;

					// Use the StreakApiService to get teams
					const response = await StreakApiService.getTeams(this, apiKey);

					// Handle the v2 API response structure: [{results: [...]}]
					let teams: any[] = [];
					if (Array.isArray(response)) {
						// v2 API returns array of objects with 'results' property
						for (const item of response) {
							if (item && item.results && Array.isArray(item.results)) {
								teams.push(...item.results);
							}
						}
					} else if (response && typeof response === 'object') {
						// Fallback: check if it's a direct results object
						if (response.results && Array.isArray(response.results)) {
							teams = response.results;
						} else {
							// Single team object
							teams = [response];
						}
					}

					// Map the response data to the format expected by n8n
					return teams
						.filter(team => team && team.key) // Filter out invalid teams
						.map(team => ({
							name: `${team.name || 'Unnamed Team'} (${team.key || 'no-key'})`,
							value: team.key || '',
						}));
				} catch (error) {
					// Return empty array to avoid breaking the UI
					return [];
				}
			},

			// Load stages for a specific pipeline (pipeline-dependent)
			async getStageOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get API credentials
					const credentials = await this.getCredentials('streakApi');
					if (!credentials?.apiKey) {
						throw new NodeOperationError(this.getNode(), 'No API key provided');
					}
					const apiKey = credentials.apiKey as string;

					// Get the pipeline key from the current node parameters
					// Handle both resourceLocator format and direct string format
					let pipelineKey: string;
					const pipelineParam = this.getCurrentNodeParameter('pipelineKey');
					
					if (typeof pipelineParam === 'string') {
						pipelineKey = pipelineParam;
					} else if (pipelineParam && typeof pipelineParam === 'object') {
						// ResourceLocator format: { mode: 'list'|'id', value: 'actual_key' }
						pipelineKey = (pipelineParam as any).value || (pipelineParam as any).id;
					} else {
						return [];
					}

					if (!pipelineKey) {
						return [];
					}

					// Use the StreakApiService to get stages for the pipeline
					const response = await StreakApiService.getStages(this, apiKey, pipelineKey);

					// Handle different response structures
					let stages: any[] = [];
					if (Array.isArray(response)) {
						// Check if it's an array of objects where stages are properties
						if (response.length > 0 && typeof response[0] === 'object') {
							const firstItem = response[0];
							// Check if this looks like a stages object (keys are stage IDs)
							const keys = Object.keys(firstItem);
							if (keys.length > 0 && firstItem[keys[0]] && typeof firstItem[keys[0]] === 'object' && (firstItem[keys[0]] as any).key) {
								// Convert object format to array format
								stages = keys.map(key => firstItem[key] as any);
							} else {
								// It's a regular array
								stages = response;
							}
						} else {
							stages = response;
						}
					} else if (response && typeof response === 'object') {
						// Check if stages are nested under a property
						if (response.results && Array.isArray(response.results)) {
							stages = response.results;
						} else if (response.data && Array.isArray(response.data)) {
							stages = response.data;
						} else if (response.stages && Array.isArray(response.stages)) {
							stages = response.stages;
						} else {
							// Check if this is a stages object (keys are stage IDs)
							const keys = Object.keys(response);
							if (keys.length > 0 && response[keys[0]] && typeof response[keys[0]] === 'object' && (response[keys[0]] as any).key) {
								// Convert object format to array format
								stages = keys.map(key => response[key] as any);
							} else {
								// If it's a single stage object, wrap it in an array
								stages = [response];
							}
						}
					}

					// Map the response data to the format expected by n8n
					return stages
						.filter(stage => stage && stage.key) // Filter out invalid stages
						.map(stage => ({
							name: `${stage.name || 'Unnamed Stage'} (${stage.key || 'no-key'})`,
							value: stage.key || '',
						}));
				} catch (error) {
					// Return empty array to avoid breaking the UI
					return [];
				}
			},
		},
		listSearch: {
			// Search method for resourceLocator lists
			async getPipelineOptions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				try {
					// Get API credentials
					const credentials = await this.getCredentials('streakApi');
					if (!credentials?.apiKey) {
						throw new NodeOperationError(this.getNode(), 'No API key provided');
					}
					const apiKey = credentials.apiKey as string;

					// Use the StreakApiService to get pipelines
					const pipelines = await StreakApiService.getPipelines(this, apiKey);

					// Filter pipelines if filter is provided
					let filteredPipelines = pipelines;
					if (filter) {
						const filterLower = filter.toLowerCase();
						filteredPipelines = pipelines.filter(pipeline => 
							pipeline && pipeline.key && (
								(pipeline.name || '').toLowerCase().includes(filterLower) ||
								pipeline.key.toLowerCase().includes(filterLower)
							)
						);
					}

					// Map the response data to the format expected by n8n resourceLocator
					const results = filteredPipelines
						.filter(pipeline => pipeline && pipeline.key) // Filter out invalid pipelines
						.map(pipeline => ({
							name: `${pipeline.name || 'Unnamed Pipeline'} (${pipeline.key || 'no-key'})`,
							value: pipeline.key || '',
							url: `https://www.streak.com/pipeline/${pipeline.key || 'no-key'}`,
						}));

					return { results };
				} catch (error) {
					// Return empty results on error
					return { results: [] };
				}
			},

			// Search method for stage resourceLocator lists (pipeline-dependent)
			async getStageOptions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				try {
					// Get API credentials
					const credentials = await this.getCredentials('streakApi');
					if (!credentials?.apiKey) {
						throw new NodeOperationError(this.getNode(), 'No API key provided');
					}
					const apiKey = credentials.apiKey as string;

					// Get the pipeline key from the current node parameters
					let pipelineKey: string;
					const pipelineParam = this.getCurrentNodeParameter('pipelineKey');
					
					if (typeof pipelineParam === 'string') {
						pipelineKey = pipelineParam;
					} else if (pipelineParam && typeof pipelineParam === 'object') {
						// ResourceLocator format: { mode: 'list'|'id', value: 'actual_key' }
						pipelineKey = (pipelineParam as any).value || (pipelineParam as any).id;
					} else {
						return { results: [] };
					}

					if (!pipelineKey) {
						return { results: [] };
					}

					// Use the StreakApiService to get stages for the pipeline
					const response = await StreakApiService.getStages(this, apiKey, pipelineKey);

					// Handle different response structures
					let stages: any[] = [];
					if (Array.isArray(response)) {
						// Check if it's an array of objects where stages are properties
						if (response.length > 0 && typeof response[0] === 'object') {
							const firstItem = response[0];
							// Check if this looks like a stages object (keys are stage IDs)
							const keys = Object.keys(firstItem);
							if (keys.length > 0 && firstItem[keys[0]] && typeof firstItem[keys[0]] === 'object' && (firstItem[keys[0]] as any).key) {
								// Convert object format to array format
								stages = keys.map(key => firstItem[key] as any);
							} else {
								// It's a regular array
								stages = response;
							}
						} else {
							stages = response;
						}
					} else if (response && typeof response === 'object') {
						if (response.results && Array.isArray(response.results)) {
							stages = response.results;
						} else if (response.data && Array.isArray(response.data)) {
							stages = response.data;
						} else if (response.stages && Array.isArray(response.stages)) {
							stages = response.stages;
						} else {
							// Check if this is a stages object (keys are stage IDs)
							const keys = Object.keys(response);
							if (keys.length > 0 && response[keys[0]] && typeof response[keys[0]] === 'object' && (response[keys[0]] as any).key) {
								// Convert object format to array format
								stages = keys.map(key => response[key] as any);
							} else {
								// If it's a single stage object, wrap it in an array
								stages = [response];
							}
						}
					}

					// Filter stages if filter is provided
					let filteredStages = stages;
					if (filter) {
						const filterLower = filter.toLowerCase();
						filteredStages = stages.filter(stage => 
							stage && stage.key && (
								(stage.name || '').toLowerCase().includes(filterLower) ||
								stage.key.toLowerCase().includes(filterLower)
							)
						);
					}

					// Map the response data to the format expected by n8n resourceLocator
					const results = filteredStages
						.filter(stage => stage && stage.key) // Filter out invalid stages
						.map(stage => ({
							name: `${stage.name || 'Unnamed Stage'} (${stage.key || 'no-key'})`,
							value: stage.key || '',
							url: `https://www.streak.com/pipeline/${pipelineKey}/stage/${stage.key || 'no-key'}`,
						}));

					return { results };
				} catch (error) {
					// Return empty results on error
					return { results: [] };
				}
			},
		},
	};
	description: INodeTypeDescription = {
		displayName: 'Streak',
		name: 'streak',
		group: ['transform'],
		version: 1,
		description: 'Streak CRM Node',
		icon: 'file:streak.svg',
		defaults: {
			name: 'Streak',
		},
		credentials: [
			{
				displayName: 'Streak API Key',
				name: 'streakApi',
				required: true,
			},
		],
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Resource Selection
			{
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
			},

			// User Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				default: 'getCurrentUser',
				options: [
					{
						name: 'Get Current User',
						value: 'getCurrentUser',
						description: 'Get information about the current user',
						action: 'Get current user',
					},
					{
						name: 'Get User',
						value: 'getUser',
						description: 'Get information about a specific user by their key',
						action: 'Get a user',
					},
				],
			},

			// Team Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['team'],
					},
				},
				default: 'getMyTeams',
				options: [
					{
						name: 'Get My Teams',
						value: 'getMyTeams',
						description: 'List all teams the authenticated user belongs to',
						action: 'Get my teams',
					},
					{
						name: 'Get Team',
						value: 'getTeam',
						description: 'Get information about a specific team',
						action: 'Get a team',
					},
				],
			},

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

			// User Key (only for getUser operation)
			{
				displayName: 'User Key',
				name: 'userKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the user to get information about',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getUser'],
					},
				},
			},

			// Team Key (only for getTeam operation)
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
						resource: ['team'],
						operation: ['getTeam'],
					},
				},
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
						name: 'Create Box',
						value: 'createBox',
						description: 'Creates a new box in a pipeline',
						action: 'Create a box',
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
						operation: [
							'getBox',
							'updateBox',
							'deleteBox',
							'getTimeline',
						],
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
						operation: [
							'listBoxes',
							'createBox',
						],
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
						displayName: 'Assigned To (Team/User Key)',
						name: 'assignedToTeamKeyOrUserKey',
						type: 'string',
						default: '',
						description: 'Team or user key to assign the box to',
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
						displayName: 'Stage Key',
						name: 'stageKey',
						type: 'string',
						default: '',
						description: 'New stage key for the box (use expressions to get from stage dropdown)',
					},
					{
						displayName: 'Assigned To (Team/User Key)',
						name: 'assignedToTeamKeyOrUserKey',
						type: 'string',
						default: '',
						description: 'New team or user key to assign the box to',
					},
				],
			},

			// Stage Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['stage'],
					},
				},
				default: 'listStages',
				options: [
					{
						name: 'Create Stage',
						value: 'createStage',
						description: 'Creates a new stage in a pipeline',
						action: 'Create a stage',
					},
					{
						name: 'Delete Stage',
						value: 'deleteStage',
						description: 'Deletes a stage',
						action: 'Delete a stage',
					},
					{
						name: 'Get Stage',
						value: 'getStage',
						description: 'Gets a specific stage by its key',
						action: 'Get a stage',
					},
					{
						name: 'List Stages',
						value: 'listStages',
						description: 'Lists all stages in a pipeline',
						action: 'List stages',
					},
					{
						name: 'Update Stage',
						value: 'updateStage',
						description: 'Updates an existing stage',
						action: 'Update a stage',
					},
				],
			},

			// Pipeline Key (for stage operations)
			{
				displayName: 'Pipeline Key',
				name: 'pipelineKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the pipeline that contains the stages',
				displayOptions: {
					show: {
						resource: ['stage'],
						operation: [
							'listStages',
							'getStage',
							'createStage',
							'updateStage',
							'deleteStage',
						],
					},
				},
			},

			// Stage Key (for stage operations)
			{
				displayName: 'Stage',
				name: 'stageKey',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				description: 'The stage to operate on',
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
						resource: ['stage'],
						operation: [
							'getStage',
							'updateStage',
							'deleteStage',
						],
					},
				},
			},

			// Stage Name (for createStage)
			{
				displayName: 'Stage Name',
				name: 'stageName',
				type: 'string',
				default: '',
				required: true,
				description: 'The name of the stage to create',
				displayOptions: {
					show: {
						resource: ['stage'],
						operation: ['createStage'],
					},
				},
			},

			// Additional Fields (for createStage)
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['stage'],
						operation: ['createStage'],
					},
				},
				options: [
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						description: 'Color code for the stage (e.g., #FF0000)',
					},
				],
			},

			// Update Fields (for updateStage)
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['stage'],
						operation: ['updateStage'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'New name for the stage',
					},
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						description: 'New color for the stage (e.g., #00FF00)',
					},
				],
			},

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
				displayName: 'Pipeline Key',
				name: 'pipelineKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the pipeline',
				displayOptions: {
					show: {
						resource: ['field'],
						operation: [
							'listFields',
							'getField',
							'createField',
							'updateField',
							'deleteField',
						],
					},
				},
			},

			// Box Key (for field value operations)
			{
				displayName: 'Box Key',
				name: 'boxKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the box',
				displayOptions: {
					show: {
						resource: ['field'],
						operation: [
							'listFieldValues',
							'getFieldValue',
							'updateFieldValue',
						],
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
						operation: [
							'getField',
							'updateField',
							'deleteField',
							'getFieldValue',
							'updateFieldValue',
						],
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
						resource: ['organization'],
						operation: ['createOrganization'],
					},
				},
			},

			// Team Key (for checkExistingOrganizations)
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
						resource: ['organization'],
						operation: ['checkExistingOrganizations'],
					},
				},
			},

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
						name: 'Create Task',
						value: 'createTask',
						description: 'Creates a new task for a box',
						action: 'Create a task',
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
						name: 'Get Tasks in Box',
						value: 'getTasksInBox',
						description: 'Gets all tasks associated with a box',
						action: 'Get tasks in box',
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
						operation: [
							'getTask',
							'updateTask',
							'deleteTask',
						],
					},
				},
			},

			// Box Key (for task operations)
			{
				displayName: 'Box Key',
				name: 'boxKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the box',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: [
							'getTasksInBox',
							'createTask',
						],
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
						displayName: 'Assignees',
						name: 'assignees',
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
						default: '',
						description: 'The user keys to assign to the task',
					},
					{
						displayName: 'Reminder',
						name: 'reminder',
						type: 'dateTime',
						default: '',
						description: 'The reminder date for the task',
					},
					{
						displayName: 'Completed',
						name: 'completed',
						type: 'boolean',
						default: false,
						description: 'Whether the task is completed',
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
						displayName: 'Text',
						name: 'text',
						type: 'string',
						default: '',
						description: 'New text content for the task',
					},
					{
						displayName: 'Due Date',
						name: 'dueDate',
						type: 'dateTime',
						default: '',
						description: 'New due date for the task',
					},
					{
						displayName: 'Assignees',
						name: 'assignees',
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
						default: '',
						description: 'New user keys to assign to the task',
					},
					{
						displayName: 'Reminder',
						name: 'reminder',
						type: 'dateTime',
						default: '',
						description: 'New reminder date for the task',
					},
					{
						displayName: 'Completed',
						name: 'completed',
						type: 'boolean',
						default: false,
						description: 'Whether the task is completed',
					},
				],
			},

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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get API key from credentials
		const apiKey = (await this.getCredentials('streakApi'))?.apiKey as string;

		if (!apiKey) {
			throw new NodeOperationError(this.getNode(), 'No API key provided');
		}

		// Process each item
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let responseData: IDataObject | IDataObject[];

				// Route to appropriate operation handler based on resource
				if (resource === 'user') {
					responseData = await handleUserOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'team') {
					responseData = await handleTeamOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'pipeline') {
					responseData = await handlePipelineOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'box') {
					responseData = await handleBoxOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'stage') {
					responseData = await handleStageOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'field') {
					responseData = await handleFieldOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'contact') {
					responseData = await handleContactOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'organization') {
					responseData = await handleOrganizationOperations.call(this, operation, itemIndex, apiKey);
				} else if (resource === 'task') {
					responseData = await handleTaskOperations.call(this, operation, itemIndex, apiKey);
				} else {
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported!`, { itemIndex });
				}

				// Process the response
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: itemIndex } }
				);
				returnData.push(...executionData);
			} catch (error) {
				// Handle errors
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: itemIndex } }
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
