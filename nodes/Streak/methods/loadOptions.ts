import type {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { streakApiRequest } from '../operations/utils';

interface StageRecord {
	key: string;
	name?: string;
}

function isStageRecord(value: unknown): value is StageRecord {
	return typeof value === 'object' && value !== null && 'key' in value;
}

// Helper function to parse stages response from Streak API
function parseStagesResponse(response: unknown): StageRecord[] {
	let stages: StageRecord[] = [];
	if (Array.isArray(response)) {
		if (response.length > 0 && typeof response[0] === 'object') {
			const firstItem = response[0] as Record<string, unknown>;
			const keys = Object.keys(firstItem);
			if (
				keys.length > 0 &&
				firstItem[keys[0]] &&
				typeof firstItem[keys[0]] === 'object' &&
				isStageRecord(firstItem[keys[0]])
			) {
				stages = keys
					.map((key) => firstItem[key])
					.filter((v): v is StageRecord => isStageRecord(v));
			} else {
				stages = response.filter((v): v is StageRecord => isStageRecord(v));
			}
		}
	} else if (response && typeof response === 'object') {
		const resp = response as Record<string, unknown>;
		if (resp.results && Array.isArray(resp.results)) {
			stages = (resp.results as unknown[]).filter((v): v is StageRecord => isStageRecord(v));
		} else if (resp.data && Array.isArray(resp.data)) {
			stages = (resp.data as unknown[]).filter((v): v is StageRecord => isStageRecord(v));
		} else if (resp.stages && Array.isArray(resp.stages)) {
			stages = (resp.stages as unknown[]).filter((v): v is StageRecord => isStageRecord(v));
		} else {
			const keys = Object.keys(resp);
			if (keys.length > 0 && resp[keys[0]] && isStageRecord(resp[keys[0]])) {
				stages = keys
					.map((key) => resp[key])
					.filter((v): v is StageRecord => isStageRecord(v));
			} else if (isStageRecord(response)) {
				stages = [response];
			}
		}
	}
	return stages;
}

function extractParamValue(param: unknown): string | undefined {
	if (typeof param === 'string') return param;
	if (param && typeof param === 'object') {
		const obj = param as Record<string, unknown>;
		if (typeof obj.value === 'string') return obj.value;
		if (typeof obj.id === 'string') return obj.id;
	}
	return undefined;
}

interface TeamRecord {
	key: string;
	name?: string;
}

function isTeamRecord(value: unknown): value is TeamRecord {
	return typeof value === 'object' && value !== null && 'key' in value;
}

function parseTeamsResponse(response: unknown): TeamRecord[] {
	const teams: TeamRecord[] = [];
	if (Array.isArray(response)) {
		for (const item of response) {
			if (item && typeof item === 'object' && 'results' in item) {
				const obj = item as Record<string, unknown>;
				if (Array.isArray(obj.results)) {
					teams.push(...(obj.results as unknown[]).filter((v): v is TeamRecord => isTeamRecord(v)));
				}
			}
		}
	} else if (response && typeof response === 'object') {
		const resp = response as Record<string, unknown>;
		if (resp.results && Array.isArray(resp.results)) {
			teams.push(...(resp.results as unknown[]).filter((v): v is TeamRecord => isTeamRecord(v)));
		} else if (isTeamRecord(response)) {
			teams.push(response);
		}
	}
	return teams;
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
		} catch {
			return [];
		}
	},

	async getTeamOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const response = await streakApiRequest(this, 'GET', '/users/me/teams');
			const teams = parseTeamsResponse(response);

			return teams
				.filter((team) => team && team.key)
				.map((team) => ({
					name: `${team.name || 'Unnamed Team'} (${team.key || 'no-key'})`,
					value: team.key || '',
				}));
		} catch {
			return [];
		}
	},

	async getStageOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const pipelineKey = extractParamValue(this.getCurrentNodeParameter('pipelineKey'));
			if (!pipelineKey) return [];

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
		} catch {
			return [];
		}
	},

	async getBoxOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const pipelineKey = extractParamValue(this.getCurrentNodeParameter('pipelineKey'));
			if (!pipelineKey) return [];

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
		} catch {
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
		} catch {
			return { results: [] };
		}
	},

	async getStageOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		try {
			const pipelineKey = extractParamValue(this.getCurrentNodeParameter('pipelineKey'));
			if (!pipelineKey) return { results: [] };

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
		} catch {
			return { results: [] };
		}
	},

	async getBoxOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		try {
			const pipelineKey = extractParamValue(this.getCurrentNodeParameter('pipelineKey'));
			if (!pipelineKey) return { results: [] };

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
		} catch {
			return { results: [] };
		}
	},

	async getTeamSearchOptions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		try {
			const response = await streakApiRequest(this, 'GET', '/users/me/teams');
			const teams = parseTeamsResponse(response);

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
		} catch {
			return { results: [] };
		}
	},
};
