import { describe, it, expect } from 'vitest';
import {
  calculateAlignmentTaxRange,
  type AlignmentTaxRange,
} from './alignment-tax';

describe('calculateAlignmentTaxRange', () => {
  describe('calculation accuracy', () => {
    it('calculates min as meetingWaste / 0.30', () => {
      const result = calculateAlignmentTaxRange(50000);

      // $50,000 / 0.30 = $166,666.67
      expect(result.estimatedMin).toBeCloseTo(166666.67, 0);
    });

    it('calculates max as meetingWaste / 0.25', () => {
      const result = calculateAlignmentTaxRange(50000);

      // $50,000 / 0.25 = $200,000
      expect(result.estimatedMax).toBe(200000);
    });

    it('returns correct range for example from story', () => {
      // Story example: Meeting waste $50,000/year
      // Min: $50,000 / 0.30 = $166,667
      // Max: $50,000 / 0.25 = $200,000
      const result = calculateAlignmentTaxRange(50000);

      expect(Math.round(result.estimatedMin)).toBe(166667);
      expect(result.estimatedMax).toBe(200000);
    });
  });

  describe('different values', () => {
    it('calculates correctly for $100,000 meeting waste', () => {
      const result = calculateAlignmentTaxRange(100000);

      // $100,000 / 0.30 = $333,333.33
      // $100,000 / 0.25 = $400,000
      expect(Math.round(result.estimatedMin)).toBe(333333);
      expect(result.estimatedMax).toBe(400000);
    });

    it('calculates correctly for $25,000 meeting waste', () => {
      const result = calculateAlignmentTaxRange(25000);

      // $25,000 / 0.30 = $83,333.33
      // $25,000 / 0.25 = $100,000
      expect(Math.round(result.estimatedMin)).toBe(83333);
      expect(result.estimatedMax).toBe(100000);
    });

    it('handles zero meeting waste', () => {
      const result = calculateAlignmentTaxRange(0);

      expect(result.estimatedMin).toBe(0);
      expect(result.estimatedMax).toBe(0);
    });
  });

  describe('return type', () => {
    it('returns AlignmentTaxRange object', () => {
      const result = calculateAlignmentTaxRange(50000);

      expect(result).toHaveProperty('estimatedMin');
      expect(result).toHaveProperty('estimatedMax');
      expect(typeof result.estimatedMin).toBe('number');
      expect(typeof result.estimatedMax).toBe('number');
    });

    it('min is always less than or equal to max', () => {
      const result = calculateAlignmentTaxRange(50000);

      expect(result.estimatedMin).toBeLessThanOrEqual(result.estimatedMax);
    });
  });
});
