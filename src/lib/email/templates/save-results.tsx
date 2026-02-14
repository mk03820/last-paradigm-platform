/**
 * Save Results Email Template
 *
 * Email sent when a user saves their PB1 diagnostic results.
 * Contains a recovery link valid for 7 days.
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC4 (Email with recovery link)
 *
 * Design: Executive Clarity theme (Navy #1e293b, Gold #b45309)
 * Per architecture.md: React Email templates with Resend
 */

interface SaveResultsEmailParams {
  recoveryUrl: string;
  host: string;
  expiresInDays?: number;
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

export function generateSaveResultsEmail({
  recoveryUrl,
  host,
  expiresInDays = 7,
}: SaveResultsEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  // Escape host for HTML and add zero-width space to prevent URL auto-linking
  const escapedHost = escapeHtml(host).replace(/\./g, '&#8203;.');
  // Escape URL for safe HTML attribute usage (already URL-encoded from server)
  const escapedUrl = escapeHtml(recoveryUrl);

  return {
    subject: 'Your Diagnostic Results - The Last Paradigm',
    text: text({ recoveryUrl, host, expiresInDays }),
    html: html({ recoveryUrl: escapedUrl, host: escapedHost, expiresInDays }),
  };
}

function text({
  recoveryUrl,
  host,
  expiresInDays,
}: SaveResultsEmailParams): string {
  return `Your Diagnostic Results Are Saved

Thank you for using The Last Paradigm diagnostic tools on ${host}.

Click the link below to recover your results:

${recoveryUrl}

This link expires in ${expiresInDays} days.

Ready to unlock your complete transformation toolkit? Create an account to:
- Save your results permanently
- Access all 7 diagnostic tools
- Generate your personalized Playbook 2 toolkit

---
The Last Paradigm
Based on the book methodology by BMad
Quantifying Your Alignment Tax`;
}

function html({
  recoveryUrl,
  host,
  expiresInDays,
}: SaveResultsEmailParams & { host: string }): string {
  // Executive Clarity Theme Colors
  const brandGold = '#D4AF37'; // Primary accent
  const navyBg = '#1e293b'; // Dark navy background
  const backgroundColor = '#0A0A0A'; // Charcoal background
  const cardBg = '#1A1A1A'; // Card background
  const textColor = '#E5E7EB'; // Light text
  const mutedColor = '#9CA3AF'; // Muted text
  const borderColor = '#333';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Diagnostic Results - The Last Paradigm</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: ${cardBg}; border-radius: 12px; border: 1px solid ${borderColor};">
          <tr>
            <td style="padding: 40px 32px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandGold}; letter-spacing: -0.5px;">
                      The Last Paradigm
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Success Icon -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <div style="width: 64px; height: 64px; background-color: ${navyBg}; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
                      <span style="font-size: 32px;">&#10003;</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Main Content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: ${textColor};">
                      Your Results Are Saved
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
                      Thank you for using the diagnostic tools on <strong style="color: ${textColor};">${host}</strong>.
                      Your progress has been securely saved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <a href="${recoveryUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Recover My Results
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: ${mutedColor};">
                      This link expires in <strong style="color: ${textColor};">${expiresInDays} days</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Value Proposition Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-radius: 8px; background-color: ${navyBg};">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: ${textColor};">
                      Ready to unlock your complete toolkit?
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: ${mutedColor};">
                      Create an account to save your results permanently, access all 7 diagnostic tools, and generate your personalized Playbook 2 transformation toolkit.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px;">
          <tr>
            <td align="center" style="padding: 24px 0 8px 0;">
              <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                Based on the methodology from <em>The Last Paradigm</em>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                Quantifying Your Alignment Tax
              </p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 11px; color: ${mutedColor};">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
