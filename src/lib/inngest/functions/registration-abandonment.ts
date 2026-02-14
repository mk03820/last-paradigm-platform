/**
 * Registration Abandonment Recovery Function
 *
 * Sends reminder email to users who started but didn't complete registration.
 * Triggered 1 hour after email entry if registration not completed.
 *
 * Covers: Story 15.9, FR67 (Registration abandonment recovery)
 */

import { inngest } from '../client';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const registrationAbandonmentCheck = inngest.createFunction(
  {
    id: 'registration-abandonment-check',
    name: 'Registration Abandonment Check',
    retries: 3,
  },
  { event: 'registration/abandoned' },
  async ({ event, step }) => {
    const { email, abandonedAt } = event.data;

    // Wait 1 hour before sending reminder
    await step.sleep('wait-1-hour', '1h');

    // Check if user has since registered
    const userExists = await step.run('check-user-registered', async () => {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      return !!user;
    });

    if (userExists) {
      return {
        success: true,
        action: 'skipped',
        reason: 'User completed registration',
      };
    }

    // Send reminder email
    await step.run('send-reminder-email', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resumeUrl = `${baseUrl}/auth/register?email=${encodeURIComponent(email)}`;

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'The Last Paradigm <noreply@thelastparadigm.com>',
        to: email,
        subject: 'Complete Your Account - The Last Paradigm',
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Complete Your Account</h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">
              You started creating an account with The Last Paradigm but didn't finish.
              Your diagnostic results are waiting for you!
            </p>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 8px;">Why create an account?</h3>
              <ul style="color: #475569; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Save your diagnostic results permanently</li>
                <li>Access your personalized transformation roadmap</li>
                <li>Preview Playbook 2 tools tailored to your results</li>
              </ul>
            </div>
            <p style="margin: 24px 0;">
              <a href="${resumeUrl}" style="display: inline-block; background-color: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Complete Your Account
              </a>
            </p>
            <p style="color: #64748b; font-size: 14px;">
              If you didn't start this registration, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">
              Based on the methodology from <em>The Last Paradigm</em>
            </p>
          </div>
        `,
      });
    });

    return {
      success: true,
      action: 'email_sent',
      email,
      abandonedAt,
    };
  }
);
