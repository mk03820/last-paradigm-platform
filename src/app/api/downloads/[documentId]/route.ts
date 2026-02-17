/**
 * Individual Document Download API
 *
 * GET /api/downloads/[documentId] - Generate presigned download URL
 *
 * Story 18.5: Download Portal Page
 * Task 3.2: Create download API endpoint
 * Covers: AC5 (time-limited download links)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  generateDownloadUrl,
  verifyDownloadAccess,
} from '@/lib/services/download-service';

interface DownloadResponse {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
): Promise<NextResponse<DownloadResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to download documents' },
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

    const hasAccess = await verifyDownloadAccess(session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Purchase required to download documents' },
        { status: 403 }
      );
    }

    const result = await generateDownloadUrl(documentId, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate download URL' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: result.fileName,
    });
  } catch (error) {
    console.error('[downloads/GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
