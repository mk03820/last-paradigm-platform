/**
 * Toolkit Status API Tests
 *
 * Tests for GET /api/toolkit/status endpoint.
 *
 * Story 18.6: Generation Progress & Status UI
 * Provides status for useDocumentStatus hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock download service
vi.mock('@/lib/services/download-service', () => ({
  getUserDocuments: vi.fn(),
}));

import { auth } from '@/auth';
import { getUserDocuments } from '@/lib/services/download-service';

describe('GET /api/toolkit/status', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockDocuments = [
    {
      id: 'doc-1',
      documentName: 'Strategic Alignment Brief',
      documentType: 'word',
      status: 'completed',
      fileSizeBytes: 102400,
      errorMessage: null,
      generatedAt: new Date(),
    },
    {
      id: 'doc-2',
      documentName: 'Meeting Cost Tracker',
      documentType: 'excel',
      status: 'generating',
      fileSizeBytes: null,
      errorMessage: null,
      generatedAt: null,
    },
    {
      id: 'doc-3',
      documentName: 'Executive Presentation',
      documentType: 'pptx',
      status: 'failed',
      fileSizeBytes: null,
      errorMessage: 'Template not found',
      generatedAt: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('You must be signed in');
    });

    it('should return 401 when user ID is missing', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as never);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('Document Retrieval', () => {
    it('should return documents for authenticated user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(getUserDocuments).mockResolvedValue(mockDocuments as never);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.documents).toHaveLength(3);
    });

    it('should call getUserDocuments with correct user ID', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(getUserDocuments).mockResolvedValue([]);

      await GET();

      expect(getUserDocuments).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array when no documents', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(getUserDocuments).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.documents).toHaveLength(0);
    });

    it('should return documents with correct structure', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(getUserDocuments).mockResolvedValue(mockDocuments as never);

      const response = await GET();
      const data = await response.json();

      expect(data.documents[0]).toMatchObject({
        id: 'doc-1',
        documentName: 'Strategic Alignment Brief',
        documentType: 'word',
        status: 'completed',
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when getUserDocuments throws', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(getUserDocuments).mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch status');
    });
  });
});
