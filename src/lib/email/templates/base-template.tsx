/**
 * Base Email Template
 *
 * Reusable base template for all platform emails with Executive Clarity theme.
 * Provides consistent branding, responsive layout, and required footer elements.
 *
 * Story 20.1: Email Template System
 * Task 1: Create base email template with Executive Clarity theme (AC: 1, 2)
 * Covers: FR62 (Branded, mobile-responsive email templates)
 *         FR65 (Book attribution in all emails)
 *         NFR30 (GDPR compliance - unsubscribe link)
 */

import { emailTheme, emailTypography, emailLayout, emailSpacing } from '../theme';

/**
 * Parameters for generating the base email template
 */
export interface BaseTemplateParams {
  /** Main content HTML to insert in the email body */
  content: string;
  /** Optional preview text (appears in email client preview) */
  previewText?: string;
  /** User's email for generating unsubscribe link */
  userEmail?: string;
  /** Unsubscribe token for secure unsubscribe link */
  unsubscribeToken?: string;
  /** Base URL for the platform */
  baseUrl?: string;
  /** Whether to show unsubscribe link (default: true for marketing emails) */
  showUnsubscribe?: boolean;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate the base email HTML template
 *
 * Features:
 * - Responsive table-based layout
 * - Executive Clarity theme (Navy/Gold)
 * - Mobile-optimized (44px tap targets)
 * - Book attribution in footer (FR65)
 * - GDPR-compliant unsubscribe link (NFR30)
 */
export function generateBaseTemplate({
  content,
  previewText,
  userEmail,
  unsubscribeToken,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com',
  showUnsubscribe = true,
}: BaseTemplateParams): string {
  const {
    brandGold,
    backgroundColor,
    cardBg,
    textColor,
    mutedColor,
    borderColor,
  } = emailTheme;

  const { fontFamily } = emailTypography;

  // Build unsubscribe URL if token provided
  const unsubscribeUrl =
    unsubscribeToken && userEmail
      ? `${baseUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&email=${encodeURIComponent(userEmail)}`
      : `${baseUrl}/unsubscribe`;

  // Escape host for display
  const host = new URL(baseUrl).host;
  const escapedHost = escapeHtml(host);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no">
  <meta name="x-apple-disable-message-reformatting">
  <title>The Last Paradigm</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-padding {
        padding-left: ${emailLayout.mobilePadding} !important;
        padding-right: ${emailLayout.mobilePadding} !important;
      }
      .mobile-full-width {
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: ${fontFamily};">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(previewText)}</div>` : ''}

  <!-- Main wrapper table -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center" style="padding: ${emailSpacing['2xl']} ${emailSpacing.lg};">

        <!-- Content card -->
        <table role="presentation" class="mobile-full-width" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: ${emailLayout.maxWidth}; background-color: ${cardBg}; border-radius: 12px; border: 1px solid ${borderColor};">
          <tr>
            <td class="mobile-padding" style="padding: ${emailLayout.contentPadding};">

              <!-- Header with branding -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: ${emailSpacing.lg};">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandGold}; letter-spacing: -0.5px;">
                      The Last Paradigm
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Main content -->
              ${content}

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" class="mobile-full-width" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: ${emailLayout.maxWidth};">
          <!-- Book Attribution (FR65) -->
          <tr>
            <td align="center" style="padding: ${emailSpacing.lg} 0 ${emailSpacing.xs} 0;">
              <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                Based on the methodology from <em>The Last Paradigm</em>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: ${emailSpacing.sm};">
              <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                Quantifying Your Alignment Tax
              </p>
            </td>
          </tr>

          <!-- Company info -->
          <tr>
            <td align="center" style="padding-bottom: ${emailSpacing.sm};">
              <p style="margin: 0; font-size: 11px; color: ${mutedColor};">
                The Last Paradigm Platform &bull; ${escapedHost}
              </p>
            </td>
          </tr>

          ${
            showUnsubscribe
              ? `
          <!-- Unsubscribe link (NFR30 - GDPR compliance) -->
          <tr>
            <td align="center" style="padding-bottom: ${emailSpacing.sm};">
              <p style="margin: 0; font-size: 11px; color: ${mutedColor};">
                <a href="${unsubscribeUrl}" style="color: ${mutedColor}; text-decoration: underline;">
                  Unsubscribe from marketing emails
                </a>
              </p>
            </td>
          </tr>
          `
              : ''
          }
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate a simple text version of an email
 *
 * @param content - Plain text content
 * @param showUnsubscribe - Whether to include unsubscribe info
 */
export function generateBaseTextTemplate(
  content: string,
  showUnsubscribe = true,
  unsubscribeUrl?: string
): string {
  return `${content}

---
The Last Paradigm
Based on the methodology from "The Last Paradigm" by BMad
Quantifying Your Alignment Tax
${showUnsubscribe && unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}` : ''}`;
}
