/**
 * Communication Pattern Diagnostic Components
 *
 * Exports all components for Tool 6.
 *
 * Story 13.1: Communication Metrics Input
 * Task 8: Create index.ts exports (AC: all)
 */

export { EmailMetricsForm } from './EmailMetricsForm';
export { ChatMetricsForm } from './ChatMetricsForm';
export { MeetingMetricsForm } from './MeetingMetricsForm';
export { MetricsSection, getSectionStatus } from './MetricsSection';

// Re-export types and constants for convenience
export type {
  FrequencyLevel,
  EmailMetrics,
  ChatMetrics,
  MeetingMetrics,
  CommunicationMetrics,
  FrequencyLevelInfo,
  MetricFieldConfig,
  MetricsSectionConfig,
} from './comm-constants';

export {
  FREQUENCY_LEVELS,
  EMAIL_METRICS_CONFIG,
  CHAT_METRICS_CONFIG,
  MEETING_METRICS_CONFIG,
  METRICS_SECTIONS,
  getFrequencyLevelInfo,
  getSectionConfig,
  createDefaultEmailMetrics,
  createDefaultChatMetrics,
  createDefaultMeetingMetrics,
  isEmailMetricsComplete,
  isChatMetricsComplete,
  isMeetingMetricsComplete,
  isAllMetricsComplete,
  countCompletedSections,
  frequencyToScore,
} from './comm-constants';
