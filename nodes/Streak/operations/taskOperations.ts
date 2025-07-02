import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { makeStreakRequest, validateParameters, handlePagination } from './utils';

/**
 * Handle task-related operations for the Streak API
 */
export async function handleTaskOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
	apiKey: string,
): Promise<IDataObject | IDataObject[]> {
	// Handle task operations
	if (operation === 'getTask') {
		// Get Task operation - uses v2 API
		const taskKey = this.getNodeParameter('taskKey', itemIndex) as string;
		
		validateParameters.call(this, { taskKey }, ['taskKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'GET',
			`/tasks/${taskKey}`,
			apiKey,
			itemIndex,
			undefined,
			undefined,
			'v2',
		);
	} else if (operation === 'getTasksInBox') {
		// Get Tasks in Box operation - uses v2 API
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
		const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
		
		validateParameters.call(this, { boxKey }, ['boxKey'], itemIndex);
		
		if (returnAll) {
			return await handlePagination.call(
				this,
				`/boxes/${boxKey}/tasks`,
				apiKey,
				true,
				itemIndex,
				100,
				{},
				'v2',
			);
		} else {
			const response = await makeStreakRequest.call(
				this,
				'GET',
				`/boxes/${boxKey}/tasks`,
				apiKey,
				itemIndex,
				{},
				{ limit: limit.toString() },
				'v2',
			);
			
			if (response && typeof response === 'object' && 'tasks' in response && Array.isArray(response.tasks)) {
				return response.tasks as IDataObject[];
			}
			
			return [];
		}
	} else if (operation === 'createTask') {
		// Create Task operation - uses v2 API
		const boxKey = this.getNodeParameter('boxKey', itemIndex) as string;
		const text = this.getNodeParameter('text', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { boxKey, text }, ['boxKey', 'text'], itemIndex);
		
		const body: IDataObject = {
			text,
		};
		
		if (additionalFields.dueDate) {
			body.dueDate = additionalFields.dueDate;
		}
		
		if (additionalFields.assignees && (additionalFields.assignees as string[]).length > 0) {
			body.assignees = additionalFields.assignees;
		}
		
		if (additionalFields.reminder) {
			body.reminder = additionalFields.reminder;
		}
		
		if (additionalFields.completed !== undefined) {
			body.completed = additionalFields.completed;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/boxes/${boxKey}/tasks`,
			apiKey,
			itemIndex,
			body,
			undefined,
			'v2',
		);
	} else if (operation === 'updateTask') {
		// Update Task operation - uses v2 API
		const taskKey = this.getNodeParameter('taskKey', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
		
		validateParameters.call(this, { taskKey }, ['taskKey'], itemIndex);
		
		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field to update must be specified',
				{ itemIndex },
			);
		}
		
		const body: IDataObject = {};
		
		if (updateFields.text) {
			body.text = updateFields.text;
		}
		
		if (updateFields.dueDate) {
			body.dueDate = updateFields.dueDate;
		}
		
		if (updateFields.assignees && (updateFields.assignees as string[]).length > 0) {
			body.assignees = updateFields.assignees;
		}
		
		if (updateFields.reminder) {
			body.reminder = updateFields.reminder;
		}
		
		if (updateFields.completed !== undefined) {
			body.completed = updateFields.completed;
		}
		
		return await makeStreakRequest.call(
			this,
			'POST',
			`/tasks/${taskKey}`,
			apiKey,
			itemIndex,
			body,
			undefined,
			'v2',
		);
	} else if (operation === 'deleteTask') {
		// Delete Task operation - uses v2 API
		const taskKey = this.getNodeParameter('taskKey', itemIndex) as string;
		
		validateParameters.call(this, { taskKey }, ['taskKey'], itemIndex);
		
		return await makeStreakRequest.call(
			this,
			'DELETE',
			`/tasks/${taskKey}`,
			apiKey,
			itemIndex,
			undefined,
			undefined,
			'v2',
		);
	}

	throw new NodeOperationError(this.getNode(), `The task operation "${operation}" is not supported!`, { itemIndex });
}
