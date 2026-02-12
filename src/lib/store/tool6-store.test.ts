/**
 * Tool 6 Store Tests
 *
 * Story 13.1: Communication Metrics Input
 * Task 9.1: Unit tests for tool6-store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTool6Store } from './tool6-store';
import { useCalculatorStore } from './calculator-store';
import type { EmailMetrics, ChatMetrics, MeetingMetrics } from '@/components/tools/communication/comm-constants';

// Mock calculator store
vi.mock('./calculator-store', () => ({
  useCalculatorStore: {
    getState: vi.fn(() => ({
      results: null,
      meetingData: null,
    })),
  },
}));

describe('tool6-store', () => {
  beforeEach(() => {
    // Reset store before each test
    useTool6Store.setState({
      email: null,
      chat: null,
      meetings: null,
      sessionId: null,
      isDirty: false,
      completion: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have null metrics initially', () => {
      const state = useTool6Store.getState();
      expect(state.email).toBeNull();
      expect(state.chat).toBeNull();
      expect(state.meetings).toBeNull();
    });

    it('should have isDirty false initially', () => {
      const state = useTool6Store.getState();
      expect(state.isDirty).toBe(false);
    });

    it('should have no completion initially', () => {
      const state = useTool6Store.getState();
      expect(state.completion).toBeNull();
    });
  });

  describe('setEmailMetrics', () => {
    it('should set email metrics', () => {
      const emailMetrics: EmailMetrics = {
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      };

      useTool6Store.getState().setEmailMetrics(emailMetrics);

      expect(useTool6Store.getState().email).toEqual(emailMetrics);
      expect(useTool6Store.getState().isDirty).toBe(true);
      expect(useTool6Store.getState().completion).toBeNull();
    });
  });

  describe('setChatMetrics', () => {
    it('should set chat metrics', () => {
      const chatMetrics: ChatMetrics = {
        activeChannels: 75,
        dmRatioPercent: 40,
        atHereFrequency: 'often',
        crossChannelRedundancyPercent: 20,
      };

      useTool6Store.getState().setChatMetrics(chatMetrics);

      expect(useTool6Store.getState().chat).toEqual(chatMetrics);
      expect(useTool6Store.getState().isDirty).toBe(true);
    });
  });

  describe('setMeetingMetrics', () => {
    it('should set meeting metrics', () => {
      const meetingMetrics: MeetingMetrics = {
        infoCascadeMeetingsPerWeek: 5,
        decisionDocumentationRatePercent: 30,
        pulledFromTool2: false,
      };

      useTool6Store.getState().setMeetingMetrics(meetingMetrics);

      expect(useTool6Store.getState().meetings).toEqual(meetingMetrics);
      expect(useTool6Store.getState().isDirty).toBe(true);
    });
  });

  describe('updateEmailField', () => {
    it('should update individual email field', () => {
      useTool6Store.getState().updateEmailField('distributionListCount', 100);

      const email = useTool6Store.getState().email;
      expect(email?.distributionListCount).toBe(100);
      expect(email?.avgListSize).toBe(0); // Default value
    });

    it('should preserve existing email values when updating', () => {
      useTool6Store.getState().setEmailMetrics({
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      });

      useTool6Store.getState().updateEmailField('avgListSize', 50);

      const email = useTool6Store.getState().email;
      expect(email?.distributionListCount).toBe(50);
      expect(email?.avgListSize).toBe(50);
    });
  });

  describe('updateChatField', () => {
    it('should update individual chat field', () => {
      useTool6Store.getState().updateChatField('activeChannels', 100);

      const chat = useTool6Store.getState().chat;
      expect(chat?.activeChannels).toBe(100);
      expect(chat?.dmRatioPercent).toBe(50); // Default value
    });
  });

  describe('updateMeetingField', () => {
    it('should update individual meeting field', () => {
      useTool6Store.getState().updateMeetingField('infoCascadeMeetingsPerWeek', 10);

      const meetings = useTool6Store.getState().meetings;
      expect(meetings?.infoCascadeMeetingsPerWeek).toBe(10);
      expect(meetings?.pulledFromTool2).toBe(false);
    });
  });

  describe('isComplete', () => {
    it('should return false when no metrics entered', () => {
      expect(useTool6Store.getState().isComplete()).toBe(false);
    });

    it('should return false when only email is complete', () => {
      useTool6Store.getState().setEmailMetrics({
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      });

      expect(useTool6Store.getState().isComplete()).toBe(false);
    });

    it('should return true when all sections are complete', () => {
      useTool6Store.getState().setEmailMetrics({
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      });

      useTool6Store.getState().setChatMetrics({
        activeChannels: 75,
        dmRatioPercent: 40,
        atHereFrequency: 'often',
        crossChannelRedundancyPercent: 20,
      });

      useTool6Store.getState().setMeetingMetrics({
        infoCascadeMeetingsPerWeek: 5,
        decisionDocumentationRatePercent: 30,
        pulledFromTool2: false,
      });

      expect(useTool6Store.getState().isComplete()).toBe(true);
    });
  });

  describe('getCompletedSectionsCount', () => {
    it('should return 0 when no sections complete', () => {
      expect(useTool6Store.getState().getCompletedSectionsCount()).toBe(0);
    });

    it('should return 1 when email is complete', () => {
      useTool6Store.getState().setEmailMetrics({
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      });

      expect(useTool6Store.getState().getCompletedSectionsCount()).toBe(1);
    });

    it('should return 3 when all sections complete', () => {
      useTool6Store.getState().setEmailMetrics({
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      });

      useTool6Store.getState().setChatMetrics({
        activeChannels: 75,
        dmRatioPercent: 40,
        atHereFrequency: 'often',
        crossChannelRedundancyPercent: 20,
      });

      useTool6Store.getState().setMeetingMetrics({
        infoCascadeMeetingsPerWeek: 5,
        decisionDocumentationRatePercent: 0,
        pulledFromTool2: true,
      });

      expect(useTool6Store.getState().getCompletedSectionsCount()).toBe(3);
    });
  });

  describe('markComplete', () => {
    it('should create completion record with timestamp', () => {
      useTool6Store.getState().setEmailMetrics({
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      });

      useTool6Store.getState().markComplete();

      const completion = useTool6Store.getState().completion;
      expect(completion).not.toBeNull();
      expect(completion?.completedAt).toBeTruthy();
      expect(completion?.emailComplete).toBe(true);
      expect(completion?.chatComplete).toBe(false);
      expect(completion?.meetingsComplete).toBe(false);
    });
  });

  describe('resetTool6', () => {
    it('should reset all state to initial values', () => {
      // Set some state
      useTool6Store.getState().setEmailMetrics({
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      });

      // Reset
      useTool6Store.getState().resetTool6();

      const state = useTool6Store.getState();
      expect(state.email).toBeNull();
      expect(state.chat).toBeNull();
      expect(state.meetings).toBeNull();
      expect(state.isDirty).toBe(false);
      expect(state.completion).toBeNull();
    });
  });

  describe('pullFromTool2', () => {
    it('should return false when Tool 2 has no data', () => {
      const result = useTool6Store.getState().pullFromTool2();
      expect(result).toBe(false);
    });

    it('should pull data when Tool 2 has results', () => {
      // Mock Tool 2 having data
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        results: { totalCost: 100000 },
        meetingData: {
          meetingCount: 20,
          averageAttendees: 8,
          averageDuration: 60,
          salaryDistribution: { executive: 5, senior: 15, midLevel: 30, entry: 50 },
        },
      } as unknown as ReturnType<typeof useCalculatorStore.getState>);

      const result = useTool6Store.getState().pullFromTool2();

      expect(result).toBe(true);
      const meetings = useTool6Store.getState().meetings;
      expect(meetings?.pulledFromTool2).toBe(true);
      expect(meetings?.infoCascadeMeetingsPerWeek).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMetrics', () => {
    it('should return all metrics as a single object', () => {
      const emailMetrics: EmailMetrics = {
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      };

      useTool6Store.getState().setEmailMetrics(emailMetrics);

      const metrics = useTool6Store.getState().getMetrics();
      expect(metrics.email).toEqual(emailMetrics);
      expect(metrics.chat).toBeNull();
      expect(metrics.meetings).toBeNull();
    });
  });

  describe('setSessionId', () => {
    it('should set session ID', () => {
      useTool6Store.getState().setSessionId('test-session-123');
      expect(useTool6Store.getState().sessionId).toBe('test-session-123');
    });

    it('should allow clearing session ID', () => {
      useTool6Store.getState().setSessionId('test-session-123');
      useTool6Store.getState().setSessionId(null);
      expect(useTool6Store.getState().sessionId).toBeNull();
    });
  });
});
