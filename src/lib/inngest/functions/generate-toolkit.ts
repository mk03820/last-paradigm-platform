/**
 * Toolkit Generation Orchestrator
 *
 * Inngest function that orchestrates the generation of all 10 toolkit documents.
 * Spawns individual document generation jobs in parallel.
 *
 * Covers: Story 18.1 Task 3, FR71 (Background job processing)
 */

import { inngest } from '../client';
import { db } from '@/lib/db';
import { toolkitDocuments } from '@/lib/db/schema';
import type { ToolkitDocumentType } from '../client';

/**
 * The 10 toolkit documents to be generated for each purchase.
 * 5 Word, 3 Excel, 1 PowerPoint, 1 PDF
 */
export const TOOLKIT_DOCUMENTS: ReadonlyArray<{
  type: ToolkitDocumentType;
  name: string;
}> = [
  // Word Documents (5)
  { type: 'word', name: 'Strategic Alignment Brief' },
  { type: 'word', name: 'Stakeholder Communication Pack' },
  { type: 'word', name: 'Decision Framework Guide' },
  { type: 'word', name: 'Data Flow Optimization Plan' },
  { type: 'word', name: 'Communication Improvement Playbook' },
  // Excel Documents (3)
  { type: 'excel', name: 'Meeting Cost Tracker' },
  { type: 'excel', name: 'Alignment Tax Calculator' },
  { type: 'excel', name: 'Transformation Roadmap Planner' },
  // PowerPoint (1)
  { type: 'pptx', name: 'Executive Presentation Deck' },
  // PDF (1)
  { type: 'pdf', name: 'Board Summary Report' },
] as const;

/**
 * Generate Toolkit Orchestrator Function
 *
 * Triggered when a user completes a purchase. Creates document records
 * and spawns parallel jobs for each document.
 */
export const generateToolkit = inngest.createFunction(
  {
    id: 'generate-toolkit',
    name: 'Generate Toolkit Documents',
  },
  { event: 'toolkit/generate' },
  async ({ event, step }) => {
    const { userId, purchaseId, diagnosticData } = event.data;

    // Step 1: Create all document records with status 'pending'
    const documentRecords = await step.run(
      'create-document-records',
      async () => {
        const docs = TOOLKIT_DOCUMENTS.map((doc) => ({
          purchaseId,
          userId,
          documentType: doc.type,
          documentName: doc.name,
          status: 'pending' as const,
          attempts: 0,
        }));

        const inserted = await db
          .insert(toolkitDocuments)
          .values(docs)
          .returning();

        return inserted;
      }
    );

    // Step 2: Spawn individual document generation jobs in parallel
    await step.sendEvent(
      'spawn-document-jobs',
      documentRecords.map((doc, index) => ({
        name: 'toolkit/document.generate' as const,
        data: {
          documentId: doc.id,
          userId,
          purchaseId,
          documentType: doc.documentType,
          documentName: doc.documentName,
          documentIndex: index + 1,
          diagnosticData,
        },
      }))
    );

    return {
      success: true,
      purchaseId,
      documentsCreated: documentRecords.length,
      documentIds: documentRecords.map((d) => d.id),
    };
  }
);
