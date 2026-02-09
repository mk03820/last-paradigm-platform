/**
 * Magic Link Email Template
 *
 * Custom-branded email template for The Last Paradigm Platform.
 * Sent via Resend when a user requests magic link sign-in.
 *
 * Covers: FR2-1, FR2-2 (Magic link authentication)
 * NFR2-1: Email delivery within 30 seconds (handled by Resend)
 */

interface MagicLinkEmailParams {
  url: string;
  host: string;
}

export function generateMagicLinkEmail({ url, host }: MagicLinkEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  const escapedHost = host.replace(/\./g, '&#8203;.');

  return {
    subject: `Sign in to The Last Paradigm`,
    text: text({ url, host }),
    html: html({ url, host: escapedHost }),
  };
}

function text({ url, host }: MagicLinkEmailParams): string {
  return `Sign in to The Last Paradigm Platform

Click the link below to sign in to ${host}:

${url}

This link expires in 15 minutes and can only be used once.

If you did not request this email, you can safely ignore it.

---
The Last Paradigm
Quantifying Your Alignment Tax`;
}

function html({ url, host }: MagicLinkEmailParams): string {
  const brandColor = '#D4AF37'; // Gold accent from design system
  const backgroundColor = '#0A0A0A'; // Charcoal background
  const textColor = '#E5E7EB'; // Light text
  const mutedColor = '#9CA3AF'; // Muted text

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sign in to The Last Paradigm</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" max-width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #1A1A1A; border-radius: 12px; border: 1px solid #333;">
          <tr>
            <td style="padding: 40px 32px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandColor}; letter-spacing: -0.5px;">
                      The Last Paradigm
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Main Content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: ${textColor};">
                      Sign in to your account
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${mutedColor};">
                      Click the button below to sign in to <strong style="color: ${textColor};">${host}</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: ${brandColor}; color: #0A0A0A; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Sign in to The Last Paradigm
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: ${mutedColor};">
                      This link expires in <strong style="color: ${textColor};">15 minutes</strong> and can only be used once.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #333;">
                <tr>
                  <td align="center" style="padding-top: 24px;">
                    <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                      If you did not request this email, you can safely ignore it.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" max-width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
          <tr>
            <td align="center" style="padding: 24px 0;">
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
