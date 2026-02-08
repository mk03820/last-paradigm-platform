import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Helper to create a mock NextRequest with JSON body
function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/calculate/meeting-audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Helper to create a mock request with invalid JSON
function createInvalidJsonRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/calculate/meeting-audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'not valid json',
  });
}

describe('POST /api/calculate/meeting-audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = createInvalidJsonRequest();
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_JSON');
    });

    it('should return 400 when meetingCount is missing', async () => {
      const request = createMockRequest({
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 2,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when meetingCount is not a number', async () => {
      const request = createMockRequest({
        meetingCount: 'ten',
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 2,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when meetingCount is negative', async () => {
      const request = createMockRequest({
        meetingCount: -5,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 2,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when meetingCount is not an integer', async () => {
      const request = createMockRequest({
        meetingCount: 5.5,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 2,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when salaryDistribution total does not equal averageAttendees', async () => {
      const request = createMockRequest({
        meetingCount: 5,
        averageAttendees: 10, // Total is 5, not 10
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 2,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when salaryDistribution is missing', async () => {
      const request = createMockRequest({
        meetingCount: 5,
        averageAttendees: 5,
        averageDuration: 60,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Successful Calculation', () => {
    it('should return 200 with calculated meeting waste', async () => {
      const request = createMockRequest({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.meetingWaste).toBe(234000);
      expect(data.data.hourlyWaste).toBe(450);
      expect(data.data.weightedHourlyRate).toBe(90);
    });

    it('should include assumptions in response', async () => {
      const request = createMockRequest({
        meetingCount: 1,
        averageAttendees: 1,
        averageDuration: 60,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.assumptions).toBeDefined();
      expect(data.data.assumptions.weeksPerYear).toBe(52);
      expect(data.data.assumptions.salaryBands).toEqual({
        executive: 150,
        senior: 100,
        midLevel: 65,
        entry: 35,
      });
    });

    it('should handle 30-minute meetings correctly', async () => {
      const request = createMockRequest({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 30,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.meetingWaste).toBe(117000); // Half of 60-minute calculation
    });

    it('should handle minimum valid input', async () => {
      const request = createMockRequest({
        meetingCount: 1,
        averageAttendees: 1,
        averageDuration: 1,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(typeof data.data.meetingWaste).toBe('number');
    });

    it('should handle large meeting counts', async () => {
      const request = createMockRequest({
        meetingCount: 500,
        averageAttendees: 20,
        averageDuration: 120,
        salaryDistribution: {
          executive: 5,
          senior: 5,
          midLevel: 5,
          entry: 5,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.meetingWaste).toBeGreaterThan(0);
    });

    it('should handle all executives', async () => {
      const request = createMockRequest({
        meetingCount: 1,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 5,
          senior: 0,
          midLevel: 0,
          entry: 0,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.weightedHourlyRate).toBe(150);
    });

    it('should handle all entry level', async () => {
      const request = createMockRequest({
        meetingCount: 1,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 5,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.weightedHourlyRate).toBe(35);
    });
  });

  describe('Response Format', () => {
    it('should return proper success response structure', async () => {
      const request = createMockRequest({
        meetingCount: 5,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 2,
          entry: 1,
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('meetingWaste');
      expect(data.data).toHaveProperty('hourlyWaste');
      expect(data.data).toHaveProperty('weightedHourlyRate');
      expect(data.data).toHaveProperty('assumptions');
    });

    it('should return proper error response structure', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });
});
