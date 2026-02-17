/**
 * Nurture Email Day 3 Template
 *
 * "How organizations reduce alignment tax by 47%"
 * Case study with ROI story and specific metrics.
 *
 * Story 20.3: Nurture Sequence Content
 * Task 1.3: Create Day 3 template (AC: 1, 2, 3, 5, 6)
 * Covers: FR52, FR62, FR65
 */

import { emailTheme, emailSpacing } from '../../theme';
import { generateBaseTemplate, generateBaseTextTemplate } from '../base-template';
import { escapeHtml } from '../../utils';
import type { NurtureEmailContext } from '../../nurture-config';

/**
 * Generate Day 3 nurture email
 */
export function generateNurtureEmailDay3(context: NurtureEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const { userEmail, unsubscribeToken, baseUrl } = context;

  const content = generateContentHtml(context);

  const html = generateBaseTemplate({
    content,
    previewText:
      'See how similar companies transformed their alignment and what it meant for their bottom line.',
    userEmail,
    unsubscribeToken,
    baseUrl,
    showUnsubscribe: true,
  });

  const text = generateTextVersion(context);

  return {
    subject: 'How organizations reduce alignment tax by 47%',
    text,
    html,
  };
}

function generateContentHtml(context: NurtureEmailContext): string {
  const { firstName, totalAlignmentTax, previewUrl } = context;
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
        When you calculated your alignment tax of ${escapeHtml(totalAlignmentTax)}, you might have wondered:
        <em>"Is it really possible to reduce this?"</em>
      </p>
    </td>
  </tr>
</table>

<!-- Case Study Box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${navyBg}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${brandGold};">
        Case Study
      </p>
      <p style="margin: 0 0 ${emailSpacing.md} 0; font-size: 18px; font-weight: 600; color: ${textColor};">
        How a Mid-Size Tech Company Cut Alignment Tax by 47%
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
        A 200-person technology company discovered they were losing <strong style="color: ${textColor};">$3.2M annually</strong>
        to misalignment. Using The Last Paradigm methodology, they identified three critical bottlenecks
        in their decision-making process.
      </p>
    </td>
  </tr>
</table>

<!-- Results -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding-bottom: ${emailSpacing.md};">
      <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 16px; font-weight: 600; color: ${textColor};">
        Within 6 months, they achieved:
      </p>
    </td>
  </tr>
</table>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td width="33%" align="center" style="padding: ${emailSpacing.sm}; border: 1px solid ${borderColor}; border-radius: 8px 0 0 8px;">
      <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${brandGold};">47%</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: ${mutedColor};">Reduction in<br/>Alignment Tax</p>
    </td>
    <td width="33%" align="center" style="padding: ${emailSpacing.sm}; border: 1px solid ${borderColor}; border-left: none;">
      <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${brandGold};">62%</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: ${mutedColor};">Faster Decision<br/>Velocity</p>
    </td>
    <td width="33%" align="center" style="padding: ${emailSpacing.sm}; border: 1px solid ${borderColor}; border-left: none; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${brandGold};">$1.5M</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: ${mutedColor};">Recovered<br/>Annually</p>
    </td>
  </tr>
</table>

<!-- Connection to user -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding-bottom: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
        With your alignment tax at ${escapeHtml(totalAlignmentTax)}, similar results could mean significant
        savings for your organization. The key is knowing exactly where to focus.
      </p>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.lg};">
      <a href="${escapeHtml(previewUrl)}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        See Your Transformation Potential
      </a>
    </td>
  </tr>
</table>

<!-- Methodology reference -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid ${borderColor};">
  <tr>
    <td style="padding-top: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: ${mutedColor};">
        <em>Based on The Last Paradigm methodology for quantifying and reducing organizational alignment tax.</em>
      </p>
    </td>
  </tr>
</table>
`;
}

function generateTextVersion(context: NurtureEmailContext): string {
  const { firstName, totalAlignmentTax, previewUrl, unsubscribeUrl } = context;

  return generateBaseTextTemplate(
    `Hi ${firstName},

When you calculated your alignment tax of ${totalAlignmentTax}, you might have wondered: "Is it really possible to reduce this?"

CASE STUDY: Mid-Size Tech Company

A 200-person technology company discovered they were losing $3.2M annually to misalignment. Using The Last Paradigm methodology, they identified three critical bottlenecks in their decision-making process.

WITHIN 6 MONTHS, THEY ACHIEVED:
- 47% reduction in alignment tax
- 62% faster decision velocity
- $1.5M recovered annually

With your alignment tax at ${totalAlignmentTax}, similar results could mean significant savings for your organization. The key is knowing exactly where to focus.

SEE YOUR TRANSFORMATION POTENTIAL
${previewUrl}

Based on The Last Paradigm methodology for quantifying and reducing organizational alignment tax.`,
    true,
    unsubscribeUrl
  );
}
