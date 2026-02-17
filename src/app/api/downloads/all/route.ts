/**
 * Download All Documents API
 *
 * GET /api/downloads/all - Generate presigned URLs for all completed documents
 *
 * Story 18.5: Download Portal Page
 * Task 4.1: Create Download All endpoint
 * Covers: AC6 (Download All option)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  verifyDownloadAccess,
  getCompletedDocumentsForZip,
  getPresignedUrlForKey,
} from '@/lib/services/download-service';

interface DownloadAllResponse {
  success: boolean;
  urls?: Array<{ url: string; fileName: string }>;
  error?: string;
}

export async function GET(): Promise<NextResponse<DownloadAllResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to download documents' },
        { status: 401 }
      );
    }

    const hasAccess = await verifyDownloadAccess(session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Purchase required to download documents' },
        { status: 403 }
      );
    }

    const documents = await getCompletedDocumentsForZip(session.user.id);

    if (documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No completed documents available' },
        { status: 404 }
      );
    }

    const urls = await Promise.all(
      documents.map(async (doc) => ({
        url: await getPresignedUrlForKey(doc.s3Key, doc.fileName),
        fileName: doc.fileName,
      }))
    );

    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error('[downloads/all/GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate download URLs' },
      { status: 500 }
    );
  }
}
