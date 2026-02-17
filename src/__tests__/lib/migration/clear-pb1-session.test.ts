/**
 * PB1 Session Cleanup Tests
 *
 * Tests for clear-pb1-session.ts utility functions.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 7: Unit tests for session cleanup
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock all Zustand stores
const mockResetTool1 = vi.fn();
const mockClearSession = vi.fn();
const mockResetTool3 = vi.fn();
const mockResetTool4 = vi.fn();
const mockResetTool5 = vi.fn();
const mockResetTool6 = vi.fn();
const mockResetTool7 = vi.fn();

vi.mock('@/lib/store/tool1-store', () => ({
  useTool1Store: {
    getState: () => ({
      scores: {},
      resetTool1: mockResetTool1,
    }),
  },
}));

vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: {
    getState: () => ({
      meetingData: null,
      results: null,
      clearSession: mockClearSession,
    }),
  },
}));

vi.mock('@/lib/store/tool3-store', () => ({
  useTool3Store: {
    getState: () => ({
      archetypes: {
        budget: { samples: [] },
        hiring: { samples: [] },
        strategy: { samples: [] },
        technical: { samples: [] },
        policy: { samples: [] },
        vendor: { samples: [] },
      },
      resetTool3: mockResetTool3,
    }),
  },
}));

vi.mock('@/lib/store/tool4-store', () => ({
  useTool4Store: {
    getState: () => ({
      stakeholders: [],
      resetTool4: mockResetTool4,
    }),
  },
}));

vi.mock('@/lib/store/tool5-store', () => ({
  useTool5Store: {
    getState: () => ({
      journeys: [],
      frictionPoints: [],
      resetTool5: mockResetTool5,
    }),
  },
}));

vi.mock('@/lib/store/tool6-store', () => ({
  useTool6Store: {
    getState: () => ({
      email: null,
      chat: null,
      meetings: null,
      resetTool6: mockResetTool6,
    }),
  },
}));

vi.mock('@/lib/store/tool7-store', () => ({
  useTool7Store: {
    getState: () => ({
      aggregatedData: null,
      calculationResults: null,
      resetTool7: mockResetTool7,
    }),
  },
}));

import {
  clearAllPB1Stores,
  clearTool1Store,
  clearTool2Store,
  clearTool3Store,
  clearTool4Store,
  clearTool5Store,
  clearTool6Store,
  clearTool7Store,
  hasPB1SessionData,
} from '@/lib/migration/clear-pb1-session';

// Mock window for node environment
const mockSessionStorage = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

describe('clear-pb1-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup global window mock for node environment
    (global as unknown as { window: unknown }).window = {
      sessionStorage: mockSessionStorage,
    };
  });

  afterEach(() => {
    delete (global as unknown as { window?: unknown }).window;
  });

  describe('Individual store clear functions', () => {
    it('clearTool1Store calls resetTool1', () => {
      clearTool1Store();
      expect(mockResetTool1).toHaveBeenCalled();
    });

    it('clearTool2Store calls clearSession', () => {
      clearTool2Store();
      expect(mockClearSession).toHaveBeenCalled();
    });

    it('clearTool3Store calls resetTool3', () => {
      clearTool3Store();
      expect(mockResetTool3).toHaveBeenCalled();
    });

    it('clearTool4Store calls resetTool4', () => {
      clearTool4Store();
      expect(mockResetTool4).toHaveBeenCalled();
    });

    it('clearTool5Store calls resetTool5', () => {
      clearTool5Store();
      expect(mockResetTool5).toHaveBeenCalled();
    });

    it('clearTool6Store calls resetTool6', () => {
      clearTool6Store();
      expect(mockResetTool6).toHaveBeenCalled();
    });

    it('clearTool7Store calls resetTool7', () => {
      clearTool7Store();
      expect(mockResetTool7).toHaveBeenCalled();
    });
  });

  describe('clearAllPB1Stores', () => {
    it('clears all 7 stores successfully', () => {
      const result = clearAllPB1Stores();

      expect(result.success).toBe(true);
      expect(result.clearedStores).toContain('tool1');
      expect(result.clearedStores).toContain('tool2');
      expect(result.clearedStores).toContain('tool3');
      expect(result.clearedStores).toContain('tool4');
      expect(result.clearedStores).toContain('tool5');
      expect(result.clearedStores).toContain('tool6');
      expect(result.clearedStores).toContain('tool7');
      expect(result.errors).toHaveLength(0);
    });

    it('continues clearing after individual store failure', () => {
      // Make Tool 3 throw an error
      mockResetTool3.mockImplementationOnce(() => {
        throw new Error('Store error');
      });

      const result = clearAllPB1Stores();

      expect(result.success).toBe(false);
      expect(result.clearedStores).toContain('tool1');
      expect(result.clearedStores).toContain('tool2');
      expect(result.clearedStores).not.toContain('tool3');
      expect(result.clearedStores).toContain('tool4');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].store).toBe('tool3');
    });
  });

  describe('hasPB1SessionData', () => {
    it('returns false when all stores are empty', () => {
      const result = hasPB1SessionData();
      expect(result).toBe(false);
    });
  });
});

// Additional tests with different mock configurations
describe('hasPB1SessionData with data', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns true when Tool 1 has scores', async () => {
    vi.doMock('@/lib/store/tool1-store', () => ({
      useTool1Store: {
        getState: () => ({
          scores: { strategic: 3 },
          resetTool1: vi.fn(),
        }),
      },
    }));

    vi.doMock('@/lib/store/calculator-store', () => ({
      useCalculatorStore: {
        getState: () => ({ meetingData: null, results: null }),
      },
    }));

    vi.doMock('@/lib/store/tool3-store', () => ({
      useTool3Store: {
        getState: () => ({
          archetypes: Object.fromEntries(
            ['budget', 'hiring', 'strategy', 'technical', 'policy', 'vendor'].map((id) => [
              id,
              { samples: [] },
            ])
          ),
        }),
      },
    }));

    vi.doMock('@/lib/store/tool4-store', () => ({
      useTool4Store: {
        getState: () => ({ stakeholders: [] }),
      },
    }));

    vi.doMock('@/lib/store/tool5-store', () => ({
      useTool5Store: {
        getState: () => ({ journeys: [], frictionPoints: [] }),
      },
    }));

    vi.doMock('@/lib/store/tool6-store', () => ({
      useTool6Store: {
        getState: () => ({ email: null, chat: null, meetings: null }),
      },
    }));

    vi.doMock('@/lib/store/tool7-store', () => ({
      useTool7Store: {
        getState: () => ({ aggregatedData: null, calculationResults: null }),
      },
    }));

    const { hasPB1SessionData } = await import('@/lib/migration/clear-pb1-session');
    const result = hasPB1SessionData();
    expect(result).toBe(true);
  });
});
