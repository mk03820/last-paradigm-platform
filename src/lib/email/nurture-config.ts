/**
 * Nurture Sequence Configuration
 *
 * Defines the 5-email nurture sequence sent to non-purchasers over 14 days.
 * Each email is designed to provide value and encourage conversion.
 *
 * Story 20.3: Nurture Sequence Content
 * Task 2: Create nurture sequence configuration (AC: 1)
 * Covers: FR52 (5-email nurture sequence over 14 days)
 */

/**
 * Nurture email day schedule
 */
export const NURTURE_SCHEDULE = {
  DAY_0: 0,
  DAY_3: 3,
  DAY_7: 7,
  DAY_10: 10,
  DAY_14: 14,
} as const;

export type NurtureDay = (typeof NURTURE_SCHEDULE)[keyof typeof NURTURE_SCHEDULE];

/**
 * Nurture email configuration
 */
export interface NurtureEmailConfig {
  day: NurtureDay;
  subject: string;
  previewText: string;
  contentFocus: string;
  ctaText: string;
  ctaDestination: 'preview' | 'purchase';
}

/**
 * The 5 nurture emails with their configurations
 */
export const NURTURE_EMAILS: ReadonlyArray<NurtureEmailConfig> = [
  {
    day: NURTURE_SCHEDULE.DAY_0,
    subject: 'Your diagnostic results are saved',
    previewText:
      "We've saved your alignment tax results. Here's what you discovered.",
    contentFocus:
      'Recap diagnostic scores, preview potential savings, soft CTA to view full preview',
    ctaText: 'View Your Savings Preview',
    ctaDestination: 'preview',
  },
  {
    day: NURTURE_SCHEDULE.DAY_3,
    subject: 'How organizations reduce alignment tax by 47%',
    previewText:
      'See how similar companies transformed their alignment and what it meant for their bottom line.',
    contentFocus:
      'Case study with ROI story, specific metrics, connection to their situation',
    ctaText: 'See Your Transformation Potential',
    ctaDestination: 'preview',
  },
  {
    day: NURTURE_SCHEDULE.DAY_7,
    subject: 'Free tool: ROI Dashboard template',
    previewText:
      "Here's a free sample from the Playbook 2 toolkit to help you get started.",
    contentFocus:
      'Deliver free ROI Dashboard Excel template, tease the full toolkit capabilities',
    ctaText: 'Unlock the Full Toolkit',
    ctaDestination: 'purchase',
  },
  {
    day: NURTURE_SCHEDULE.DAY_10,
    subject: 'Your {{estimatedSavings}} in savings is waiting',
    previewText:
      'Your personalized transformation toolkit is ready to help you capture these savings.',
    contentFocus:
      'Personalized urgency with specific savings amount, testimonial, time-sensitive messaging',
    ctaText: 'Start Saving Now',
    ctaDestination: 'purchase',
  },
  {
    day: NURTURE_SCHEDULE.DAY_14,
    subject: 'Questions about the toolkit?',
    previewText:
      'Before your preview expires, let us know if you have any questions.',
    contentFocus:
      'Offer consultation/support, address common objections, final CTA with urgency',
    ctaText: 'Get Your Questions Answered',
    ctaDestination: 'preview',
  },
] as const;

/**
 * Get nurture email config by day
 */
export function getNurtureEmailConfig(day: NurtureDay): NurtureEmailConfig | undefined {
  return NURTURE_EMAILS.find((email) => email.day === day);
}

/**
 * Get all nurture days in order
 */
export function getNurtureDays(): NurtureDay[] {
  return NURTURE_EMAILS.map((email) => email.day);
}

/**
 * Total number of nurture emails
 */
export const NURTURE_EMAIL_COUNT = NURTURE_EMAILS.length;

/**
 * Sequence duration in days
 */
export const NURTURE_SEQUENCE_DURATION_DAYS = 14;

/**
 * Context for personalizing nurture emails
 */
export interface NurtureEmailContext {
  /** User's first name or "there" */
  firstName: string;
  /** User's email */
  userEmail: string;
  /** Formatted total alignment tax (e.g., "$2.5M") */
  totalAlignmentTax: string;
  /** Formatted estimated savings (e.g., "$1.2M") */
  estimatedSavings: string;
  /** Company name if provided */
  companyName?: string;
  /** Personalized preview page URL */
  previewUrl: string;
  /** Direct purchase URL */
  purchaseUrl: string;
  /** GDPR-compliant unsubscribe URL */
  unsubscribeUrl: string;
  /** Unsubscribe token */
  unsubscribeToken: string;
  /** Base URL for the platform */
  baseUrl: string;
}

/**
 * Default context values for testing/fallback
 */
export const DEFAULT_NURTURE_CONTEXT: NurtureEmailContext = {
  firstName: 'there',
  userEmail: '',
  totalAlignmentTax: '$0',
  estimatedSavings: '$0',
  previewUrl: 'https://lastparadigm.com/preview',
  purchaseUrl: 'https://lastparadigm.com/purchase',
  unsubscribeUrl: 'https://lastparadigm.com/unsubscribe',
  unsubscribeToken: '',
  baseUrl: 'https://lastparadigm.com',
};
