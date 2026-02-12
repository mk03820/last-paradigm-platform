/**
 * Aggregated Data Preview Component
 *
 * Displays summary cards for each completed tool showing key metrics.
 * Supports expand/collapse for additional details.
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Task 4: Create AggregatedDataPreview component (AC: 1, 2)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  type AggregatedToolData,
  type Tool1Aggregation,
  type Tool2Aggregation,
  type Tool3Aggregation,
  type Tool4Aggregation,
  type Tool5Aggregation,
  type Tool6Aggregation,
} from './cost-constants';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  Users,
  TrendingDown,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ============================================================================
// Types
// ============================================================================

export interface AggregatedDataPreviewProps {
  /** Aggregated data from all tools */
  aggregatedData: AggregatedToolData | null;
  /** Optional className */
  className?: string;
}

interface DataCardProps {
  title: string;
  toolNumber: number;
  icon: React.ReactNode;
  primaryLabel: string;
  primaryValue: string | number;
  details: { label: string; value: string | number }[];
  colorClass: string;
  defaultOpen?: boolean;
}

// ============================================================================
// Helper Components
// ============================================================================

function DataCard({
  title,
  toolNumber,
  icon,
  primaryLabel,
  primaryValue,
  details,
  colorClass,
  defaultOpen = false,
}: DataCardProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'rounded-lg border p-4 transition-colors',
          'hover:border-primary/50'
        )}
      >
        {/* Header - Always visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', colorClass)}>
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Tool {toolNumber}
                  </p>
                  <h3 className="font-semibold">{title}</h3>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Primary Metric */}
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">{primaryLabel}</p>
              <p className="text-2xl font-bold">{primaryValue}</p>
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Collapsible Details */}
        <CollapsibleContent>
          <div className="mt-3 pt-3 border-t space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 px-4">
      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
      <h3 className="font-medium text-lg mb-1">No Data Available</h3>
      <p className="text-sm text-muted-foreground">
        Complete the diagnostic tools to see aggregated data here.
        Tool 2 (Meeting Audit) is required as a minimum.
      </p>
    </div>
  );
}

// ============================================================================
// Data Card Factories
// ============================================================================

function renderTool1Card(data: Tool1Aggregation) {
  return (
    <DataCard
      title="Alignment"
      toolNumber={1}
      icon={<Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      primaryLabel="Composite Score"
      primaryValue={`${data.compositeScore.toFixed(1)} / 4.0`}
      colorClass="bg-blue-100 dark:bg-blue-900/30"
      details={[
        { label: 'Category', value: data.category.charAt(0).toUpperCase() + data.category.slice(1) },
        { label: 'Weakest Dimension', value: data.weakestDimension },
      ]}
    />
  );
}

function renderTool2Card(data: Tool2Aggregation) {
  return (
    <DataCard
      title="Meeting Audit"
      toolNumber={2}
      icon={<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />}
      primaryLabel="Annual Meeting Waste"
      primaryValue={formatCurrency(data.annualizedWaste)}
      colorClass="bg-green-100 dark:bg-green-900/30"
      defaultOpen
      details={[
        { label: 'Meetings/Week', value: data.meetingsPerWeek },
        { label: 'Attendee Hours/Week', value: `${data.totalAttendeeHours.toFixed(0)} hrs` },
      ]}
    />
  );
}

function renderTool3Card(data: Tool3Aggregation) {
  const bottleneckDisplay = data.bottleneckPatterns.length > 0
    ? data.bottleneckPatterns.join(', ')
    : 'None detected';

  return (
    <DataCard
      title="Decision Velocity"
      toolNumber={3}
      icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
      primaryLabel="Avg Decision Latency"
      primaryValue={`${data.avgDecisionLatencyDays} days`}
      colorClass="bg-amber-100 dark:bg-amber-900/30"
      details={[
        { label: 'Decision Types', value: data.decisionTypeCount },
        { label: 'Bottlenecks', value: bottleneckDisplay },
      ]}
    />
  );
}

function renderTool4Card(data: Tool4Aggregation) {
  const riskDisplay = data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1);

  return (
    <DataCard
      title="Stakeholder Map"
      toolNumber={4}
      icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
      primaryLabel="Stakeholders Mapped"
      primaryValue={data.stakeholderCount}
      colorClass="bg-purple-100 dark:bg-purple-900/30"
      details={[
        { label: 'Key Players', value: data.keyPlayerCount },
        { label: 'Potential Blockers', value: data.blockerCount },
        { label: 'Risk Level', value: riskDisplay },
      ]}
    />
  );
}

function renderTool5Card(data: Tool5Aggregation) {
  return (
    <DataCard
      title="Data Flow"
      toolNumber={5}
      icon={<TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
      primaryLabel="Total Friction Cost"
      primaryValue={formatCurrency(data.totalFrictionCost)}
      colorClass="bg-red-100 dark:bg-red-900/30"
      details={[
        { label: 'Data Journeys', value: data.journeyCount },
        { label: 'Friction Points', value: data.frictionPointCount },
        { label: 'Critical Issues', value: data.criticalFrictionCount },
      ]}
    />
  );
}

function renderTool6Card(data: Tool6Aggregation) {
  const statusDisplay = data.healthStatus.charAt(0).toUpperCase() + data.healthStatus.slice(1);

  return (
    <DataCard
      title="Communication"
      toolNumber={6}
      icon={<MessageSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
      primaryLabel="Health Score"
      primaryValue={`${data.healthScore}/100`}
      colorClass="bg-cyan-100 dark:bg-cyan-900/30"
      details={[
        { label: 'Status', value: statusDisplay },
        { label: 'Patterns Detected', value: data.patternsDetected },
        { label: 'Interventions', value: data.interventionsRecommended },
      ]}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AggregatedDataPreview({
  aggregatedData,
  className,
}: AggregatedDataPreviewProps) {
  // Check if we have any completed tools
  const hasAnyData = aggregatedData && aggregatedData.completedToolsCount > 0;

  if (!hasAnyData) {
    return (
      <div className={cn('rounded-lg border bg-card', className)}>
        <EmptyState />
      </div>
    );
  }

  // Build list of cards for completed tools
  const cards: React.ReactNode[] = [];

  if (aggregatedData.tool1) {
    cards.push(
      <div key="tool1">
        {renderTool1Card(aggregatedData.tool1)}
      </div>
    );
  }

  if (aggregatedData.tool2) {
    cards.push(
      <div key="tool2">
        {renderTool2Card(aggregatedData.tool2)}
      </div>
    );
  }

  if (aggregatedData.tool3) {
    cards.push(
      <div key="tool3">
        {renderTool3Card(aggregatedData.tool3)}
      </div>
    );
  }

  if (aggregatedData.tool4) {
    cards.push(
      <div key="tool4">
        {renderTool4Card(aggregatedData.tool4)}
      </div>
    );
  }

  if (aggregatedData.tool5) {
    cards.push(
      <div key="tool5">
        {renderTool5Card(aggregatedData.tool5)}
      </div>
    );
  }

  if (aggregatedData.tool6) {
    cards.push(
      <div key="tool6">
        {renderTool6Card(aggregatedData.tool6)}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-4 sm:p-6', className)}>
      <h2 className="text-lg font-semibold mb-4">Aggregated Data Preview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards}
      </div>

      {aggregatedData.aggregatedAt && (
        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          Last aggregated: {new Date(aggregatedData.aggregatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
