/**
 * Session Routing Utilities Tests
 *
 * C3-S10: Integration testing for smart routing
 */

import { describe, it, expect } from 'vitest';
import {
  getNextToolRoute,
  getLastCompletedTool,
  buildSessionResumeUrl,
  isSessionComplete,
  getSessionProgressMessage,
} from './routing';
import type { DiagnosticSession } from '@/lib/db/schema';

function createMockSession(overrides: Partial<DiagnosticSession> = {}): DiagnosticSession {
  return {
    id: 'test-session-id',
    userId: 'test-user-id',
    name: 'Test Session',
    status: 'in_progress',
    toolsCompleted: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    data: null,
    ...overrides,
  };
}

describe('getNextToolRoute', () => {
  it('returns Tool 1 route for session with no data', () => {
    const session = createMockSession({ data: null });
    expect(getNextToolRoute(session)).toBe('/tool/alignment');
  });

  it('returns Tool 1 route for session with empty data', () => {
    const session = createMockSession({ data: {} });
    expect(getNextToolRoute(session)).toBe('/tool/alignment');
  });

  it('returns Tool 2 route when Tool 1 is completed', () => {
    const session = createMockSession({
      toolsCompleted: 1,
      data: {
        tool1: {
          scores: { strategic: 5, governance: 4, cultural: 3, operational: 4, informational: 3 },
          compositeScore: 3.8,
          completedAt: new Date().toISOString(),
        },
      },
    });
    expect(getNextToolRoute(session)).toBe('/tool/meeting-audit');
  });

  it('returns Tool 4 route when Tools 1-3 are completed', () => {
    const session = createMockSession({
      toolsCompleted: 3,
      data: {
        tool1: { completedAt: new Date().toISOString() },
        tool2: { completedAt: new Date().toISOString() },
        tool3: { completedAt: new Date().toISOString() },
      },
    });
    expect(getNextToolRoute(session)).toBe('/tool/stakeholder-map');
  });

  it('returns results route when all tools are completed', () => {
    const session = createMockSession({
      toolsCompleted: 7,
      status: 'completed',
      data: {
        tool1: { completedAt: new Date().toISOString() },
        tool2: { completedAt: new Date().toISOString() },
        tool3: { completedAt: new Date().toISOString() },
        tool4: { completedAt: new Date().toISOString() },
        tool5: { completedAt: new Date().toISOString() },
        tool6: { completedAt: new Date().toISOString() },
        tool7: { completedAt: new Date().toISOString() },
      },
    });
    expect(getNextToolRoute(session)).toBe('/tool/total-cost/results');
  });

  it('skips incomplete tools in the middle', () => {
    // Tool 2 not completed, but others are (unlikely scenario, but should work)
    const session = createMockSession({
      toolsCompleted: 1,
      data: {
        tool1: { completedAt: new Date().toISOString() },
        // tool2 missing
        tool3: { completedAt: new Date().toISOString() },
      },
    });
    expect(getNextToolRoute(session)).toBe('/tool/meeting-audit');
  });
});

describe('getLastCompletedTool', () => {
  it('returns null for session with no data', () => {
    const session = createMockSession({ data: null });
    expect(getLastCompletedTool(session)).toBeNull();
  });

  it('returns null for session with no completed tools', () => {
    const session = createMockSession({ data: {} });
    expect(getLastCompletedTool(session)).toBeNull();
  });

  it('returns Tool 1 info when only Tool 1 completed', () => {
    const session = createMockSession({
      toolsCompleted: 1,
      data: {
        tool1: { completedAt: new Date().toISOString() },
      },
    });
    const result = getLastCompletedTool(session);
    expect(result).toEqual({
      name: 'Organizational Alignment Assessment',
      number: 1,
    });
  });

  it('returns the highest numbered completed tool', () => {
    const session = createMockSession({
      toolsCompleted: 4,
      data: {
        tool1: { completedAt: new Date().toISOString() },
        tool2: { completedAt: new Date().toISOString() },
        tool3: { completedAt: new Date().toISOString() },
        tool4: { completedAt: new Date().toISOString() },
      },
    });
    const result = getLastCompletedTool(session);
    expect(result).toEqual({
      name: 'Stakeholder Power/Interest Mapping',
      number: 4,
    });
  });

  it('returns Tool 7 for fully completed session', () => {
    const session = createMockSession({
      toolsCompleted: 7,
      status: 'completed',
      data: {
        tool1: { completedAt: new Date().toISOString() },
        tool2: { completedAt: new Date().toISOString() },
        tool3: { completedAt: new Date().toISOString() },
        tool4: { completedAt: new Date().toISOString() },
        tool5: { completedAt: new Date().toISOString() },
        tool6: { completedAt: new Date().toISOString() },
        tool7: { completedAt: new Date().toISOString() },
      },
    });
    const result = getLastCompletedTool(session);
    expect(result).toEqual({
      name: 'Total Cost of Misalignment',
      number: 7,
    });
  });
});

describe('buildSessionResumeUrl', () => {
  it('builds URL with session ID and correct route', () => {
    const session = createMockSession({
      id: 'my-session-123',
      data: {
        tool1: { completedAt: new Date().toISOString() },
        tool2: { completedAt: new Date().toISOString() },
      },
    });
    expect(buildSessionResumeUrl(session)).toBe('/tool/decision-velocity?session=my-session-123');
  });

  it('builds results URL for completed session', () => {
    const session = createMockSession({
      id: 'completed-session',
      toolsCompleted: 7,
      data: {
        tool1: { completedAt: new Date().toISOString() },
        tool2: { completedAt: new Date().toISOString() },
        tool3: { completedAt: new Date().toISOString() },
        tool4: { completedAt: new Date().toISOString() },
        tool5: { completedAt: new Date().toISOString() },
        tool6: { completedAt: new Date().toISOString() },
        tool7: { completedAt: new Date().toISOString() },
      },
    });
    expect(buildSessionResumeUrl(session)).toBe('/tool/total-cost/results?session=completed-session');
  });
});

describe('isSessionComplete', () => {
  it('returns false for new session', () => {
    const session = createMockSession({ toolsCompleted: 0 });
    expect(isSessionComplete(session)).toBe(false);
  });

  it('returns false for partially completed session', () => {
    const session = createMockSession({ toolsCompleted: 4 });
    expect(isSessionComplete(session)).toBe(false);
  });

  it('returns true for session with 7 tools completed', () => {
    const session = createMockSession({ toolsCompleted: 7 });
    expect(isSessionComplete(session)).toBe(true);
  });

  it('returns true for session with more than 7 (edge case)', () => {
    const session = createMockSession({ toolsCompleted: 8 });
    expect(isSessionComplete(session)).toBe(true);
  });
});

describe('getSessionProgressMessage', () => {
  it('returns "Not started" for 0 tools', () => {
    const session = createMockSession({ toolsCompleted: 0 });
    expect(getSessionProgressMessage(session)).toBe('Not started');
  });

  it('returns "1 of 7 tools complete" for 1 tool', () => {
    const session = createMockSession({ toolsCompleted: 1 });
    expect(getSessionProgressMessage(session)).toBe('1 of 7 tools complete');
  });

  it('returns "4 of 7 tools complete" for 4 tools', () => {
    const session = createMockSession({ toolsCompleted: 4 });
    expect(getSessionProgressMessage(session)).toBe('4 of 7 tools complete');
  });

  it('returns "Diagnostic complete" for 7 tools', () => {
    const session = createMockSession({ toolsCompleted: 7 });
    expect(getSessionProgressMessage(session)).toBe('Diagnostic complete');
  });
});
