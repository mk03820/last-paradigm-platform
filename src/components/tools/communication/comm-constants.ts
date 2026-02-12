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

// ============================================================================
// Anti-Pattern Detection Types and Constants (Story 13.2)
// ============================================================================

/**
 * Severity levels for anti-pattern detection
 */
export type SeverityLevel = 'none' | 'low' | 'medium' | 'high';

/**
 * Anti-pattern definition
 */
export interface AntiPattern {
  id: string;
  name: string;
  description: string;
  examples: string[];
  icon: string;
}

/**
 * Detection result for a single anti-pattern
 */
export interface DetectionResult {
  patternId: string;
  detected: boolean;
  severity: SeverityLevel;
  evidence: string[];
  confidence: number; // 0-1 scale
}

/**
 * Complete pattern analysis results
 */
export interface PatternAnalysis {
  results: DetectionResult[];
  detectedCount: number;
  overallHealth: 'healthy' | 'warning' | 'critical';
  analyzedAt: string;
}

/**
 * The 5 communication anti-patterns from Playbook 1
 */
export const ANTI_PATTERNS: AntiPattern[] = [
  {
    id: 'broadcast-overload',
    name: 'Broadcast Overload',
    description: 'Over-reliance on broadcast communication (@here, @channel, mass emails) that creates noise and reduces signal.',
    examples: [
      'Every message uses @here or @channel',
      'Distribution lists used for information that affects few people',
      'Same message cross-posted to 3+ channels',
    ],
    icon: '📢',
  },
  {
    id: 'telephone-game',
    name: 'Telephone Game',
    description: 'Information passes through multiple intermediaries before reaching the people who need it, degrading accuracy.',
    examples: [
      'Decisions made in small meetings, then cascaded through managers',
      'Information travels executive → director → manager → team',
      'Second-hand information is the norm',
    ],
    icon: '📞',
  },
  {
    id: 'tribal-knowledge',
    name: 'Tribal Knowledge',
    description: 'Critical information lives in people\'s heads or private channels rather than searchable, shared locations.',
    examples: [
      'High DM usage for work discussions',
      'Decisions made but not documented',
      '"Ask Sarah, she knows how this works"',
    ],
    icon: '🧠',
  },
  {
    id: 'tool-sprawl',
    name: 'Tool Sprawl',
    description: 'Too many communication channels creating fragmentation and duplication of discussions.',
    examples: [
      'Same topic discussed in Slack, email, and meetings',
      'Hundreds of channels with overlapping purposes',
      'No clear guidance on which tool for what purpose',
    ],
    icon: '🔀',
  },
  {
    id: 'cya-culture',
    name: 'CYA Culture',
    description: 'Communication patterns driven by covering tracks rather than effective information sharing.',
    examples: [
      'Excessive CC/BCC usage',
      'Reply-all to establish record',
      'Documentation for blame protection, not knowledge',
    ],
    icon: '🛡️',
  },
];

/**
 * Detection thresholds for anti-patterns
 */
export const DETECTION_THRESHOLDS = {
  // Broadcast Overload thresholds
  atHereFrequency: {
    low: 'sometimes' as FrequencyLevel,
    medium: 'often' as FrequencyLevel,
    high: 'always' as FrequencyLevel,
  },
  crossChannelRedundancy: {
    low: 20,    // 20% redundancy
    medium: 30, // 30% redundancy
    high: 50,   // 50% redundancy
  },

  // Telephone Game thresholds
  infoCascadeMeetings: {
    low: 3,     // 3 per week
    medium: 5,  // 5 per week
    high: 10,   // 10 per week
  },
  decisionDocRate: {
    healthy: 70,  // 70%+ is healthy
    warning: 50,  // 50-70% is warning
    crisis: 25,   // Below 25% is crisis
  },

  // Tribal Knowledge thresholds
  dmRatio: {
    low: 40,    // 40% DMs
    medium: 50, // 50% DMs
    high: 70,   // 70% DMs
  },

  // Tool Sprawl thresholds
  activeChannels: {
    low: 75,    // 75 channels
    medium: 100, // 100 channels
    high: 200,   // 200 channels
  },

  // CYA Culture thresholds
  replyAllFrequency: {
    low: 'sometimes' as FrequencyLevel,
    medium: 'often' as FrequencyLevel,
    high: 'always' as FrequencyLevel,
  },
  distributionListImpact: {
    low: 500,     // DL count × avg size
    medium: 1000,
    high: 2500,
  },
};

/**
 * Severity color and style mapping
 */
