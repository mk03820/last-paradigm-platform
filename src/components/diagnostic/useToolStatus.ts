/**
 * Hook to get tool status and results from stores
 *
 * Story 8.5: Diagnostic Tool Hub
 * Covers: AC2 (status), AC3 (result summaries), AC4 (completion percentage)
 */

'use client';

import { useMemo } from 'react';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool1Store } from '@/lib/store/tool1-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import type { ToolStatus, DiagnosticTool } from './diagnostic-constants';
import {
  DIAGNOSTIC_TOOLS,
  formatCurrency,
  calculateCompletionPercentage,
  TOTAL_TOOLS,
} from './diagnostic-constants';
import { SCORE_CATEGORIES } from '@/components/tools/alignment/constants';

export interface ToolStatusInfo {
  status: ToolStatus;
  resultSummary: string | null;
}

export interface DiagnosticProgress {
  completedCount: number;
  inProgressCount: number;
  totalTools: number;
  percentage: number;
}

/**
 * Get status for a single tool based on its store data
 */
function getTool1Status(store: ReturnType<typeof useTool1Store.getState>): ToolStatusInfo {
  if (store.completion) {
    const score = store.completion.compositeScore;
    const category = SCORE_CATEGORIES.find(
      (c) => score >= c.min && score < c.max
    ) || SCORE_CATEGORIES[SCORE_CATEGORIES.length - 1];
    return {
      status: 'completed',
      resultSummary: `Score: ${score.toFixed(1)} (${category.label})`,
    };
  }

  const scoredCount = Object.values(store.scores).filter((s) => s !== undefined).length;
  if (scoredCount > 0) {
    return {
      status: 'in_progress',
      resultSummary: `${scoredCount} of 5 dimensions scored`,
    };
  }

  return { status: 'not_started', resultSummary: null };
}

function getTool2Status(store: ReturnType<typeof useCalculatorStore.getState>): ToolStatusInfo {
  if (store.results) {
    return {
      status: 'completed',
      resultSummary: `Meeting Waste: ${formatCurrency(store.results.meetingWaste)}/year`,
    };
  }

  if (store.meetingData) {
    return {
      status: 'in_progress',
      resultSummary: 'Data entered, ready to calculate',
    };
  }

  return { status: 'not_started', resultSummary: null };
}

function getTool3Status(store: ReturnType<typeof useTool3Store.getState>): ToolStatusInfo {
  if (store.completion) {
    return {
      status: 'completed',
      resultSummary: 'Velocity analysis complete',
    };
  }

  const totalSamples = Object.values(store.archetypes).reduce(
    (sum, a) => sum + a.samples.length,
    0
  );

  if (totalSamples > 0) {
    return {
      status: 'in_progress',
      resultSummary: `${totalSamples} decision samples entered`,
    };
  }

  return { status: 'not_started', resultSummary: null };
}

function getTool4Status(store: ReturnType<typeof useTool4Store.getState>): ToolStatusInfo {
  if (store.completion) {
    return {
      status: 'completed',
      resultSummary: `${store.completion.stakeholderCount} stakeholders mapped`,
    };
  }

  if (store.stakeholders.length > 0) {
    return {
      status: 'in_progress',
      resultSummary: `${store.stakeholders.length} stakeholders added`,
    };
  }

  return { status: 'not_started', resultSummary: null };
}

// Tools 5, 6, 7 are not yet implemented - always not_started
function getNotImplementedStatus(): ToolStatusInfo {
  return { status: 'not_started', resultSummary: null };
}

/**
 * Hook to get status for all tools
 */
export function useAllToolStatuses(): Map<string, ToolStatusInfo> {
  // Subscribe to all stores
  const tool1Store = useTool1Store();
  const calculatorStore = useCalculatorStore();
  const tool3Store = useTool3Store();
  const tool4Store = useTool4Store();

  return useMemo(() => {
    const statuses = new Map<string, ToolStatusInfo>();

    statuses.set('alignment', getTool1Status(tool1Store));
    statuses.set('meeting-audit', getTool2Status(calculatorStore));
    statuses.set('decision-velocity', getTool3Status(tool3Store));
    statuses.set('stakeholder-map', getTool4Status(tool4Store));
    statuses.set('data-flow', getNotImplementedStatus());
    statuses.set('communication', getNotImplementedStatus());
    statuses.set('total-cost', getNotImplementedStatus());

    return statuses;
  }, [tool1Store, calculatorStore, tool3Store, tool4Store]);
}

/**
 * Hook to get status for a single tool
 */
export function useToolStatus(toolId: string): ToolStatusInfo {
  const allStatuses = useAllToolStatuses();
  return allStatuses.get(toolId) || { status: 'not_started', resultSummary: null };
}

/**
 * Hook to get overall diagnostic progress
 */
export function useDiagnosticProgress(): DiagnosticProgress {
  const allStatuses = useAllToolStatuses();

  return useMemo(() => {
    let completedCount = 0;
    let inProgressCount = 0;

    allStatuses.forEach((info) => {
      if (info.status === 'completed') {
        completedCount++;
      } else if (info.status === 'in_progress') {
        inProgressCount++;
      }
    });

    return {
      completedCount,
      inProgressCount,
      totalTools: TOTAL_TOOLS,
      percentage: calculateCompletionPercentage(completedCount),
    };
  }, [allStatuses]);
}

/**
 * Get all tools with their current status
 */
export function useToolsWithStatus(): Array<DiagnosticTool & ToolStatusInfo> {
  const allStatuses = useAllToolStatuses();

  return useMemo(() => {
    return DIAGNOSTIC_TOOLS.map((tool) => {
      const statusInfo = allStatuses.get(tool.id) || {
        status: 'not_started' as ToolStatus,
        resultSummary: null,
      };
      return { ...tool, ...statusInfo };
    });
  }, [allStatuses]);
}
