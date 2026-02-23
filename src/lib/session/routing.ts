/**
 * Session Routing Utilities
 *
 * Smart routing helpers for resuming diagnostic sessions at the
 * appropriate tool based on completion state.
 *
 * C3-S9: Smart routing helper + session resume UX
 */

import { DIAGNOSTIC_TOOLS } from '@/components/diagnostic/diagnostic-constants';
import type { DiagnosticSession, DiagnosticSessionData } from '@/lib/db/schema';

/**
 * Determines the next tool route for a session based on completion state.
 * Returns the first incomplete tool, or results page if all complete.
 *
 * @param session - The diagnostic session to route
 * @returns The route path to navigate to
 */
export function getNextToolRoute(session: DiagnosticSession): string {
  const data = session.data;

  // Find first incomplete tool
  for (let i = 1; i <= 7; i++) {
    const toolKey = `tool${i}` as keyof DiagnosticSessionData;
    const toolData = data?.[toolKey];

    // Check if tool has completedAt timestamp
    if (!toolData || !('completedAt' in toolData) || !toolData.completedAt) {
      const tool = DIAGNOSTIC_TOOLS.find((t) => t.number === i);
      return tool?.route || '/tool/meeting-audit';
    }
  }

  // All tools complete, go to results
  return '/tool/total-cost/results';
}

/**
 * Gets the last completed tool for display purposes.
 *
 * @param session - The diagnostic session
 * @returns Tool name and number, or null if none completed
 */
export function getLastCompletedTool(
  session: DiagnosticSession
): { name: string; number: number } | null {
  const data = session.data;
  if (!data) return null;

  // Check tools in reverse order to find last completed
  for (let i = 7; i >= 1; i--) {
    const toolKey = `tool${i}` as keyof DiagnosticSessionData;
    const toolData = data[toolKey];

    if (toolData && 'completedAt' in toolData && toolData.completedAt) {
      const tool = DIAGNOSTIC_TOOLS.find((t) => t.number === i);
      if (tool) {
        return { name: tool.name, number: i };
      }
    }
  }

  return null;
}

/**
 * Builds a session URL with smart routing.
 * Routes to the appropriate tool based on session state.
 *
 * @param session - The diagnostic session
 * @returns Full URL path with session query parameter
 */
export function buildSessionResumeUrl(session: DiagnosticSession): string {
  const route = getNextToolRoute(session);
  return `${route}?session=${session.id}`;
}

/**
 * Determines if a session should show "Continue" vs "View Results" action.
 *
 * @param session - The diagnostic session
 * @returns true if session is complete (all 7 tools done)
 */
export function isSessionComplete(session: DiagnosticSession): boolean {
  return session.toolsCompleted >= 7;
}

/**
 * Gets a human-readable status message for session progress.
 *
 * @param session - The diagnostic session
 * @returns Status message like "3 of 7 tools complete"
 */
export function getSessionProgressMessage(session: DiagnosticSession): string {
  if (session.toolsCompleted === 0) {
    return 'Not started';
  }
  if (session.toolsCompleted >= 7) {
    return 'Diagnostic complete';
  }
  return `${session.toolsCompleted} of 7 tools complete`;
}
