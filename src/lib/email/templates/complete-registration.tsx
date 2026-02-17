/**
 * Complete Registration Email Template
 *
 * Email sent to users who started but didn't complete registration.
 * Contains a link to resume registration with pre-filled email.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 5, AC2 (Resume link), AC4 (Value proposition), FR65 (Book attribution)
 */

import {
  emailTheme,
  emailTypography,
  emailButtonStyles,
  emailSpacing,
} from '../theme';
import { generateBaseTemplate, generateBaseTextTemplate } from './base-template';

/**
 * Parameters for the complete registration email
 */
export interface CompleteRegistrationEmailParams {
  /** Resume registration URL with token */
  resumeUrl: string;
  /** Optional estimated savings from diagnostic (if available) */
  estimatedSavings?: number;
  /** User's email for unsubscribe */
  userEmail: string;
  /** Unsubscribe token */
  unsubscribeToken?: string;
}

/**
 * Generate the complete registration email HTML
 */
export function generateCompleteRegistrationEmail({
  resumeUrl,
  estimatedSavings,
  userEmail,
  unsubscribeToken,
}: CompleteRegistrationEmailParams): { html: string; text: string } {
  const { textColor, mutedColor, headingColor, brandGold } = emailTheme;
  const { sizes, weights, lineHeights } = emailTypography;

  // Format estimated savings if provided
  const formattedSavings = estimatedSavings
    ? `$${estimatedSavings.toLocaleString()}`
    : null;

  // Build the main content
  const content = `
    <!-- Main Heading -->
    <h2 style="margin: 0 0 ${emailSpacing.md} 0; font-size: ${sizes['2xl']}; font-weight: ${weights.bold}; color: ${headingColor}; text-align: center;">
      Complete Your Account
    </h2>

    <!-- Value Proposition -->
    <p style="margin: 0 0 ${emailSpacing.lg} 0; font-size: ${sizes.base}; line-height: ${lineHeights.relaxed}; color: ${textColor}; text-align: center;">
      Your diagnostic results are waiting! Don't lose the insights you've already gathered.
    </p>

    ${
      formattedSavings
        ? `
    <!-- Estimated Savings Highlight -->
    <div style="margin: 0 0 ${emailSpacing.lg} 0; padding: ${emailSpacing.md}; background-color: rgba(212, 175, 55, 0.1); border-radius: 8px; border-left: 4px solid ${brandGold};">
      <p style="margin: 0; font-size: ${sizes.lg}; font-weight: ${weights.semibold}; color: ${brandGold}; text-align: center;">
        Potential Annual Savings Identified: ${formattedSavings}
      </p>
    </div>
    `
        : ''
    }

    <!-- Benefits List -->
    <div style="margin: 0 0 ${emailSpacing.lg} 0; padding: ${emailSpacing.md}; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px;">
      <h3 style="margin: 0 0 ${emailSpacing.sm} 0; font-size: ${sizes.base}; font-weight: ${weights.semibold}; color: ${headingColor};">
        Why complete your account?
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: ${sizes.sm}; line-height: ${lineHeights.relaxed}; color: ${textColor};">
        <li style="margin-bottom: 8px;">Save your diagnostic results permanently</li>
        <li style="margin-bottom: 8px;">Access your personalized transformation roadmap</li>
        <li style="margin-bottom: 8px;">Preview Playbook 2 tools tailored to your results</li>
        <li>Get priority access to future platform features</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: ${emailSpacing.lg} 0;">
      <a href="${resumeUrl}" style="${Object.entries(emailButtonStyles.primary)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
    .join('; ')}">
        Complete Registration
      </a>
    </div>

    <!-- Reassurance -->
    <p style="margin: ${emailSpacing.lg} 0 0 0; font-size: ${sizes.sm}; line-height: ${lineHeights.relaxed}; color: ${mutedColor}; text-align: center;">
      If you didn't start this registration, you can safely ignore this email.
    </p>
  `;

  // Generate HTML using base template
  const html = generateBaseTemplate({
    content,
    previewText:
      'Your diagnostic results are waiting - complete your account to save them.',
    userEmail,
    unsubscribeToken,
    showUnsubscribe: true,
  });

  // Generate plain text version
  const textContent = `
Complete Your Account

Your diagnostic results are waiting! Don't lose the insights you've already gathered.

${formattedSavings ? `Potential Annual Savings Identified: ${formattedSavings}\n` : ''}
Why complete your account?
- Save your diagnostic results permanently
- Access your personalized transformation roadmap
- Preview Playbook 2 tools tailored to your results
- Get priority access to future platform features

Complete your registration here:
${resumeUrl}

If you didn't start this registration, you can safely ignore this email.
`;

  const text = generateBaseTextTemplate(
    textContent.trim(),
    true,
    unsubscribeToken
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com'}/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(userEmail)}`
      : undefined
  );

  return { html, text };
}
