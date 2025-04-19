import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Streak implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Streak',
		name: 'streak',
		group: ['transform'],
		version: 1,
		description: 'Streak CRM Node',
		icon: 'file:streak.png',
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
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			// Operation Selection
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'getCurrentUser',
				options: [
					// User operations
					{
						name: 'Get Current User',
						value: 'getCurrentUser',
						description: 'Get information about the current user',
					},
					{
						name: 'Get User',
						value: 'getUser',
						description: 'Get information about a specific user by their key',
					},
					// Team operations
					{
						name: 'Get My Teams',
						value: 'getMyTeams',
						description: 'List all teams the authenticated user belongs to',
					},
					{
						name: 'Get Team',
						value: 'getTeam',
						description: 'Get information about a specific team',
					},
					// Pipeline operations
					{
						name: 'List All Pipelines',
						value: 'listAllPipelines',
						description: 'Lists all pipelines the user has access to',
					},
					{
						name: 'Get Pipeline',
						value: 'getPipeline',
						description: 'Gets a specific pipeline by its key',
					},
					{
						name: 'Create Pipeline',
						value: 'createPipeline',
						description: 'Creates a new pipeline',
					},
					{
						name: 'Update Pipeline',
						value: 'updatePipeline',
						description: 'Updates an existing pipeline',
					},
					{
						name: 'Delete Pipeline',
						value: 'deletePipeline',
						description: 'Deletes a pipeline',
					},
					{
						name: 'Move Boxes (Batch)',
						value: 'moveBoxesBatch',
						description: 'Moves multiple boxes to a different pipeline',
					}
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
						operation: [
							'getUser',
						],
					},
				},
			},
			// Team Key (only for getTeam operation)
			{
				displayName: 'Team Key',
				name: 'teamKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the team to get information about',
				displayOptions: {
					show: {
						operation: [
							'getTeam',
						],
					},
				},
			},
			// Pipeline Key (for pipeline operations)
			{
				displayName: 'Pipeline Key',
				name: 'pipelineKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the pipeline',
				displayOptions: {
					show: {
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
				},
				default: '',
				required: true,
				description: 'The keys of the boxes to move (comma-separated)',
				displayOptions: {
					show: {
						operation: [
							'moveBoxesBatch',
						],
					},
				},
			},
			// Target Pipeline Key (for moveBoxesBatch)
			{
				displayName: 'Target Pipeline Key',
				name: 'targetPipelineKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The key of the target pipeline to move boxes to',
				displayOptions: {
					show: {
						operation: [
							'moveBoxesBatch',
						],
					},
				},
			},
		],
	};

	// The function below makes requests to the Streak API based on the selected operation
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
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let responseData: IDataObject | IDataObject[];

				if (operation === 'getCurrentUser') {
					// Get Current User operation
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: 'https://api.streak.com/api/v1/users/me',
						headers: {
							'Accept': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'getUser') {
					// Get User operation
					const userKey = this.getNodeParameter('userKey', itemIndex) as string;
					
					if (!userKey) {
						throw new NodeOperationError(this.getNode(), 'User Key is required for this operation', { itemIndex });
					}
					
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://api.streak.com/api/v1/users/${userKey}`,
						headers: {
							'Accept': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'getMyTeams') {
					// Get My Teams operation
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: 'https://api.streak.com/api/v1/teams',
						headers: {
							'Accept': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'getTeam') {
					// Get Team operation
					const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
					
					if (!teamKey) {
						throw new NodeOperationError(this.getNode(), 'Team Key is required for this operation', { itemIndex });
					}
					
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://api.streak.com/api/v1/teams/${teamKey}`,
						headers: {
							'Accept': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'listAllPipelines') {
					// List All Pipelines operation
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: 'https://api.streak.com/api/v1/pipelines',
						headers: {
							'Accept': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'getPipeline') {
					// Get Pipeline operation
					const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
					
					if (!pipelineKey) {
						throw new NodeOperationError(this.getNode(), 'Pipeline Key is required for this operation', { itemIndex });
					}
					
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://api.streak.com/api/v1/pipelines/${pipelineKey}`,
						headers: {
							'Accept': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'createPipeline') {
					// Create Pipeline operation
					const pipelineName = this.getNodeParameter('pipelineName', itemIndex) as string;
					
					if (!pipelineName) {
						throw new NodeOperationError(this.getNode(), 'Pipeline Name is required for this operation', { itemIndex });
					}
					
					responseData = await this.helpers.httpRequest({
						method: 'PUT',
						url: 'https://api.streak.com/api/v1/pipelines',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						body: {
							name: pipelineName,
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'updatePipeline') {
					// Update Pipeline operation
					const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
					const pipelineName = this.getNodeParameter('pipelineName', itemIndex) as string;
					
					if (!pipelineKey) {
						throw new NodeOperationError(this.getNode(), 'Pipeline Key is required for this operation', { itemIndex });
					}
					
					if (!pipelineName) {
						throw new NodeOperationError(this.getNode(), 'Pipeline Name is required for this operation', { itemIndex });
					}
					
					responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://api.streak.com/api/v1/pipelines/${pipelineKey}`,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						body: {
							name: pipelineName,
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'deletePipeline') {
					// Delete Pipeline operation
					const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
					
					if (!pipelineKey) {
						throw new NodeOperationError(this.getNode(), 'Pipeline Key is required for this operation', { itemIndex });
					}
					
					responseData = await this.helpers.httpRequest({
						method: 'DELETE',
						url: `https://api.streak.com/api/v1/pipelines/${pipelineKey}`,
						headers: {
							'Accept': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						json: true,
					}) as JsonObject;
				} else if (operation === 'moveBoxesBatch') {
					// Move Boxes (Batch) operation
					const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
					const boxKeysInput = this.getNodeParameter('boxKeys', itemIndex) as string[];
					const targetPipelineKey = this.getNodeParameter('targetPipelineKey', itemIndex) as string;
					
					if (!pipelineKey) {
						throw new NodeOperationError(this.getNode(), 'Source Pipeline Key is required for this operation', { itemIndex });
					}
					
					if (!boxKeysInput || !boxKeysInput.length) {
						throw new NodeOperationError(this.getNode(), 'Box Keys are required for this operation', { itemIndex });
					}
					
					if (!targetPipelineKey) {
						throw new NodeOperationError(this.getNode(), 'Target Pipeline Key is required for this operation', { itemIndex });
					}
					
					responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://api.streak.com/api/v1/pipelines/${pipelineKey}/moveBoxes`,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						auth: {
							username: apiKey,
							password: '',
						},
						body: {
							targetPipelineKey,
							boxKeys: boxKeysInput,
						},
						json: true,
					}) as JsonObject;
				} else {
					throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`, { itemIndex });
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
				throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}

		return [returnData];
	}
}
