/**
 * Nurture Email Day 14 Template
 *
 * "Questions about the toolkit?"
 * Final email offering consultation, addressing objections, final CTA.
 *
 * Story 20.3: Nurture Sequence Content
 * Task 1.6: Create Day 14 template (AC: 1, 2, 3, 5, 6)
 * Covers: FR52, FR62, FR65
 */

import { emailTheme, emailSpacing } from '../../theme';
import { generateBaseTemplate, generateBaseTextTemplate } from '../base-template';
import { escapeHtml } from '../../utils';
import type { NurtureEmailContext } from '../../nurture-config';

/**
 * Generate Day 14 nurture email
 */
export function generateNurtureEmailDay14(context: NurtureEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const { userEmail, unsubscribeToken, baseUrl } = context;

  const content = generateContentHtml(context);

  const html = generateBaseTemplate({
    content,
    previewText:
      'Before your preview expires, let us know if you have any questions about the toolkit.',
    userEmail,
    unsubscribeToken,
    baseUrl,
    showUnsubscribe: true,
  });

  const text = generateTextVersion(context);

  return {
    subject: 'Questions about the toolkit?',
    text,
    html,
  };
}

function generateContentHtml(context: NurtureEmailContext): string {
  const { firstName, estimatedSavings, previewUrl } = context;
  const { brandGold, navyBg, textColor, mutedColor, borderColor } = emailTheme;

  return `
<!-- Greeting -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding-bottom: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${textColor};">
        Hi ${escapeHtml(firstName)},
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
        It's been a couple of weeks since your diagnostic, and I wanted to reach out personally.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
        Your results showed potential savings of <strong style="color: ${brandGold};">${escapeHtml(estimatedSavings)}</strong>,
        but you haven't taken the next step yet. I'm curious&mdash;is there anything holding you back?
      </p>
    </td>
  </tr>
</table>

<!-- Common Questions Box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${navyBg}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.md} 0; font-size: 16px; font-weight: 600; color: ${textColor};">
        Common questions we hear:
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding-bottom: ${emailSpacing.md};">
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${textColor};">
              "Is the $2,500 worth it?"
            </p>
            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${mutedColor};">
              If your alignment tax is ${escapeHtml(estimatedSavings)}, the toolkit pays for itself within
              weeks of implementation. Plus, there's a 30-day guarantee.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: ${emailSpacing.md};">
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${textColor};">
              "Do I need to get buy-in first?"
            </p>
            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${mutedColor};">
              The Executive Presentation Deck and Board Summary Report are designed to help you
              make the case to leadership. Many buyers use these to secure organizational support.
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${textColor};">
              "What if it doesn't work for our organization?"
            </p>
            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${mutedColor};">
              The methodology is based on patterns from hundreds of organizations. If it doesn't
              fit your situation, we'll refund you&mdash;no questions asked.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Personal offer -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid ${borderColor}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 15px; font-weight: 600; color: ${textColor};">
        Want to talk it through?
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
        Reply to this email with your questions, and I'll personally respond within 24 hours.
        I'm happy to discuss your specific situation and whether the toolkit is right for you.
      </p>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.lg};">
      <a href="${escapeHtml(previewUrl)}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Get Your Questions Answered
      </a>
    </td>
  </tr>
</table>

<!-- Final note -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid ${borderColor};">
  <tr>
    <td style="padding-top: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: ${mutedColor};">
        This is the last email in our series. If you're not ready, that's completely fine.
        Your diagnostic results will remain saved, and you can access them anytime from your dashboard.
      </p>
    </td>
  </tr>
</table>

<!-- Sign off -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: ${emailSpacing.lg};">
  <tr>
    <td>
      <p style="margin: 0; font-size: 14px; color: ${textColor};">
        Best regards,<br/>
        <strong>The Last Paradigm Team</strong>
      </p>
    </td>
  </tr>
</table>
`;
}

function generateTextVersion(context: NurtureEmailContext): string {
  const { firstName, estimatedSavings, previewUrl, unsubscribeUrl } = context;

  return generateBaseTextTemplate(
    `Hi ${firstName},

It's been a couple of weeks since your diagnostic, and I wanted to reach out personally.

Your results showed potential savings of ${estimatedSavings}, but you haven't taken the next step yet. I'm curious - is there anything holding you back?

COMMON QUESTIONS WE HEAR:

"Is the $2,500 worth it?"
If your alignment tax potential savings are ${estimatedSavings}, the toolkit pays for itself within weeks of implementation. Plus, there's a 30-day guarantee.

"Do I need to get buy-in first?"
The Executive Presentation Deck and Board Summary Report are designed to help you make the case to leadership. Many buyers use these to secure organizational support.

"What if it doesn't work for our organization?"
The methodology is based on patterns from hundreds of organizations. If it doesn't fit your situation, we'll refund you - no questions asked.

WANT TO TALK IT THROUGH?
Reply to this email with your questions, and I'll personally respond within 24 hours. I'm happy to discuss your specific situation and whether the toolkit is right for you.

GET YOUR QUESTIONS ANSWERED
${previewUrl}

This is the last email in our series. If you're not ready, that's completely fine. Your diagnostic results will remain saved, and you can access them anytime from your dashboard.

Best regards,
The Last Paradigm Team`,
    true,
    unsubscribeUrl
  );
}
