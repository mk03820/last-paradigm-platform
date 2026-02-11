/**
 * Tests for friction-constants
 *
 * Story 12.2: Friction Point Identification
 * Task 8.1: Unit tests for friction-constants
 */

import { describe, it, expect } from 'vitest';
import {
  FRICTION_CATEGORIES,
  SEVERITY_LEVELS,
  TOTAL_SEVERITY_CONFIG,
  SEVERITY_DIMENSIONS,
  getFrictionCategoryInfo,
  calculateTotalSeverity,
  getSeverityLevel,
  getSeverityConfig,
  isCriticalFriction,
  generateFrictionId,
  createDefaultSeverity,
  validateFrictionPoint,
  calculateAverageSeverity,
  countByCategory,
  isOrganizationalFriction,
  getFrictionSplit,
  type FrictionCategory,
  type SeverityScore,
  type FrictionPoint,
} from './friction-constants';

describe('friction-constants', () => {
  describe('FRICTION_CATEGORIES', () => {
    it('has four categories', () => {
      expect(FRICTION_CATEGORIES).toHaveLength(4);
    });

    it('includes all required categories', () => {
      const categoryIds = FRICTION_CATEGORIES.map((c) => c.id);
      expect(categoryIds).toContain('access_bureaucracy');
      expect(categoryIds).toContain('quality_degradation');
      expect(categoryIds).toContain('multiple_sources');
      expect(categoryIds).toContain('technical_debt');
    });

    it('each category has required fields', () => {
      for (const category of FRICTION_CATEGORIES) {
        expect(category.id).toBeTruthy();
        expect(category.label).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(category.examples).toHaveLength(3);
        expect(category.color).toBeTruthy();
        expect(category.bgColor).toBeTruthy();
        expect(category.borderColor).toBeTruthy();
        expect(typeof category.isOrganizational).toBe('boolean');
      }
    });

    it('technical_debt is the only non-organizational category', () => {
      const orgCategories = FRICTION_CATEGORIES.filter((c) => c.isOrganizational);
      expect(orgCategories).toHaveLength(3);
      expect(
        FRICTION_CATEGORIES.find((c) => c.id === 'technical_debt')?.isOrganizational
      ).toBe(false);
    });
  });

  describe('SEVERITY_LEVELS', () => {
    it('has three levels', () => {
      expect(Object.keys(SEVERITY_LEVELS)).toHaveLength(3);
    });

    it('includes levels 1, 2, 3', () => {
      expect(SEVERITY_LEVELS[1]).toBeDefined();
      expect(SEVERITY_LEVELS[2]).toBeDefined();
      expect(SEVERITY_LEVELS[3]).toBeDefined();
    });

    it('each level has label and description', () => {
      for (const level of Object.values(SEVERITY_LEVELS)) {
        expect(level.label).toBeTruthy();
        expect(level.description).toBeTruthy();
      }
    });
  });

  describe('SEVERITY_DIMENSIONS', () => {
    it('has three dimensions', () => {
      expect(Object.keys(SEVERITY_DIMENSIONS)).toHaveLength(3);
    });

    it('includes frequency, effort, impact', () => {
      expect(SEVERITY_DIMENSIONS.frequency).toBeDefined();
      expect(SEVERITY_DIMENSIONS.effort).toBeDefined();
      expect(SEVERITY_DIMENSIONS.impact).toBeDefined();
    });
  });

  describe('TOTAL_SEVERITY_CONFIG', () => {
    it('has four levels', () => {
      expect(Object.keys(TOTAL_SEVERITY_CONFIG)).toHaveLength(4);
    });

    it('covers score range 3-9', () => {
      expect(TOTAL_SEVERITY_CONFIG.low.min).toBe(3);
      expect(TOTAL_SEVERITY_CONFIG.critical.max).toBe(9);
    });
  });

  describe('getFrictionCategoryInfo', () => {
    it('returns info for valid category', () => {
      const info = getFrictionCategoryInfo('access_bureaucracy');
      expect(info.id).toBe('access_bureaucracy');
      expect(info.label).toBe('Access Bureaucracy');
    });

    it('returns first category as fallback for invalid category', () => {
      const info = getFrictionCategoryInfo('invalid' as FrictionCategory);
      expect(info.id).toBe('access_bureaucracy');
    });
  });

  describe('calculateTotalSeverity', () => {
    it('sums frequency, effort, and impact', () => {
      const severity: SeverityScore = { frequency: 1, effort: 2, impact: 3 };
      expect(calculateTotalSeverity(severity)).toBe(6);
    });

    it('returns minimum 3 for all 1s', () => {
      const severity: SeverityScore = { frequency: 1, effort: 1, impact: 1 };
      expect(calculateTotalSeverity(severity)).toBe(3);
    });

    it('returns maximum 9 for all 3s', () => {
      const severity: SeverityScore = { frequency: 3, effort: 3, impact: 3 };
      expect(calculateTotalSeverity(severity)).toBe(9);
    });
  });

  describe('getSeverityLevel', () => {
    it('returns low for 3', () => {
      expect(getSeverityLevel(3)).toBe('low');
    });

    it('returns medium for 4-5', () => {
      expect(getSeverityLevel(4)).toBe('medium');
      expect(getSeverityLevel(5)).toBe('medium');
    });

    it('returns high for 6-7', () => {
      expect(getSeverityLevel(6)).toBe('high');
      expect(getSeverityLevel(7)).toBe('high');
    });

    it('returns critical for 8-9', () => {
      expect(getSeverityLevel(8)).toBe('critical');
      expect(getSeverityLevel(9)).toBe('critical');
    });
  });

  describe('getSeverityConfig', () => {
    it('returns config with styling for given score', () => {
      const config = getSeverityConfig(6);
      expect(config.label).toBe('High');
      expect(config.color).toBeTruthy();
      expect(config.bgColor).toBeTruthy();
    });
  });

  describe('isCriticalFriction', () => {
    it('returns true for severity >= 7', () => {
      expect(isCriticalFriction({ frequency: 3, effort: 2, impact: 2 })).toBe(true);
      expect(isCriticalFriction({ frequency: 3, effort: 3, impact: 3 })).toBe(true);
    });

    it('returns false for severity < 7', () => {
      expect(isCriticalFriction({ frequency: 2, effort: 2, impact: 2 })).toBe(false);
      expect(isCriticalFriction({ frequency: 1, effort: 1, impact: 1 })).toBe(false);
    });
  });

  describe('generateFrictionId', () => {
    it('generates unique IDs', () => {
      const id1 = generateFrictionId();
      const id2 = generateFrictionId();
      expect(id1).not.toBe(id2);
    });

    it('generates IDs with friction_ prefix', () => {
      const id = generateFrictionId();
      expect(id).toMatch(/^friction_/);
    });
  });

  describe('createDefaultSeverity', () => {
    it('creates severity with all values at 2', () => {
      const severity = createDefaultSeverity();
      expect(severity.frequency).toBe(2);
      expect(severity.effort).toBe(2);
      expect(severity.impact).toBe(2);
    });
  });

  describe('validateFrictionPoint', () => {
    it('returns valid for complete point', () => {
      const result = validateFrictionPoint({
        category: 'access_bureaucracy',
        description: 'Test description',
        stageId: 'stage_123',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns errors for missing category', () => {
      const result = validateFrictionPoint({
        description: 'Test',
        stageId: 'stage_123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.category).toBeTruthy();
    });

    it('returns errors for missing description', () => {
      const result = validateFrictionPoint({
        category: 'access_bureaucracy',
        stageId: 'stage_123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.description).toBeTruthy();
    });

    it('returns errors for whitespace-only description', () => {
      const result = validateFrictionPoint({
        category: 'access_bureaucracy',
        description: '   ',
        stageId: 'stage_123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.description).toBeTruthy();
    });

    it('returns errors for missing stageId', () => {
      const result = validateFrictionPoint({
        category: 'access_bureaucracy',
        description: 'Test',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.stageId).toBeTruthy();
    });
  });

  describe('calculateAverageSeverity', () => {
    it('returns 0 for empty array', () => {
      expect(calculateAverageSeverity([])).toBe(0);
    });

    it('calculates average correctly', () => {
      const points: FrictionPoint[] = [
        {
          id: '1',
          journeyId: 'j1',
          stageId: 's1',
          category: 'access_bureaucracy',
          description: 'Test 1',
          severity: { frequency: 1, effort: 1, impact: 1 }, // total: 3
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          journeyId: 'j1',
          stageId: 's1',
          category: 'technical_debt',
          description: 'Test 2',
          severity: { frequency: 3, effort: 3, impact: 3 }, // total: 9
          createdAt: '',
          updatedAt: '',
        },
      ];
      expect(calculateAverageSeverity(points)).toBe(6); // (3+9)/2 = 6
    });
  });

  describe('countByCategory', () => {
    it('counts friction points by category', () => {
      const points: FrictionPoint[] = [
        {
          id: '1',
          journeyId: 'j1',
          stageId: 's1',
          category: 'access_bureaucracy',
          description: 'Test 1',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          journeyId: 'j1',
          stageId: 's1',
          category: 'access_bureaucracy',
          description: 'Test 2',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          journeyId: 'j1',
          stageId: 's1',
          category: 'technical_debt',
          description: 'Test 3',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '',
          updatedAt: '',
        },
      ];
      const counts = countByCategory(points);
      expect(counts.access_bureaucracy).toBe(2);
      expect(counts.technical_debt).toBe(1);
      expect(counts.quality_degradation).toBe(0);
      expect(counts.multiple_sources).toBe(0);
    });
  });

  describe('isOrganizationalFriction', () => {
    it('returns true for organizational categories', () => {
      expect(isOrganizationalFriction('access_bureaucracy')).toBe(true);
      expect(isOrganizationalFriction('quality_degradation')).toBe(true);
      expect(isOrganizationalFriction('multiple_sources')).toBe(true);
    });

    it('returns false for technical_debt', () => {
      expect(isOrganizationalFriction('technical_debt')).toBe(false);
    });
  });

  describe('getFrictionSplit', () => {
    it('returns correct split', () => {
      const points: FrictionPoint[] = [
        {
          id: '1',
          journeyId: 'j1',
          stageId: 's1',
          category: 'access_bureaucracy',
          description: 'Test 1',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          journeyId: 'j1',
          stageId: 's1',
          category: 'technical_debt',
          description: 'Test 2',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          journeyId: 'j1',
          stageId: 's1',
          category: 'quality_degradation',
          description: 'Test 3',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '',
          updatedAt: '',
        },
      ];
      const split = getFrictionSplit(points);
      expect(split.organizational).toBe(2);
      expect(split.technical).toBe(1);
    });

    it('returns zeros for empty array', () => {
      const split = getFrictionSplit([]);
      expect(split.organizational).toBe(0);
      expect(split.technical).toBe(0);
    });
  });
});
