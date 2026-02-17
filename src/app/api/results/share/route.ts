/**
 * Share Results API Endpoint
 *
 * Generates a shareable read-only link for diagnostic results.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 5.1: Create share token API (AC: 5)
 * Covers: FR64 (Results sharing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// In a real implementation, you'd store share tokens in a database table
// For now, we'll use a simple approach with signed tokens

interface ShareRequest {
  diagnosticResultId: string;
}

interface ShareResponse {
  shareUrl: string;
  expiresAt: string;
}

/**
 * Generate a simple share token
 * In production, use a proper JWT or database-backed token
 */
function generateShareToken(resultId: string, userId: string): string {
  // Simple base64 encoding of result ID with timestamp
  // In production, use crypto signing
  const data = {
    rid: resultId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ShareResponse | { error: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ShareRequest = await request.json();
    const { diagnosticResultId } = body;

    if (!diagnosticResultId) {
      return NextResponse.json(
        { error: 'Missing diagnosticResultId' },
        { status: 400 }
      );
    }

    // Verify the result belongs to the user
    const result = await db
      .select({ id: diagnosticResults.id })
      .from(diagnosticResults)
      .where(
        and(
          eq(diagnosticResults.id, diagnosticResultId),
          eq(diagnosticResults.userId, session.user.id)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Generate share token
    const token = generateShareToken(diagnosticResultId, session.user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Build share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/results/${token}`;

    const response: ShareResponse = {
      shareUrl,
      expiresAt: expiresAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
