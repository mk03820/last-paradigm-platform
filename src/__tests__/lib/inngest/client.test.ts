/**
 * Inngest Client Tests
 *
 * Tests for Inngest client configuration.
 *
 * Covers: Story 15.10 Task 1
 */

import { describe, it, expect } from 'vitest';
import { inngest } from '@/lib/inngest/client';

describe('Inngest Client', () => {
  it('should have correct id', () => {
    expect(inngest.id).toBe('last-paradigm-platform');
  });

  it('should be defined', () => {
    expect(inngest).toBeDefined();
  });

  it('should have createFunction method', () => {
    expect(typeof inngest.createFunction).toBe('function');
  });

  it('should have send method', () => {
    expect(typeof inngest.send).toBe('function');
  });
});
