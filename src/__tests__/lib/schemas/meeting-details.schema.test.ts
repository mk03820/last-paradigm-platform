import { describe, it, expect } from 'vitest';
import { meetingDetailsSchema } from '@/lib/schemas/meeting-details.schema';

describe('meetingDetailsSchema', () => {
  describe('valid inputs', () => {
    it('should validate when all fields are positive integers', () => {
      const validInput = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate with large positive integers', () => {
      const validInput = {
        meetingCount: 1000,
        averageAttendees: 100,
        averageDuration: 480,
      };

      const result = meetingDetailsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate with minimum positive values (1)', () => {
      const validInput = {
        meetingCount: 1,
        averageAttendees: 1,
        averageDuration: 1,
      };

      const result = meetingDetailsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('meetingCount validation', () => {
    it('should reject zero', () => {
      const input = {
        meetingCount: 0,
        averageAttendees: 5,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Number of meetings must be greater than 0');
      }
    });

    it('should reject negative numbers', () => {
      const input = {
        meetingCount: -5,
        averageAttendees: 5,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject decimal numbers', () => {
      const input = {
        meetingCount: 5.5,
        averageAttendees: 5,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a whole number');
      }
    });

    it('should reject non-number types', () => {
      const input = {
        meetingCount: 'ten',
        averageAttendees: 5,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid number');
      }
    });
  });

  describe('averageAttendees validation', () => {
    it('should reject zero', () => {
      const input = {
        meetingCount: 10,
        averageAttendees: 0,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Average attendees must be greater than 0');
      }
    });

    it('should reject negative numbers', () => {
      const input = {
        meetingCount: 10,
        averageAttendees: -3,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject decimal numbers', () => {
      const input = {
        meetingCount: 10,
        averageAttendees: 4.5,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a whole number');
      }
    });
  });

  describe('averageDuration validation', () => {
    it('should reject zero', () => {
      const input = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 0,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Duration must be greater than 0');
      }
    });

    it('should reject negative numbers', () => {
      const input = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: -30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject decimal numbers', () => {
      const input = {
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 30.5,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a whole number');
      }
    });
  });

  describe('missing fields', () => {
    it('should reject when meetingCount is missing', () => {
      const input = {
        averageAttendees: 5,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject when averageAttendees is missing', () => {
      const input = {
        meetingCount: 10,
        averageDuration: 30,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject when averageDuration is missing', () => {
      const input = {
        meetingCount: 10,
        averageAttendees: 5,
      };

      const result = meetingDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty object', () => {
      const result = meetingDetailsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
