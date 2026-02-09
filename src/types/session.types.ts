/**
 * Session Type Definitions
 *
 * Types for diagnostic sessions and API responses.
 * Covers: Story 8.2 (User Dashboard and Session Management)
 */

import type { DiagnosticSession, DiagnosticSessionData } from '@/lib/db/schema';

export type { DiagnosticSession, DiagnosticSessionData };

/**
 * Session summary for dashboard display
 */
export interface SessionSummary {
  id: string;
  name: string | null;
  status: 'in_progress' | 'completed';
  toolsCompleted: number;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields for display
  progressPercent: number;
  lastToolCompleted: string | null;
}

/**
 * API response for listing sessions
 */
export interface SessionListResponse {
  success: true;
  data: {
    sessions: SessionSummary[];
  };
}

/**
 * API response for single session
 */
export interface SessionResponse {
  success: true;
  data: {
    session: DiagnosticSession;
  };
}

/**
 * API error response
 */
export interface SessionErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Request body for creating a session
 */
export interface CreateSessionRequest {
  name?: string;
}

/**
 * Request body for updating a session
 */
export interface UpdateSessionRequest {
  name?: string;
  status?: 'in_progress' | 'completed';
  toolsCompleted?: number;
  data?: Partial<DiagnosticSessionData>;
}

/**
 * Tool names for display
 */
export const TOOL_NAMES: Record<number, string> = {
  1: 'Organizational Alignment Assessment',
  2: 'Meeting Audit Calculator',
  3: 'Decision Velocity Scorecard',
  4: 'Stakeholder Power/Interest Mapping',
  5: 'Data Flow Friction Analysis',
  6: 'Communication Pattern Diagnostic',
  7: 'Total Cost of Misalignment',
};

/**
 * Get the name of the last completed tool
 */
export function getLastToolCompleted(data: DiagnosticSessionData | null): string | null {
  if (!data) return null;

  // Check tools in reverse order to find the last completed
  for (let i = 7; i >= 1; i--) {
    const toolKey = `tool${i}` as keyof DiagnosticSessionData;
    const toolData = data[toolKey];
    if (toolData && 'completedAt' in toolData && toolData.completedAt) {
      return TOOL_NAMES[i];
    }
  }

  return null;
}

/**
 * Convert database session to summary for dashboard
 */
export function toSessionSummary(session: DiagnosticSession): SessionSummary {
  return {
    id: session.id,
    name: session.name,
    status: session.status,
    toolsCompleted: session.toolsCompleted,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    progressPercent: Math.round((session.toolsCompleted / 7) * 100),
    lastToolCompleted: getLastToolCompleted(session.data),
  };
}
