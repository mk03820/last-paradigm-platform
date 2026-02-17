/**
 * Toolkit Status API
 *
 * GET /api/toolkit/status - Get document generation status
 *
 * Story 18.6: Generation Progress & Status UI
 * Provides status for useDocumentStatus hook
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserDocuments } from '@/lib/services/download-service';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in' },
        { status: 401 }
      );
    }

    const documents = await getUserDocuments(session.user.id);

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('[toolkit/status/GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