export const SEVERITY_STYLES: Record<SeverityLevel, { color: string; bgColor: string; label: string }> = {
  none: {
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Not Detected',
  },
  low: {
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Low',
  },
  medium: {
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'Medium',
  },
  high: {
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'High',
  },
};

/**
 * Get anti-pattern by ID
 */
export function getAntiPatternById(id: string): AntiPattern | undefined {
  return ANTI_PATTERNS.find((p) => p.id === id);
}

/**
 * Get severity style configuration
 */
export function getSeverityStyle(severity: SeverityLevel) {
  return SEVERITY_STYLES[severity];
}

/**
 * Calculate overall health from detection results
 */
export function calculateOverallHealth(results: DetectionResult[]): 'healthy' | 'warning' | 'critical' {
  const highCount = results.filter((r) => r.severity === 'high').length;
  const mediumCount = results.filter((r) => r.severity === 'medium').length;
  const detectedCount = results.filter((r) => r.detected).length;

  if (highCount >= 2 || (highCount >= 1 && mediumCount >= 2)) {
    return 'critical';
  }
  if (detectedCount >= 3 || highCount >= 1 || mediumCount >= 2) {
    return 'warning';
  }
  return 'healthy';
}

/**
 * Health indicator styles
 */
export const HEALTH_STYLES = {
  healthy: {
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Healthy',
    icon: '✅',
  },
  warning: {
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Warning',
    icon: '⚠️',
  },
  critical: {
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Critical',
    icon: '🚨',
  },
};

// ============================================================================
// Health Indicators Types and Constants (Story 13.3)
// ============================================================================

/**
 * Health status for individual indicators
 */
export type HealthStatus = 'healthy' | 'warning' | 'crisis';

/**
 * Category for health indicators
 */
export type IndicatorCategory = 'email' | 'chat' | 'meetings';

/**
 * Health indicator definition
 */
export interface HealthIndicator {
  id: string;
  name: string;
  description: string;
  category: IndicatorCategory;
  unit: string;
  direction: 'lower-is-better' | 'higher-is-better';
  thresholds: {
    healthy: number;
    warning: number;
    crisis: number;
  };
  getValue: (metrics: CommunicationMetrics) => number | null;
}

/**
 * Result of evaluating a single health indicator
 */
export interface HealthIndicatorResult {
  indicatorId: string;
  value: number | null;
  status: HealthStatus;
  evidence: string;
}

/**
 * Complete health evaluation results
 */
export interface HealthEvaluationResult {
  indicators: HealthIndicatorResult[];
  overallScore: number;
  overallStatus: HealthStatus;
  evaluatedAt: string;
}

/**
 * Key health indicators for communication patterns
 */
export const HEALTH_INDICATORS: HealthIndicator[] = [
  // Email Indicators
  {
    id: 'email-response-time',
    name: 'Urgent Email Response Time',
    description: 'Average time to respond to urgent emails',
    category: 'email',
    unit: 'hours',
    direction: 'lower-is-better',
    thresholds: {
      healthy: 4,
      warning: 12,
      crisis: 24,
    },
    getValue: (m) => m.email?.urgentResponseTimeHours ?? null,
  },
  {
    id: 'broadcast-intensity',
    name: 'Distribution List Intensity',
    description: 'DL count × average size (broadcast reach)',
    category: 'email',
    unit: 'recipients',
    direction: 'lower-is-better',
    thresholds: {
      healthy: 500,
      warning: 1500,
      crisis: 3000,
    },
    getValue: (m) => m.email ? m.email.distributionListCount * m.email.avgListSize : null,
  },

  // Chat Indicators
  {
    id: 'dm-ratio',
    name: 'Direct Message Ratio',
    description: 'Percentage of conversations in private DMs (tribal knowledge risk)',
    category: 'chat',
    unit: '%',
    direction: 'lower-is-better',
    thresholds: {
      healthy: 30,
      warning: 50,
      crisis: 70,
    },
    getValue: (m) => m.chat?.dmRatioPercent ?? null,
  },
  {
    id: 'channel-count',
    name: 'Active Channel Count',
    description: 'Number of active Slack/Teams channels (tool sprawl risk)',
    category: 'chat',
    unit: 'channels',
    direction: 'lower-is-better',
    thresholds: {
      healthy: 50,
      warning: 100,
      crisis: 200,
    },
    getValue: (m) => m.chat?.activeChannels ?? null,
  },
  {
    id: 'cross-post-rate',
    name: 'Cross-Channel Redundancy',
    description: 'Messages duplicated across multiple channels',
    category: 'chat',
    unit: '%',
    direction: 'lower-is-better',
    thresholds: {
      healthy: 10,
      warning: 25,
      crisis: 50,
    },
    getValue: (m) => m.chat?.crossChannelRedundancyPercent ?? null,
  },

  // Meeting Indicators
  {
    id: 'decision-doc-rate',
    name: 'Decision Documentation Rate',
    description: 'Percentage of meeting decisions that get documented',
    category: 'meetings',
    unit: '%',
    direction: 'higher-is-better',
    thresholds: {
      healthy: 70,
      warning: 40,
      crisis: 25,
    },
    getValue: (m) => m.meetings?.decisionDocumentationRatePercent ?? null,
  },
  {
    id: 'info-cascade-meetings',
    name: 'Information Cascade Meetings',
    description: 'Weekly meetings that should have been emails',
    category: 'meetings',
    unit: '/week',
    direction: 'lower-is-better',
    thresholds: {
      healthy: 2,
      warning: 5,
      crisis: 10,
    },
    getValue: (m) => m.meetings?.infoCascadeMeetingsPerWeek ?? null,
  },
];

