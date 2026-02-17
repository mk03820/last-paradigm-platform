/**
 * Invoice Request API Route
 *
 * POST /api/invoice/request - Submit an enterprise invoice request
 *
 * Story 17.7: Invoice Request Flow
 * Task 4: Create invoice request API endpoint (AC: 4, 8)
 * Covers: AC4 (store request in database, send notification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { invoiceRequests } from '@/lib/db/schema';
import {
  sendInvoiceRequestNotification,
  sendInvoiceRequestConfirmation,
} from '@/lib/email/invoice-notifications';

/**
 * Invoice request validation schema
 */
const invoiceRequestSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  billingEmail: z.string().email('Valid email is required'),
  billingAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    postalCode: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  poNumber: z.string().nullable().optional(),
});

type InvoiceRequestData = z.infer<typeof invoiceRequestSchema>;

/**
 * Success response type
 */
interface SuccessResponse {
  success: true;
  requestId: string;
  message: string;
}

/**
 * Error response type
 */
interface ErrorResponse {
  success: false;
  error: string;
  details?: z.ZodIssue[];
}

/**
 * POST /api/invoice/request
 *
 * Creates a new invoice request and notifies admin.
 *
 * Requires authentication.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Verify authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = invoiceRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Format billing address as string for database
    const { billingAddress } = data;
    const formattedAddress = `${billingAddress.street}, ${billingAddress.city}, ${billingAddress.state} ${billingAddress.postalCode}, ${billingAddress.country}`;

    // Create invoice request in database
    const [invoiceRequest] = await db
      .insert(invoiceRequests)
      .values({
        userId: session.user.id,
        companyName: data.companyName,
        billingAddress: formattedAddress,
        contactEmail: data.billingEmail,
        poNumber: data.poNumber || null,
        status: 'pending',
      })
      .returning({ id: invoiceRequests.id });

    console.log(
      `[Invoice Request] Created request ${invoiceRequest.id} for user ${session.user.id}`
    );

    // Send admin notification (non-blocking)
    sendInvoiceRequestNotification({
      requestId: invoiceRequest.id,
      companyName: data.companyName,
      billingEmail: data.billingEmail,
      billingAddress: data.billingAddress,
      poNumber: data.poNumber,
      userName: session.user.name || 'Unknown',
      userEmail: session.user.email || 'Unknown',
    }).catch((error) => {
      console.error('[Invoice Request] Failed to send admin notification:', error);
    });

    // Send confirmation to user (non-blocking)
    sendInvoiceRequestConfirmation({
      requestId: invoiceRequest.id,
      companyName: data.companyName,
      billingEmail: data.billingEmail,
      billingAddress: data.billingAddress,
      poNumber: data.poNumber,
      userName: session.user.name || 'Unknown',
      userEmail: session.user.email || 'Unknown',
    }).catch((error) => {
      console.error('[Invoice Request] Failed to send confirmation email:', error);
    });

    return NextResponse.json({
      success: true,
      requestId: invoiceRequest.id,
      message: 'Invoice request submitted successfully',
    });
  } catch (error) {
    console.error('[Invoice Request] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit invoice request' },
      { status: 500 }
    );
  }
}
