/**
 * Document Retry API
 *
 * POST /api/documents/[documentId]/retry - Retry failed document generation
 *
 * Story 18.6: Generation Progress & Status UI
 * Task 2: Create retry endpoint
 * Covers: AC4 (retry failed documents)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { toolkitDocuments, diagnosticResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';

interface RetryResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
): Promise<NextResponse<RetryResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to retry generation' },
        { status: 401 }
      );
    }

    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns this document and it's in failed state
    const document = await db
      .select({
        id: toolkitDocuments.id,
        purchaseId: toolkitDocuments.purchaseId,
        userId: toolkitDocuments.userId,
        documentType: toolkitDocuments.documentType,
        documentName: toolkitDocuments.documentName,
        status: toolkitDocuments.status,
      })
      .from(toolkitDocuments)
      .where(
        and(
          eq(toolkitDocuments.id, documentId),
          eq(toolkitDocuments.userId, session.user.id)
        )
      )
      .limit(1);

    if (!document[0]) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document[0].status !== 'failed') {
      return NextResponse.json(
        { success: false, error: 'Only failed documents can be retried' },
        { status: 400 }
      );
    }

    // Get diagnostic data for regeneration
    const diagnosticData = await db
      .select({ toolResults: diagnosticResults.toolResults })
      .from(diagnosticResults)
      .where(eq(diagnosticResults.userId, session.user.id))
      .limit(1);

    // Reset document status to pending
    await db
      .update(toolkitDocuments)
      .set({
        status: 'pending',
        errorMessage: null,
        attempts: 0,
        updatedAt: new Date(),
      })
      .where(eq(toolkitDocuments.id, documentId));

    // Trigger regeneration via Inngest
    await inngest.send({
      name: 'toolkit/document.generate',
      data: {
        documentId: document[0].id,
        userId: session.user.id,
        purchaseId: document[0].purchaseId,
        documentType: document[0].documentType,
        documentName: document[0].documentName,
        documentIndex: 0,
        diagnosticData: diagnosticData[0]?.toolResults || {},
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document regeneration started',
    });
  } catch (error) {
    console.error('[documents/retry/POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retry document generation' },
      { status: 500 }
    );
  }
}
