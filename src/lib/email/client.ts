/**
 * Email Client using Resend
 *
 * Centralized email sending functionality for the platform.
 * Uses the Resend API for email delivery.
 *
 * Covers: Story 15.8 (Pre-Account Results Preservation)
 * Per architecture.md: Resend for transactional emails
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM || 'The Last Paradigm <noreply@lastparadigm.com>';

  if (!apiKey) {
    console.error('[email/client] AUTH_RESEND_KEY not configured');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[email/client] Resend error:', errorText);
      return {
        success: false,
        error: `Email delivery failed: ${errorText}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error('[email/client] Send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
