/**
 * Toolkit Status Service
 *
 * Story 19.3: Purchase Status & Toolkit Access
 * Task 9: Create download portal availability service (AC: 6)
 *
 * Checks toolkit document generation status for download portal availability.
 * Provides graceful fallback when Story 18.5 (Download Portal) is not available.
 *
 * Coordinates with Dev Team 2 (Epic 18) on integration.
 */

import { db } from '@/lib/db';
import { toolkitDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Toolkit status information for display in the dashboard
 */
export interface ToolkitStatus {
  /** Whether all documents are ready and download portal is available */
  available: boolean;
  /** Number of documents that have been generated successfully */
  documentsReady: number;
  /** Total number of documents to be generated (always 10) */
  totalDocuments: number;
  /** Whether any documents are currently being generated */
  isGenerating: boolean;
  /** Number of documents that failed to generate */
  failedDocuments: number;
}

/**
 * Default status returned when generation hasn't started or on error
 */
const DEFAULT_STATUS: ToolkitStatus = {
  available: false,
  documentsReady: 0,
  totalDocuments: 10,
  isGenerating: false,
  failedDocuments: 0,
};

/**
 * Get the toolkit generation status for a user
 *
 * Queries the toolkit_documents table from Story 18.1 to determine:
 * - How many documents are ready for download
 * - Whether generation is in progress
 * - Whether any documents failed to generate
 *
 * Returns graceful fallback if:
 * - No documents exist yet (generation not started)
 * - toolkit_documents table doesn't exist (Story 18.1 not deployed)
 * - Any database error occurs
 *
 * @param userId - The user ID to check toolkit status for
 * @returns ToolkitStatus object with availability information
 */
export async function getToolkitStatus(userId: string): Promise<ToolkitStatus> {
  try {
    // Query all toolkit documents for this user
    const documents = await db
      .select()
      .from(toolkitDocuments)
      .where(eq(toolkitDocuments.userId, userId));

    // No documents - generation hasn't started yet
    if (documents.length === 0) {
      return DEFAULT_STATUS;
    }

    // Count documents by status
    const completed = documents.filter((d) => d.status === 'completed').length;
    const generating = documents.filter((d) => d.status === 'generating').length;
    const failed = documents.filter((d) => d.status === 'failed').length;

    return {
      // Available only when ALL 10 documents are completed
      available: completed === 10,
      documentsReady: completed,
      totalDocuments: 10,
      isGenerating: generating > 0,
      failedDocuments: failed,
    };
  } catch (error) {
    // Graceful fallback for any error:
    // - Table doesn't exist (Story 18.1 not deployed yet)
    // - Database connection issues
    // - Any other unexpected errors
    console.error('[toolkit-status] Error checking toolkit status:', error);

    return DEFAULT_STATUS;
  }
}

/**
 * Check if the download portal page exists (Story 18.5)
 *
 * This is a simple check to determine if the download portal route
 * has been implemented. Used to decide whether to show a link or fallback.
 *
 * Note: This is a compile-time check based on expected route structure.
 * The actual route availability is determined by Next.js routing.
 *
 * @returns boolean indicating if download portal page is expected to exist
 */
export function isDownloadPortalAvailable(): boolean {
  // Story 18.5 is in backlog - download portal is not available yet
  // This will be updated to return true once Story 18.5 is complete
  return false;
}
