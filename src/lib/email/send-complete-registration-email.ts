/**
 * Send Complete Registration Email
 *
 * Sends abandonment recovery email to users who started but didn't complete registration.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 8, AC2 (Email delivery)
 */

import { sendEmail, type SendEmailResult } from './client';
import { generateCompleteRegistrationEmail } from './templates/complete-registration';

/**
 * Parameters for sending complete registration email
 */
export interface SendCompleteRegistrationEmailParams {
  /** Recipient email address */
  to: string;
  /** Resume registration token */
  token: string;
  /** Optional estimated savings from diagnostic */
  estimatedSavings?: number;
  /** Optional unsubscribe token */
  unsubscribeToken?: string;
}

/**
 * Send the complete registration email to a user who abandoned registration
 *
 * @param params - Email parameters
 * @returns Promise with send result
 */
export async function sendCompleteRegistrationEmail({
  to,
  token,
  estimatedSavings,
  unsubscribeToken,
}: SendCompleteRegistrationEmailParams): Promise<SendEmailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com';
  const resumeUrl = `${baseUrl}/auth/register/resume?token=${encodeURIComponent(token)}`;

  const { html, text } = generateCompleteRegistrationEmail({
    resumeUrl,
    estimatedSavings,
    userEmail: to,
    unsubscribeToken,
  });

  console.log(`[send-complete-registration-email] Sending to: ${to}`);

  const result = await sendEmail({
    to,
    subject: 'Complete Your Account - The Last Paradigm',
    html,
    text,
  });

  if (result.success) {
    console.log(
      `[send-complete-registration-email] Email sent successfully: ${result.id}`
    );
  } else {
    console.error(
      `[send-complete-registration-email] Failed to send: ${result.error}`
    );
  }

  return result;
}
