import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Import the methods
import { loadOptions, listSearch } from './methods/loadOptions';

// Import the consolidated properties
import { nodeProperties } from './properties';

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
		loadOptions,
		listSearch,
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
		properties: nodeProperties,
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