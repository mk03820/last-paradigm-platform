/**
 * Password Reset Cleanup Function
 *
 * Scheduled function to clean up expired password reset tokens.
 * Runs daily to keep the password_resets table clean.
 *
 * Covers: Story 15.10 Task 2, Story 15.5 cleanup
 */

import { inngest } from '../client';
import { cleanupExpiredResets } from '@/lib/auth/password-reset';

export const passwordResetCleanup = inngest.createFunction(
  {
    id: 'password-reset-cleanup',
    name: 'Password Reset Cleanup',
    retries: 3,
  },
  { cron: '0 2 * * *' }, // Daily at 2 AM
  async ({ step }) => {
    const deletedCount = await step.run('cleanup-expired-resets', async () => {
      return await cleanupExpiredResets();
    });

    return {
      success: true,
      deletedCount,
      timestamp: new Date().toISOString(),
    };
  }
);
