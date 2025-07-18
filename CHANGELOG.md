# Changelog

All notable changes to the n8n-nodes-streak-crm project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2025-12-30
### Fixed
- **CRITICAL**: Fixed API endpoint version in `utils.ts` from v2 to v1 to resolve 400 errors
## [1.0.3] - 2025-04-22

### Added
- Created a comprehensive `StreakApiService` class to centralize API interactions
- Added TypeScript interfaces for Streak API data structures (IStreakPipeline, IStreakStage, IStreakBox)
- Implemented dynamic pipeline selection dropdown using the Streak API

### Fixed
- Fixed "Box Keys" field handling in "Move Boxes (Batch)" operation to properly support multiple values
- Improved error handling for API requests with better error messages
- Made API request handling more consistent across the node

### Changed
- Refactored pipeline operations to use the new StreakApiService
- Changed the "Box Keys" input from a comma-separated string to proper multi-value input with "Add Box Key" button
- Updated node parameter descriptions for better clarity

## [1.0.2] - Previous Release

Initial implementation of the Streak CRM node with basic functionality.
