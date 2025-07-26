import type { INodeProperties } from 'n8n-workflow';

// Import all property definitions
import { resourceSelector } from './resourceSelector';
import { userProperties } from './userProperties';
import { teamProperties } from './teamProperties';
import { pipelineProperties } from './pipelineProperties';
import { boxProperties } from './boxProperties';
import { stageProperties } from './stageProperties';
import { fieldProperties } from './fieldProperties';
import { contactProperties } from './contactProperties';
import { organizationProperties } from './organizationProperties';
import { taskProperties } from './taskProperties';
import { sharedProperties } from './sharedProperties';

// Export consolidated properties array
export const nodeProperties: INodeProperties[] = [
	// Resource Selection
	resourceSelector,

	// Resource-specific properties
	...userProperties,
	...teamProperties,
	...pipelineProperties,
	...boxProperties,
	...stageProperties,
	...fieldProperties,
	...contactProperties,
	...organizationProperties,
	...taskProperties,

	// Shared properties (returnAll, limit)
	...sharedProperties,
];
