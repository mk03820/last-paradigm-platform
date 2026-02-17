/**
 * Nurture Email Day 7 Template
 *
 * "Free tool: ROI Dashboard template"
 * Delivers free sample Excel template, teases full toolkit.
 *
 * Story 20.3: Nurture Sequence Content
 * Task 1.4: Create Day 7 template (AC: 1, 2, 3, 4, 5, 6)
 * Covers: FR52, FR62, FR65
 */

import { emailTheme, emailSpacing } from '../../theme';
import { generateBaseTemplate, generateBaseTextTemplate } from '../base-template';
import { escapeHtml } from '../../utils';
import type { NurtureEmailContext } from '../../nurture-config';

/**
 * URL for the free ROI Dashboard sample
 */
export const FREE_ROI_DASHBOARD_URL = '/downloads/roi-dashboard-sample.xlsx';

/**
 * Generate Day 7 nurture email
 */
export function generateNurtureEmailDay7(context: NurtureEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const { userEmail, unsubscribeToken, baseUrl } = context;

  const downloadUrl = `${baseUrl}${FREE_ROI_DASHBOARD_URL}`;
  const content = generateContentHtml(context, downloadUrl);

  const html = generateBaseTemplate({
    content,
    previewText:
      "Here's a free sample from the Playbook 2 toolkit to help you get started.",
    userEmail,
    unsubscribeToken,
    baseUrl,
    showUnsubscribe: true,
  });

  const text = generateTextVersion(context, downloadUrl);

  return {
    subject: 'Free tool: ROI Dashboard template',
    text,
    html,
  };
}

function generateContentHtml(context: NurtureEmailContext, downloadUrl: string): string {
  const { firstName, estimatedSavings, purchaseUrl } = context;
  const { brandGold, navyBg, textColor, mutedColor, borderColor, successColor } = emailTheme;

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
        We want to give you a taste of what's in the Playbook 2 toolkit. Here's a free sample
        you can use right away.
      </p>
    </td>
  </tr>
</table>

<!-- Free Download Box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${navyBg}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="48" valign="top">
            <div style="width: 40px; height: 40px; background-color: ${successColor}; border-radius: 8px; text-align: center; line-height: 40px;">
              <span style="font-size: 20px; color: white;">&#127873;</span>
            </div>
          </td>
          <td style="padding-left: ${emailSpacing.sm};">
            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${successColor};">
              Free Download
            </p>
            <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 18px; font-weight: 600; color: ${textColor};">
              ROI Dashboard Template
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${mutedColor};">
              Track your transformation progress and visualize ROI with this Excel template.
            </p>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: ${emailSpacing.md};">
        <tr>
          <td align="center">
            <a href="${escapeHtml(downloadUrl)}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: ${successColor}; color: white; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">
              Download Free Template
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- What's in the sample -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding-bottom: ${emailSpacing.md};">
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${textColor};">
        What's in this sample:
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="24" valign="top" style="color: ${brandGold};">&#10003;</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: ${mutedColor};">Pre-built ROI tracking dashboard</td>
        </tr>
        <tr>
          <td width="24" valign="top" style="color: ${brandGold};">&#10003;</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: ${mutedColor};">Automatic savings calculations</td>
        </tr>
        <tr>
          <td width="24" valign="top" style="color: ${brandGold};">&#10003;</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: ${mutedColor};">Visual progress charts</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Tease full toolkit -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid ${borderColor}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 14px; font-weight: 600; color: ${textColor};">
        The full Playbook 2 toolkit includes:
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
        <strong style="color: ${textColor};">10 enterprise-grade documents</strong> including the Strategic Alignment Brief,
        Executive Presentation Deck, and 8 more tools&mdash;all pre-populated with your diagnostic data
        and potential savings of ${escapeHtml(estimatedSavings)}.
      </p>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.lg};">
      <a href="${escapeHtml(purchaseUrl)}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Unlock the Full Toolkit
      </a>
    </td>
  </tr>
</table>
`;
}

function generateTextVersion(context: NurtureEmailContext, downloadUrl: string): string {
  const { firstName, estimatedSavings, purchaseUrl, unsubscribeUrl } = context;

  return generateBaseTextTemplate(
    `Hi ${firstName},

We want to give you a taste of what's in the Playbook 2 toolkit. Here's a free sample you can use right away.

FREE DOWNLOAD: ROI Dashboard Template
--------------------------------------
Track your transformation progress and visualize ROI with this Excel template.

Download: ${downloadUrl}

WHAT'S IN THIS SAMPLE:
- Pre-built ROI tracking dashboard
- Automatic savings calculations
- Visual progress charts

THE FULL PLAYBOOK 2 TOOLKIT INCLUDES:
10 enterprise-grade documents including the Strategic Alignment Brief, Executive Presentation Deck, and 8 more tools - all pre-populated with your diagnostic data and potential savings of ${estimatedSavings}.

UNLOCK THE FULL TOOLKIT
${purchaseUrl}`,
    true,
    unsubscribeUrl
  );
}
