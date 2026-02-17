/**
 * useAnalytics Hook Tests
 *
 * Unit tests for the analytics React hook.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 8: Write comprehensive tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics, useTrackOnMount } from './useAnalytics';
import { analytics } from '@/lib/analytics/service';

// Mock the analytics service
vi.mock('@/lib/analytics/service', () => ({
  analytics: {
    track: vi.fn().mockResolvedValue(undefined),
    initialize: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock tracking functions
vi.mock('@/lib/analytics/tracking', () => ({
  trackCheckoutStarted: vi.fn().mockResolvedValue(undefined),
  trackCheckoutCompleted: vi.fn().mockResolvedValue(undefined),
  trackCheckoutAbandoned: vi.fn().mockResolvedValue(undefined),
  trackInvoiceRequested: vi.fn().mockResolvedValue(undefined),
  trackInvoiceFormAbandoned: vi.fn().mockResolvedValue(undefined),
  trackPreviewViewed: vi.fn().mockResolvedValue(undefined),
  clearCheckoutStartTime: vi.fn(),
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize analytics on mount', async () => {
    renderHook(() => useAnalytics());

    expect(analytics.initialize).toHaveBeenCalled();
  });

  it('should return all tracking functions', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(result.current.track).toBeDefined();
    expect(result.current.trackCheckoutStarted).toBeDefined();
    expect(result.current.trackCheckoutCompleted).toBeDefined();
    expect(result.current.trackCheckoutAbandoned).toBeDefined();
    expect(result.current.trackInvoiceRequested).toBeDefined();
    expect(result.current.trackInvoiceFormAbandoned).toBeDefined();
    expect(result.current.trackPreviewViewed).toBeDefined();
    expect(result.current.clearCheckoutStartTime).toBeDefined();
    expect(result.current.getTimeOnComponent).toBeDefined();
  });

  it('should track generic events', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.track({
        name: 'test_event',
        properties: { foo: 'bar' },
      });
    });

    expect(analytics.track).toHaveBeenCalledWith({
      name: 'test_event',
      properties: { foo: 'bar' },
    });
  });

  it('should return time since mount', async () => {
    const { result } = renderHook(() => useAnalytics());

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    const timeOnComponent = result.current.getTimeOnComponent();

    expect(timeOnComponent).toBeGreaterThanOrEqual(100);
    expect(timeOnComponent).toBeLessThan(1000);
  });
});

describe('useTrackOnMount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track event on mount', () => {
    renderHook(() =>
      useTrackOnMount({
        name: 'page_viewed',
        properties: { page: 'preview' },
      })
    );

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'page_viewed',
        properties: { page: 'preview' },
      })
    );
  });

  it('should only track once', () => {
    const { rerender } = renderHook(() =>
      useTrackOnMount({
        name: 'page_viewed',
        properties: {},
      })
    );

    // Rerender the hook
    rerender();
    rerender();

    // Should still only be called once
    expect(analytics.track).toHaveBeenCalledTimes(1);
  });

  it('should accept a function that returns the event', () => {
    const eventFactory = vi.fn().mockReturnValue({
      name: 'dynamic_event',
      properties: { timestamp: Date.now() },
    });

    renderHook(() => useTrackOnMount(eventFactory));

    expect(eventFactory).toHaveBeenCalled();
    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'dynamic_event',
      })
    );
  });
});
