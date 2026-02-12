import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  EmailMetrics,
  ChatMetrics,
  MeetingMetrics,
  CommunicationMetrics,
  PatternAnalysis,
} from '@/components/tools/communication/comm-constants';
import {
  createDefaultEmailMetrics,
  createDefaultChatMetrics,
  createDefaultMeetingMetrics,
  isEmailMetricsComplete,
  isChatMetricsComplete,
  isMeetingMetricsComplete,
  isAllMetricsComplete,
  countCompletedSections,
} from '@/components/tools/communication/comm-constants';
import { analyzePatterns } from '@/components/tools/communication/detection-engine';
import { useCalculatorStore } from './calculator-store';

/**
 * Tool 6 Communication Pattern Diagnostic Store
 *
 * Manages state for the Communication Pattern Diagnostic tool.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 13.1: Communication Metrics Input
 * Covers: FR2-26 (Input communication pattern metrics)
 */

export interface Tool6CompletionData {
  completedAt: string;
  emailComplete: boolean;
  chatComplete: boolean;
  meetingsComplete: boolean;
}

export interface Tool6State {
  // Metrics data
  email: EmailMetrics | null;
  chat: ChatMetrics | null;
  meetings: MeetingMetrics | null;

  // Analysis results (Story 13.2)
  analysisResults: PatternAnalysis | null;

  // Server session ID for sync (if authenticated)
  sessionId: string | null;

  // Track if data needs server sync
  isDirty: boolean;

  // Completion tracking
  completion: Tool6CompletionData | null;

  // Actions
  setEmailMetrics: (metrics: EmailMetrics) => void;
  setChatMetrics: (metrics: ChatMetrics) => void;
  setMeetingMetrics: (metrics: MeetingMetrics) => void;
  updateEmailField: <K extends keyof EmailMetrics>(field: K, value: EmailMetrics[K]) => void;
  updateChatField: <K extends keyof ChatMetrics>(field: K, value: ChatMetrics[K]) => void;
  updateMeetingField: <K extends keyof MeetingMetrics>(field: K, value: MeetingMetrics[K]) => void;

  // Session
  setSessionId: (id: string | null) => void;

  // Completion
  markComplete: () => void;
  resetTool6: () => void;

  // Computed helpers
  getMetrics: () => CommunicationMetrics;
  isComplete: () => boolean;
  getCompletedSectionsCount: () => number;
  isEmailComplete: () => boolean;
  isChatComplete: () => boolean;
  isMeetingsComplete: () => boolean;

  // Tool 2 integration
  pullFromTool2: () => boolean;

  // Analysis (Story 13.2)
  runAnalysis: () => PatternAnalysis | null;
  isAnalysisComplete: () => boolean;
  clearAnalysis: () => void;
}