/**
 * Get health indicator by ID
 */
export function getHealthIndicatorById(id: string): HealthIndicator | undefined {
  return HEALTH_INDICATORS.find((i) => i.id === id);
}

/**
 * Get health indicators by category
 */
export function getHealthIndicatorsByCategory(category: IndicatorCategory): HealthIndicator[] {
  return HEALTH_INDICATORS.filter((i) => i.category === category);
}

/**
 * Get health status style (maps to existing HEALTH_STYLES)
 */
export function getHealthStatusStyle(status: HealthStatus) {
  // Map 'crisis' to 'critical' for HEALTH_STYLES
  const styleKey = status === 'crisis' ? 'critical' : status;
  return HEALTH_STYLES[styleKey];
}

/**
 * Health score interpretation text
 */
export const HEALTH_SCORE_INTERPRETATIONS = {
  healthy: {
    range: '70-100',
    title: 'Healthy Communication',
    description: 'Your organization demonstrates strong communication patterns. Continue maintaining these practices.',
  },
  warning: {
    range: '40-69',
    title: 'Mixed Communication Health',
    description: 'Some communication patterns need attention. Review the indicators below to identify areas for improvement.',
  },
  crisis: {
    range: '0-39',
    title: 'Critical Communication Issues',
    description: 'Multiple communication patterns are in crisis. Immediate intervention is recommended to prevent organizational drag.',
  },
};

// ============================================================================
// Intervention Types and Constants (Story 13.4)
// ============================================================================

/**
 * Impact level for interventions
 */
export type ImpactLevel = 'high' | 'medium' | 'low';

/**
 * Effort level for interventions
 */
export type EffortLevel = 'high' | 'medium' | 'low';

/**
 * Intervention definition
 */
export interface Intervention {
  id: string;
  patternId: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  playbook2Tool?: string;
  playbook2Link?: string;
}

/**
 * Recommended intervention with priority calculation
 */
export interface RecommendedIntervention extends Intervention {
  priority: number;
  severity: SeverityLevel;
}

/**
 * Tool 6 summary for Tool 7 aggregation
 */
export interface Tool6Summary {
  healthScore: number;
  healthStatus: HealthStatus;
  patternsDetected: number;
  patternsSeverity: {
    high: number;
    medium: number;
    low: number;
  };
  interventionsRecommended: number;
  topInterventions: string[];
  completedAt: string;
}

/**
 * Interventions for each anti-pattern
 */
