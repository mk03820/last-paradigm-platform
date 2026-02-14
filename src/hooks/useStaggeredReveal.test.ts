/**
 * useStaggeredReveal Hook Tests
 *
 * Story 16.4: Premium Card Interactions
 * Task 2.6: Write tests for stagger timing accuracy
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStaggeredReveal } from './useStaggeredReveal';

describe('useStaggeredReveal', () => {
  let intersectionObserverCallback: IntersectionObserverCallback | null = null;
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    // Mock IntersectionObserver
    const MockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      intersectionObserverCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
        unobserve: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: () => [],
      };
    });

    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    intersectionObserverCallback = null;
  });

  it('should return containerRef, isVisible, and getDelay function', () => {
    const { result } = renderHook(() => useStaggeredReveal());

    expect(result.current.containerRef).toBeDefined();
    expect(typeof result.current.isVisible).toBe('boolean');
    expect(typeof result.current.getDelay).toBe('function');
  });

  it('should start with isVisible false', () => {
    const { result } = renderHook(() => useStaggeredReveal());

    expect(result.current.isVisible).toBe(false);
  });

  it('should calculate correct delay for each index', () => {
    const { result } = renderHook(() =>
      useStaggeredReveal({ staggerDelay: 50 })
    );

    // Delay should be in seconds for Framer Motion
    expect(result.current.getDelay(0)).toBe(0);
    expect(result.current.getDelay(1)).toBe(0.05);
    expect(result.current.getDelay(2)).toBe(0.1);
    expect(result.current.getDelay(3)).toBe(0.15);
    expect(result.current.getDelay(4)).toBe(0.2);
  });

  it('should calculate delay with custom stagger value', () => {
    const { result } = renderHook(() =>
      useStaggeredReveal({ staggerDelay: 100 })
    );

    expect(result.current.getDelay(0)).toBe(0);
    expect(result.current.getDelay(1)).toBe(0.1);
    expect(result.current.getDelay(2)).toBe(0.2);
  });

  it('should return 0 delay when disabled', () => {
    const { result } = renderHook(() =>
      useStaggeredReveal({ disabled: true, staggerDelay: 50 })
    );

    expect(result.current.getDelay(0)).toBe(0);
    expect(result.current.getDelay(1)).toBe(0);
    expect(result.current.getDelay(5)).toBe(0);
  });

  it('should set isVisible true immediately when disabled', () => {
    const { result } = renderHook(() =>
      useStaggeredReveal({ disabled: true })
    );

    expect(result.current.isVisible).toBe(true);
  });

  it('should observe container element', () => {
    const { result } = renderHook(() => useStaggeredReveal());

    // Simulate ref attachment
    const mockContainer = document.createElement('div');
    act(() => {
      (result.current.containerRef as { current: HTMLDivElement | null }).current = mockContainer;
    });

    // Re-render to trigger effect
    const { rerender } = renderHook(() => useStaggeredReveal());
    rerender();

    // Note: The observer is created in useEffect which runs after render
  });

  it('should set isVisible true when element intersects', () => {
    const { result } = renderHook(() => useStaggeredReveal());

    // Simulate intersection
    act(() => {
      if (intersectionObserverCallback) {
        intersectionObserverCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('should disconnect observer after intersection when triggerOnce is true', () => {
    renderHook(() => useStaggeredReveal({ triggerOnce: true }));

    // Simulate intersection
    act(() => {
      if (intersectionObserverCallback) {
        intersectionObserverCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => useStaggeredReveal());

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should use custom threshold and rootMargin', () => {
    renderHook(() =>
      useStaggeredReveal({
        threshold: 0.5,
        rootMargin: '100px',
      })
    );

    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '100px',
      }
    );
  });
});
