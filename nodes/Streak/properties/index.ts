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
import { commentProperties } from './commentProperties';
import { meetingProperties } from './meetingProperties';
import { threadProperties } from './threadProperties';
import { fileProperties } from './fileProperties';
import { newsfeedProperties } from './newsfeedProperties';
import { snippetProperties } from './snippetProperties';
import { searchProperties } from './searchProperties';
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
	...commentProperties,
	...meetingProperties,
	...threadProperties,
	...fileProperties,
	...newsfeedProperties,
	...snippetProperties,
	...searchProperties,

	// Shared properties (returnAll, limit)
	...sharedProperties,
];
