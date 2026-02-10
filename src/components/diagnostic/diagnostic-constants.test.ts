/**
 * Tests for diagnostic-constants.ts
 *
 * Story 8.5: Diagnostic Tool Hub
 * Task 8.1: Unit tests for diagnostic-constants
 */

import { describe, it, expect } from 'vitest';
import {
  DIAGNOSTIC_TOOLS,
  TOTAL_TOOLS,
  STATUS_CONFIG,
  getToolById,
  getToolByNumber,
  formatCurrency,
  calculateCompletionPercentage,
} from './diagnostic-constants';

describe('diagnostic-constants', () => {
  describe('DIAGNOSTIC_TOOLS', () => {
    it('contains exactly 7 tools', () => {
      expect(DIAGNOSTIC_TOOLS).toHaveLength(7);
      expect(TOTAL_TOOLS).toBe(7);
    });

    it('has tools numbered 1-7 in order', () => {
      const numbers = DIAGNOSTIC_TOOLS.map((t) => t.number);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('each tool has required properties', () => {
      DIAGNOSTIC_TOOLS.forEach((tool) => {
        expect(tool.id).toBeDefined();
        expect(tool.number).toBeGreaterThanOrEqual(1);
        expect(tool.number).toBeLessThanOrEqual(7);
        expect(tool.name).toBeDefined();
        expect(tool.shortName).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.icon).toBeDefined();
        expect(tool.route).toMatch(/^\//);
        expect(tool.storeKey).toBeDefined();
        expect(typeof tool.anonymousAccess).toBe('boolean');
        expect(tool.estimatedMinutes).toBeGreaterThan(0);
      });
    });

    it('has unique IDs for each tool', () => {
      const ids = DIAGNOSTIC_TOOLS.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(DIAGNOSTIC_TOOLS.length);
    });

    it('only Tool 2 (meeting-audit) allows anonymous access', () => {
      const anonymousTools = DIAGNOSTIC_TOOLS.filter((t) => t.anonymousAccess);
      expect(anonymousTools).toHaveLength(1);
      expect(anonymousTools[0].id).toBe('meeting-audit');
      expect(anonymousTools[0].number).toBe(2);
    });
  });

  describe('STATUS_CONFIG', () => {
    it('has configuration for all status types', () => {
      expect(STATUS_CONFIG.not_started).toBeDefined();
      expect(STATUS_CONFIG.in_progress).toBeDefined();
      expect(STATUS_CONFIG.completed).toBeDefined();
    });

    it('each status has label, variant, and className', () => {
      Object.values(STATUS_CONFIG).forEach((config) => {
        expect(config.label).toBeDefined();
        expect(config.variant).toBeDefined();
        expect(config.className).toBeDefined();
      });
    });

    it('has correct labels', () => {
      expect(STATUS_CONFIG.not_started.label).toBe('Not Started');
      expect(STATUS_CONFIG.in_progress.label).toBe('In Progress');
      expect(STATUS_CONFIG.completed.label).toBe('Completed');
    });
  });

  describe('getToolById', () => {
    it('returns the correct tool for valid ID', () => {
      const tool = getToolById('alignment');
      expect(tool).toBeDefined();
      expect(tool?.number).toBe(1);
      expect(tool?.name).toBe('Organizational Alignment Assessment');
    });

    it('returns undefined for invalid ID', () => {
      const tool = getToolById('invalid-id');
      expect(tool).toBeUndefined();
    });

    it('finds meeting-audit tool', () => {
      const tool = getToolById('meeting-audit');
      expect(tool).toBeDefined();
      expect(tool?.number).toBe(2);
      expect(tool?.anonymousAccess).toBe(true);
    });
  });

  describe('getToolByNumber', () => {
    it('returns the correct tool for valid number', () => {
      const tool = getToolByNumber(1);
      expect(tool).toBeDefined();
      expect(tool?.id).toBe('alignment');
    });

    it('returns undefined for invalid number', () => {
      expect(getToolByNumber(0)).toBeUndefined();
      expect(getToolByNumber(8)).toBeUndefined();
      expect(getToolByNumber(-1)).toBeUndefined();
    });

    it('finds all tools by number 1-7', () => {
      for (let i = 1; i <= 7; i++) {
        const tool = getToolByNumber(i);
        expect(tool).toBeDefined();
        expect(tool?.number).toBe(i);
      }
    });
  });

  describe('formatCurrency', () => {
    it('formats millions correctly', () => {
      expect(formatCurrency(1_000_000)).toBe('$1.0M');
      expect(formatCurrency(2_500_000)).toBe('$2.5M');
      expect(formatCurrency(10_000_000)).toBe('$10.0M');
    });

    it('formats thousands correctly', () => {
      expect(formatCurrency(1_000)).toBe('$1K');
      expect(formatCurrency(500_000)).toBe('$500K');
      expect(formatCurrency(999_999)).toBe('$1000K');
    });

    it('formats smaller values correctly', () => {
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(999)).toBe('$999');
      expect(formatCurrency(0)).toBe('$0');
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('calculates 0% for no completed tools', () => {
      expect(calculateCompletionPercentage(0)).toBe(0);
    });

    it('calculates 100% for all completed tools', () => {
      expect(calculateCompletionPercentage(7)).toBe(100);
    });

    it('calculates correct percentage for partial completion', () => {
      expect(calculateCompletionPercentage(1)).toBe(14);
      expect(calculateCompletionPercentage(3)).toBe(43);
      expect(calculateCompletionPercentage(4)).toBe(57);
    });

    it('rounds to nearest integer', () => {
      // 2/7 = 28.57... should round to 29
      expect(calculateCompletionPercentage(2)).toBe(29);
    });
  });
});
