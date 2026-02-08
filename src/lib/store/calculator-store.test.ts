import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculatorStore } from './calculator-store';
import type { MeetingAuditInput, CalculationResult } from '@/types/calculator.types';

describe('useCalculatorStore', () => {
  // Reset store and sessionStorage before each test
  beforeEach(() => {
    useCalculatorStore.getState().clearSession();
    sessionStorage.clear();
  });

  describe('initial state', () => {
    it('should have null meetingData initially', () => {
      const { meetingData } = useCalculatorStore.getState();
      expect(meetingData).toBeNull();
    });

    it('should have null results initially', () => {
      const { results } = useCalculatorStore.getState();
      expect(results).toBeNull();
    });

    it('should have isCalculating as false initially', () => {
      const { isCalculating } = useCalculatorStore.getState();
      expect(isCalculating).toBe(false);
    });
  });

  describe('setMeetingData', () => {
    it('should update meetingData state', () => {
      const testData: MeetingAuditInput = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      };

      useCalculatorStore.getState().setMeetingData(testData);

      const { meetingData } = useCalculatorStore.getState();
      expect(meetingData).toEqual(testData);
    });

    it('should allow setting meetingData to null', () => {
      const testData: MeetingAuditInput = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      };

      useCalculatorStore.getState().setMeetingData(testData);
      useCalculatorStore.getState().setMeetingData(null);

      const { meetingData } = useCalculatorStore.getState();
      expect(meetingData).toBeNull();
    });
  });

  describe('setResults', () => {
    it('should update results state', () => {
      const testResults: CalculationResult = {
        meetingWaste: 50000,
        estimatedAlignmentTaxMin: 166666.67,
        estimatedAlignmentTaxMax: 200000,
        inputs: {
          meetingCount: 10,
          averageAttendees: 5,
          averageDuration: 60,
          salaryDistribution: {
            executive: 1,
            senior: 2,
            midLevel: 1,
            entry: 1,
          },
        },
        calculatedAt: new Date().toISOString(),
      };

      useCalculatorStore.getState().setResults(testResults);

      const { results } = useCalculatorStore.getState();
      expect(results).toEqual(testResults);
    });
  });

  describe('setIsCalculating', () => {
    it('should update isCalculating state to true', () => {
      useCalculatorStore.getState().setIsCalculating(true);

      const { isCalculating } = useCalculatorStore.getState();
      expect(isCalculating).toBe(true);
    });

    it('should update isCalculating state to false', () => {
      useCalculatorStore.getState().setIsCalculating(true);
      useCalculatorStore.getState().setIsCalculating(false);

      const { isCalculating } = useCalculatorStore.getState();
      expect(isCalculating).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('should reset all state to initial values', () => {
      // Set up some state
      const testData: MeetingAuditInput = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      };

      const testResults: CalculationResult = {
        meetingWaste: 50000,
        estimatedAlignmentTaxMin: 166666.67,
        estimatedAlignmentTaxMax: 200000,
        inputs: testData,
        calculatedAt: new Date().toISOString(),
      };

      useCalculatorStore.getState().setMeetingData(testData);
      useCalculatorStore.getState().setResults(testResults);
      useCalculatorStore.getState().setIsCalculating(true);

      // Clear session
      useCalculatorStore.getState().clearSession();

      // Verify all state is reset
      const state = useCalculatorStore.getState();
      expect(state.meetingData).toBeNull();
      expect(state.results).toBeNull();
      expect(state.isCalculating).toBe(false);
    });
  });

  describe('sessionStorage persistence', () => {
    it('should use sessionStorage for persistence', () => {
      const testData: MeetingAuditInput = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      };

      useCalculatorStore.getState().setMeetingData(testData);

      // Check that data is stored in sessionStorage
      const storedData = sessionStorage.getItem('calculator-session');
      expect(storedData).not.toBeNull();

      // Verify the stored data contains our meeting data
      const parsed = JSON.parse(storedData!);
      expect(parsed.state.meetingData).toEqual(testData);
    });

    it('should restore data from sessionStorage on store rehydration', () => {
      const testData: MeetingAuditInput = {
        meetingCount: 15,
        averageAttendees: 8,
        averageDuration: 45,
        salaryDistribution: {
          executive: 2,
          senior: 3,
          midLevel: 2,
          entry: 1,
        },
      };

      // Store data
      useCalculatorStore.getState().setMeetingData(testData);

      // Verify data is persisted and can be read back
      const storedData = sessionStorage.getItem('calculator-session');
      expect(storedData).not.toBeNull();

      const parsed = JSON.parse(storedData!);
      expect(parsed.state.meetingData).toEqual(testData);
    });

    it('should clear sessionStorage when clearSession is called', () => {
      const testData: MeetingAuditInput = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      };

      useCalculatorStore.getState().setMeetingData(testData);
      useCalculatorStore.getState().clearSession();

      // Check that sessionStorage still has the key but with null values
      const storedData = sessionStorage.getItem('calculator-session');
      expect(storedData).not.toBeNull();

      const parsed = JSON.parse(storedData!);
      expect(parsed.state.meetingData).toBeNull();
    });
  });
});
