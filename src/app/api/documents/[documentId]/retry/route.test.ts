/**
 * Document Retry API Tests
 *
 * Tests for POST /api/documents/[documentId]/retry endpoint.
 *
 * Story 18.6: Generation Progress & Status UI
 * Task 2: Tests for retry endpoint
 * Covers: AC4 (retry failed documents)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

// Mock Inngest client
vi.mock('@/lib/inngest/client', () => ({
  inngest: {
    send: vi.fn(),
  },
}));

// Mock schema
vi.mock('@/lib/db/schema', () => ({
  toolkitDocuments: {
    id: 'id',
    purchaseId: 'purchaseId',
    userId: 'userId',
    documentType: 'documentType',
    documentName: 'documentName',
    status: 'status',
    errorMessage: 'errorMessage',
    attempts: 'attempts',
    updatedAt: 'updatedAt',
  },
  diagnosticResults: {
    userId: 'userId',
    toolResults: 'toolResults',
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions })),
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';

describe('POST /api/documents/[documentId]/retry', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockDocumentId = 'doc-123';

  const mockDocument = {
    id: mockDocumentId,
    purchaseId: 'purchase-123',
    userId: 'user-123',
    documentType: 'word',
    documentName: 'Strategic Alignment Brief',
    status: 'failed',
  };

  const mockDiagnosticData = {
    toolResults: {
      tool1: { scores: { strategic: 75 } },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest(
      `http://localhost/api/documents/${mockDocumentId}/retry`,
      {
        method: 'POST',
      }
    );
  };

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as never);

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('You must be signed in to retry generation');
    });

    it('should return 401 when user ID is missing', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as never);

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('Document ID Validation', () => {
    it('should return 400 when document ID is empty', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: '' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Document ID is required');
    });
  });

  describe('Document Ownership', () => {
    it('should return 404 when document not found', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Document not found');
    });
  });

  describe('Status Validation', () => {
    it('should return 400 when document is not in failed state', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockDocument, status: 'completed' }]),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Only failed documents can be retried');
    });

    it('should return 400 when document is generating', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockDocument, status: 'generating' }]),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Only failed documents can be retried');
    });

    it('should return 400 when document is pending', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockDocument, status: 'pending' }]),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Only failed documents can be retried');
    });
  });

  describe('Successful Retry', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);

      // First select for document
      // Second select for diagnostic data
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockDocument]),
              }),
            }),
          } as never;
        }
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockDiagnosticData]),
            }),
          }),
        } as never;
      });

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      } as never);

      vi.mocked(inngest.send).mockResolvedValue({} as never);
    });

    it('should return success for failed document retry', async () => {
      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Document regeneration started');
    });

    it('should reset document status to pending', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      });
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const request = createRequest();
      await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });

      expect(db.update).toHaveBeenCalled();
    });

    it('should trigger Inngest regeneration event', async () => {
      const request = createRequest();
      await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });

      expect(inngest.send).toHaveBeenCalledWith({
        name: 'toolkit/document.generate',
        data: expect.objectContaining({
          documentId: mockDocumentId,
          userId: 'user-123',
          purchaseId: 'purchase-123',
          documentType: 'word',
          documentName: 'Strategic Alignment Brief',
        }),
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when database error occurs', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to retry document generation');
    });

    it('should return 500 when Inngest send fails', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);

      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockDocument]),
              }),
            }),
          } as never;
        }
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockDiagnosticData]),
            }),
          }),
        } as never;
      });

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      } as never);

      vi.mocked(inngest.send).mockRejectedValue(new Error('Inngest unavailable'));

      const request = createRequest();
      const response = await POST(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
