import { describe, it, expect } from 'vitest';
import {
  MAX_STAKEHOLDERS,
  MIN_STAKEHOLDERS,
  ROLE_SUGGESTIONS,
  POWER_CALIBRATION,
  INTEREST_CALIBRATION,
  QUADRANTS,
  getPowerLevel,
  getInterestLevel,
  getQuadrant,
  getQuadrantInfo,
  generateStakeholderId,
  validateStakeholder,
  canProceedToMatrix,
  getQuadrantCounts,
  type Stakeholder,
} from './stakeholder-constants';

/**
 * Stakeholder Constants Tests
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: AC1 (data structure), AC2 (calibration), AC3 (limits)
 */

describe('stakeholder-constants', () => {
  describe('constants', () => {
    it('has MAX_STAKEHOLDERS of 50', () => {
      expect(MAX_STAKEHOLDERS).toBe(50);
    });

    it('has MIN_STAKEHOLDERS of 3', () => {
      expect(MIN_STAKEHOLDERS).toBe(3);
    });

    it('has role suggestions array', () => {
      expect(ROLE_SUGGESTIONS.length).toBeGreaterThan(20);
      expect(ROLE_SUGGESTIONS).toContain('CEO');
      expect(ROLE_SUGGESTIONS).toContain('CFO');
      expect(ROLE_SUGGESTIONS).toContain('VP Engineering');
    });

    it('has 4 quadrants', () => {
      expect(QUADRANTS).toHaveLength(4);
      expect(QUADRANTS.map((q) => q.id)).toEqual([
        'key_players',
        'keep_satisfied',
        'keep_informed',
        'monitor',
      ]);
    });

    it('has power calibration levels', () => {
      expect(POWER_CALIBRATION).toHaveLength(4);
      expect(POWER_CALIBRATION[0].label).toBe('Very High');
      expect(POWER_CALIBRATION[3].label).toBe('Low');
    });

    it('has interest calibration levels', () => {
      expect(INTEREST_CALIBRATION).toHaveLength(4);
      expect(INTEREST_CALIBRATION[0].label).toBe('Very High');
      expect(INTEREST_CALIBRATION[3].label).toBe('Low');
    });
  });

  describe('getPowerLevel', () => {
    it('returns Very High for power 8-10', () => {
      expect(getPowerLevel(8).label).toBe('Very High');
      expect(getPowerLevel(9).label).toBe('Very High');
      expect(getPowerLevel(10).label).toBe('Very High');
    });

    it('returns High for power 6-7', () => {
      expect(getPowerLevel(6).label).toBe('High');
      expect(getPowerLevel(7).label).toBe('High');
    });

    it('returns Medium for power 4-5', () => {
      expect(getPowerLevel(4).label).toBe('Medium');
      expect(getPowerLevel(5).label).toBe('Medium');
    });

    it('returns Low for power 1-3', () => {
      expect(getPowerLevel(1).label).toBe('Low');
      expect(getPowerLevel(2).label).toBe('Low');
      expect(getPowerLevel(3).label).toBe('Low');
    });
  });

  describe('getInterestLevel', () => {
    it('returns Very High for interest 8-10', () => {
      expect(getInterestLevel(8).label).toBe('Very High');
      expect(getInterestLevel(10).label).toBe('Very High');
    });

    it('returns High for interest 6-7', () => {
      expect(getInterestLevel(6).label).toBe('High');
      expect(getInterestLevel(7).label).toBe('High');
    });

    it('returns Medium for interest 4-5', () => {
      expect(getInterestLevel(4).label).toBe('Medium');
      expect(getInterestLevel(5).label).toBe('Medium');
    });

    it('returns Low for interest 1-3', () => {
      expect(getInterestLevel(1).label).toBe('Low');
      expect(getInterestLevel(3).label).toBe('Low');
    });
  });

  describe('getQuadrant', () => {
    it('returns key_players for high power and high interest', () => {
      expect(getQuadrant(6, 6)).toBe('key_players');
      expect(getQuadrant(10, 10)).toBe('key_players');
      expect(getQuadrant(8, 7)).toBe('key_players');
    });

    it('returns keep_satisfied for high power and low interest', () => {
      expect(getQuadrant(6, 5)).toBe('keep_satisfied');
      expect(getQuadrant(10, 1)).toBe('keep_satisfied');
      expect(getQuadrant(8, 3)).toBe('keep_satisfied');
    });

    it('returns keep_informed for low power and high interest', () => {
      expect(getQuadrant(5, 6)).toBe('keep_informed');
      expect(getQuadrant(1, 10)).toBe('keep_informed');
      expect(getQuadrant(3, 8)).toBe('keep_informed');
    });

    it('returns monitor for low power and low interest', () => {
      expect(getQuadrant(5, 5)).toBe('monitor');
      expect(getQuadrant(1, 1)).toBe('monitor');
      expect(getQuadrant(3, 3)).toBe('monitor');
    });

    it('uses 6 as threshold for high', () => {
      // Edge cases at threshold
      expect(getQuadrant(6, 6)).toBe('key_players');
      expect(getQuadrant(5, 6)).toBe('keep_informed');
      expect(getQuadrant(6, 5)).toBe('keep_satisfied');
      expect(getQuadrant(5, 5)).toBe('monitor');
    });
  });

  describe('getQuadrantInfo', () => {
    it('returns info for key_players', () => {
      const info = getQuadrantInfo('key_players');
      expect(info.label).toBe('Key Players');
      expect(info.color).toBe('blue');
    });

    it('returns info for keep_satisfied', () => {
      const info = getQuadrantInfo('keep_satisfied');
      expect(info.label).toBe('Keep Satisfied');
      expect(info.color).toBe('purple');
    });

    it('returns info for keep_informed', () => {
      const info = getQuadrantInfo('keep_informed');
      expect(info.label).toBe('Keep Informed');
      expect(info.color).toBe('teal');
    });

    it('returns info for monitor', () => {
      const info = getQuadrantInfo('monitor');
      expect(info.label).toBe('Monitor');
      expect(info.color).toBe('gray');
    });
  });

  describe('generateStakeholderId', () => {
    it('generates unique IDs', () => {
      const id1 = generateStakeholderId();
      const id2 = generateStakeholderId();
      expect(id1).not.toBe(id2);
    });

    it('generates IDs with sh_ prefix', () => {
      const id = generateStakeholderId();
      expect(id.startsWith('sh_')).toBe(true);
    });
  });

  describe('validateStakeholder', () => {
    it('validates complete stakeholder', () => {
      const result = validateStakeholder({
        name: 'John Doe',
        role: 'CEO',
        power: 10,
        interest: 8,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('requires name', () => {
      const result = validateStakeholder({
        name: '',
        role: 'CEO',
        power: 5,
        interest: 5,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });

    it('requires role', () => {
      const result = validateStakeholder({
        name: 'John',
        role: '',
        power: 5,
        interest: 5,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.role).toBe('Role is required');
    });

    it('validates power range', () => {
      const tooLow = validateStakeholder({
        name: 'John',
        role: 'CEO',
        power: 0,
        interest: 5,
      });
      expect(tooLow.errors.power).toBeDefined();

      const tooHigh = validateStakeholder({
        name: 'John',
        role: 'CEO',
        power: 11,
        interest: 5,
      });
      expect(tooHigh.errors.power).toBeDefined();
    });

    it('validates interest range', () => {
      const tooLow = validateStakeholder({
        name: 'John',
        role: 'CEO',
        power: 5,
        interest: 0,
      });
      expect(tooLow.errors.interest).toBeDefined();

      const tooHigh = validateStakeholder({
        name: 'John',
        role: 'CEO',
        power: 5,
        interest: 11,
      });
      expect(tooHigh.errors.interest).toBeDefined();
    });

    it('trims whitespace from name', () => {
      const result = validateStakeholder({
        name: '   ',
        role: 'CEO',
        power: 5,
        interest: 5,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });
  });

  describe('canProceedToMatrix', () => {
    const createStakeholder = (id: string): Stakeholder => ({
      id,
      name: `Stakeholder ${id}`,
      role: 'Role',
      power: 5,
      interest: 5,
    });

    it('returns false with fewer than 3 stakeholders', () => {
      expect(canProceedToMatrix([])).toBe(false);
      expect(canProceedToMatrix([createStakeholder('1')])).toBe(false);
      expect(
        canProceedToMatrix([createStakeholder('1'), createStakeholder('2')])
      ).toBe(false);
    });

    it('returns true with 3 or more stakeholders', () => {
      expect(
        canProceedToMatrix([
          createStakeholder('1'),
          createStakeholder('2'),
          createStakeholder('3'),
        ])
      ).toBe(true);
      expect(
        canProceedToMatrix([
          createStakeholder('1'),
          createStakeholder('2'),
          createStakeholder('3'),
          createStakeholder('4'),
        ])
      ).toBe(true);
    });
  });

  describe('getQuadrantCounts', () => {
    it('returns zero counts for empty array', () => {
      const counts = getQuadrantCounts([]);
      expect(counts).toEqual({
        key_players: 0,
        keep_satisfied: 0,
        keep_informed: 0,
        monitor: 0,
      });
    });

    it('counts stakeholders by quadrant', () => {
      const stakeholders: Stakeholder[] = [
        { id: '1', name: 'A', role: 'R', power: 8, interest: 8 }, // key_players
        { id: '2', name: 'B', role: 'R', power: 8, interest: 3 }, // keep_satisfied
        { id: '3', name: 'C', role: 'R', power: 3, interest: 8 }, // keep_informed
        { id: '4', name: 'D', role: 'R', power: 3, interest: 3 }, // monitor
        { id: '5', name: 'E', role: 'R', power: 10, interest: 10 }, // key_players
      ];

      const counts = getQuadrantCounts(stakeholders);
      expect(counts).toEqual({
        key_players: 2,
        keep_satisfied: 1,
        keep_informed: 1,
        monitor: 1,
      });
    });
  });
});
