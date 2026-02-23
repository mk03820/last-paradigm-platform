/**
 * useTouchDevice Hook Tests
 *
 * Story 16.4: Premium Card Interactions
 * Task 4.6: Write tests for touch interaction sequences
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTouchDevice } from './useTouchDevice';

describe('useTouchDevice', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;
  let originalOntouchstart: typeof window.ontouchstart;
  let originalMaxTouchPoints: number;

  beforeEach(() => {
    originalOntouchstart = window.ontouchstart;
    originalMaxTouchPoints = navigator.maxTouchPoints;

    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(hover: none)' ? true : false,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }));

    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset window properties
    Object.defineProperty(window, 'ontouchstart', {
      value: originalOntouchstart,
      writable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      writable: true,
      configurable: true,
    });
  });

  it('should return true for touch device without hover', () => {
    // Mock touch capability
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      writable: true,
    });

    // Mock hover: none
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(hover: none)',
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }));

    const { result } = renderHook(() => useTouchDevice());

    expect(result.current).toBe(true);
  });

  it('should return false for device with hover capability', () => {
    // Mock touch capability
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      writable: true,
    });

    // Mock hover: hover (not a touch-primary device)
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }));

    const { result } = renderHook(() => useTouchDevice());

    expect(result.current).toBe(false);
  });

  it('should return false for non-touch device', () => {
    // No touch capability
    delete (window as typeof window & { ontouchstart?: unknown }).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useTouchDevice());

    expect(result.current).toBe(false);
  });

  it('should add event listener for hover capability changes', () => {
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      writable: true,
    });

    renderHook(() => useTouchDevice());

    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      writable: true,
    });

    const { unmount } = renderHook(() => useTouchDevice());

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when hover capability changes (e.g., tablet with keyboard)', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;

    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      writable: true,
    });

    addEventListenerMock.mockImplementation(
      (event: string, handler: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      }
    );

    // Start as touch device
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(hover: none)',
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }));

    const { result } = renderHook(() => useTouchDevice());

    expect(result.current).toBe(true);

    // Simulate keyboard attachment (now has hover)
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: false } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(false);
  });
});
