/**
 * Document Download API Tests
 *
 * Tests for GET /api/downloads/[documentId] endpoint.
 *
 * Story 18.5: Download Portal Page
 * Task 3.2: Tests for download API endpoint
 * Covers: AC5 (time-limited download links), authentication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock download service
vi.mock('@/lib/services/download-service', () => ({
  generateDownloadUrl: vi.fn(),
  verifyDownloadAccess: vi.fn(),
}));

import { auth } from '@/auth';
import {
  generateDownloadUrl,
  verifyDownloadAccess,
} from '@/lib/services/download-service';

describe('GET /api/downloads/[documentId]', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockDocumentId = 'doc-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest(
      `http://localhost/api/downloads/${mockDocumentId}`,
      {
        method: 'GET',
      }
    );
  };

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('You must be signed in to download documents');
    });

    it('should return 401 when user ID is missing', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as never);

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('Access Control', () => {
    it('should return 403 when user has not purchased', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(false);

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Purchase required to download documents');
    });

    it('should verify download access with correct user ID', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(generateDownloadUrl).mockResolvedValue({
        success: true,
        url: 'https://s3.example.com/doc',
        fileName: 'test.docx',
      });

      const request = createRequest();
      await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });

      expect(verifyDownloadAccess).toHaveBeenCalledWith('user-123');
    });
  });

  describe('Document ID Validation', () => {
    it('should return 400 when document ID is empty', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: '' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Document ID is required');
    });
  });

  describe('Download URL Generation', () => {
    it('should return download URL for valid document', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(generateDownloadUrl).mockResolvedValue({
        success: true,
        url: 'https://s3.example.com/presigned-url',
        fileName: 'Strategic_Alignment_Brief.docx',
      });

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.url).toBe('https://s3.example.com/presigned-url');
      expect(data.fileName).toBe('Strategic_Alignment_Brief.docx');
    });

    it('should call generateDownloadUrl with correct parameters', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(generateDownloadUrl).mockResolvedValue({
        success: true,
        url: 'https://s3.example.com/doc',
        fileName: 'test.docx',
      });

      const request = createRequest();
      await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });

      expect(generateDownloadUrl).toHaveBeenCalledWith(
        mockDocumentId,
        'user-123'
      );
    });

    it('should return 404 when document is not found', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(generateDownloadUrl).mockResolvedValue({
        success: false,
        error: 'Document not found',
      });

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: 'nonexistent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Document not found');
    });

    it('should return 404 when document is not ready', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(generateDownloadUrl).mockResolvedValue({
        success: false,
        error: 'Document not ready for download',
      });

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Document not ready for download');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when an unexpected error occurs', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockRejectedValue(
        new Error('Database error')
      );

      const request = createRequest();
      const response = await GET(request, {
        params: Promise.resolve({ documentId: mockDocumentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to generate download URL');
    });
  });
});