export const INTERVENTIONS: Intervention[] = [
  // Broadcast Overload Interventions
  {
    id: 'collapse-distribution-lists',
    patternId: 'broadcast-overload',
    title: 'Consolidate Distribution Lists',
    description: 'Audit and merge overlapping DLs. Create tiered lists separating need-to-know from nice-to-know information.',
    impact: 'high',
    effort: 'medium',
    playbook2Tool: 'Communication Audit Template',
  },
  {
    id: 'implement-channel-guidelines',
    patternId: 'broadcast-overload',
    title: 'Establish Channel Guidelines',
    description: 'Define when to use @here/@channel. Create escalation tiers for different urgency levels.',
    impact: 'medium',
    effort: 'low',
  },
  {
    id: 'implement-digest-system',
    patternId: 'broadcast-overload',
    title: 'Implement Digest System',
    description: 'Replace constant broadcasts with daily/weekly digests. Let people pull info rather than push to everyone.',
    impact: 'medium',
    effort: 'medium',
  },

  // Telephone Game Interventions
  {
    id: 'direct-communication-paths',
    patternId: 'telephone-game',
    title: 'Create Direct Communication Paths',
    description: 'Identify info that cascades through 3+ levels. Create direct channels to skip intermediaries.',
    impact: 'high',
    effort: 'medium',
  },
  {
    id: 'decision-documentation',
    patternId: 'telephone-game',
    title: 'Implement Decision Logs',
    description: 'Require written decisions within 24 hours of meetings. Use standard template with context, decision, and rationale.',
    impact: 'high',
    effort: 'low',
    playbook2Tool: 'Decision Log Template',
  },
  {
    id: 'single-source-of-truth',
    patternId: 'telephone-game',
    title: 'Establish Single Source of Truth',
    description: 'For each major initiative, designate one canonical location for status and decisions. No verbal-only updates.',
    impact: 'high',
    effort: 'medium',
  },

  // Tribal Knowledge Interventions
  {
    id: 'knowledge-externalization',
    patternId: 'tribal-knowledge',
    title: 'Externalize Critical Knowledge',
    description: 'Identify top 10 "ask Sarah" topics. Document in searchable wiki/knowledge base with regular updates.',
    impact: 'high',
    effort: 'high',
    playbook2Tool: 'Knowledge Audit Framework',
  },
  {
    id: 'public-channel-default',
    patternId: 'tribal-knowledge',
    title: 'Default to Public Channels',
    description: 'Policy: Work discussions start in public channels. DMs only for sensitive/personal topics.',
    impact: 'medium',
    effort: 'low',
  },
  {
    id: 'onboarding-documentation',
    patternId: 'tribal-knowledge',
    title: 'Create Onboarding Documentation',
    description: 'Document what new team members need to know. If it is not written down, it does not exist.',
    impact: 'medium',
    effort: 'medium',
  },

  // Tool Sprawl Interventions
  {
    id: 'channel-consolidation',
    patternId: 'tool-sprawl',
    title: 'Consolidate Redundant Channels',
    description: 'Audit channels with similar purposes. Archive duplicates, redirect to canonical channels.',
    impact: 'medium',
    effort: 'medium',
  },
  {
    id: 'tool-purpose-matrix',
    patternId: 'tool-sprawl',
    title: 'Define Tool-Purpose Matrix',
    description: 'Create clear guidance: Email for X, Slack for Y, Meetings for Z. Enforce boundaries consistently.',
    impact: 'high',
    effort: 'low',
    playbook2Tool: 'Communication Channel Matrix',
  },
  {
    id: 'channel-naming-convention',
    patternId: 'tool-sprawl',
    title: 'Implement Channel Naming Convention',
    description: 'Standard prefixes (proj-, team-, topic-) make channels discoverable and reduce duplication.',
    impact: 'low',
    effort: 'low',
  },

  // CYA Culture Interventions
  {
    id: 'psychological-safety',
    patternId: 'cya-culture',
    title: 'Build Psychological Safety',
    description: 'Address root cause: fear of blame. Implement blameless postmortems, celebrate learning from failures.',
    impact: 'high',
    effort: 'high',
  },
  {
    id: 'reduce-email-cc',
    patternId: 'cya-culture',
    title: 'Implement CC Reduction Policy',
    description: 'Guideline: CC only those who need to act. Move FYI info to weekly digests or shared dashboards.',
    impact: 'medium',
    effort: 'low',
  },
  {
    id: 'decision-authority-clarity',
    patternId: 'cya-culture',
    title: 'Clarify Decision Authority',
    description: 'Document who can decide what. Clear authority reduces need to "cover" with excessive documentation.',
    impact: 'high',
    effort: 'medium',
    playbook2Tool: 'RACI Matrix Template',
  },
];

/**
 * Get interventions for a specific anti-pattern
 */
export function getInterventionsForPattern(patternId: string): Intervention[] {
  return INTERVENTIONS.filter((i) => i.patternId === patternId);
}

/**
 * Impact and effort styles for badges
 */
export const IMPACT_STYLES: Record<ImpactLevel, { color: string; bgColor: string; label: string }> = {
  high: {
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'High Impact',
  },
  medium: {
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Medium Impact',
  },
  low: {
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    label: 'Low Impact',
  },
};

export const EFFORT_STYLES: Record<EffortLevel, { color: string; bgColor: string; label: string }> = {
  low: {
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Low Effort',
  },
  medium: {
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Medium Effort',
  },
  high: {
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'High Effort',
  },
};
