/**
 * Purchase Confirmation Email Template
 *
 * Email sent when a user completes a successful purchase of Playbook 2.
 * Contains order confirmation, download portal link, and getting started guidance.
 *
 * Story 20.2: Purchase Confirmation Email
 * Task 1: Create purchase confirmation email template (AC: 2, 3, 4)
 * Covers: FR53 (Purchase confirmation email)
 *         FR62 (Branded, mobile-responsive email templates)
 *         FR65 (Book attribution)
 */

import { emailTheme, emailTypography, emailSpacing } from '../theme';
import { generateBaseTemplate, generateBaseTextTemplate } from './base-template';
import { escapeHtml, formatCurrency, getFirstName } from '../utils';

/**
 * Toolkit document info
 */
interface ToolkitDocument {
  name: string;
  type: 'Word' | 'Excel' | 'PowerPoint' | 'PDF';
}

/**
 * The 10 toolkit documents included in Playbook 2
 */
const TOOLKIT_DOCUMENTS: ToolkitDocument[] = [
  { name: 'Strategic Alignment Brief', type: 'Word' },
  { name: 'Stakeholder Communication Pack', type: 'Word' },
  { name: 'Decision Framework Guide', type: 'Word' },
  { name: 'Data Flow Optimization Plan', type: 'Word' },
  { name: 'Communication Improvement Playbook', type: 'Word' },
  { name: 'Meeting Cost Tracker', type: 'Excel' },
  { name: 'Alignment Tax Calculator', type: 'Excel' },
  { name: 'Transformation Roadmap Planner', type: 'Excel' },
  { name: 'Executive Presentation Deck', type: 'PowerPoint' },
  { name: 'Board Summary Report', type: 'PDF' },
];

/**
 * Parameters for purchase confirmation email
 */
export interface PurchaseConfirmationEmailParams {
  /** User's name (optional) */
  userName?: string | null;
  /** User's email */
  userEmail: string;
  /** Purchase amount in dollars */
  amount: number;
  /** Purchase ID for reference */
  purchaseId: string;
  /** Link to download portal */
  downloadPortalUrl: string;
  /** Base URL for the platform */
  baseUrl?: string;
  /** Unsubscribe token (optional for transactional) */
  unsubscribeToken?: string;
}

/**
 * Generate purchase confirmation email
 *
 * @param params - Email parameters
 * @returns Object with subject, text, and html
 */
export function generatePurchaseConfirmationEmail(
  params: PurchaseConfirmationEmailParams
): {
  subject: string;
  text: string;
  html: string;
} {
  const {
    userName,
    userEmail,
    amount,
    purchaseId,
    downloadPortalUrl,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com',
    unsubscribeToken,
  } = params;

  const firstName = getFirstName(userName, userEmail);
  const formattedAmount = formatCurrency(amount);

  // Generate email content
  const content = generateContentHtml({
    firstName,
    formattedAmount,
    purchaseId,
    downloadPortalUrl,
  });

  const html = generateBaseTemplate({
    content,
    previewText: `Your Playbook 2 Toolkit is ready! Access your 10 enterprise documents now.`,
    userEmail,
    unsubscribeToken,
    baseUrl,
    showUnsubscribe: false, // Transactional email - no marketing unsubscribe
  });

  const text = generateTextEmail({
    firstName,
    formattedAmount,
    purchaseId,
    downloadPortalUrl,
  });

  return {
    subject: 'Your Playbook 2 Toolkit is Ready',
    text,
    html,
  };
}

/**
 * Generate HTML content for the email body
 */
