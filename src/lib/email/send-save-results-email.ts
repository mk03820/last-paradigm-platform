/**
 * Send Save Results Email
 *
 * Sends an email with a recovery link when a user saves their
 * PB1 diagnostic results.
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC4 (Email sent with recovery link)
 */

import { sendEmail } from './client';
import { generateSaveResultsEmail } from './templates/save-results';

interface SendSaveResultsEmailParams {
  email: string;
  token: string;
  baseUrl?: string;
}

export async function sendSaveResultsEmail({
  email,
  token,
  baseUrl,
}: SendSaveResultsEmailParams): Promise<{ success: boolean; error?: string }> {
  // Determine base URL
  const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const recoveryUrl = `${base}/recover-session?token=${token}`;
  const { host } = new URL(base);

  // Generate email content
  const { subject, text, html } = generateSaveResultsEmail({
    recoveryUrl,
    host,
    expiresInDays: 7,
  });

  // Send email
  const result = await sendEmail({
    to: email,
    subject,
    text,
    html,
  });

  if (!result.success) {
    console.error('[send-save-results-email] Failed to send:', result.error);
  }

  return {
    success: result.success,
    error: result.error,
  };
}
