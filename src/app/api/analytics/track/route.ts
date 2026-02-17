/**
 * Analytics Tracking API Route
 *
 * Receives analytics events from the client and stores them in the database.
 * Provides server-side backup for critical events.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 7: Create analytics database schema (AC: 6)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';
import { z } from 'zod';

/**
 * Event payload validation schema
 */
const eventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional().default({}),
  timestamp: z.string().datetime().optional(),
  userId: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
});

/**
 * Hash an IP address for privacy
 * Only keeps first two octets for rough geolocation
 */
function hashIP(ip: string): string {
  if (!ip) return '';

  // Handle IPv6 addresses
  if (ip.includes(':')) {
    // For IPv6, just take first segment
    const parts = ip.split(':');
    return Buffer.from(parts.slice(0, 2).join(':')).toString('base64');
  }

  // For IPv4, take first two octets
  const parts = ip.split('.');
  if (parts.length < 2) return '';

  return Buffer.from(parts.slice(0, 2).join('.')).toString('base64');
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs; take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback (may not work in all environments)
  return '';
}

/**
 * POST /api/analytics/track
 *
 * Receives analytics events and stores them in the database.
 * Always returns 200 to prevent analytics from breaking client functionality.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = eventSchema.safeParse(body);

    if (!parseResult.success) {
      // Log validation errors but still return 200
      console.error('Analytics validation error:', parseResult.error);
      return NextResponse.json({ success: false, error: 'Invalid event data' });
    }

    const event = parseResult.data;

    // Get additional context from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Store in database
    await db.insert(analyticsEvents).values({
      eventName: event.name,
      eventData: event.properties,
      userId: event.userId,
      sessionId: event.sessionId,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
      userAgent,
      ipHash,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);

    // Always return 200 - analytics should never break anything
    return NextResponse.json({
      success: false,
      error: 'Internal error',
    });
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Internal-Request',
    },
  });
}
