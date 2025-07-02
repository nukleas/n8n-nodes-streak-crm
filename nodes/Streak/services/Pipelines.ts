import { AbstractService } from "./AbstractService";
import { IStreakPipeline } from "./StreakApiService";

/**
 * Service for managing Streak CRM Pipelines.
 * Pipelines are core data objects in Streak that represent business processes.
 * They define the schema for boxes, stages, and custom fields.
 */
export class PipelinesService extends AbstractService<IStreakPipeline> {
    constructor(apiKey: string) {
        super(apiKey, 'https://api.streak.com/api/v1');
    }

    /**
     * Get a specific pipeline by its key
     * @param key The unique key of the pipeline
     * @returns The pipeline object
     */
    async get(key: string): Promise<IStreakPipeline> {
        return this.request<IStreakPipeline>('GET', `/pipelines/${key}`);
    }

    /**
     * Query pipelines with optional parameters
     * @param queryParams Optional query parameters for filtering results
     * @returns Array of pipeline objects
     */
    async query(queryParams?: Record<string, string>): Promise<IStreakPipeline[]> {
        return this.request<IStreakPipeline[]>('GET', '/pipelines', undefined, queryParams);
    }

    /**
     * Update a pipeline's properties
     * @param key The unique key of the pipeline to update
     * @param params The properties to update
     * @returns The updated pipeline object
     */
    async update(key: string, params: Partial<IStreakPipeline>): Promise<IStreakPipeline> {
        return this.request<IStreakPipeline>('POST', `/pipelines/${key}`, params);
    }

    /**
     * Create a new pipeline
     * @param params The pipeline properties
     * @returns The newly created pipeline object
     */
    async create(params: Omit<IStreakPipeline, 'key'>): Promise<IStreakPipeline> {
        return this.request<IStreakPipeline>('PUT', '/pipelines', params);
    }

    /**
     * Delete a pipeline
     * @param key The unique key of the pipeline to delete
     */
    async delete(key: string): Promise<void> {
        await this.request('DELETE', `/pipelines/${key}`);
    }

    /**
     * Move boxes between pipelines
     * @param sourcePipelineKey The key of the source pipeline
     * @param targetPipelineKey The key of the target pipeline
     * @param boxKeys Array of box keys to move
     * @returns The updated pipeline object
     */
    async moveBoxesBatch(
        sourcePipelineKey: string,
        targetPipelineKey: string,
        boxKeys: string[]
    ): Promise<IStreakPipeline> {
        return this.request<IStreakPipeline>('POST', `/pipelines/${sourcePipelineKey}/moveBoxes`, {
            targetPipelineKey,
            boxKeys
        });
    }
    
}
