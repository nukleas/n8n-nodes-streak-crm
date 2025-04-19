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
					{
						name: 'Get Current User',
						value: 'getCurrentUser',
						description: 'Get information about the current user',
					},
					{
						name: 'Get User',
						value: 'getUser',
						description: 'Get information about a specific user by their key',
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
