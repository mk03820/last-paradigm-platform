/**
 * Communication Pattern Diagnostic Constants and Types
 *
 * Defines metric types, validation rules, and guidance text
 * for the Communication Pattern Diagnostic tool.
 *
 * Story 13.1: Communication Metrics Input
 * Covers: FR2-26 (Input communication pattern metrics)
 */

/**
 * Frequency levels for qualitative metrics
 */
export type FrequencyLevel = 'never' | 'rarely' | 'sometimes' | 'often' | 'always';

/**
 * Email communication metrics
 */
export interface EmailMetrics {
  distributionListCount: number; // 0-500
  avgListSize: number; // 1-1000
  replyAllFrequency: FrequencyLevel;
  urgentResponseTimeHours: number; // 0-72
}

/**
 * Chat/messaging metrics (Slack, Teams)
 */
export interface ChatMetrics {
  activeChannels: number; // 1-500
  dmRatioPercent: number; // 0-100
  atHereFrequency: FrequencyLevel;
  crossChannelRedundancyPercent: number; // 0-100
}

/**
 * Meeting metrics
 */
export interface MeetingMetrics {
  infoCascadeMeetingsPerWeek: number; // 0-50
  decisionDocumentationRatePercent: number; // 0-100
  pulledFromTool2: boolean;
}

/**
 * Complete communication metrics
 */
export interface CommunicationMetrics {
  email: EmailMetrics | null;
  chat: ChatMetrics | null;
  meetings: MeetingMetrics | null;
}

/**
 * Frequency level display info
 */
export interface FrequencyLevelInfo {
  value: FrequencyLevel;
  label: string;
  description: string;
}

export const FREQUENCY_LEVELS: FrequencyLevelInfo[] = [
  {
    value: 'never',
    label: 'Never',
    description: 'This never happens in our organization',
  },
  {
    value: 'rarely',
    label: 'Rarely',
    description: 'Happens occasionally, maybe once a month',
  },
  {
    value: 'sometimes',
    label: 'Sometimes',
    description: 'Happens regularly, a few times a week',
  },
  {
    value: 'often',
    label: 'Often',
    description: 'Happens frequently, multiple times daily',
  },
  {
    value: 'always',
    label: 'Always',
    description: 'This is the norm, happens constantly',
  },
];

/**
 * Get frequency level info
 */
export function getFrequencyLevelInfo(level: FrequencyLevel): FrequencyLevelInfo {
  return FREQUENCY_LEVELS.find((f) => f.value === level) || FREQUENCY_LEVELS[0];
}

/**
 * Metric field configuration
 */
export interface MetricFieldConfig {
  id: string;
  label: string;
  description: string;
  guidance: string;
  type: 'number' | 'percentage' | 'frequency';
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
}

/**
 * Email metrics field configurations
 */
export const EMAIL_METRICS_CONFIG: MetricFieldConfig[] = [
  {
    id: 'distributionListCount',
    label: 'Distribution Lists',
    description: 'Number of active distribution lists in your organization',
    guidance:
      "Count your organization's active distribution lists. Include team DLs, project DLs, and department DLs. Check your email admin or estimate from your inbox.",
    type: 'number',
    min: 0,
    max: 500,
    placeholder: 'e.g., 50',
  },
  {
    id: 'avgListSize',
    label: 'Average List Size',
    description: 'Average number of recipients on distribution lists',
    guidance:
      'Average number of recipients on distribution lists. If you have 10 DLs averaging 25 people each, enter 25.',
    type: 'number',
    min: 1,
    max: 1000,
    placeholder: 'e.g., 25',
  },
  {
    id: 'replyAllFrequency',
    label: 'Reply-All Frequency',
    description: 'How often do email threads become reply-all chains?',
    guidance:
      'How often do email threads devolve into reply-all chains? Consider your experience over the last month.',
    type: 'frequency',
  },
  {
    id: 'urgentResponseTimeHours',
    label: 'Urgent Response Time',
    description: 'Average time to get a response to urgent emails',
    guidance:
      'On average, how long does it take to get a response to an urgent email? Include weekends if applicable.',
    type: 'number',
    min: 0,
    max: 72,
    unit: 'hours',
    placeholder: 'e.g., 4',
  },
];

/**
 * Chat metrics field configurations
 */
export const CHAT_METRICS_CONFIG: MetricFieldConfig[] = [
  {
    id: 'activeChannels',
    label: 'Active Channels',
    description: 'Number of Slack/Teams channels with recent activity',
    guidance:
      'Count Slack/Teams channels with activity in the last 30 days. Include public and private channels you can see.',
    type: 'number',
    min: 1,
    max: 500,
    placeholder: 'e.g., 75',
  },
  {
    id: 'dmRatioPercent',
    label: 'DM Ratio',
    description: 'Percentage of conversations happening in DMs vs channels',
    guidance:
      'Estimate what percentage of work conversations happen in DMs vs public channels. Higher DM ratio = more tribal knowledge.',
    type: 'percentage',
    min: 0,
    max: 100,
    unit: '%',
  },
  {
    id: 'atHereFrequency',
    label: '@here/@channel Frequency',
    description: 'How often people use broadcast mentions',
    guidance:
      'How often do people use @here, @channel, or @all in your workspace? This indicates broadcast overload.',
    type: 'frequency',
  },
  {
    id: 'crossChannelRedundancyPercent',
    label: 'Cross-Channel Redundancy',
    description: 'Percentage of messages cross-posted to multiple channels',
    guidance:
      'What percentage of messages get cross-posted to multiple channels? Estimate from your experience.',
    type: 'percentage',
    min: 0,
    max: 100,
    unit: '%',
    placeholder: 'e.g., 20',
  },
];

