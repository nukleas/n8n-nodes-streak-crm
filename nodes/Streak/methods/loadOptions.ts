import type {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { StreakApiService } from '../services/StreakApiService';

// Helper function to parse stages response from Streak API
function parseStagesResponse(response: any): any[] {
	let stages: any[] = [];
	if (Array.isArray(response)) {
		// Check if it's an array of objects where stages are properties
		if (response.length > 0 && typeof response[0] === 'object') {
			const firstItem = response[0];
			// Check if this looks like a stages object (keys are stage IDs)
			const keys = Object.keys(firstItem);
			if (
				keys.length > 0 &&
				firstItem[keys[0]] &&
				typeof firstItem[keys[0]] === 'object' &&
				(firstItem[keys[0]] as any).key
			) {
				// Convert object format to array format
				stages = keys.map((key) => firstItem[key] as any);
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
			if (
				keys.length > 0 &&
				response[keys[0]] &&
				typeof response[keys[0]] === 'object' &&
				(response[keys[0]] as any).key
			) {
				// Convert object format to array format
				stages = keys.map((key) => response[key] as any);
			} else {
				// If it's a single stage object, wrap it in an array
				stages = [response];
			}
		}
	}
	return stages;
}

export const loadOptions = {
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
				.filter((pipeline) => pipeline && pipeline.key) // Filter out invalid pipelines
				.map((pipeline) => ({
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
				.filter((team) => team && team.key) // Filter out invalid teams
				.map((team) => ({
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

			// Parse the stages response using the helper function
			const stages = parseStagesResponse(response);

			// Map the response data to the format expected by n8n
			return stages
				.filter((stage) => stage && stage.key) // Filter out invalid stages
				.map((stage) => ({
					name: `${stage.name || 'Unnamed Stage'} (${stage.key || 'no-key'})`,
					value: stage.key || '',
				}));
		} catch (error) {
			// Return empty array to avoid breaking the UI
			return [];
		}
	},

	// Load boxes for a specific pipeline (pipeline-dependent)
	async getBoxOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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

			// Use the StreakApiService to get boxes for the pipeline
			const boxes = await StreakApiService.listBoxes(this, apiKey, pipelineKey);

			// Map the response data to the format expected by n8n
			return boxes
				.filter((box) => box && box.key) // Filter out invalid boxes
				.map((box) => ({
					name: `${box.name || 'Unnamed Box'} (${box.key || 'no-key'})`,
					value: box.key || '',
				}));
		} catch (error) {
			// Return empty array to avoid breaking the UI
			return [];
		}
	},
};

export const listSearch = {
	// Search method for resourceLocator lists
	async getPipelineOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
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
				filteredPipelines = pipelines.filter(
					(pipeline) =>
						pipeline &&
						pipeline.key &&
						((pipeline.name || '').toLowerCase().includes(filterLower) ||
							pipeline.key.toLowerCase().includes(filterLower)),
				);
			}

			// Map the response data to the format expected by n8n resourceLocator
			const results = filteredPipelines
				.filter((pipeline) => pipeline && pipeline.key) // Filter out invalid pipelines
				.map((pipeline) => ({
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
	async getStageOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
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

			// Parse the stages response using the helper function
			const stages = parseStagesResponse(response);

			// Filter stages if filter is provided
			let filteredStages = stages;
			if (filter) {
				const filterLower = filter.toLowerCase();
				filteredStages = stages.filter(
					(stage) =>
						stage &&
						stage.key &&
						((stage.name || '').toLowerCase().includes(filterLower) ||
							stage.key.toLowerCase().includes(filterLower)),
				);
			}

			// Map the response data to the format expected by n8n resourceLocator
			const results = filteredStages
				.filter((stage) => stage && stage.key) // Filter out invalid stages
				.map((stage) => ({
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

	// Search method for box resourceLocator lists (pipeline-dependent)
	async getBoxOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
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

			// Use the StreakApiService to get boxes for the pipeline
			const boxes = await StreakApiService.listBoxes(this, apiKey, pipelineKey);

			// Filter boxes if filter is provided
			let filteredBoxes = boxes;
			if (filter) {
				const filterLower = filter.toLowerCase();
				filteredBoxes = boxes.filter(
					(box) =>
						box &&
						box.key &&
						((box.name || '').toLowerCase().includes(filterLower) ||
							box.key.toLowerCase().includes(filterLower)),
				);
			}

			// Map the response data to the format expected by n8n resourceLocator
			const results = filteredBoxes
				.filter((box) => box && box.key) // Filter out invalid boxes
				.map((box) => ({
					name: `${box.name || 'Unnamed Box'} (${box.key || 'no-key'})`,
					value: box.key || '',
					url: `https://www.streak.com/box/${box.key || 'no-key'}`,
				}));

			return { results };
		} catch (error) {
			// Return empty results on error
			return { results: [] };
		}
	},
};
