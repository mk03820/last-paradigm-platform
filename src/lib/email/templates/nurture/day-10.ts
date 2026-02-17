/**
 * Nurture Email Day 10 Template
 *
 * "Your $X.XM in savings is waiting"
 * Personalized urgency with specific savings, testimonial.
 *
 * Story 20.3: Nurture Sequence Content
 * Task 1.5: Create Day 10 template (AC: 1, 2, 3, 5, 6)
 * Covers: FR52, FR62, FR65
 */

import { emailTheme, emailSpacing } from '../../theme';
import { generateBaseTemplate, generateBaseTextTemplate } from '../base-template';
import { escapeHtml } from '../../utils';
import type { NurtureEmailContext } from '../../nurture-config';

/**
 * Generate Day 10 nurture email
 */
export function generateNurtureEmailDay10(context: NurtureEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const { userEmail, unsubscribeToken, baseUrl, estimatedSavings } = context;

  const content = generateContentHtml(context);

  const html = generateBaseTemplate({
    content,
    previewText: `Your personalized toolkit is ready to help you capture ${estimatedSavings} in savings.`,
    userEmail,
    unsubscribeToken,
    baseUrl,
    showUnsubscribe: true,
  });

  const text = generateTextVersion(context);

  // Personalize subject with savings amount
  const subject = `Your ${estimatedSavings} in savings is waiting`;

  return {
    subject,
    text,
    html,
  };
}

function generateContentHtml(context: NurtureEmailContext): string {
  const { firstName, estimatedSavings, totalAlignmentTax, purchaseUrl } = context;
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
        Your diagnostic revealed <strong style="color: ${brandGold};">${escapeHtml(totalAlignmentTax)}</strong> in alignment costs.
        That's not just a number&mdash;it's money leaving your organization every year.
      </p>
    </td>
  </tr>
</table>

<!-- Urgency Box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${navyBg}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 14px; color: ${mutedColor};">
        Your potential savings:
      </p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: ${brandGold};">
        ${escapeHtml(estimatedSavings)}
      </p>
      <p style="margin: ${emailSpacing.sm} 0 0 0; font-size: 13px; color: ${mutedColor};">
        Every week without action costs your organization real money.
      </p>
    </td>
  </tr>
</table>

<!-- Testimonial -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-left: 3px solid ${brandGold}; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding-left: ${emailSpacing.md};">
      <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 14px; line-height: 1.6; color: ${textColor}; font-style: italic;">
        "We hesitated for two weeks before purchasing the toolkit. In retrospect, those two weeks
        cost us another $40,000 in alignment tax. Don't make our mistake."
      </p>
      <p style="margin: 0; font-size: 13px; color: ${mutedColor};">
        <strong style="color: ${textColor};">Sarah Chen</strong>, VP Operations at Meridian Tech
      </p>
    </td>
  </tr>
</table>

<!-- What you get -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding-bottom: ${emailSpacing.md};">
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${textColor};">
        Your Playbook 2 toolkit is ready and waiting:
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="24" valign="top" style="color: ${brandGold};">&#10003;</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: ${mutedColor};">10 enterprise documents pre-populated with your data</td>
        </tr>
        <tr>
          <td width="24" valign="top" style="color: ${brandGold};">&#10003;</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: ${mutedColor};">Board-ready Executive Presentation Deck</td>
        </tr>
        <tr>
          <td width="24" valign="top" style="color: ${brandGold};">&#10003;</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: ${mutedColor};">30-day money-back guarantee</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.lg};">
      <a href="${escapeHtml(purchaseUrl)}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Start Saving Now
      </a>
    </td>
  </tr>
</table>

<!-- Risk reversal -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid ${borderColor};">
  <tr>
    <td align="center" style="padding-top: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 13px; color: ${mutedColor};">
        30-day money-back guarantee. If you're not satisfied, we'll refund you completely.
      </p>
    </td>
  </tr>
</table>
`;
}

function generateTextVersion(context: NurtureEmailContext): string {
  const { firstName, estimatedSavings, totalAlignmentTax, purchaseUrl, unsubscribeUrl } = context;

  return generateBaseTextTemplate(
    `Hi ${firstName},

Your diagnostic revealed ${totalAlignmentTax} in alignment costs. That's not just a number - it's money leaving your organization every year.

YOUR POTENTIAL SAVINGS: ${estimatedSavings}

Every week without action costs your organization real money.

---

"We hesitated for two weeks before purchasing the toolkit. In retrospect, those two weeks cost us another $40,000 in alignment tax. Don't make our mistake."

- Sarah Chen, VP Operations at Meridian Tech

---

YOUR PLAYBOOK 2 TOOLKIT IS READY AND WAITING:
- 10 enterprise documents pre-populated with your data
- Board-ready Executive Presentation Deck
- 30-day money-back guarantee

START SAVING NOW
${purchaseUrl}

30-day money-back guarantee. If you're not satisfied, we'll refund you completely.`,
    true,
    unsubscribeUrl
  );
}
