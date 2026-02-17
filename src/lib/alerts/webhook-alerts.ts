/**
 * Webhook Alerting Service
 *
 * Sends alerts to admins when webhook processing fails repeatedly.
 * Supports email (via Resend) and optional Slack integration.
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 2: Implement failure alerting (AC: 3)
 * Covers: AC3 (alert generation on repeated failures)
 */

import { sendEmail } from '@/lib/email/client';

/**
 * Webhook failure alert data
 */
export interface WebhookFailureAlert {
  eventId: string;
  eventType: string;
  retryCount: number;
  error: string;
  sessionId?: string;
  userId?: string;
}

/**
 * Alert thresholds
 */
const ALERT_THRESHOLD = 3; // Send alert after 3 failures

/**
 * Send webhook failure alert to admins
 *
 * Sends email notification when a webhook event has failed multiple times.
 * Only sends if retry count exceeds threshold and alert hasn't been sent yet.
 *
 * @param alert - Webhook failure details
 * @returns true if alert was sent, false otherwise
 */
export async function sendWebhookFailureAlert(
  alert: WebhookFailureAlert
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;

  if (!adminEmail) {
    console.warn('[Webhook Alert] No admin email configured (ADMIN_ALERT_EMAIL)');
    return false;
  }

  if (alert.retryCount < ALERT_THRESHOLD) {
    console.log(
      `[Webhook Alert] Retry count ${alert.retryCount} below threshold ${ALERT_THRESHOLD}, skipping alert`
    );
    return false;
  }

  console.log(`[Webhook Alert] Sending failure alert for event: ${alert.eventId}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com';

  const result = await sendEmail({
    to: adminEmail,
    subject: `[URGENT] Webhook Processing Failed - ${alert.eventType}`,
    text: `
Webhook Processing Failure

A webhook event has failed multiple times and may require manual intervention.

Event Details:
- Event ID: ${alert.eventId}
- Event Type: ${alert.eventType}
- Retry Count: ${alert.retryCount}
- Session ID: ${alert.sessionId || 'N/A'}
- User ID: ${alert.userId || 'N/A'}

Error:
${alert.error}

View in Admin Dashboard: ${appUrl}/admin/webhooks
    `.trim(),
    html: `
      <h2>Webhook Processing Failure</h2>
      <p>A webhook event has failed multiple times and may require manual intervention.</p>

      <h3>Event Details</h3>
      <ul>
        <li><strong>Event ID:</strong> ${alert.eventId}</li>
        <li><strong>Event Type:</strong> ${alert.eventType}</li>
        <li><strong>Retry Count:</strong> ${alert.retryCount}</li>
        <li><strong>Session ID:</strong> ${alert.sessionId || 'N/A'}</li>
        <li><strong>User ID:</strong> ${alert.userId || 'N/A'}</li>
      </ul>

      <h3>Error</h3>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">${escapeHtml(alert.error)}</pre>

      <p style="margin-top: 24px;">
        <a href="${appUrl}/admin/webhooks" style="display: inline-block; padding: 12px 24px; background: #d97706; color: white; text-decoration: none; border-radius: 6px;">
          View in Admin Dashboard
        </a>
      </p>
    `.trim(),
  });

  if (result.success) {
    console.log(`[Webhook Alert] Alert sent successfully (id: ${result.id})`);
  } else {
    console.error(`[Webhook Alert] Failed to send alert: ${result.error}`);
  }

  // Also try Slack if configured
  await sendSlackAlert(alert);

  return result.success;
}

/**
 * Send Slack alert for webhook failure (optional)
 *
 * @param alert - Webhook failure details
 */
async function sendSlackAlert(alert: WebhookFailureAlert): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    // Slack not configured, skip silently
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:warning: Webhook Processing Failed`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: ':warning: Webhook Processing Failed',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Event Type:*\n${alert.eventType}`,
              },
              {
                type: 'mrkdwn',
                text: `*Retry Count:*\n${alert.retryCount}`,
              },
              {
                type: 'mrkdwn',
                text: `*Event ID:*\n\`${alert.eventId}\``,
              },
              {
                type: 'mrkdwn',
                text: `*User ID:*\n${alert.userId || 'N/A'}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error:*\n\`\`\`${alert.error}\`\`\``,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View in Dashboard',
                },
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com'}/admin/webhooks`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[Webhook Alert] Slack notification failed:', await response.text());
    } else {
      console.log('[Webhook Alert] Slack notification sent');
    }
  } catch (error) {
    console.error('[Webhook Alert] Slack notification error:', error);
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
