/**
 * Nurture Sequence Inngest Functions
 *
 * Automated email nurture sequence for non-purchasers.
 * 5 emails over 14 days with exit conditions for purchase/unsubscribe.
 *
 * Story 20.4: Nurture Sequence Automation
 * Tasks 1-6: Implement nurture sequence automation
 * Covers: FR52 (5-email nurture sequence), NFR30 (GDPR compliance)
 */

import { inngest } from '../client';
import { db } from '@/lib/db';
import {
  users,
  emailSequences,
  nurtureEmails,
  emailPreferences,
  diagnosticResults,
} from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { sendEmail } from '@/lib/email/client';
import { generateNurtureEmail } from '@/lib/email/templates/nurture';
import {
  NURTURE_SCHEDULE,
  NURTURE_EMAIL_COUNT,
  getNurtureEmailConfig,
  type NurtureDay,
  type NurtureEmailContext,
} from '@/lib/email/nurture-config';
import {
  generateEmailToken,
  formatCurrency,
  getFirstName,
  generateUnsubscribeUrl,
} from '@/lib/email/utils';

/**
 * Check if user should start nurture sequence
 *
 * Called 24 hours after account creation.
 * Only triggers if user hasn't purchased.
 */
export const checkNurtureTrigger = inngest.createFunction(
  {
    id: 'nurture-check-trigger',
    name: 'Check Nurture Sequence Trigger',
  },
  { event: 'nurture/check-trigger' },
  async ({ event, step }) => {
    const { userId } = event.data;

    // Check if user has purchased
    const user = await step.run('check-purchase-status', async () => {
      const result = await db
        .select({
          id: users.id,
          hasPb2Access: users.hasPb2Access,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return result[0] || null;
    });

    if (!user) {
      console.log(`[Nurture] User not found: ${userId}`);
      return { triggered: false, reason: 'user_not_found' };
    }

    if (user.hasPb2Access) {
      console.log(`[Nurture] User already purchased: ${userId}`);
      return { triggered: false, reason: 'already_purchased' };
    }

    // Check for existing active sequence
    const existingSequence = await step.run('check-existing-sequence', async () => {
      const result = await db
        .select({ id: emailSequences.id, status: emailSequences.status })
        .from(emailSequences)
        .where(
          and(
            eq(emailSequences.userId, userId),
            eq(emailSequences.sequenceType, 'nurture')
          )
        )
        .limit(1);

      return result[0] || null;
    });

    if (existingSequence) {
      console.log(`[Nurture] Sequence already exists for user: ${userId}`);
      return { triggered: false, reason: 'sequence_exists' };
    }

    // Trigger the nurture sequence
    await step.sendEvent('trigger-nurture', {
      name: 'nurture/trigger',
      data: {
        userId,
        triggerReason: 'account_created_no_purchase',
      },
    });

    return { triggered: true };
  }
);

/**
 * Start nurture sequence
 *
 * Creates sequence record and schedules all 5 emails.
 */
export const startNurtureSequence = inngest.createFunction(
  {
    id: 'nurture-start-sequence',
    name: 'Start Nurture Sequence',
    retries: 3,
  },
  { event: 'nurture/trigger' },
  async ({ event, step }) => {
    const { userId, triggerReason } = event.data;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com';

    // Get user data and diagnostic results
    const userData = await step.run('get-user-data', async () => {
      const user = await db
        .select({
          email: users.email,
          name: users.name,
          hasPb2Access: users.hasPb2Access,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0 || user[0].hasPb2Access) {
        return null;
      }

      // Get diagnostic results for personalization
      const diagnostic = await db
        .select({
          totalAlignmentTax: diagnosticResults.totalAlignmentTax,
          estimatedSavings: diagnosticResults.estimatedSavings,
        })
        .from(diagnosticResults)
        .where(eq(diagnosticResults.userId, userId))
        .orderBy(desc(diagnosticResults.completedAt))
        .limit(1);

      return {
        ...user[0],
        diagnostic: diagnostic[0] || null,
      };
    });

    if (!userData || !userData.email) {
      console.log(`[Nurture] Invalid user data for: ${userId}`);
      return { success: false, reason: 'invalid_user' };
    }

    // Ensure email preferences exist with unsubscribe token
    const unsubscribeToken = await step.run('ensure-email-preferences', async () => {
      const existing = await db
        .select({ unsubscribeToken: emailPreferences.unsubscribeToken })
        .from(emailPreferences)
        .where(eq(emailPreferences.email, userData.email!.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        return existing[0].unsubscribeToken;
      }

      // Create new preferences
      const token = generateEmailToken();
      await db.insert(emailPreferences).values({
        email: userData.email!.toLowerCase(),
        userId,
        unsubscribeToken: token,
        marketingOptOut: false,
        nurturOptOut: false,
        transactionalOnly: false,
      });

      return token;
    });

    // Create sequence record
    const sequence = await step.run('create-sequence', async () => {
      const [seq] = await db
        .insert(emailSequences)
        .values({
          userId,
          sequenceType: 'nurture',
          currentStep: 0,
          totalSteps: NURTURE_EMAIL_COUNT,
          status: 'active',
          createdAt: new Date(),
        })
        .returning();

      return seq;
    });

    // Build email context
    const context: NurtureEmailContext = {
      firstName: getFirstName(userData.name, userData.email),
      userEmail: userData.email,
      totalAlignmentTax: userData.diagnostic?.totalAlignmentTax
        ? formatCurrency(Number(userData.diagnostic.totalAlignmentTax))
        : '$0',
      estimatedSavings: userData.diagnostic?.estimatedSavings
        ? formatCurrency(Number(userData.diagnostic.estimatedSavings))
        : '$0',
      previewUrl: `${baseUrl}/preview`,
      purchaseUrl: `${baseUrl}/purchase`,
      unsubscribeUrl: generateUnsubscribeUrl(userData.email, unsubscribeToken, baseUrl),
      unsubscribeToken,
      baseUrl,
    };

    // Send Day 0 email immediately
    await step.run('send-day-0', async () => {
      await sendNurtureEmailStep(userId, sequence.id, 0, context);
    });

    // Schedule remaining emails with delays
    // Day 3: 3 days = 72 hours
    await step.sleep('wait-for-day-3', '3d');
    const day3Result = await step.run('send-day-3', async () => {
      return await sendNurtureEmailWithExitCheck(userId, sequence.id, 3, context);
    });
    if (day3Result.exited) return { success: true, exitedAt: 'day-3', reason: day3Result.reason };

    // Day 7: 4 more days
    await step.sleep('wait-for-day-7', '4d');
    const day7Result = await step.run('send-day-7', async () => {
      return await sendNurtureEmailWithExitCheck(userId, sequence.id, 7, context);
    });
    if (day7Result.exited) return { success: true, exitedAt: 'day-7', reason: day7Result.reason };

    // Day 10: 3 more days
    await step.sleep('wait-for-day-10', '3d');
    const day10Result = await step.run('send-day-10', async () => {
      return await sendNurtureEmailWithExitCheck(userId, sequence.id, 10, context);
    });
    if (day10Result.exited) return { success: true, exitedAt: 'day-10', reason: day10Result.reason };

    // Day 14: 4 more days
    await step.sleep('wait-for-day-14', '4d');
    const day14Result = await step.run('send-day-14', async () => {
      return await sendNurtureEmailWithExitCheck(userId, sequence.id, 14, context);
    });
    if (day14Result.exited) return { success: true, exitedAt: 'day-14', reason: day14Result.reason };

    // Mark sequence as completed
    await step.run('mark-completed', async () => {
      await db
        .update(emailSequences)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(emailSequences.id, sequence.id));
    });

    return { success: true, completed: true };
  }
);

/**
 * Send nurture email with exit condition check
 */
async function sendNurtureEmailWithExitCheck(
  userId: string,
  sequenceId: string,
  day: NurtureDay,
  context: NurtureEmailContext
): Promise<{ exited: boolean; reason?: string }> {
  // Check exit conditions
  const exitCheck = await checkExitConditions(userId, sequenceId);
  if (exitCheck.shouldExit) {
    return { exited: true, reason: exitCheck.reason };
  }

  // Send the email
  await sendNurtureEmailStep(userId, sequenceId, day, context);
  return { exited: false };
}

/**
 * Check if user should exit nurture sequence
 */
async function checkExitConditions(
  userId: string,
  sequenceId: string
): Promise<{ shouldExit: boolean; reason?: string }> {
  // Check purchase status
  const user = await db
    .select({ hasPb2Access: users.hasPb2Access })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length > 0 && user[0].hasPb2Access) {
    // Mark sequence as converted
    await db
      .update(emailSequences)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(emailSequences.id, sequenceId));

    console.log(`[Nurture] User purchased, exiting sequence: ${userId}`);
    return { shouldExit: true, reason: 'purchased' };
  }

  // Check unsubscribe status
  const userEmail = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userEmail.length > 0 && userEmail[0].email) {
    const prefs = await db
      .select({ nurturOptOut: emailPreferences.nurturOptOut })
      .from(emailPreferences)
      .where(eq(emailPreferences.email, userEmail[0].email.toLowerCase()))
      .limit(1);

    if (prefs.length > 0 && prefs[0].nurturOptOut) {
      // Mark sequence as unsubscribed
      await db
        .update(emailSequences)
        .set({
          status: 'unsubscribed',
          completedAt: new Date(),
        })
        .where(eq(emailSequences.id, sequenceId));

      console.log(`[Nurture] User unsubscribed, exiting sequence: ${userId}`);
      return { shouldExit: true, reason: 'unsubscribed' };
    }
  }

  return { shouldExit: false };
}

