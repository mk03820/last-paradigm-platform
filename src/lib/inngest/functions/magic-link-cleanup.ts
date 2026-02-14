/**
 * Magic Link Cleanup Function
 *
 * Scheduled function to clean up expired magic links.
 * Runs hourly to keep the magic_links table clean.
 *
 * Covers: Story 15.10 Task 2, Story 15.4 Task 7
 */

import { inngest } from '../client';
import { cleanupExpiredMagicLinks } from '@/lib/auth/magic-link';

export const magicLinkCleanup = inngest.createFunction(
  {
    id: 'magic-link-cleanup',
    name: 'Magic Link Cleanup',
    retries: 3,
  },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    const deletedCount = await step.run('cleanup-expired-links', async () => {
      return await cleanupExpiredMagicLinks();
    });

    return {
      success: true,
      deletedCount,
      timestamp: new Date().toISOString(),
    };
  }
);