/**
 * Meeting metrics field configurations
 */
export const MEETING_METRICS_CONFIG: MetricFieldConfig[] = [
  {
    id: 'infoCascadeMeetingsPerWeek',
    label: 'Info Cascade Meetings',
    description: 'Weekly meetings that could have been emails/documents',
    guidance:
      'Meetings that exist primarily to cascade information that could have been an email or document. Count per week.',
    type: 'number',
    min: 0,
    max: 50,
    unit: 'per week',
    placeholder: 'e.g., 5',
  },
  {
    id: 'decisionDocumentationRatePercent',
    label: 'Decision Documentation Rate',
    description: 'Percentage of meeting decisions that get documented',
    guidance:
      'What percentage of meeting decisions get documented in a retrievable location (not buried in chat)?',
    type: 'percentage',
    min: 0,
    max: 100,
    unit: '%',
    placeholder: 'e.g., 30',
  },
];

/**
 * Section configuration
 */
export interface MetricsSectionConfig {
  id: string;
  title: string;
  icon: string;
  description: string;
  fields: MetricFieldConfig[];
}

export const METRICS_SECTIONS: MetricsSectionConfig[] = [
  {
    id: 'email',
    title: 'Email Communication',
    icon: '📧',
    description: 'Analyze how your organization uses email for communication',
    fields: EMAIL_METRICS_CONFIG,
  },
  {
    id: 'chat',
    title: 'Chat/Messaging',
    icon: '💬',
    description: 'Analyze Slack, Teams, or other messaging platforms',
    fields: CHAT_METRICS_CONFIG,
  },
  {
    id: 'meetings',
    title: 'Meetings',
    icon: '📅',
    description: 'Analyze meeting patterns and decision documentation',
    fields: MEETING_METRICS_CONFIG,
  },
];

/**
 * Get section configuration by ID
 */
export function getSectionConfig(sectionId: string): MetricsSectionConfig | undefined {
  return METRICS_SECTIONS.find((s) => s.id === sectionId);
}

/**
 * Create default email metrics
 */
export function createDefaultEmailMetrics(): EmailMetrics {
  return {
    distributionListCount: 0,
    avgListSize: 0,
    replyAllFrequency: 'sometimes',
    urgentResponseTimeHours: 0,
  };
}

/**
 * Create default chat metrics
 */
export function createDefaultChatMetrics(): ChatMetrics {
  return {
    activeChannels: 0,
    dmRatioPercent: 50,
    atHereFrequency: 'sometimes',
    crossChannelRedundancyPercent: 0,
  };
}

/**
 * Create default meeting metrics
 */
export function createDefaultMeetingMetrics(): MeetingMetrics {
  return {
    infoCascadeMeetingsPerWeek: 0,
    decisionDocumentationRatePercent: 0,
    pulledFromTool2: false,
  };
}

/**
 * Check if email metrics are complete
 */
export function isEmailMetricsComplete(metrics: EmailMetrics | null): boolean {
  if (!metrics) return false;
  return (
    metrics.distributionListCount > 0 &&
    metrics.avgListSize > 0 &&
    metrics.urgentResponseTimeHours > 0
  );
}

/**
 * Check if chat metrics are complete
 */
export function isChatMetricsComplete(metrics: ChatMetrics | null): boolean {
  if (!metrics) return false;
  return metrics.activeChannels > 0;
}

/**
 * Check if meeting metrics are complete
 */
export function isMeetingMetricsComplete(metrics: MeetingMetrics | null): boolean {
  if (!metrics) return false;
  // Either pulled from Tool 2 or manually entered
  return (
    metrics.pulledFromTool2 ||
    (metrics.infoCascadeMeetingsPerWeek > 0 || metrics.decisionDocumentationRatePercent > 0)
  );
}

/**
 * Check if all communication metrics are complete
 */
export function isAllMetricsComplete(metrics: CommunicationMetrics): boolean {
  return (
    isEmailMetricsComplete(metrics.email) &&
    isChatMetricsComplete(metrics.chat) &&
    isMeetingMetricsComplete(metrics.meetings)
  );
}

/**
 * Count completed sections
 */
export function countCompletedSections(metrics: CommunicationMetrics): number {
  let count = 0;
  if (isEmailMetricsComplete(metrics.email)) count++;
  if (isChatMetricsComplete(metrics.chat)) count++;
  if (isMeetingMetricsComplete(metrics.meetings)) count++;
  return count;
}

/**
 * Convert frequency level to numeric score (for calculations)
 */
export function frequencyToScore(frequency: FrequencyLevel): number {
  const scores: Record<FrequencyLevel, number> = {
    never: 0,
    rarely: 1,
    sometimes: 2,
    often: 3,
    always: 4,
  };
  return scores[frequency];
}