/**
 * Send individual nurture email and update records
 */
async function sendNurtureEmailStep(
  userId: string,
  sequenceId: string,
  day: NurtureDay,
  context: NurtureEmailContext
): Promise<void> {
  const config = getNurtureEmailConfig(day);
  if (!config) {
    throw new Error(`Invalid nurture day: ${day}`);
  }

  // Generate email content
  const { subject, text, html } = generateNurtureEmail(day, context);

  // Create nurture email record
  const [emailRecord] = await db
    .insert(nurtureEmails)
    .values({
      sequenceId,
      userId,
      emailDay: day,
      subject,
      status: 'pending',
    })
    .returning();

  // Send email
  const result = await sendEmail({
    to: context.userEmail,
    subject,
    text,
    html,
  });

  // Update record with result
  const now = new Date();
  await db
    .update(nurtureEmails)
    .set({
      status: result.success ? 'sent' : 'failed',
      sentAt: result.success ? now : null,
      resendMessageId: result.id || null,
      errorMessage: result.error || null,
    })
    .where(eq(nurtureEmails.id, emailRecord.id));

  // Update sequence current step
  await db
    .update(emailSequences)
    .set({
      currentStep: day === 0 ? 1 : day === 3 ? 2 : day === 7 ? 3 : day === 10 ? 4 : 5,
      lastSentAt: now,
    })
    .where(eq(emailSequences.id, sequenceId));

  if (result.success) {
    console.log(`[Nurture] Sent Day ${day} email to ${context.userEmail}`);
  } else {
    console.error(`[Nurture] Failed to send Day ${day} email: ${result.error}`);
    // Retry logic is handled by Inngest retries
  }
}
