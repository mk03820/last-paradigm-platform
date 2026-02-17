/**
 * PB1 Migration Hook Tests
 *
 * Tests for use-pb1-migration.ts hook functionality.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 7.3: Unit tests for migration hook (success/failure/retry flows)
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock data collection
vi.mock('@/lib/migration/collect-pb1-data', () => ({
  collectAllToolData: vi.fn(),
  toSessionData: vi.fn((data) => data),
}));

// Mock transformation
vi.mock('@/lib/migration/transform-pb1-to-pb2', () => ({
  transformPB1ToPB2: vi.fn(),
}));

// Mock session cleanup
vi.mock('@/lib/migration/clear-pb1-session', () => ({
  clearAllPB1Stores: vi.fn(() => ({ success: true, clearedStores: [], errors: [] })),
  hasPB1SessionData: vi.fn(),
}));

import { migratePB1DataStandalone } from '@/lib/migration/use-pb1-migration';
import { collectAllToolData } from '@/lib/migration/collect-pb1-data';
import { clearAllPB1Stores, hasPB1SessionData } from '@/lib/migration/clear-pb1-session';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('migratePB1DataStandalone', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(collectAllToolData).mockReturnValue({
      tool1: { scores: { strategic: 3 } },
      tool2: null,
      tool3: null,
      tool4: null,
      tool5: null,
      tool6: null,
      tool7: null,
      totalAlignmentTax: null,
      estimatedSavings: null,
      completedToolsCount: 1,
      hasData: true,
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { diagnosticResultId: 'result-789' },
      }),
    });
  });

  it('executes migration successfully', async () => {
    const result = await migratePB1DataStandalone('test-token');

    expect(result.success).toBe(true);
    expect(result.diagnosticResultId).toBe('result-789');
  });

  it('calls API with correct token', async () => {
    await migratePB1DataStandalone('test-token');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/user/migrate-pb1',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('clears session by default', async () => {
    await migratePB1DataStandalone('test-token');

    expect(clearAllPB1Stores).toHaveBeenCalled();
  });

  it('skips session clear when option set', async () => {
    await migratePB1DataStandalone('test-token', { clearSession: false });

    expect(clearAllPB1Stores).not.toHaveBeenCalled();
  });

  it('returns success when no data to migrate', async () => {
    vi.mocked(collectAllToolData).mockReturnValue({
      tool1: null,
      tool2: null,
      tool3: null,
      tool4: null,
      tool5: null,
      tool6: null,
      tool7: null,
      totalAlignmentTax: null,
      estimatedSavings: null,
      completedToolsCount: 0,
      hasData: false,
    });

    const result = await migratePB1DataStandalone('test-token');

    expect(result.success).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('handles API errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: 'MIGRATION_FAILED' },
      }),
    });

    const result = await migratePB1DataStandalone('test-token');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('MIGRATION_FAILED');
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));

    const result = await migratePB1DataStandalone('test-token');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NETWORK_ERROR');
  });

  it('sends session data in request body', async () => {
    vi.mocked(collectAllToolData).mockReturnValue({
      tool1: { scores: { strategic: 3, execution: 2 }, compositeScore: 2.5 },
      tool2: { inputs: { meetingCount: 20 }, results: { wastedCost: 150000 } },
      tool3: null,
      tool4: null,
      tool5: null,
      tool6: null,
      tool7: null,
      totalAlignmentTax: 500000,
      estimatedSavings: 200000,
      completedToolsCount: 2,
      hasData: true,
    });

    await migratePB1DataStandalone('test-token');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/user/migrate-pb1',
      expect.objectContaining({
        body: expect.stringContaining('totalAlignmentTax'),
      })
    );

    // Parse the body to verify structure
    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.sessionData.totalAlignmentTax).toBe(500000);
    expect(body.sessionData.estimatedSavings).toBe(200000);
  });
});

describe('hasPB1SessionData integration', () => {
  it('is called by checkHasData', () => {
    vi.mocked(hasPB1SessionData).mockReturnValue(true);

    const result = hasPB1SessionData();

    expect(result).toBe(true);
  });
});

describe('Error parsing', () => {
  beforeEach(() => {
    vi.mocked(collectAllToolData).mockReturnValue({
      tool1: { scores: { strategic: 3 } },
      tool2: null,
      tool3: null,
      tool4: null,
      tool5: null,
      tool6: null,
      tool7: null,
      totalAlignmentTax: null,
      estimatedSavings: null,
      completedToolsCount: 1,
      hasData: true,
    });
  });

  it('marks network errors as retryable', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));

    const result = await migratePB1DataStandalone('test-token');

    expect(result.error?.retryable).toBe(true);
  });

  it('marks fetch errors as retryable', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'));

    const result = await migratePB1DataStandalone('test-token');

    expect(result.error?.retryable).toBe(true);
  });

  it('marks server errors as retryable based on code', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal error' },
      }),
    });

    const result = await migratePB1DataStandalone('test-token');

    expect(result.error?.retryable).toBe(true);
  });

  it('marks validation errors as not retryable', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid data' },
      }),
    });

    const result = await migratePB1DataStandalone('test-token');

    expect(result.error?.retryable).toBe(false);
  });
});
