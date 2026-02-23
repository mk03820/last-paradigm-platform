/**
 * Download All Documents API Tests
 *
 * Tests for GET /api/downloads/all endpoint.
 *
 * Story 18.5: Download Portal Page
 * Task 4.1: Tests for Download All endpoint
 * Covers: AC6 (Download All option)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock download service
vi.mock('@/lib/services/download-service', () => ({
  verifyDownloadAccess: vi.fn(),
  getCompletedDocumentsForZip: vi.fn(),
  getPresignedUrlForKey: vi.fn(),
}));

import { auth } from '@/auth';
import {
  verifyDownloadAccess,
  getCompletedDocumentsForZip,
  getPresignedUrlForKey,
} from '@/lib/services/download-service';

describe('GET /api/downloads/all', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockDocuments = [
    { s3Key: 'user-123/doc1.docx', fileName: 'Strategic_Alignment_Brief.docx' },
    { s3Key: 'user-123/doc2.xlsx', fileName: 'Meeting_Cost_Tracker.xlsx' },
    { s3Key: 'user-123/doc3.pptx', fileName: 'Executive_Presentation.pptx' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as never);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('You must be signed in to download documents');
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

  describe('Access Control', () => {
    it('should return 403 when user has not purchased', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(false);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Purchase required to download documents');
    });

    it('should verify download access with correct user ID', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(getCompletedDocumentsForZip).mockResolvedValue(mockDocuments);
      vi.mocked(getPresignedUrlForKey).mockResolvedValue(
        'https://s3.example.com/presigned'
      );

      await GET();

      expect(verifyDownloadAccess).toHaveBeenCalledWith('user-123');
    });
  });

  describe('Document Retrieval', () => {
    it('should return 404 when no completed documents', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(getCompletedDocumentsForZip).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No completed documents available');
    });

    it('should fetch completed documents for user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(getCompletedDocumentsForZip).mockResolvedValue(mockDocuments);
      vi.mocked(getPresignedUrlForKey).mockResolvedValue(
        'https://s3.example.com/presigned'
      );

      await GET();

      expect(getCompletedDocumentsForZip).toHaveBeenCalledWith('user-123');
    });
  });

  describe('URL Generation', () => {
    it('should return presigned URLs for all completed documents', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(getCompletedDocumentsForZip).mockResolvedValue(mockDocuments);
      vi.mocked(getPresignedUrlForKey).mockImplementation(
        async (s3Key, fileName) => `https://s3.example.com/${fileName}`
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.urls).toHaveLength(3);
      expect(data.urls[0]).toEqual({
        url: 'https://s3.example.com/Strategic_Alignment_Brief.docx',
        fileName: 'Strategic_Alignment_Brief.docx',
      });
    });

    it('should generate presigned URL for each document', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(getCompletedDocumentsForZip).mockResolvedValue(mockDocuments);
      vi.mocked(getPresignedUrlForKey).mockResolvedValue(
        'https://s3.example.com/presigned'
      );

      await GET();

      expect(getPresignedUrlForKey).toHaveBeenCalledTimes(3);
      expect(getPresignedUrlForKey).toHaveBeenCalledWith(
        'user-123/doc1.docx',
        'Strategic_Alignment_Brief.docx'
      );
      expect(getPresignedUrlForKey).toHaveBeenCalledWith(
        'user-123/doc2.xlsx',
        'Meeting_Cost_Tracker.xlsx'
      );
      expect(getPresignedUrlForKey).toHaveBeenCalledWith(
        'user-123/doc3.pptx',
        'Executive_Presentation.pptx'
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when an unexpected error occurs', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(getCompletedDocumentsForZip).mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to generate download URLs');
    });

    it('should return 500 when presigned URL generation fails', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(verifyDownloadAccess).mockResolvedValue(true);
      vi.mocked(getCompletedDocumentsForZip).mockResolvedValue(mockDocuments);
      vi.mocked(getPresignedUrlForKey).mockRejectedValue(
        new Error('S3 error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
