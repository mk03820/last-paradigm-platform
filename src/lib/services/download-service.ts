/**
 * Download Service
 *
 * Generates presigned URLs for secure document downloads.
 *
 * Story 18.5: Download Portal Page
 * Task 3: Implement secure download functionality
 * Covers: AC5 (time-limited download links), NFR20 (secure access)
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@/lib/db';
import { toolkitDocuments, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * S3 client configured for toolkit document storage
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

/**
 * S3 bucket for toolkit documents
 */
const BUCKET_NAME = process.env.S3_TOOLKIT_BUCKET || 'last-paradigm-toolkits';

/**
 * Presigned URL expiry time in seconds (24 hours)
 */
const URL_EXPIRY_SECONDS = 24 * 60 * 60;

/**
 * Document information with download capability
 */
export interface DownloadableDocument {
  id: string;
  documentName: string;
  documentType: 'word' | 'excel' | 'pptx' | 'pdf';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  fileSizeBytes: number | null;
  errorMessage: string | null;
  generatedAt: Date | null;
}

/**
 * Result of generating a download URL
 */
export interface DownloadUrlResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

/**
 * Document descriptions for display
 */
export const DOCUMENT_DESCRIPTIONS: Record<string, string> = {
  'strategic-alignment-brief':
    'Executive summary with total alignment tax and key findings from all diagnostic tools',
  'stakeholder-communication-pack':
    'Stakeholder power/interest matrix with communication strategies and key messaging templates',
  'decision-framework-guide':
    'Decision archetype analysis with bottleneck identification and recommended protocols',
  'data-flow-optimization-plan':
    'Journey friction maps with latency hotspots and improvement recommendations',
  'communication-improvement-playbook':
    'Anti-pattern analysis with channel optimization and implementation timeline',
  'meeting-cost-tracker':
    'Pre-populated meeting data with ongoing cost calculation formulas and tracking dashboard',
  'alignment-tax-calculator':
    'All 7 tool inputs pre-populated with master calculation formulas and ROI projections',
  'transformation-roadmap-planner':
    'Priority matrix based on diagnostic findings with timeline and resource allocation',
  'executive-presentation-deck':
    '16-slide presentation with executive summary, tool findings, and recommendations',
  'board-summary-report':
    'Professional PDF summary with cover page, metrics dashboard, and strategic recommendations',
};

/**
 * Category for each document type
 */
export type DocumentCategory = 'strategic' | 'tools' | 'presentations';

/**
 * Get the category for a document based on its type
 */
export function getDocumentCategory(documentType: string): DocumentCategory {
  switch (documentType) {
    case 'word':
      return 'strategic';
    case 'excel':
      return 'tools';
    case 'pptx':
    case 'pdf':
      return 'presentations';
    default:
      return 'strategic';
  }
}

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  strategic: 'Strategic Documents',
  tools: 'Working Tools',
  presentations: 'Presentations',
};

/**
 * Category descriptions
 */
export const CATEGORY_DESCRIPTIONS: Record<DocumentCategory, string> = {
  strategic: 'Enterprise-ready Word documents customized with your diagnostic findings',
  tools: 'Interactive Excel spreadsheets with working formulas and your data pre-populated',
  presentations: 'Board-presentation ready materials for executive stakeholders',
};

/**
 * Verify user has access to download documents
 *
 * @param userId - The user ID to verify
 * @returns true if user has completed purchase
 */
export async function verifyDownloadAccess(userId: string): Promise<boolean> {
  try {
    const user = await db
      .select({ purchaseStatus: users.purchaseStatus })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0]?.purchaseStatus === 'completed';
  } catch (error) {
    console.error('[download-service] Error verifying access:', error);
    return false;
  }
}

/**
 * Get all downloadable documents for a user
 *
 * @param userId - The user ID to fetch documents for
 * @returns Array of downloadable documents
 */
export async function getUserDocuments(
  userId: string
): Promise<DownloadableDocument[]> {
  try {
    const documents = await db
      .select({
        id: toolkitDocuments.id,
        documentName: toolkitDocuments.documentName,
        documentType: toolkitDocuments.documentType,
        status: toolkitDocuments.status,
        fileSizeBytes: toolkitDocuments.fileSizeBytes,
        errorMessage: toolkitDocuments.errorMessage,
        generatedAt: toolkitDocuments.generatedAt,
      })
      .from(toolkitDocuments)
      .where(eq(toolkitDocuments.userId, userId));

    return documents as DownloadableDocument[];
  } catch (error) {
    console.error('[download-service] Error fetching documents:', error);
    return [];
  }
}

/**
 * Generate a presigned download URL for a document
 *
 * @param documentId - The document ID to generate URL for
 * @param userId - The user ID (for verification)
 * @returns Download URL result
 */
export async function generateDownloadUrl(
  documentId: string,
  userId: string
): Promise<DownloadUrlResult> {
  try {
    // Verify user owns this document and it's completed
    const document = await db
      .select({
        s3Key: toolkitDocuments.s3Key,
        documentName: toolkitDocuments.documentName,
        documentType: toolkitDocuments.documentType,
        status: toolkitDocuments.status,
      })
      .from(toolkitDocuments)
      .where(
        and(
          eq(toolkitDocuments.id, documentId),
          eq(toolkitDocuments.userId, userId)
        )
      )
      .limit(1);

    if (!document[0]) {
      return { success: false, error: 'Document not found' };
    }

    if (document[0].status !== 'completed') {
      return { success: false, error: 'Document not ready for download' };
    }

    if (!document[0].s3Key) {
      return { success: false, error: 'Document file not available' };
    }

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: document[0].s3Key,
      ResponseContentDisposition: `attachment; filename="${getDownloadFileName(
        document[0].documentName,
        document[0].documentType
      )}"`,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRY_SECONDS,
    });

    return {
      success: true,
      url,
      fileName: getDownloadFileName(
        document[0].documentName,
        document[0].documentType
      ),
    };
  } catch (error) {
    console.error('[download-service] Error generating URL:', error);
    return { success: false, error: 'Failed to generate download URL' };
  }
}

/**
 * Generate user-friendly download file name
 */
function getDownloadFileName(documentName: string, documentType: string): string {
  const extensions: Record<string, string> = {
    word: 'docx',
    excel: 'xlsx',
    pptx: 'pptx',
    pdf: 'pdf',
  };

  const sanitized = documentName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_');

  return `${sanitized}.${extensions[documentType] || 'bin'}`;
}

/**
 * Get all completed documents for ZIP download
 *
 * @param userId - The user ID
 * @returns Array of S3 keys and file names for completed documents
 */
export async function getCompletedDocumentsForZip(
  userId: string
): Promise<Array<{ s3Key: string; fileName: string }>> {
  try {
    const documents = await db
      .select({
        s3Key: toolkitDocuments.s3Key,
        documentName: toolkitDocuments.documentName,
        documentType: toolkitDocuments.documentType,
      })
      .from(toolkitDocuments)
      .where(
        and(
          eq(toolkitDocuments.userId, userId),
          eq(toolkitDocuments.status, 'completed')
        )
      );

    return documents
      .filter((d) => d.s3Key)
      .map((d) => ({
        s3Key: d.s3Key!,
        fileName: getDownloadFileName(d.documentName, d.documentType),
      }));
  } catch (error) {
    console.error('[download-service] Error fetching documents for ZIP:', error);
    return [];
  }
}

/**
 * Generate presigned URL for a specific S3 key
 */
export async function getPresignedUrlForKey(
  s3Key: string,
  fileName: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: URL_EXPIRY_SECONDS,
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
