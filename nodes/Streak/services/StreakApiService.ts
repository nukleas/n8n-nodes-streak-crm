import { BoxService } from './resources/BoxService';
import { OrganizationService } from './resources/OrganizationService';
import { PipelineService } from './resources/PipelineService';

/**
 * StreakApiService is the main entry point for all Streak API operations
 * It follows a facade pattern, exposing resource-specific services through factory methods
 */
export class StreakApiService {
	/**
	 * Get access to Pipeline related operations
	 */
	public static pipeline() {
		return PipelineService;
	}

	/**
	 * Get access to Box related operations
	 */
	public static box() {
		return BoxService;
	}

	/**
	 * Get access to Organization related operations
	 */
	public static organization() {
		return OrganizationService;
	}
}
