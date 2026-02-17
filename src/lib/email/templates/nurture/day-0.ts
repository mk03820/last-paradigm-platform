/**
 * Nurture Email Day 0 Template
 *
 * "Your diagnostic results are saved"
 * Sent immediately when user creates account but doesn't purchase within 24 hours.
 * Recaps scores, previews savings, soft CTA.
 *
 * Story 20.3: Nurture Sequence Content
 * Task 1.2: Create Day 0 template (AC: 1, 2, 3, 5, 6)
 * Covers: FR52, FR62, FR65
 */

import { emailTheme, emailSpacing } from '../../theme';
import { generateBaseTemplate, generateBaseTextTemplate } from '../base-template';
import { escapeHtml } from '../../utils';
import type { NurtureEmailContext } from '../../nurture-config';

/**
 * Generate Day 0 nurture email
 */
export function generateNurtureEmailDay0(context: NurtureEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const {
    firstName,
    userEmail,
    totalAlignmentTax,
    estimatedSavings,
    previewUrl,
    unsubscribeToken,
    baseUrl,
  } = context;

  const content = generateContentHtml(context);

  const html = generateBaseTemplate({
    content,
    previewText: `We've saved your alignment tax results. You discovered ${totalAlignmentTax} in alignment costs.`,
    userEmail,
    unsubscribeToken,
    baseUrl,
    showUnsubscribe: true,
  });

  const text = generateTextVersion(context);

  return {
    subject: 'Your diagnostic results are saved',
    text,
    html,
  };
}

function generateContentHtml(context: NurtureEmailContext): string {
  const {
    firstName,
    totalAlignmentTax,
    estimatedSavings,
    previewUrl,
  } = context;

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
        Thank you for completing The Last Paradigm diagnostic. We've saved your results so you can
        access them anytime.
      </p>
    </td>
  </tr>
</table>

<!-- Results Summary Box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${navyBg}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.md} 0; font-size: 14px; font-weight: 600; color: ${textColor};">
        What You Discovered
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding-bottom: ${emailSpacing.sm};">
            <p style="margin: 0; font-size: 13px; color: ${mutedColor};">Your Alignment Tax</p>
            <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: ${brandGold};">
              ${escapeHtml(totalAlignmentTax)}
            </p>
          </td>
          <td style="padding-bottom: ${emailSpacing.sm};">
            <p style="margin: 0; font-size: 13px; color: ${mutedColor};">Potential Savings</p>
            <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: ${brandGold};">
              ${escapeHtml(estimatedSavings)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Value Message -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding-bottom: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
        Your diagnostic revealed significant opportunities for improvement. The Last Paradigm
        methodology shows you exactly where these costs are hidden and how to address them.
      </p>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.xl};">
      <a href="${escapeHtml(previewUrl)}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        View Your Savings Preview
      </a>
    </td>
  </tr>
</table>

<!-- Soft sell -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid ${borderColor};">
  <tr>
    <td style="padding-top: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
        Your preview shows how The Last Paradigm Playbook 2 toolkit can help you transform these
        findings into actionable improvements. Take your time to explore it.
      </p>
    </td>
  </tr>
</table>
`;
}

function generateTextVersion(context: NurtureEmailContext): string {
  const { firstName, totalAlignmentTax, estimatedSavings, previewUrl, unsubscribeUrl } = context;

  return generateBaseTextTemplate(
    `Hi ${firstName},

Thank you for completing The Last Paradigm diagnostic. We've saved your results so you can access them anytime.

WHAT YOU DISCOVERED
-------------------
Your Alignment Tax: ${totalAlignmentTax}
Potential Savings: ${estimatedSavings}

Your diagnostic revealed significant opportunities for improvement. The Last Paradigm methodology shows you exactly where these costs are hidden and how to address them.

VIEW YOUR SAVINGS PREVIEW
${previewUrl}

Your preview shows how The Last Paradigm Playbook 2 toolkit can help you transform these findings into actionable improvements. Take your time to explore it.`,
    true,
    unsubscribeUrl
  );
}
