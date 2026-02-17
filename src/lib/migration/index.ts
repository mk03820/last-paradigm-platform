/**
 * PB1 Migration Module
 *
 * Exports all utilities for migrating PB1 session data to the database.
 *
 * Story 15.7: PB1 Data Migration to Database
 */

// Data collection
export {
  collectAllToolData,
  collectTool1Data,
  collectTool2Data,
  collectTool3Data,
  collectTool4Data,
  collectTool5Data,
  collectTool6Data,
  collectTool7Data,
  toSessionData,
  type PB1CollectedData,
} from './collect-pb1-data';

// Transformation
export {
  transformPB1ToPB2,
  transformSessionDataToPB2,
  transformToRoadmap,
  transformToOKRFramework,
  transformToMeetingProtocol,
  transformToDelegationFramework,
  transformToGovernanceCharter,
  transformToDataPlatformPlaybook,
  transformToCommunicationArchitecture,
  transformToROIDashboard,
  calculateEstimatedSavings,
} from './transform-pb1-to-pb2';

// Session cleanup
export {
  clearAllPB1Stores,
  clearTool1Store,
  clearTool2Store,
  clearTool3Store,
  clearTool4Store,
  clearTool5Store,
  clearTool6Store,
  clearTool7Store,
  hasPB1SessionData,
  type ClearSessionResult,
} from './clear-pb1-session';

// React hook
export {
  usePB1Migration,
  migratePB1DataStandalone,
  type MigrationStatus,
  type MigrationError,
  type MigrationResult,
  type UsePB1MigrationState,
  type UsePB1MigrationActions,
  type UsePB1MigrationReturn,
} from './use-pb1-migration';
