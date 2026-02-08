import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/calculate/meeting-audit/route';
import type { ApiResponse, MeetingAuditResult } from '@/types/api.types';

// Helper to create a mock NextRequest with JSON body
function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/calculate/meeting-audit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Helper to create request with invalid JSON
function createInvalidJsonRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/calculate/meeting-audit', {
    method: 'POST',
    body: 'not valid json',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('POST /api/calculate/meeting-audit', () => {
  describe('successful calculations', () => {
    it('should return success response with correct format', async () => {
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
      const data: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('data');
    });

    it('should include all required fields in response data', async () => {
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
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(json.success).toBe(true);
      if (json.success) {
        expect(json.data).toHaveProperty('meetingWaste');
        expect(json.data).toHaveProperty('hourlyWaste');
        expect(json.data).toHaveProperty('weightedHourlyRate');
        expect(json.data).toHaveProperty('assumptions');
        expect(json.data.assumptions).toHaveProperty('weeksPerYear', 52);
        expect(json.data.assumptions).toHaveProperty('salaryBands');
        expect(json.data.assumptions.salaryBands).toEqual({
          executive: 150,
          senior: 100,
          midLevel: 65,
          entry: 35,
        });
      }
    });

    it('should calculate correct values', async () => {
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
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(json.success).toBe(true);
      if (json.success) {
        expect(json.data.weightedHourlyRate).toBe(90);
        expect(json.data.hourlyWaste).toBe(450);
        expect(json.data.meetingWaste).toBe(234000);
      }
    });

    it('should produce identical outputs for identical inputs', async () => {
      const body = {
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

      const response1 = await POST(createMockRequest(body));
      const response2 = await POST(createMockRequest(body));

      const json1: ApiResponse<MeetingAuditResult> = await response1.json();
      const json2: ApiResponse<MeetingAuditResult> = await response2.json();

      expect(json1).toEqual(json2);
    });
  });

  describe('validation errors', () => {
    it('should return 400 for missing meetingCount', async () => {
      const request = createMockRequest({
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
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      if (!json.success) {
        expect(json.error).toHaveProperty('code', 'VALIDATION_ERROR');
        expect(json.error).toHaveProperty('message');
      }
    });

    it('should return 400 for negative meetingCount', async () => {
      const request = createMockRequest({
        meetingCount: -5,
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
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should return 400 for non-integer meetingCount', async () => {
      const request = createMockRequest({
        meetingCount: 10.5,
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
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should return 400 for missing salaryDistribution', async () => {
      const request = createMockRequest({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
      });

      const response = await POST(request);
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should return 400 for negative salary band counts', async () => {
      const request = createMockRequest({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: -1,
          senior: 2,
          midLevel: 2,
          entry: 2,
        },
      });

      const response = await POST(request);
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should return 400 when salary distribution total does not match averageAttendees', async () => {
      const request = createMockRequest({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 1,
          entry: 1, // Total: 4, but averageAttendees: 5
        },
      });

      const response = await POST(request);
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      if (!json.success) {
        expect(json.error.message).toContain('total');
      }
    });

    it('should return 400 for invalid JSON', async () => {
      const request = createInvalidJsonRequest();

      const response = await POST(request);
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      if (!json.success) {
        expect(json.error.code).toBe('INVALID_JSON');
      }
    });

    it('should return 400 for string values instead of numbers', async () => {
      const request = createMockRequest({
        meetingCount: '10',
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
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle single meeting with single attendee', async () => {
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
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      if (json.success) {
        expect(json.data.meetingWaste).toBe(1820); // 1 * 1 * 35 * 52
      }
    });

    it('should handle large meeting counts efficiently', async () => {
      const request = createMockRequest({
        meetingCount: 1000,
        averageAttendees: 100,
        averageDuration: 120,
        salaryDistribution: {
          executive: 10,
          senior: 30,
          midLevel: 40,
          entry: 20,
        },
      });

      const startTime = performance.now();
      const response = await POST(request);
      const endTime = performance.now();

      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // < 1 second
    });

    it('should handle short meeting durations', async () => {
      const request = createMockRequest({
        meetingCount: 20,
        averageAttendees: 4,
        averageDuration: 15,
        salaryDistribution: {
          executive: 1,
          senior: 1,
          midLevel: 1,
          entry: 1,
        },
      });

      const response = await POST(request);
      const json: ApiResponse<MeetingAuditResult> = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe('performance requirement (NFR2)', () => {
    it('should complete calculation in less than 1 second', async () => {
      const request = createMockRequest({
        meetingCount: 500,
        averageAttendees: 50,
        averageDuration: 90,
        salaryDistribution: {
          executive: 5,
          senior: 15,
          midLevel: 20,
          entry: 10,
        },
      });

      const startTime = performance.now();
      const response = await POST(request);
      const endTime = performance.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
