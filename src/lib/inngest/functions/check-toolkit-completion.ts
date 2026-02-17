/**
 * Toolkit Completion Checker
 *
 * Inngest function that monitors document completion events and emits
 * a toolkit/ready event when all documents are processed.
 *
 * Covers: Story 18.1 Task 5, FR71 (Background job processing)
 */

import { inngest } from '../client';
import { db } from '@/lib/db';
import { toolkitDocuments } from '@/lib/db/schema';
import { eq, and, or, count } from 'drizzle-orm';

/**
 * Total number of documents in a toolkit
 */
const TOTAL_DOCUMENTS = 10;

/**
 * Check Toolkit Completion Function
 *
 * Triggered on each document completion event.
 * Checks if all documents are processed and emits toolkit/ready when complete.
 */
export const checkToolkitCompletion = inngest.createFunction(
  {
    id: 'check-toolkit-completion',
    name: 'Check Toolkit Completion',
  },
  { event: 'toolkit/document.completed' },
  async ({ event, step }) => {
    const { purchaseId, userId } = event.data;

    // Step 1: Query the status of all documents for this purchase
    const statusCounts = await step.run('check-all-documents', async () => {
      // Count completed documents
      const completedResult = await db
        .select({ count: count() })
        .from(toolkitDocuments)
        .where(
          and(
            eq(toolkitDocuments.purchaseId, purchaseId),
            eq(toolkitDocuments.status, 'completed')
          )
        );

      // Count failed documents
      const failedResult = await db
        .select({ count: count() })
        .from(toolkitDocuments)
        .where(
          and(
            eq(toolkitDocuments.purchaseId, purchaseId),
            eq(toolkitDocuments.status, 'failed')
          )
        );

      // Count pending/generating (still in progress)
      const inProgressResult = await db
        .select({ count: count() })
        .from(toolkitDocuments)
        .where(
          and(
            eq(toolkitDocuments.purchaseId, purchaseId),
            or(
              eq(toolkitDocuments.status, 'pending'),
              eq(toolkitDocuments.status, 'generating')
            )
          )
        );

      // Get all document IDs for this purchase
      const allDocs = await db
        .select({ id: toolkitDocuments.id })
        .from(toolkitDocuments)
        .where(eq(toolkitDocuments.purchaseId, purchaseId));

      return {
        completedCount: Number(completedResult[0]?.count ?? 0),
        failedCount: Number(failedResult[0]?.count ?? 0),
        inProgressCount: Number(inProgressResult[0]?.count ?? 0),
        documentIds: allDocs.map((d) => d.id),
      };
    });

    const { completedCount, failedCount, inProgressCount, documentIds } =
      statusCounts;
    const totalProcessed = completedCount + failedCount;

    // Step 2: Check if all documents are processed
    if (totalProcessed >= TOTAL_DOCUMENTS && inProgressCount === 0) {
      // All documents have been processed - emit toolkit/ready event
      await step.sendEvent('emit-toolkit-ready', {
        name: 'toolkit/ready',
        data: {
          userId,
          purchaseId,
          completedCount,
          failedCount,
          documentIds,
        },
      });

      return {
        allComplete: true,
        completedCount,
        failedCount,
        message: `Toolkit generation complete: ${completedCount} successful, ${failedCount} failed`,
      };
    }

    // Still in progress
    return {
      allComplete: false,
      completedCount,
      failedCount,
      inProgressCount,
      message: `Toolkit generation in progress: ${totalProcessed}/${TOTAL_DOCUMENTS} documents processed`,
    };
  }
);
