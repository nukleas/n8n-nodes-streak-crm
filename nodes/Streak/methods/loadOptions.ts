import type {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { streakApiRequest } from '../operations/utils';

// Helper function to parse stages response from Streak API
function parseStagesResponse(response: any): any[] {
	let stages: any[] = [];
	if (Array.isArray(response)) {
		if (response.length > 0 && typeof response[0] === 'object') {
			const firstItem = response[0];
			const keys = Object.keys(firstItem);
			if (
				keys.length > 0 &&
				firstItem[keys[0]] &&
				typeof firstItem[keys[0]] === 'object' &&
				(firstItem[keys[0]] as any).key
			) {
				stages = keys.map((key) => firstItem[key] as any);
			} else {
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
			const keys = Object.keys(response);
			if (
				keys.length > 0 &&
				response[keys[0]] &&
				typeof response[keys[0]] === 'object' &&
				(response[keys[0]] as any).key
			) {
				stages = keys.map((key) => response[key] as any);
			} else {
				stages = [response];
			}
		}
	}
	return stages;
}

export const loadOptions = {
	async getPipelineOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const pipelines = (await streakApiRequest(this, 'GET', '/pipelines')) as Array<{
				key: string;
				name: string;
			}>;

			return pipelines
				.filter((pipeline) => pipeline && pipeline.key)
				.map((pipeline) => ({
					name: `${pipeline.name || 'Unnamed Pipeline'} (${pipeline.key || 'no-key'})`,
					value: pipeline.key || '',
				}));
		} catch (error) {
			return [];
		}
	},

	async getTeamOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const response = await streakApiRequest(this, 'GET', '/users/me/teams');

			let teams: any[] = [];
			if (Array.isArray(response)) {
				for (const item of response) {
					if (item && item.results && Array.isArray(item.results)) {
						teams.push(...item.results);
					}
				}
			} else if (response && typeof response === 'object') {
				if (response.results && Array.isArray(response.results)) {
					teams = response.results;
				} else {
					teams = [response];
				}
			}

			return teams
				.filter((team) => team && team.key)
				.map((team) => ({
					name: `${team.name || 'Unnamed Team'} (${team.key || 'no-key'})`,
					value: team.key || '',
				}));
		} catch (error) {
			return [];
		}
	},

	async getStageOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			let pipelineKey: string;
			const pipelineParam = this.getCurrentNodeParameter('pipelineKey');

			if (typeof pipelineParam === 'string') {
				pipelineKey = pipelineParam;
			} else if (pipelineParam && typeof pipelineParam === 'object') {
				pipelineKey = (pipelineParam as any).value || (pipelineParam as any).id;
			} else {
				return [];
			}

			if (!pipelineKey) {
				return [];
			}

			const response = await streakApiRequest(
				this,
				'GET',
				`/pipelines/${pipelineKey}/stages`,
			);
			const stages = parseStagesResponse(response);

			return stages
				.filter((stage) => stage && stage.key)
				.map((stage) => ({
					name: `${stage.name || 'Unnamed Stage'} (${stage.key || 'no-key'})`,
					value: stage.key || '',
				}));
		} catch (error) {
			return [];
		}
	},

	async getBoxOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			let pipelineKey: string;
			const pipelineParam = this.getCurrentNodeParameter('pipelineKey');

			if (typeof pipelineParam === 'string') {
				pipelineKey = pipelineParam;
			} else if (pipelineParam && typeof pipelineParam === 'object') {
				pipelineKey = (pipelineParam as any).value || (pipelineParam as any).id;
			} else {
				return [];
			}

			if (!pipelineKey) {
				return [];
			}

			const boxes = (await streakApiRequest(
				this,
				'GET',
				`/pipelines/${pipelineKey}/boxes`,
			)) as Array<{ key: string; name: string }>;

			return boxes
				.filter((box) => box && box.key)
				.map((box) => ({
					name: `${box.name || 'Unnamed Box'} (${box.key || 'no-key'})`,
					value: box.key || '',
				}));
		} catch (error) {
			return [];
		}
	},
};

