/**
 * Communication Constants Tests
 *
 * Story 13.1: Communication Metrics Input
 * Task 9.2: Unit tests for comm-constants
 */

import { describe, it, expect } from 'vitest';
import {
  FREQUENCY_LEVELS,
  EMAIL_METRICS_CONFIG,
  CHAT_METRICS_CONFIG,
  MEETING_METRICS_CONFIG,
  METRICS_SECTIONS,
  getFrequencyLevelInfo,
  getSectionConfig,
  createDefaultEmailMetrics,
  createDefaultChatMetrics,
  createDefaultMeetingMetrics,
  isEmailMetricsComplete,
  isChatMetricsComplete,
  isMeetingMetricsComplete,
  isAllMetricsComplete,
  countCompletedSections,
  frequencyToScore,
  type FrequencyLevel,
} from './comm-constants';

describe('comm-constants', () => {
  describe('FREQUENCY_LEVELS', () => {
    it('should have 5 frequency levels', () => {
      expect(FREQUENCY_LEVELS).toHaveLength(5);
    });

    it('should include never, rarely, sometimes, often, always', () => {
      const values = FREQUENCY_LEVELS.map((l) => l.value);
      expect(values).toContain('never');
      expect(values).toContain('rarely');
      expect(values).toContain('sometimes');
      expect(values).toContain('often');
      expect(values).toContain('always');
    });

    it('should have label and description for each level', () => {
      FREQUENCY_LEVELS.forEach((level) => {
        expect(level.label).toBeTruthy();
        expect(level.description).toBeTruthy();
      });
    });
  });

  describe('EMAIL_METRICS_CONFIG', () => {
    it('should have 4 email metric fields', () => {
      expect(EMAIL_METRICS_CONFIG).toHaveLength(4);
    });

    it('should include distributionListCount field', () => {
      const field = EMAIL_METRICS_CONFIG.find((f) => f.id === 'distributionListCount');
      expect(field).toBeDefined();
      expect(field?.type).toBe('number');
      expect(field?.min).toBe(0);
      expect(field?.max).toBe(500);
    });

    it('should include avgListSize field', () => {
      const field = EMAIL_METRICS_CONFIG.find((f) => f.id === 'avgListSize');
      expect(field).toBeDefined();
      expect(field?.type).toBe('number');
      expect(field?.min).toBe(1);
      expect(field?.max).toBe(1000);
    });

    it('should include replyAllFrequency field', () => {
      const field = EMAIL_METRICS_CONFIG.find((f) => f.id === 'replyAllFrequency');
      expect(field).toBeDefined();
      expect(field?.type).toBe('frequency');
    });

    it('should have guidance text for each field', () => {
      EMAIL_METRICS_CONFIG.forEach((field) => {
        expect(field.guidance).toBeTruthy();
      });
    });
  });

  describe('CHAT_METRICS_CONFIG', () => {
    it('should have 4 chat metric fields', () => {
      expect(CHAT_METRICS_CONFIG).toHaveLength(4);
    });

    it('should include activeChannels field', () => {
      const field = CHAT_METRICS_CONFIG.find((f) => f.id === 'activeChannels');
      expect(field).toBeDefined();
      expect(field?.min).toBe(1);
      expect(field?.max).toBe(500);
    });

    it('should include dmRatioPercent as percentage type', () => {
      const field = CHAT_METRICS_CONFIG.find((f) => f.id === 'dmRatioPercent');
      expect(field).toBeDefined();
      expect(field?.type).toBe('percentage');
    });
  });

  describe('MEETING_METRICS_CONFIG', () => {
    it('should have 2 meeting metric fields', () => {
      expect(MEETING_METRICS_CONFIG).toHaveLength(2);
    });

    it('should include infoCascadeMeetingsPerWeek field', () => {
      const field = MEETING_METRICS_CONFIG.find((f) => f.id === 'infoCascadeMeetingsPerWeek');
      expect(field).toBeDefined();
      expect(field?.max).toBe(50);
    });

    it('should include decisionDocumentationRatePercent field', () => {
      const field = MEETING_METRICS_CONFIG.find((f) => f.id === 'decisionDocumentationRatePercent');
      expect(field).toBeDefined();
      expect(field?.type).toBe('percentage');
    });
  });

  describe('METRICS_SECTIONS', () => {
    it('should have 3 sections', () => {
      expect(METRICS_SECTIONS).toHaveLength(3);
    });

    it('should include email, chat, and meetings sections', () => {
      const ids = METRICS_SECTIONS.map((s) => s.id);
      expect(ids).toContain('email');
      expect(ids).toContain('chat');
      expect(ids).toContain('meetings');
    });

    it('should have icon, title, and description for each section', () => {
      METRICS_SECTIONS.forEach((section) => {
        expect(section.icon).toBeTruthy();
        expect(section.title).toBeTruthy();
        expect(section.description).toBeTruthy();
      });
    });
  });

  describe('getFrequencyLevelInfo', () => {
    it('should return info for valid frequency level', () => {
      const info = getFrequencyLevelInfo('sometimes');
      expect(info.value).toBe('sometimes');
      expect(info.label).toBe('Sometimes');
    });

    it('should return first level for invalid frequency', () => {
      const info = getFrequencyLevelInfo('invalid' as FrequencyLevel);
      expect(info.value).toBe('never');
    });
  });

  describe('getSectionConfig', () => {
    it('should return section config by ID', () => {
      const config = getSectionConfig('email');
      expect(config?.id).toBe('email');
      expect(config?.title).toBe('Email Communication');
    });

    it('should return undefined for invalid section ID', () => {
      const config = getSectionConfig('invalid');
      expect(config).toBeUndefined();
    });
  });

  describe('createDefaultEmailMetrics', () => {
    it('should create default email metrics', () => {
      const metrics = createDefaultEmailMetrics();
      expect(metrics.distributionListCount).toBe(0);
      expect(metrics.avgListSize).toBe(0);
      expect(metrics.replyAllFrequency).toBe('sometimes');
      expect(metrics.urgentResponseTimeHours).toBe(0);
    });
  });

  describe('createDefaultChatMetrics', () => {
    it('should create default chat metrics', () => {
      const metrics = createDefaultChatMetrics();
      expect(metrics.activeChannels).toBe(0);
      expect(metrics.dmRatioPercent).toBe(50);
      expect(metrics.atHereFrequency).toBe('sometimes');
      expect(metrics.crossChannelRedundancyPercent).toBe(0);
    });
  });

  describe('createDefaultMeetingMetrics', () => {
    it('should create default meeting metrics', () => {
      const metrics = createDefaultMeetingMetrics();
      expect(metrics.infoCascadeMeetingsPerWeek).toBe(0);
      expect(metrics.decisionDocumentationRatePercent).toBe(0);
      expect(metrics.pulledFromTool2).toBe(false);
    });
  });

  describe('isEmailMetricsComplete', () => {
    it('should return false for null', () => {
      expect(isEmailMetricsComplete(null)).toBe(false);
    });

    it('should return false for default metrics', () => {
      const metrics = createDefaultEmailMetrics();
      expect(isEmailMetricsComplete(metrics)).toBe(false);
    });

    it('should return true when all required fields are filled', () => {
      const metrics = {
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'sometimes' as FrequencyLevel,
        urgentResponseTimeHours: 4,
      };
      expect(isEmailMetricsComplete(metrics)).toBe(true);
    });

    it('should return false when any required field is zero', () => {
      const metrics = {
        distributionListCount: 50,
        avgListSize: 0,
        replyAllFrequency: 'sometimes' as FrequencyLevel,
        urgentResponseTimeHours: 4,
      };
      expect(isEmailMetricsComplete(metrics)).toBe(false);
    });
  });

  describe('isChatMetricsComplete', () => {
    it('should return false for null', () => {
      expect(isChatMetricsComplete(null)).toBe(false);
    });

    it('should return true when activeChannels is set', () => {
      const metrics = {
        activeChannels: 75,
        dmRatioPercent: 50,
        atHereFrequency: 'sometimes' as FrequencyLevel,
        crossChannelRedundancyPercent: 0,
      };
      expect(isChatMetricsComplete(metrics)).toBe(true);
    });

    it('should return false when activeChannels is zero', () => {
      const metrics = createDefaultChatMetrics();
      expect(isChatMetricsComplete(metrics)).toBe(false);
    });
  });

  describe('isMeetingMetricsComplete', () => {
    it('should return false for null', () => {
      expect(isMeetingMetricsComplete(null)).toBe(false);
    });

    it('should return true when pulledFromTool2 is true', () => {
      const metrics = {
        infoCascadeMeetingsPerWeek: 0,
        decisionDocumentationRatePercent: 0,
        pulledFromTool2: true,
      };
      expect(isMeetingMetricsComplete(metrics)).toBe(true);
    });

    it('should return true when infoCascadeMeetingsPerWeek is set', () => {
      const metrics = {
        infoCascadeMeetingsPerWeek: 5,
        decisionDocumentationRatePercent: 0,
        pulledFromTool2: false,
      };
      expect(isMeetingMetricsComplete(metrics)).toBe(true);
    });

    it('should return true when decisionDocumentationRatePercent is set', () => {
      const metrics = {
        infoCascadeMeetingsPerWeek: 0,
        decisionDocumentationRatePercent: 30,
        pulledFromTool2: false,
      };
      expect(isMeetingMetricsComplete(metrics)).toBe(true);
    });

    it('should return false when all values are zero and not pulled', () => {
      const metrics = createDefaultMeetingMetrics();
      expect(isMeetingMetricsComplete(metrics)).toBe(false);
    });
  });

  describe('isAllMetricsComplete', () => {
    it('should return false when no metrics', () => {
      expect(isAllMetricsComplete({ email: null, chat: null, meetings: null })).toBe(false);
    });

    it('should return true when all metrics complete', () => {
      const metrics = {
        email: {
          distributionListCount: 50,
          avgListSize: 25,
          replyAllFrequency: 'sometimes' as FrequencyLevel,
          urgentResponseTimeHours: 4,
        },
        chat: {
          activeChannels: 75,
          dmRatioPercent: 50,
          atHereFrequency: 'sometimes' as FrequencyLevel,
          crossChannelRedundancyPercent: 0,
        },
        meetings: {
          infoCascadeMeetingsPerWeek: 5,
          decisionDocumentationRatePercent: 30,
          pulledFromTool2: false,
        },
      };
      expect(isAllMetricsComplete(metrics)).toBe(true);
    });
  });

  describe('countCompletedSections', () => {
    it('should return 0 when no sections complete', () => {
      expect(countCompletedSections({ email: null, chat: null, meetings: null })).toBe(0);
    });

    it('should return 1 when one section complete', () => {
      const metrics = {
        email: {
          distributionListCount: 50,
          avgListSize: 25,
          replyAllFrequency: 'sometimes' as FrequencyLevel,
          urgentResponseTimeHours: 4,
        },
        chat: null,
        meetings: null,
      };
      expect(countCompletedSections(metrics)).toBe(1);
    });

    it('should return 3 when all sections complete', () => {
      const metrics = {
        email: {
          distributionListCount: 50,
          avgListSize: 25,
          replyAllFrequency: 'sometimes' as FrequencyLevel,
          urgentResponseTimeHours: 4,
        },
        chat: {
          activeChannels: 75,
          dmRatioPercent: 50,
          atHereFrequency: 'sometimes' as FrequencyLevel,
          crossChannelRedundancyPercent: 0,
        },
        meetings: {
          infoCascadeMeetingsPerWeek: 5,
          decisionDocumentationRatePercent: 30,
          pulledFromTool2: false,
        },
      };
      expect(countCompletedSections(metrics)).toBe(3);
    });
  });

  describe('frequencyToScore', () => {
    it('should return 0 for never', () => {
      expect(frequencyToScore('never')).toBe(0);
    });

    it('should return 1 for rarely', () => {
      expect(frequencyToScore('rarely')).toBe(1);
    });

    it('should return 2 for sometimes', () => {
      expect(frequencyToScore('sometimes')).toBe(2);
    });

    it('should return 3 for often', () => {
      expect(frequencyToScore('often')).toBe(3);
    });

    it('should return 4 for always', () => {
      expect(frequencyToScore('always')).toBe(4);
    });
  });
});
