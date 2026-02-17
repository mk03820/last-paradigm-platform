/**
 * Toolkit Status Service Tests
 *
 * Story 19.3: Purchase Status & Toolkit Access
 * Task 9: Create download portal availability service (AC: 6)
 * Task 10.3: Test download portal availability fallback
 *
 * Tests toolkit status checking for download portal availability.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getToolkitStatus, type ToolkitStatus } from './toolkit-status';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value, type: 'eq' })),
}));

// Mock schema
vi.mock('@/lib/db/schema', () => ({
  toolkitDocuments: {
    userId: 'user_id',
    status: 'status',
  },
}));

describe('getToolkitStatus', () => {
  const mockUserId = 'user_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no documents exist', () => {
    it('returns available: false with 0 documents ready', async () => {
      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getToolkitStatus(mockUserId);

      expect(result).toEqual({
        available: false,
        documentsReady: 0,
        totalDocuments: 10,
        isGenerating: false,
        failedDocuments: 0,
      });
    });
  });

  describe('when all documents are completed', () => {
    it('returns available: true with 10 documents ready', async () => {
      const { db } = await import('@/lib/db');
      const completedDocs = Array(10).fill({ status: 'completed' });

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(completedDocs),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getToolkitStatus(mockUserId);

      expect(result.available).toBe(true);
      expect(result.documentsReady).toBe(10);
      expect(result.totalDocuments).toBe(10);
      expect(result.isGenerating).toBe(false);
    });
  });

  describe('when documents are generating', () => {
    it('returns isGenerating: true with partial completion', async () => {
      const { db } = await import('@/lib/db');
      const mixedDocs = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'generating' },
        { status: 'generating' },
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mixedDocs),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getToolkitStatus(mockUserId);

      expect(result.available).toBe(false);
      expect(result.documentsReady).toBe(3);
      expect(result.isGenerating).toBe(true);
      expect(result.failedDocuments).toBe(0);
    });
  });

  describe('when some documents have failed', () => {
    it('returns failedDocuments count', async () => {
      const { db } = await import('@/lib/db');
      const docsWithFailures = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'failed' },
        { status: 'failed' },
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(docsWithFailures),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getToolkitStatus(mockUserId);

      expect(result.available).toBe(false);
      expect(result.documentsReady).toBe(2);
      expect(result.failedDocuments).toBe(2);
    });
  });

  describe('error handling', () => {
    it('returns graceful fallback when database query fails', async () => {
      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      // Should not throw
      const result = await getToolkitStatus(mockUserId);

      expect(result).toEqual({
        available: false,
        documentsReady: 0,
        totalDocuments: 10,
        isGenerating: false,
        failedDocuments: 0,
      });
    });

    it('returns graceful fallback when toolkit_documents table does not exist', async () => {
      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('relation "toolkit_documents" does not exist')),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getToolkitStatus(mockUserId);

      expect(result.available).toBe(false);
      expect(result.documentsReady).toBe(0);
    });
  });

  describe('type safety', () => {
    it('returns correct ToolkitStatus shape', async () => {
      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result: ToolkitStatus = await getToolkitStatus(mockUserId);

      // Type checks - these should compile
      const _available: boolean = result.available;
      const _ready: number = result.documentsReady;
      const _total: number = result.totalDocuments;
      const _generating: boolean = result.isGenerating;
      const _failed: number = result.failedDocuments;

      expect(typeof result.available).toBe('boolean');
      expect(typeof result.documentsReady).toBe('number');
      expect(typeof result.totalDocuments).toBe('number');
      expect(typeof result.isGenerating).toBe('boolean');
      expect(typeof result.failedDocuments).toBe('number');
    });
  });
});
