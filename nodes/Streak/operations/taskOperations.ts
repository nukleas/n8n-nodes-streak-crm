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
		// Get Task operation
		const taskKey = this.getNodeParameter('taskKey', itemIndex) as string;

		validateParameters.call(this, { taskKey }, ['taskKey'], itemIndex);

		return await makeStreakRequest.call(this, 'GET', `/tasks/${taskKey}`, apiKey, itemIndex);
	} else if (operation === 'getTasksInBox') {
		// Get Tasks in Box operation
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
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
			);
		} else {
			const response = await makeStreakRequest.call(
				this,
				'GET',
				`/boxes/${boxKey}/tasks`,
				apiKey,
				itemIndex,
				undefined,
				{ limit },
			);

			if (Array.isArray(response)) return response as IDataObject[];

			if (response && typeof response === 'object') {
				const obj = response as IDataObject;
				if (Array.isArray((obj as any).tasks)) return (obj as any).tasks as IDataObject[];
				if (Array.isArray((obj as any).results)) return (obj as any).results as IDataObject[];
				if (Array.isArray((obj as any).items)) return (obj as any).items as IDataObject[];
			}

			return [];
		}
	} else if (operation === 'createTask') {
		// Create Task operation
		const boxKeyParam = this.getNodeParameter('boxKey', itemIndex) as
			| string
			| { mode: string; value: string };
		const boxKey = typeof boxKeyParam === 'string' ? boxKeyParam : boxKeyParam.value;
		const text = this.getNodeParameter('text', itemIndex) as string;
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		validateParameters.call(this, { boxKey, text }, ['boxKey', 'text'], itemIndex);

		const body: IDataObject = {
			// v2 requires the box key in the body as `key`
			key: boxKey,
			text,
		};

		if (additionalFields.dueDate) {
			// Convert to Unix timestamp in milliseconds
			const dateValue = additionalFields.dueDate as string;
			body.dueDate = new Date(dateValue).getTime();
		}

		if (additionalFields.assignees && (additionalFields.assignees as string[]).length > 0) {
			// v2 expects an array of objects with { email }
			const assigneesArray = Array.isArray(additionalFields.assignees)
				? (additionalFields.assignees as string[])
				: [String(additionalFields.assignees)];
			body.assignedToSharingEntries = assigneesArray.filter((e) => !!e).map((email) => ({ email }));
		}

		return await makeStreakRequest.call(
			this,
			'POST',
			`/boxes/${boxKey}/tasks`,
			apiKey,
			itemIndex,
			body,
		);
	} else if (operation === 'updateTask') {
		// Update Task operation
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
			// Convert to Unix timestamp in milliseconds
			const dateValue = updateFields.dueDate as string;
			body.dueDate = new Date(dateValue).getTime();
		}

		if (updateFields.assignees && (updateFields.assignees as string[]).length > 0) {
			// v2 expects an array of objects with { email }
			const assigneesArray = Array.isArray(updateFields.assignees)
				? (updateFields.assignees as string[])
				: [String(updateFields.assignees)];
			body.assignedToSharingEntries = assigneesArray.filter((e) => !!e).map((email) => ({ email }));
		}

		// Map completed boolean to v2 status enum
		if (updateFields.completed !== undefined) {
			body.status = updateFields.completed ? 'DONE' : 'NOT_DONE';
		}

		return await makeStreakRequest.call(this, 'POST', `/tasks/${taskKey}`, apiKey, itemIndex, body);
	} else if (operation === 'deleteTask') {
		// Delete Task operation
		const taskKey = this.getNodeParameter('taskKey', itemIndex) as string;

		validateParameters.call(this, { taskKey }, ['taskKey'], itemIndex);

		return await makeStreakRequest.call(this, 'DELETE', `/tasks/${taskKey}`, apiKey, itemIndex);
	}

	throw new NodeOperationError(
		this.getNode(),
		`The task operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
