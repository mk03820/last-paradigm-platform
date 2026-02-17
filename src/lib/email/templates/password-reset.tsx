/**
 * Password Reset Email Template
 *
 * Email sent when a user requests a password reset.
 * Contains a secure, time-limited link valid for 1 hour.
 *
 * Story 15.5: Password Reset Flow
 * Covers: Task 2, AC1 (Password reset email)
 *
 * Design: Executive Clarity theme (Navy #1e293b, Gold #b45309)
 * Per architecture.md: React Email templates with Resend
 * Includes: FR65 (Book attribution in footer)
 */

interface PasswordResetEmailParams {
  resetUrl: string;
  host: string;
  expiresInMinutes?: number;
}

export function generatePasswordResetEmail({
  resetUrl,
  host,
  expiresInMinutes = 60,
}: PasswordResetEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  const escapedHost = host.replace(/\./g, '&#8203;.');

  return {
    subject: 'Reset Your Password - The Last Paradigm',
    text: text({ resetUrl, host, expiresInMinutes }),
    html: html({ resetUrl, host: escapedHost, expiresInMinutes }),
  };
}

function text({
  resetUrl,
  host,
  expiresInMinutes,
}: PasswordResetEmailParams): string {
  return `Reset Your Password - The Last Paradigm

You requested to reset your password for ${host}.

Click the link below to set a new password:

${resetUrl}

This link expires in ${expiresInMinutes} minutes and can only be used once.

If you didn't request this password reset, you can safely ignore this email.
Your password will remain unchanged.

---
The Last Paradigm
Based on the methodology from "The Last Paradigm" by BMad
Quantifying Your Alignment Tax`;
}

function html({
  resetUrl,
  host,
  expiresInMinutes,
}: PasswordResetEmailParams & { host: string }): string {
  // Executive Clarity Theme Colors
  const brandGold = '#D4AF37'; // Primary accent (from design system)
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
  <title>Reset Your Password - The Last Paradigm</title>
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

              <!-- Key Icon -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <div style="width: 64px; height: 64px; background-color: ${navyBg}; border-radius: 50%; display: inline-block; line-height: 64px; text-align: center;">
                      <span style="font-size: 28px;">&#128273;</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Main Content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: ${textColor};">
                      Reset Your Password
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
                      You requested to reset your password for <strong style="color: ${textColor};">${host}</strong>.
                      Click the button below to set a new password.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: ${brandGold}; color: #0A0A0A; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: ${mutedColor};">
                      This link expires in <strong style="color: ${textColor};">${expiresInMinutes} minutes</strong> and can only be used once.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid ${borderColor};">
                <tr>
                  <td align="center" style="padding-top: 24px;">
                    <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                      If you didn't request this password reset, you can safely ignore this email.
                      <br />
                      Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer with Book Attribution (FR65) -->
        <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px;">
          <tr>
            <td align="center" style="padding: 24px 0 8px 0;">
              <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                Based on the methodology from <em>The Last Paradigm</em>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                Quantifying Your Alignment Tax
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
