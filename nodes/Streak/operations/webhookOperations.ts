import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { streakApiRequest, validateParameters } from './utils';

/**
 * Handle webhook-related operations for the Streak API
 */
export async function handleWebhookOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'listWebhooks') {
		const scope = this.getNodeParameter('scope', itemIndex) as string;

		if (scope === 'pipeline') {
			const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
			validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);
			return await streakApiRequest(this, 'GET', `/pipelines/${pipelineKey}/webhooks`);
		} else {
			const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
			validateParameters.call(this, { teamKey }, ['teamKey'], itemIndex);
			return await streakApiRequest(this, 'GET', `/teams/${teamKey}/webhooks`);
		}
	} else if (operation === 'getWebhook') {
		const webhookKey = this.getNodeParameter('webhookKey', itemIndex) as string;

		validateParameters.call(this, { webhookKey }, ['webhookKey'], itemIndex);

		return await streakApiRequest(this, 'GET', `/webhooks/${webhookKey}`);
	} else if (operation === 'createWebhook') {
		const event = this.getNodeParameter('event', itemIndex) as string;
		const targetUrl = this.getNodeParameter('targetUrl', itemIndex) as string;
		const scope = this.getNodeParameter('scope', itemIndex) as string;

		validateParameters.call(this, { event, targetUrl }, ['event', 'targetUrl'], itemIndex);

		const body: IDataObject = {
			event,
			targetUrl,
		};

		if (scope === 'pipeline') {
			const pipelineKey = this.getNodeParameter('pipelineKey', itemIndex) as string;
			validateParameters.call(this, { pipelineKey }, ['pipelineKey'], itemIndex);
			body.pipelineKey = pipelineKey;
		} else {
			const teamKey = this.getNodeParameter('teamKey', itemIndex) as string;
			validateParameters.call(this, { teamKey }, ['teamKey'], itemIndex);
			body.teamKey = teamKey;
		}

		return await streakApiRequest(this, 'POST', '/webhooks', body);
	} else if (operation === 'deleteWebhook') {
		const webhookKey = this.getNodeParameter('webhookKey', itemIndex) as string;

		validateParameters.call(this, { webhookKey }, ['webhookKey'], itemIndex);

		const response = await streakApiRequest(this, 'DELETE', `/webhooks/${webhookKey}`);

		if (
			response === null ||
			response === undefined ||
			(typeof response === 'string' && response === '') ||
			(typeof response === 'object' && Object.keys(response as IDataObject).length === 0)
		) {
			return { success: true, message: 'Webhook deleted successfully' };
		}

		return response;
	}

	throw new NodeOperationError(
		this.getNode(),
		`The webhook operation "${operation}" is not supported!`,
		{ itemIndex },
	);
}
