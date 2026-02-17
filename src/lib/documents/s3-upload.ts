/**
 * S3 Document Upload Helper
 *
 * Handles uploading generated documents to S3 storage.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 1.5: Create S3 upload helper for generated documents
 * Covers: AC1 (document uploaded to secure storage)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
 * Result of an S3 upload operation
 */
export interface UploadResult {
  s3Key: string;
  bucket: string;
}

/**
 * Content types for different document formats
 */
export const CONTENT_TYPES = {
  word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
} as const;

/**
 * File extensions for different document formats
 */
export const FILE_EXTENSIONS = {
  word: 'docx',
  excel: 'xlsx',
  pptx: 'pptx',
  pdf: 'pdf',
} as const;

/**
 * Upload a document to S3
 *
 * @param userId - User ID for path namespacing
 * @param documentId - Document record ID
 * @param buffer - Document content as Buffer
 * @param fileName - Original file name
 * @param contentType - MIME content type
 * @returns Upload result with S3 key and bucket
 */
export async function uploadDocument(
  userId: string,
  documentId: string,
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  const s3Key = `toolkits/${userId}/${documentId}/${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: `attachment; filename="${fileName}"`,
      // Enable server-side encryption
      ServerSideEncryption: 'AES256',
    })
  );

  return { s3Key, bucket: BUCKET_NAME };
}

/**
 * Sanitize a file name for safe storage
 * Removes special characters and replaces spaces with underscores
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Generate a complete file name with extension
 */
export function generateFileName(
  documentName: string,
  documentType: keyof typeof FILE_EXTENSIONS
): string {
  const sanitized = sanitizeFileName(documentName);
  const extension = FILE_EXTENSIONS[documentType];
  return `${sanitized}.${extension}`;
}

/**
 * Get content type for a document type
 */
export function getContentType(
  documentType: keyof typeof CONTENT_TYPES
): string {
  return CONTENT_TYPES[documentType];
}
