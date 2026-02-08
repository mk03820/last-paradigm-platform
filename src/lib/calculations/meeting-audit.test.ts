import { describe, it, expect } from 'vitest';
import {
  calculateMeetingWaste,
  calculateWeightedHourlyRate,
  SALARY_BAND_RATES,
  WEEKS_PER_YEAR,
} from './meeting-audit';
import type { SalaryBandDistribution } from '@/types/calculator.types';
import type { MeetingWasteInput } from './types';

describe('meeting-audit calculations', () => {
  describe('SALARY_BAND_RATES', () => {
    it('should have correct executive rate', () => {
      expect(SALARY_BAND_RATES.executive).toBe(150);
    });

    it('should have correct senior rate', () => {
      expect(SALARY_BAND_RATES.senior).toBe(100);
    });

    it('should have correct midLevel rate', () => {
      expect(SALARY_BAND_RATES.midLevel).toBe(65);
    });

    it('should have correct entry rate', () => {
      expect(SALARY_BAND_RATES.entry).toBe(35);
    });
  });

  describe('WEEKS_PER_YEAR', () => {
    it('should be 52', () => {
      expect(WEEKS_PER_YEAR).toBe(52);
    });
  });

  describe('calculateWeightedHourlyRate', () => {
    it('should calculate correct weighted rate for mixed distribution', () => {
      const distribution: SalaryBandDistribution = {
        executive: 1, // $150
        senior: 2, // $200 ($100 x 2)
        midLevel: 1, // $65
        entry: 1, // $35
      };
      // Total: $450, 5 attendees => $90/hour
      const result = calculateWeightedHourlyRate(distribution);
      expect(result).toBe(90);
    });

    it('should return 0 for zero attendees', () => {
      const distribution: SalaryBandDistribution = {
        executive: 0,
        senior: 0,
        midLevel: 0,
        entry: 0,
      };
      const result = calculateWeightedHourlyRate(distribution);
      expect(result).toBe(0);
    });

    it('should return executive rate for all executives', () => {
      const distribution: SalaryBandDistribution = {
        executive: 5,
        senior: 0,
        midLevel: 0,
        entry: 0,
      };
      const result = calculateWeightedHourlyRate(distribution);
      expect(result).toBe(150);
    });

    it('should return entry rate for all entry level', () => {
      const distribution: SalaryBandDistribution = {
        executive: 0,
        senior: 0,
        midLevel: 0,
        entry: 5,
      };
      const result = calculateWeightedHourlyRate(distribution);
      expect(result).toBe(35);
    });

    it('should calculate equal distribution correctly', () => {
      const distribution: SalaryBandDistribution = {
        executive: 1, // $150
        senior: 1, // $100
        midLevel: 1, // $65
        entry: 1, // $35
      };
      // Total: $350, 4 attendees => $87.50/hour
      const result = calculateWeightedHourlyRate(distribution);
      expect(result).toBe(87.5);
    });
  });

  describe('calculateMeetingWaste', () => {
    it('should produce consistent results (same input = same output)', () => {
      const input: MeetingWasteInput = {
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

      const result1 = calculateMeetingWaste(input);
      const result2 = calculateMeetingWaste(input);
      const result3 = calculateMeetingWaste(input);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should calculate correctly with known values', () => {
      // 10 meetings per week, 5 attendees, 60 minutes
      // Distribution: 1 exec ($150), 2 senior ($200), 1 mid ($65), 1 entry ($35) = $450
      // Weighted rate: $450 / 5 = $90/hour
      // Hourly waste: 5 attendees x 1 hour x $90 = $450 per meeting
      // Annual waste: 10 meetings x $450 x 52 weeks = $234,000
      const input: MeetingWasteInput = {
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

      const result = calculateMeetingWaste(input);

      expect(result.weightedHourlyRate).toBe(90);
      expect(result.hourlyWaste).toBe(450);
      expect(result.meetingWaste).toBe(234000);
    });

    it('should handle 30-minute meetings', () => {
      // Same as above but 30 minutes = 0.5 hours
      // Hourly waste: 5 x 0.5 x $90 = $225 per meeting
      // Annual waste: 10 x $225 x 52 = $117,000
      const input: MeetingWasteInput = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 30,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      };

      const result = calculateMeetingWaste(input);

      expect(result.hourlyWaste).toBe(225);
      expect(result.meetingWaste).toBe(117000);
    });

    it('should handle single meeting edge case', () => {
      // 1 meeting per week, 1 attendee (entry level), 60 minutes
      // Weighted rate: $35/hour
      // Hourly waste: 1 x 1 x $35 = $35 per meeting
      // Annual waste: 1 x $35 x 52 = $1,820
      const input: MeetingWasteInput = {
        meetingCount: 1,
        averageAttendees: 1,
        averageDuration: 60,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 1,
        },
      };

      const result = calculateMeetingWaste(input);

      expect(result.weightedHourlyRate).toBe(35);
      expect(result.hourlyWaste).toBe(35);
      expect(result.meetingWaste).toBe(1820);
    });

    it('should handle large meeting counts', () => {
      const input: MeetingWasteInput = {
        meetingCount: 100,
        averageAttendees: 10,
        averageDuration: 60,
        salaryDistribution: {
          executive: 2,
          senior: 3,
          midLevel: 3,
          entry: 2,
        },
      };

      const result = calculateMeetingWaste(input);

      // Weighted rate: (2*150 + 3*100 + 3*65 + 2*35) / 10 = (300+300+195+70)/10 = 86.5
      expect(result.weightedHourlyRate).toBe(86.5);
      // Hourly waste: 10 x 1 x 86.5 = 865 per meeting
      expect(result.hourlyWaste).toBe(865);
      // Annual waste: 100 x 865 x 52 = 4,498,000
      expect(result.meetingWaste).toBe(4498000);
    });

    it('should handle 15-minute meetings', () => {
      const input: MeetingWasteInput = {
        meetingCount: 20,
        averageAttendees: 3,
        averageDuration: 15,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 1,
          entry: 0,
        },
      };

      const result = calculateMeetingWaste(input);

      // Weighted rate: (150 + 100 + 65) / 3 = 315/3 = 105
      expect(result.weightedHourlyRate).toBe(105);
      // Hourly waste: 3 x 0.25 x 105 = 78.75 per meeting
      expect(result.hourlyWaste).toBe(78.75);
      // Annual waste: 20 x 78.75 x 52 = 81,900
      expect(result.meetingWaste).toBe(81900);
    });

    it('should return zero for zero attendees in distribution', () => {
      const input: MeetingWasteInput = {
        meetingCount: 10,
        averageAttendees: 0,
        averageDuration: 60,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 0,
        },
      };

      const result = calculateMeetingWaste(input);

      expect(result.weightedHourlyRate).toBe(0);
      expect(result.hourlyWaste).toBe(0);
      expect(result.meetingWaste).toBe(0);
    });

    it('should complete calculation in less than 1 second', () => {
      const input: MeetingWasteInput = {
        meetingCount: 1000,
        averageAttendees: 100,
        averageDuration: 120,
        salaryDistribution: {
          executive: 10,
          senior: 30,
          midLevel: 40,
          entry: 20,
        },
      };

      const startTime = performance.now();
      calculateMeetingWaste(input);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // < 1 second
    });
  });
});
