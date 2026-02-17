/**
 * ResultsGrid Component
 *
 * Displays all 7 tool results in a responsive grid layout.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 4: Create results grid layout (AC: 2, 8)
 * Covers: FR64 (All 7 tool results display)
 */

'use client';

import { AlignmentResultCard } from './AlignmentResultCard';
import { MeetingAuditResultCard } from './MeetingAuditResultCard';
import { DecisionVelocityResultCard } from './DecisionVelocityResultCard';
import { StakeholderMapResultCard } from './StakeholderMapResultCard';
import { DataFlowResultCard } from './DataFlowResultCard';
import { CommunicationResultCard } from './CommunicationResultCard';
import { TotalCostResultCard } from './TotalCostResultCard';
import type { ToolResultsData } from './types';

interface ResultsGridProps {
  toolResults: ToolResultsData | null;
}

export function ResultsGrid({ toolResults }: ResultsGridProps) {
  // Empty state
  if (!toolResults) {
    return (
      <section aria-label="Diagnostic tool results" role="region">
        <h2 className="text-lg font-semibold mb-4">Tool Results</h2>
        <div className="p-8 text-center border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No results available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Diagnostic tool results" role="region">
      <h2 className="text-lg font-semibold mb-4">Tool Results</h2>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Diagnostic tool results"
        data-testid="results-grid"
      >
        {/* Tool 1: Alignment Assessment */}
        <div role="listitem">
          <AlignmentResultCard data={toolResults.tool1} />
        </div>

        {/* Tool 2: Meeting Audit */}
        <div role="listitem">
          <MeetingAuditResultCard data={toolResults.tool2} />
        </div>

        {/* Tool 3: Decision Velocity */}
        <div role="listitem">
          <DecisionVelocityResultCard data={toolResults.tool3} />
        </div>

        {/* Tool 4: Stakeholder Map */}
        <div role="listitem">
          <StakeholderMapResultCard data={toolResults.tool4} />
        </div>

        {/* Tool 5: Data Flow Friction */}
        <div role="listitem">
          <DataFlowResultCard data={toolResults.tool5} />
        </div>

        {/* Tool 6: Communication Pattern */}
        <div role="listitem">
          <CommunicationResultCard data={toolResults.tool6} />
        </div>

        {/* Tool 7: Total Cost */}
        <div role="listitem">
          <TotalCostResultCard data={toolResults.tool7} />
        </div>
      </div>
    </section>
  );
}
