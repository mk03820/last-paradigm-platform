/**
 * Registration Abandonment Recovery Function
 *
 * Sends reminder email to users who started but didn't complete registration.
 * Triggered 1 hour after email entry if registration not completed.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 4, FR67 (Registration abandonment recovery)
 *         AC1 (1-hour trigger), AC5 (One email per abandonment), AC6 (Cancel if completed)
 */

import { inngest } from '../client';
import { db } from '@/lib/db';
import { abandonedRegistrations, users } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { sendCompleteRegistrationEmail } from '@/lib/email/send-complete-registration-email';

export const registrationAbandonmentCheck = inngest.createFunction(
  {
    id: 'registration-abandonment-check',
    name: 'Registration Abandonment Check',
    retries: 3,
  },
  { event: 'registration/abandoned' },
  async ({ event, step }) => {
    const { email, token } = event.data;

    // Wait 1 hour before sending reminder (AC1)
    await step.sleep('wait-1-hour', '1h');

    // Check if user has since completed registration (AC6)
    const userExists = await step.run('check-user-registered', async () => {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      return !!user;
    });

    if (userExists) {
      // Mark as completed in abandoned_registrations table
      await step.run('mark-completed', async () => {
        await db
          .update(abandonedRegistrations)
          .set({ completedAt: new Date() })
          .where(eq(abandonedRegistrations.email, email.toLowerCase()));
      });

      return {
        success: true,
        action: 'skipped',
        reason: 'User completed registration',
      };
    }

    // Check if email already sent for this abandonment (AC5 - idempotency)
    const shouldSendEmail = await step.run('check-and-send', async () => {
      const [record] = await db
        .select()
        .from(abandonedRegistrations)
        .where(
          and(
            eq(abandonedRegistrations.email, email.toLowerCase()),
            isNull(abandonedRegistrations.completedAt),
            isNull(abandonedRegistrations.emailSentAt)
          )
        )
        .limit(1);

      if (!record) {
        // Either completed or email already sent
        return { shouldSend: false, record: null };
      }

      return { shouldSend: true, record };
    });

    if (!shouldSendEmail.shouldSend) {
      return {
        success: true,
        action: 'skipped',
        reason: 'Email already sent or registration completed',
      };
    }

    // Send reminder email (AC2)
    const emailResult = await step.run('send-reminder-email', async () => {
      const result = await sendCompleteRegistrationEmail({
        to: email,
        token,
      });

      return result;
    });

    if (!emailResult.success) {
      return {
        success: false,
        action: 'email_failed',
        error: emailResult.error,
      };
    }

    // Mark email as sent to prevent duplicates (AC5)
    await step.run('mark-email-sent', async () => {
      await db
        .update(abandonedRegistrations)
        .set({ emailSentAt: new Date() })
        .where(eq(abandonedRegistrations.email, email.toLowerCase()));
    });

    return {
      success: true,
      action: 'email_sent',
      email,
      emailId: emailResult.id,
    };
  }
);