function generateContentHtml(params: {
  firstName: string;
  formattedAmount: string;
  purchaseId: string;
  downloadPortalUrl: string;
}): string {
  const { firstName, formattedAmount, purchaseId, downloadPortalUrl } = params;
  const {
    brandGold,
    navyBg,
    textColor,
    mutedColor,
    borderColor,
    successColor,
  } = emailTheme;

  return `
<!-- Success Icon -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.md};">
      <div style="width: 64px; height: 64px; background-color: ${successColor}; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
        <span style="font-size: 32px; color: white;">&#10003;</span>
      </div>
    </td>
  </tr>
</table>

<!-- Greeting -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.sm};">
      <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: ${textColor};">
        Thank You for Your Purchase!
      </h2>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.lg};">
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
        Hi ${escapeHtml(firstName)}, your Playbook 2 toolkit is ready for download.
      </p>
    </td>
  </tr>
</table>

<!-- Order Summary Box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${navyBg}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding-bottom: ${emailSpacing.sm};">
            <p style="margin: 0; font-size: 13px; color: ${mutedColor};">Order Reference</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: ${textColor};">${escapeHtml(purchaseId.slice(0, 8).toUpperCase())}</p>
          </td>
          <td align="right" style="padding-bottom: ${emailSpacing.sm};">
            <p style="margin: 0; font-size: 13px; color: ${mutedColor};">Amount Paid</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: ${brandGold};">${formattedAmount}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Download Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: ${emailSpacing.xl};">
      <a href="${escapeHtml(downloadPortalUrl)}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Access Your Toolkit
      </a>
    </td>
  </tr>
</table>

<!-- What's Included -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid ${borderColor}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.md} 0; font-size: 16px; font-weight: 600; color: ${textColor};">
        Your Toolkit Includes:
      </p>
      ${TOOLKIT_DOCUMENTS.map(
        (doc) => `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: ${emailSpacing.xs};">
        <tr>
          <td width="24" valign="top" style="padding-right: 8px; color: ${brandGold};">&#10003;</td>
          <td style="font-size: 14px; color: ${textColor};">
            ${escapeHtml(doc.name)} <span style="color: ${mutedColor}; font-size: 12px;">(${doc.type})</span>
          </td>
        </tr>
      </table>`
      ).join('')}
    </td>
  </tr>
</table>

<!-- Getting Started -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${navyBg}; border-radius: 8px; margin-bottom: ${emailSpacing.lg};">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <p style="margin: 0 0 ${emailSpacing.sm} 0; font-size: 16px; font-weight: 600; color: ${textColor};">
        Getting Started
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
        We recommend starting with the <strong style="color: ${textColor};">Strategic Alignment Brief</strong>.
        This document provides a comprehensive overview of your organization's alignment status and
        the specific actions you can take based on your diagnostic results.
      </p>
    </td>
  </tr>
</table>

<!-- 30-Day Guarantee -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 2px solid ${brandGold}; border-radius: 8px;">
  <tr>
    <td style="padding: ${emailSpacing.lg};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="40" valign="top">
            <span style="font-size: 24px;">&#128274;</span>
          </td>
          <td>
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${brandGold};">
              30-Day Money-Back Guarantee
            </p>
            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${mutedColor};">
              If you're not satisfied with your toolkit, contact us within 30 days for a full refund.
              No questions asked.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Help Section -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: ${emailSpacing.xl};">
  <tr>
    <td align="center">
      <p style="margin: 0; font-size: 13px; color: ${mutedColor};">
        Questions? Reply to this email or contact us at
        <a href="mailto:support@lastparadigm.com" style="color: ${brandGold}; text-decoration: none;">support@lastparadigm.com</a>
      </p>
    </td>
  </tr>
</table>
`;
}

/**
 * Generate plain text version of the email
 */
function generateTextEmail(params: {
  firstName: string;
  formattedAmount: string;
  purchaseId: string;
  downloadPortalUrl: string;
}): string {
  const { firstName, formattedAmount, purchaseId, downloadPortalUrl } = params;

  const documentList = TOOLKIT_DOCUMENTS.map(
    (doc) => `  - ${doc.name} (${doc.type})`
  ).join('\n');

  return generateBaseTextTemplate(
    `Thank You for Your Purchase!

Hi ${firstName}, your Playbook 2 toolkit is ready for download.

ORDER SUMMARY
-------------
Order Reference: ${purchaseId.slice(0, 8).toUpperCase()}
Amount Paid: ${formattedAmount}

ACCESS YOUR TOOLKIT
-------------------
${downloadPortalUrl}

YOUR TOOLKIT INCLUDES:
${documentList}

GETTING STARTED
---------------
We recommend starting with the Strategic Alignment Brief. This document
provides a comprehensive overview of your organization's alignment status
and the specific actions you can take based on your diagnostic results.

30-DAY MONEY-BACK GUARANTEE
---------------------------
If you're not satisfied with your toolkit, contact us within 30 days
for a full refund. No questions asked.

Questions? Reply to this email or contact us at support@lastparadigm.com`,
    false // No unsubscribe for transactional
  );
}
