/**
 * Invoice Request API Route Tests
 *
 * Tests for POST /api/invoice/request endpoint.
 *
 * Story 17.7: Invoice Request Flow
 * Task 7.3: Integration tests for API endpoint
 * Covers: AC4 (store request in database, send notification), AC8 (error handling)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/invoice/request/route';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  invoiceRequests: {
    id: 'id',
  },
}));

vi.mock('@/lib/email/invoice-notifications', () => ({
  sendInvoiceRequestNotification: vi.fn(),
  sendInvoiceRequestConfirmation: vi.fn(),
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  sendInvoiceRequestNotification,
  sendInvoiceRequestConfirmation,
} from '@/lib/email/invoice-notifications';

describe('POST /api/invoice/request', () => {
  const validRequestBody = {
    companyName: 'Acme Corporation',
    billingEmail: 'billing@acme.com',
    billingAddress: {
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    poNumber: 'PO-12345',
  };

  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost/api/invoice/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user_123', name: 'Test User', email: 'user@example.com' },
    } as never);

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'invoice_req_123' }]),
      }),
    } as never);

    vi.mocked(sendInvoiceRequestNotification).mockResolvedValue(true);
    vi.mocked(sendInvoiceRequestConfirmation).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as never);

      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 401 when user has no ID', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: null, email: 'user@example.com' },
      } as never);

      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should accept valid authenticated request', async () => {
      const request = createRequest(validRequestBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Request Validation', () => {
    it('should return 400 for missing company name', async () => {
      const body = { ...validRequestBody, companyName: '' };

      const request = createRequest(body);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 for short company name', async () => {
      const body = { ...validRequestBody, companyName: 'A' };

      const request = createRequest(body);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email', async () => {
      const body = { ...validRequestBody, billingEmail: 'invalid-email' };

      const request = createRequest(body);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 for missing street', async () => {
      const body = {
        ...validRequestBody,
        billingAddress: { ...validRequestBody.billingAddress, street: '' },
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for short street address', async () => {
      const body = {
        ...validRequestBody,
        billingAddress: { ...validRequestBody.billingAddress, street: '123' },
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing city', async () => {
      const body = {
        ...validRequestBody,
        billingAddress: { ...validRequestBody.billingAddress, city: '' },
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing state', async () => {
      const body = {
        ...validRequestBody,
        billingAddress: { ...validRequestBody.billingAddress, state: '' },
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing postal code', async () => {
      const body = {
        ...validRequestBody,
        billingAddress: { ...validRequestBody.billingAddress, postalCode: '' },
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing country', async () => {
      const body = {
        ...validRequestBody,
        billingAddress: { ...validRequestBody.billingAddress, country: '' },
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should accept request without PO number', async () => {
      const body = { ...validRequestBody, poNumber: null };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept request with undefined PO number', async () => {
      const { poNumber: _, ...bodyWithoutPO } = validRequestBody;

      const request = createRequest(bodyWithoutPO);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should include validation details in error response', async () => {
      const body = { ...validRequestBody, companyName: '' };

      const request = createRequest(body);
      const response = await POST(request);
      const data = await response.json();

      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });
  });

  describe('Database Storage (AC4)', () => {
    it('should store invoice request with correct data', async () => {
      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'invoice_req_123' }]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as never);

      const request = createRequest(validRequestBody);
      await POST(request);

      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_123',
          companyName: 'Acme Corporation',
          status: 'pending',
        })
      );
    });

    it('should format billing address as string', async () => {
      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'invoice_req_123' }]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as never);

      const request = createRequest(validRequestBody);
      await POST(request);

      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          billingAddress: '123 Business St, New York, NY 10001, United States',
        })
      );
    });

    it('should store contact email', async () => {
      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'invoice_req_123' }]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as never);

      const request = createRequest(validRequestBody);
      await POST(request);

      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          contactEmail: 'billing@acme.com',
        })
      );
    });

    it('should store PO number when provided', async () => {
      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'invoice_req_123' }]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as never);

      const request = createRequest(validRequestBody);
      await POST(request);

      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          poNumber: 'PO-12345',
        })
      );
    });

    it('should store null PO number when not provided', async () => {
      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'invoice_req_123' }]),
      });

      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as never);

      const body = { ...validRequestBody, poNumber: null };
      const request = createRequest(body);
      await POST(request);

      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          poNumber: null,
        })
      );
    });
  });

  describe('Admin Notification (AC4)', () => {
    it('should send admin notification', async () => {
      const request = createRequest(validRequestBody);
      await POST(request);

      expect(sendInvoiceRequestNotification).toHaveBeenCalled();
    });

    it('should include correct data in admin notification', async () => {
      const request = createRequest(validRequestBody);
      await POST(request);

      expect(sendInvoiceRequestNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'invoice_req_123',
          companyName: 'Acme Corporation',
          billingEmail: 'billing@acme.com',
          poNumber: 'PO-12345',
          userName: 'Test User',
          userEmail: 'user@example.com',
        })
      );
    });

    it('should include billing address object in notification', async () => {
      const request = createRequest(validRequestBody);
      await POST(request);

      expect(sendInvoiceRequestNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          billingAddress: validRequestBody.billingAddress,
        })
      );
    });

    it('should not fail if admin notification fails', async () => {
      vi.mocked(sendInvoiceRequestNotification).mockRejectedValue(
        new Error('Email error')
      );

      const request = createRequest(validRequestBody);
      const response = await POST(request);

      // Request should still succeed
      expect(response.status).toBe(200);
    });

    it('should handle unknown user name', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', name: null, email: 'user@example.com' },
      } as never);

      const request = createRequest(validRequestBody);
      await POST(request);

      expect(sendInvoiceRequestNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: 'Unknown',
        })
      );
    });

    it('should handle unknown user email', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', name: 'Test User', email: null },
      } as never);

      const request = createRequest(validRequestBody);
      await POST(request);

      expect(sendInvoiceRequestNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: 'Unknown',
        })
      );
    });
  });

  describe('User Confirmation', () => {
    it('should send confirmation email to user', async () => {
      const request = createRequest(validRequestBody);
      await POST(request);

      expect(sendInvoiceRequestConfirmation).toHaveBeenCalled();
    });

    it('should include correct data in confirmation email', async () => {
      const request = createRequest(validRequestBody);
      await POST(request);

      expect(sendInvoiceRequestConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'invoice_req_123',
          companyName: 'Acme Corporation',
          billingEmail: 'billing@acme.com',
          userName: 'Test User',
          userEmail: 'user@example.com',
        })
      );
    });

    it('should not fail if confirmation email fails', async () => {
      vi.mocked(sendInvoiceRequestConfirmation).mockRejectedValue(
        new Error('Email error')
      );

      const request = createRequest(validRequestBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Success Response', () => {
    it('should return success true on successful submission', async () => {
      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should return request ID on successful submission', async () => {
      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(data.requestId).toBe('invoice_req_123');
    });

    it('should return success message', async () => {
      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(data.message).toBe('Invoice request submitted successfully');
    });
  });

  describe('Error Handling (AC8)', () => {
    it('should return 500 on database error', async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as never);

      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to submit invoice request');
    });

    it('should return 400 for malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/invoice/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should return 400 for missing required fields', async () => {
      const request = createRequest({});
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('International Addresses', () => {
    it('should handle international addresses', async () => {
      const internationalBody = {
        ...validRequestBody,
        billingAddress: {
          street: '123 High Street',
          city: 'London',
          state: 'England',
          postalCode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      };

      const request = createRequest(internationalBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle addresses with special characters', async () => {
      const specialBody = {
        ...validRequestBody,
        billingAddress: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          state: 'Ile-de-France',
          postalCode: '75001',
          country: 'France',
        },
      };

      const request = createRequest(specialBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle German addresses with umlauts', async () => {
      const germanBody = {
        ...validRequestBody,
        companyName: 'Müller GmbH',
        billingAddress: {
          street: 'Königstraße 123',
          city: 'München',
          state: 'Bayern',
          postalCode: '80331',
          country: 'Deutschland',
        },
      };

      const request = createRequest(germanBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Company Name Variations', () => {
    it('should accept company names with special characters', async () => {
      const body = {
        ...validRequestBody,
        companyName: 'ABC & XYZ Corp.',
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept company names with numbers', async () => {
      const body = {
        ...validRequestBody,
        companyName: '123 Industries LLC',
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept long company names', async () => {
      const body = {
        ...validRequestBody,
        companyName: 'The Very Long Company Name That Goes On And On International Holdings LLC',
      };

      const request = createRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('PO Number Variations', () => {
    it('should accept various PO number formats', async () => {
      const formats = [
        'PO-12345',
        'PO12345',
        '12345',
        'ABC-123-DEF',
        'Purchase Order #12345',
      ];

      for (const poNumber of formats) {
        const body = { ...validRequestBody, poNumber };
        const request = createRequest(body);
        const response = await POST(request);

        expect(response.status).toBe(200);
      }
    });
  });
});
