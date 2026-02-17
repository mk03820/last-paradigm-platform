/**
 * Send Purchase Confirmation Email
 *
 * Sends a confirmation email after successful Playbook 2 purchase.
 * Triggered by the Stripe webhook handler upon payment completion.
 *
 * Story 20.2: Purchase Confirmation Email
 * Task 2: Create send purchase confirmation function (AC: 1, 5)
 * Covers: FR53 (Purchase confirmation email with download links)
 */

import { sendEmail } from './client';
import { generatePurchaseConfirmationEmail } from './templates/purchase-confirmation';

/**
 * Parameters for sending purchase confirmation
 */
export interface SendPurchaseConfirmationParams {
  /** User's name (optional) */
  userName?: string | null;
  /** User's email address */
  userEmail: string;
  /** Purchase amount in cents (will be converted to dollars) */
  amountCents: number;
  /** Purchase ID for reference */
  purchaseId: string;
  /** User ID for building portal link */
  userId: string;
  /** Base URL for the platform (optional) */
  baseUrl?: string;
}

/**
 * Result of sending purchase confirmation email
 */
export interface SendPurchaseConfirmationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send purchase confirmation email
 *
 * @param params - Email parameters
 * @returns Result with success status and message ID
 */
export async function sendPurchaseConfirmation(
  params: SendPurchaseConfirmationParams
): Promise<SendPurchaseConfirmationResult> {
  const {
    userName,
    userEmail,
    amountCents,
    purchaseId,
    userId,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com',
  } = params;

  console.log(`[Purchase Confirmation] Sending to: ${userEmail}, purchaseId: ${purchaseId}`);

  try {
    // Convert cents to dollars
    const amountDollars = amountCents / 100;

    // Generate download portal URL
    const downloadPortalUrl = `${baseUrl}/dashboard/toolkit`;

    // Generate email content
    const { subject, text, html } = generatePurchaseConfirmationEmail({
      userName,
      userEmail,
      amount: amountDollars,
      purchaseId,
      downloadPortalUrl,
      baseUrl,
    });

    // Send the email
    const result = await sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    });

    if (result.success) {
      console.log(
        `[Purchase Confirmation] Successfully sent to ${userEmail}, messageId: ${result.id}`
      );
      return {
        success: true,
        messageId: result.id,
      };
    } else {
      console.error(
        `[Purchase Confirmation] Failed to send to ${userEmail}: ${result.error}`
      );
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Purchase Confirmation] Error sending email: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