export const listSearch = {
	async getPipelineOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		try {
			const pipelines = (await streakApiRequest(this, 'GET', '/pipelines')) as Array<{
				key: string;
				name: string;
			}>;

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

			const results = filteredPipelines
				.filter((pipeline) => pipeline && pipeline.key)
				.map((pipeline) => ({
					name: `${pipeline.name || 'Unnamed Pipeline'} (${pipeline.key || 'no-key'})`,
					value: pipeline.key || '',
					url: `https://www.streak.com/pipeline/${pipeline.key || 'no-key'}`,
				}));

			return { results };
		} catch (error) {
			return { results: [] };
		}
	},

	async getStageOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		try {
			let pipelineKey: string;
			const pipelineParam = this.getCurrentNodeParameter('pipelineKey');

			if (typeof pipelineParam === 'string') {
				pipelineKey = pipelineParam;
			} else if (pipelineParam && typeof pipelineParam === 'object') {
				pipelineKey = (pipelineParam as any).value || (pipelineParam as any).id;
			} else {
				return { results: [] };
			}

			if (!pipelineKey) {
				return { results: [] };
			}

			const response = await streakApiRequest(
				this,
				'GET',
				`/pipelines/${pipelineKey}/stages`,
			);
			const stages = parseStagesResponse(response);

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

			const results = filteredStages
				.filter((stage) => stage && stage.key)
				.map((stage) => ({
					name: `${stage.name || 'Unnamed Stage'} (${stage.key || 'no-key'})`,
					value: stage.key || '',
					url: `https://www.streak.com/pipeline/${pipelineKey}/stage/${stage.key || 'no-key'}`,
				}));

			return { results };
		} catch (error) {
			return { results: [] };
		}
	},

	async getBoxOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		try {
			let pipelineKey: string;
			const pipelineParam = this.getCurrentNodeParameter('pipelineKey');

			if (typeof pipelineParam === 'string') {
				pipelineKey = pipelineParam;
			} else if (pipelineParam && typeof pipelineParam === 'object') {
				pipelineKey = (pipelineParam as any).value || (pipelineParam as any).id;
			} else {
				return { results: [] };
			}

			if (!pipelineKey) {
				return { results: [] };
			}

			const boxes = (await streakApiRequest(
				this,
				'GET',
				`/pipelines/${pipelineKey}/boxes`,
			)) as Array<{ key: string; name: string }>;

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

			const results = filteredBoxes
				.filter((box) => box && box.key)
				.map((box) => ({
					name: `${box.name || 'Unnamed Box'} (${box.key || 'no-key'})`,
					value: box.key || '',
					url: `https://www.streak.com/box/${box.key || 'no-key'}`,
				}));

			return { results };
		} catch (error) {
			return { results: [] };
		}
	},

	async getTeamSearchOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		try {
			const response = await streakApiRequest(this, 'GET', '/users/me/teams');

			let teams: any[] = [];
			if (Array.isArray(response)) {
				for (const item of response) {
					if (item && item.results && Array.isArray(item.results)) {
						teams.push(...item.results);
					}
				}
			} else if (response && typeof response === 'object') {
				if (response.results && Array.isArray(response.results)) {
					teams = response.results;
				} else {
					teams = [response];
				}
			}

			let filteredTeams = teams;
			if (filter) {
				const filterLower = filter.toLowerCase();
				filteredTeams = teams.filter(
					(team) =>
						team &&
						team.key &&
						((team.name || '').toLowerCase().includes(filterLower) ||
							team.key.toLowerCase().includes(filterLower)),
				);
			}

			const results = filteredTeams
				.filter((team) => team && team.key)
				.map((team) => ({
					name: `${team.name || 'Unnamed Team'} (${team.key || 'no-key'})`,
					value: team.key || '',
					url: `https://www.streak.com/team/${team.key || 'no-key'}`,
				}));

			return { results };
		} catch (error) {
			return { results: [] };
		}
	},
};
