/**
 * Invoice Notification Email Service
 *
 * Sends notifications to admins when enterprise customers request invoices.
 *
 * Story 17.7: Invoice Request Flow
 * Task 6: Create admin notification system (AC: 4, 7)
 * Covers: AC4 (email notification to admin team)
 */

import { sendEmail } from './client';

/**
 * Invoice request notification data
 */
export interface InvoiceRequestNotificationData {
  requestId: string;
  companyName: string;
  billingEmail: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  poNumber?: string | null;
  userName: string;
  userEmail: string;
}

/**
 * Send invoice request notification to admin
 *
 * Notifies the billing admin team when a new invoice request is submitted.
 * Includes all company details needed to generate the Stripe invoice.
 *
 * @param data - Invoice request details
 * @returns true if email was sent successfully
 */
export async function sendInvoiceRequestNotification(
  data: InvoiceRequestNotificationData
): Promise<boolean> {
  const adminEmail =
    process.env.BILLING_ADMIN_EMAIL || process.env.ADMIN_ALERT_EMAIL;

  if (!adminEmail) {
    console.warn(
      '[Invoice Notification] No admin email configured (BILLING_ADMIN_EMAIL or ADMIN_ALERT_EMAIL)'
    );
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com';
  const { billingAddress } = data;
  const fullAddress = `${billingAddress.street}, ${billingAddress.city}, ${billingAddress.state} ${billingAddress.postalCode}, ${billingAddress.country}`;

  console.log(
    `[Invoice Notification] Sending notification for request: ${data.requestId}`
  );

  const result = await sendEmail({
    to: adminEmail,
    subject: `[ACTION REQUIRED] Invoice Request from ${data.companyName}`,
    text: `
New Invoice Request

A customer has requested an invoice for Playbook 2 ($2,500).

Company Details:
- Company: ${data.companyName}
- Billing Email: ${data.billingEmail}
- Billing Address: ${fullAddress}
${data.poNumber ? `- PO Number: ${data.poNumber}` : ''}

Requesting User:
- Name: ${data.userName}
- Email: ${data.userEmail}

Next Steps:
1. Create invoice in Stripe for ${data.billingEmail}
2. Include PO number on invoice if provided
3. Send invoice via Stripe
4. Update request status in admin panel

View in Admin Panel: ${appUrl}/admin/invoices
    `.trim(),
    html: `
      <h2>New Invoice Request</h2>
      <p>A customer has requested an invoice for <strong>Playbook 2 ($2,500)</strong>.</p>

      <h3>Company Details</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.companyName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Billing Email:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.billingEmail)}">${escapeHtml(data.billingEmail)}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Billing Address:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(fullAddress)}</td>
        </tr>
        ${
          data.poNumber
            ? `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>PO Number:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.poNumber)}</td>
        </tr>
        `
            : ''
        }
      </table>

      <h3>Requesting User</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.userName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.userEmail)}">${escapeHtml(data.userEmail)}</a></td>
        </tr>
      </table>

      <h3>Next Steps</h3>
      <ol style="line-height: 1.8;">
        <li>Create invoice in Stripe for <strong>${escapeHtml(data.billingEmail)}</strong></li>
        <li>Include PO number on invoice if provided</li>
        <li>Send invoice via Stripe</li>
        <li>Update request status in admin panel</li>
      </ol>

      <p style="margin-top: 24px;">
        <a href="${appUrl}/admin/invoices" style="display: inline-block; padding: 12px 24px; background: #d97706; color: white; text-decoration: none; border-radius: 6px;">
          View in Admin Panel
        </a>
      </p>
    `.trim(),
  });

  if (result.success) {
    console.log(
      `[Invoice Notification] Admin notification sent successfully (id: ${result.id})`
    );
  } else {
    console.error(
      `[Invoice Notification] Failed to send notification: ${result.error}`
    );
  }

  return result.success;
}

/**
 * Send invoice request confirmation to customer
 *
 * Optional confirmation email sent to the requesting user.
 *
 * @param data - Invoice request details
 * @returns true if email was sent successfully
 */
export async function sendInvoiceRequestConfirmation(
  data: InvoiceRequestNotificationData
): Promise<boolean> {
  console.log(
    `[Invoice Notification] Sending confirmation to: ${data.userEmail}`
  );

  const result = await sendEmail({
    to: data.userEmail,
    subject: `Invoice Request Received - The Last Paradigm`,
    text: `
Hi ${data.userName},

Thank you for your invoice request for Playbook 2.

We've received your request with the following details:

Company: ${data.companyName}
Billing Email: ${data.billingEmail}
${data.poNumber ? `PO Number: ${data.poNumber}` : ''}

Our team will prepare and send your invoice within 1 business day.

If you have any questions, please reply to this email or contact us at billing@lastparadigm.com.

Best regards,
The Last Paradigm Team
    `.trim(),
    html: `
      <p>Hi ${escapeHtml(data.userName)},</p>

      <p>Thank you for your invoice request for <strong>Playbook 2</strong>.</p>

      <p>We've received your request with the following details:</p>

      <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.companyName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Billing Email:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.billingEmail)}</td>
        </tr>
        ${
          data.poNumber
            ? `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>PO Number:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.poNumber)}</td>
        </tr>
        `
            : ''
        }
      </table>

      <p><strong>Our team will prepare and send your invoice within 1 business day.</strong></p>

      <p>If you have any questions, please reply to this email or contact us at <a href="mailto:billing@lastparadigm.com">billing@lastparadigm.com</a>.</p>

      <p style="margin-top: 24px;">Best regards,<br>The Last Paradigm Team</p>
    `.trim(),
  });

  if (result.success) {
    console.log(
      `[Invoice Notification] Confirmation sent to ${data.userEmail} (id: ${result.id})`
    );
  } else {
    console.error(
      `[Invoice Notification] Failed to send confirmation: ${result.error}`
    );
  }

  return result.success;
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
