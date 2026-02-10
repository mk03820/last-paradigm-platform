/**
 * Tests for useGuidancePreference hook
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 9.2: Unit tests for useGuidancePreference hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useGuidancePreference,
  isGuidanceDismissed,
  dismissGuidance,
  resetAllGuidancePreferences,
} from './useGuidancePreference';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    keys: () => Object.keys(store),
  };
})();

describe('useGuidancePreference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns isDismissed false by default', () => {
    const { result } = renderHook(() => useGuidancePreference('alignment'));

    expect(result.current.isDismissed).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isDismissed true when previously dismissed', () => {
    localStorageMock.setItem('lpp-guidance-dismissed-alignment', 'true');

    const { result } = renderHook(() => useGuidancePreference('alignment'));

    expect(result.current.isDismissed).toBe(true);
  });

  it('dismiss function sets isDismissed to true', () => {
    const { result } = renderHook(() => useGuidancePreference('alignment'));

    expect(result.current.isDismissed).toBe(false);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isDismissed).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'lpp-guidance-dismissed-alignment',
      'true'
    );
  });

  it('reset function clears the preference', () => {
    localStorageMock.setItem('lpp-guidance-dismissed-alignment', 'true');
    const { result } = renderHook(() => useGuidancePreference('alignment'));

    expect(result.current.isDismissed).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isDismissed).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'lpp-guidance-dismissed-alignment'
    );
  });

  it('different tools have independent preferences', () => {
    localStorageMock.setItem('lpp-guidance-dismissed-alignment', 'true');

    const { result: alignmentResult } = renderHook(() =>
      useGuidancePreference('alignment')
    );
    const { result: meetingResult } = renderHook(() =>
      useGuidancePreference('meeting-audit')
    );

    expect(alignmentResult.current.isDismissed).toBe(true);
    expect(meetingResult.current.isDismissed).toBe(false);
  });
});

describe('isGuidanceDismissed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('returns false when not dismissed', () => {
    expect(isGuidanceDismissed('alignment')).toBe(false);
  });

  it('returns true when dismissed', () => {
    localStorageMock.setItem('lpp-guidance-dismissed-alignment', 'true');
    expect(isGuidanceDismissed('alignment')).toBe(true);
  });
});

describe('dismissGuidance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('sets the dismissed flag in localStorage', () => {
    dismissGuidance('alignment');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'lpp-guidance-dismissed-alignment',
      'true'
    );
  });
});

describe('resetAllGuidancePreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    // Mock Object.keys to work with our mock
    vi.spyOn(Object, 'keys').mockImplementation((obj) => {
      if (obj === localStorageMock) {
        return localStorageMock.keys();
      }
      return Object.getOwnPropertyNames(obj);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes all guidance preferences', () => {
    localStorageMock.setItem('lpp-guidance-dismissed-alignment', 'true');
    localStorageMock.setItem('lpp-guidance-dismissed-meeting-audit', 'true');
    localStorageMock.setItem('other-key', 'value');

    resetAllGuidancePreferences();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'lpp-guidance-dismissed-alignment'
    );
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'lpp-guidance-dismissed-meeting-audit'
    );
    // Should not remove non-guidance keys
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other-key');
  });
});