export const useTool6Store = create<Tool6State>()(
  persist(
    (set, get) => ({
      // Initial state
      email: null,
      chat: null,
      meetings: null,
      analysisResults: null,
      sessionId: null,
      isDirty: false,
      completion: null,

      // Set full email metrics
      setEmailMetrics: (metrics) => {
        set({
          email: metrics,
          isDirty: true,
          completion: null,
        });
      },

      // Set full chat metrics
      setChatMetrics: (metrics) => {
        set({
          chat: metrics,
          isDirty: true,
          completion: null,
        });
      },

      // Set full meeting metrics
      setMeetingMetrics: (metrics) => {
        set({
          meetings: metrics,
          isDirty: true,
          completion: null,
        });
      },

      // Update individual email field
      updateEmailField: (field, value) => {
        const { email } = get();
        const current = email || createDefaultEmailMetrics();
        set({
          email: { ...current, [field]: value },
          isDirty: true,
          completion: null,
        });
      },

      // Update individual chat field
      updateChatField: (field, value) => {
        const { chat } = get();
        const current = chat || createDefaultChatMetrics();
        set({
          chat: { ...current, [field]: value },
          isDirty: true,
          completion: null,
        });
      },

      // Update individual meeting field
      updateMeetingField: (field, value) => {
        const { meetings } = get();
        const current = meetings || createDefaultMeetingMetrics();
        set({
          meetings: { ...current, [field]: value },
          isDirty: true,
          completion: null,
        });
      },

      // Set server session ID
      setSessionId: (id) => {
        set({ sessionId: id });
      },

      // Mark tool as complete
      markComplete: () => {
        const { email, chat, meetings } = get();
        set({
          completion: {
            completedAt: new Date().toISOString(),
            emailComplete: isEmailMetricsComplete(email),
            chatComplete: isChatMetricsComplete(chat),
            meetingsComplete: isMeetingMetricsComplete(meetings),
          },
          isDirty: true,
        });
      },

      // Reset all Tool 6 data
      resetTool6: () => {
        set({
          email: null,
          chat: null,
          meetings: null,
          analysisResults: null,
          isDirty: false,
          completion: null,
        });
      },

      // Get all metrics as a single object
      getMetrics: () => {
        const { email, chat, meetings } = get();
        return { email, chat, meetings };
      },

      // Check if all metrics are complete
      isComplete: () => {
        const { email, chat, meetings } = get();
        return isAllMetricsComplete({ email, chat, meetings });
      },

      // Get count of completed sections
      getCompletedSectionsCount: () => {
        const { email, chat, meetings } = get();
        return countCompletedSections({ email, chat, meetings });
      },

      // Check individual section completion
      isEmailComplete: () => {
        return isEmailMetricsComplete(get().email);
      },

      isChatComplete: () => {
        return isChatMetricsComplete(get().chat);
      },

      isMeetingsComplete: () => {
        return isMeetingMetricsComplete(get().meetings);
      },

      // Pull meeting data from Tool 2 (calculator store)
      pullFromTool2: () => {
        const calcStore = useCalculatorStore.getState();

        // Check if Tool 2 has results
        if (!calcStore.results || !calcStore.meetingData) {
          return false;
        }

        const meetingData = calcStore.meetingData;

        // Calculate info cascade meetings estimate
        // Assume a percentage of meetings are info cascade based on meeting patterns
        // This is a heuristic - meetings with many attendees and short duration are likely info cascade
        const totalMeetingsPerWeek = meetingData.meetingCount || 0;
        const avgAttendees = meetingData.averageAttendees || 0;

        // Estimate: meetings with 10+ attendees are likely info cascade
        // Since we don't have per-meeting data, estimate 30% of large meetings are info cascade
        const estimatedInfoCascade = avgAttendees >= 10
          ? Math.round(totalMeetingsPerWeek * 0.3)
          : Math.round(totalMeetingsPerWeek * 0.15);

        // Decision documentation rate: estimate based on meeting patterns
        // Lower for organizations with many meetings (they tend to document less)
        const estimatedDocRate = totalMeetingsPerWeek > 20
          ? 20 // Heavy meeting culture = poor documentation
          : totalMeetingsPerWeek > 10
          ? 35
          : 50;

        set({
          meetings: {
            infoCascadeMeetingsPerWeek: estimatedInfoCascade,
            decisionDocumentationRatePercent: estimatedDocRate,
            pulledFromTool2: true,
          },
          isDirty: true,
          completion: null,
        });

        return true;
      },

      // Run anti-pattern analysis (Story 13.2)
      runAnalysis: () => {
        const { email, chat, meetings } = get();
        const metrics = { email, chat, meetings };

        // Only run if we have at least some metrics
        if (!email && !chat && !meetings) {
          return null;
        }

        const results = analyzePatterns(metrics);
        set({
          analysisResults: results,
          isDirty: true,
        });

        return results;
      },

      // Check if analysis has been run
      isAnalysisComplete: () => {
        return get().analysisResults !== null;
      },

      // Clear analysis results (useful when metrics change)
      clearAnalysis: () => {
        set({
          analysisResults: null,
        });
      },
    }),
    {
      name: 'tool6-communication-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        email: state.email,
        chat: state.chat,
        meetings: state.meetings,
        analysisResults: state.analysisResults,
        sessionId: state.sessionId,
        completion: state.completion,
      }),
    }
  )
);
