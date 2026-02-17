/**
 * Individual Document Generation Function
 *
 * Inngest function that generates a single toolkit document.
 * Handles retries with exponential backoff and status updates.
 *
 * Covers: Story 18.1 Task 4, FR71 (Background jobs), FR74 (Individual retry)
 * Story 18.2: Word Document Generation integration
 */

import { inngest } from '../client';
import { db } from '@/lib/db';
import { toolkitDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getWordDocumentGenerator, isWordDocument } from '@/lib/documents/word';
import { getExcelDocumentGenerator, isExcelDocument } from '@/lib/documents/excel';
import { getPptxDocumentGenerator, isPptxDocument } from '@/lib/documents/pptx';
import { getPdfDocumentGenerator, isPdfDocument } from '@/lib/documents/pdf';
import {
  uploadDocument,
  generateFileName,
  getContentType,
  FILE_EXTENSIONS,
} from '@/lib/documents/s3-upload';
import type { DiagnosticSessionData } from '@/lib/db/schema';

/**
 * Get file extension for document type
 */
function getExtension(type: string): string {
  const extensions: Record<string, string> = {
    word: 'docx',
    excel: 'xlsx',
    pptx: 'pptx',
    pdf: 'pdf',
  };
  return extensions[type] || 'bin';
}

/**
 * Generate document content based on type
 */
async function generateDocumentContent(
  documentType: string,
  documentName: string,
  diagnosticData: DiagnosticSessionData,
  userId: string,
  documentId: string
): Promise<{ s3Key: string; fileSizeBytes: number }> {
  if (documentType === 'word' && isWordDocument(documentName)) {
    // Generate Word document
    const generator = getWordDocumentGenerator(documentName);
    const { buffer, fileSizeBytes } = await generator(diagnosticData);

    // Upload to S3
    const fileName = generateFileName(documentName, 'word');
    const contentType = getContentType('word');
    const { s3Key } = await uploadDocument(
      userId,
      documentId,
      buffer,
      fileName,
      contentType
    );

    return { s3Key, fileSizeBytes };
  }

  if (documentType === 'excel' && isExcelDocument(documentName)) {
    // Generate Excel document
    const generator = getExcelDocumentGenerator(documentName);
    if (!generator) {
      throw new Error(`Excel generator not found for: ${documentName}`);
    }
    const { buffer, fileSizeBytes } = await generator(diagnosticData);

    // Upload to S3
    const fileName = generateFileName(documentName, 'excel');
    const contentType = getContentType('excel');
    const { s3Key } = await uploadDocument(
      userId,
      documentId,
      buffer,
      fileName,
      contentType
    );

    return { s3Key, fileSizeBytes };
  }

  if (documentType === 'pptx' && isPptxDocument(documentName)) {
    // Generate PowerPoint document
    const generator = getPptxDocumentGenerator(documentName);
    if (!generator) {
      throw new Error(`PowerPoint generator not found for: ${documentName}`);
    }
    const { buffer, fileSizeBytes } = await generator(diagnosticData);

    // Upload to S3
    const fileName = generateFileName(documentName, 'pptx');
    const contentType = getContentType('pptx');
    const { s3Key } = await uploadDocument(
      userId,
      documentId,
      buffer,
      fileName,
      contentType
    );

    return { s3Key, fileSizeBytes };
  }

  if (documentType === 'pdf' && isPdfDocument(documentName)) {
    // Generate PDF document
    const generator = getPdfDocumentGenerator(documentName);
    if (!generator) {
      throw new Error(`PDF generator not found for: ${documentName}`);
    }
    const { buffer, fileSizeBytes } = await generator(diagnosticData);

    // Upload to S3
    const fileName = generateFileName(documentName, 'pdf');
    const contentType = getContentType('pdf');
    const { s3Key } = await uploadDocument(
      userId,
      documentId,
      buffer,
      fileName,
      contentType
    );

    return { s3Key, fileSizeBytes };
  }

  // Fallback for unimplemented document types
  const extension = getExtension(documentType);
  const s3Key = `toolkits/${userId}/${documentId}.${extension}`;
  return { s3Key, fileSizeBytes: 0 };
}

/**
 * Generate Single Document Function
 *
 * Processes a single document generation job with retry support.
 * Updates document status throughout the process.
 */
export const generateDocument = inngest.createFunction(
  {
    id: 'generate-document',
    name: 'Generate Single Document',
    retries: 3,
  },
  { event: 'toolkit/document.generate' },
  async ({ event, step, attempt }) => {
    const { documentId, userId, purchaseId, documentType, documentName } =
      event.data;

    // Step 1: Update status to 'generating' and increment attempts
    await step.run('update-status-generating', async () => {
      await db
        .update(toolkitDocuments)
        .set({
          status: 'generating',
          attempts: attempt,
          updatedAt: new Date(),
        })
        .where(eq(toolkitDocuments.id, documentId));
    });

    try {
      // Step 2: Generate the document
      const result = await step.run('generate-document-content', async () => {
        const diagnosticData = event.data.diagnosticData || {};
        return generateDocumentContent(
          documentType,
          documentName,
          diagnosticData,
          userId,
          documentId
        );
      });

      // Step 3: Update status to 'completed'
      await step.run('update-status-completed', async () => {
        await db
          .update(toolkitDocuments)
          .set({
            status: 'completed',
            s3Key: result.s3Key,
            fileSizeBytes: result.fileSizeBytes,
            generatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(toolkitDocuments.id, documentId));
      });

      // Step 4: Emit completion event for progress tracking
      await step.sendEvent('notify-document-completed', {
        name: 'toolkit/document.completed',
        data: {
          documentId,
          purchaseId,
          userId,
          status: 'completed' as const,
          documentName,
        },
      });

      return {
        success: true,
        documentId,
        documentName,
        s3Key: result.s3Key,
      };
    } catch (error) {
      // On final failure (attempt >= 3), update status to 'failed'
      if (attempt >= 3) {
        await step.run('update-status-failed', async () => {
          await db
            .update(toolkitDocuments)
            .set({
              status: 'failed',
              errorMessage:
                error instanceof Error ? error.message : 'Unknown error',
              updatedAt: new Date(),
            })
            .where(eq(toolkitDocuments.id, documentId));
        });

        // Emit failed completion event
        await step.sendEvent('notify-document-failed', {
          name: 'toolkit/document.completed',
          data: {
            documentId,
            purchaseId,
            userId,
            status: 'failed' as const,
            documentName,
          },
        });

        return {
          success: false,
          documentId,
          documentName,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      // Re-throw to trigger retry
      throw error;
    }
  }
);
