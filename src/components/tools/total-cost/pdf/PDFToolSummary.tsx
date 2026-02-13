/**
 * PDF Tool Summary Component
 *
 * Reusable component for displaying individual tool results in the PDF.
 * Provides a consistent format for all 6 diagnostic tool summaries.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Results from each of 7 tools with key visualizations)
 */

import { View, Text } from '@react-pdf/renderer';
import {
  diagnosticPDFStyles as styles,
  brandColors,
  formatCurrencyPDF,
  formatPercentPDF,
} from './DiagnosticPDFStyles';
import type {
  Tool1Aggregation,
  Tool2Aggregation,
  Tool3Aggregation,
  Tool4Aggregation,
  Tool5Aggregation,
  Tool6Aggregation,
  AlignmentCategory,
} from '../cost-constants';

interface PDFToolSummaryProps {
  /** Tool number (1-6) */
  toolNumber: number;
  /** Tool name */
  toolName: string;
  /** Tool data (null if not completed) */
  data:
    | Tool1Aggregation
    | Tool2Aggregation
    | Tool3Aggregation
    | Tool4Aggregation
    | Tool5Aggregation
    | Tool6Aggregation
    | null;
}

/**
 * Get alignment category display info
 */
function getAlignmentCategoryInfo(category: AlignmentCategory): {
  label: string;
  color: string;
} {
  const categories: Record<AlignmentCategory, { label: string; color: string }> = {
    chaos: { label: 'Chaos', color: '#dc2626' },
    siloed: { label: 'Siloed', color: '#d97706' },
    coordinated: { label: 'Coordinated', color: '#0284c7' },
    integrated: { label: 'Integrated', color: '#059669' },
  };
  return categories[category] || { label: category, color: brandColors.muted };
}

/**
 * Get risk level display info
 */
function getRiskLevelInfo(level: string): { label: string; color: string } {
  const levels: Record<string, { label: string; color: string }> = {
    low: { label: 'Low Risk', color: '#059669' },
    medium: { label: 'Medium Risk', color: '#d97706' },
    high: { label: 'High Risk', color: '#dc2626' },
  };
  return levels[level] || { label: level, color: brandColors.muted };
}

/**
 * Get health status display info
 */
function getHealthStatusInfo(status: string): { label: string; color: string } {
  const statuses: Record<string, { label: string; color: string }> = {
    healthy: { label: 'Healthy', color: '#059669' },
    warning: { label: 'Warning', color: '#d97706' },
    crisis: { label: 'Crisis', color: '#dc2626' },
  };
  return statuses[status] || { label: status, color: brandColors.muted };
}

/**
 * Render Tool 1: Alignment Assessment Summary
 */
function Tool1Summary({ data }: { data: Tool1Aggregation }) {
  const categoryInfo = getAlignmentCategoryInfo(data.category);
  return (
    <View>
      <View style={styles.toolSummaryHeader}>
        <View>
          <Text style={styles.toolMetric}>{data.compositeScore.toFixed(1)}</Text>
          <Text style={styles.toolMetricLabel}>Composite Score (1-4)</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.toolMetric, { color: categoryInfo.color }]}>
            {categoryInfo.label}
          </Text>
          <Text style={styles.toolMetricLabel}>Category</Text>
        </View>
      </View>
      <Text style={styles.toolInsight}>
        Weakest Dimension: {data.weakestDimension}
      </Text>
    </View>
  );
}

/**
 * Render Tool 2: Meeting Audit Summary
 */
function Tool2Summary({ data }: { data: Tool2Aggregation }) {
  return (
    <View>
      <View style={styles.toolSummaryHeader}>
        <View>
          <Text style={styles.toolMetric}>{formatCurrencyPDF(data.annualizedWaste)}</Text>
          <Text style={styles.toolMetricLabel}>Annual Meeting Waste</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.toolMetric}>{data.meetingsPerWeek}</Text>
          <Text style={styles.toolMetricLabel}>Meetings/Week</Text>
        </View>
      </View>
      <Text style={styles.toolInsight}>
        Total Attendee Hours: {data.totalAttendeeHours.toLocaleString()} per week
      </Text>
    </View>
  );
}

/**
 * Render Tool 3: Decision Velocity Summary
 */
function Tool3Summary({ data }: { data: Tool3Aggregation }) {
  return (
    <View>
      <View style={styles.toolSummaryHeader}>
        <View>
          <Text style={styles.toolMetric}>{data.avgDecisionLatencyDays.toFixed(0)} days</Text>
          <Text style={styles.toolMetricLabel}>Avg Decision Latency</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.toolMetric}>{data.decisionTypeCount}</Text>
          <Text style={styles.toolMetricLabel}>Decision Types Analyzed</Text>
        </View>
      </View>
      {data.bottleneckPatterns.length > 0 && (
        <Text style={styles.toolInsight}>
          Bottlenecks: {data.bottleneckPatterns.join(', ')}
        </Text>
      )}
    </View>
  );
}

/**
 * Render Tool 4: Stakeholder Map Summary
 */
function Tool4Summary({ data }: { data: Tool4Aggregation }) {
  const riskInfo = getRiskLevelInfo(data.riskLevel);
  return (
    <View>
      <View style={styles.toolSummaryHeader}>
        <View>
          <Text style={styles.toolMetric}>{data.stakeholderCount}</Text>
          <Text style={styles.toolMetricLabel}>Stakeholders Mapped</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.toolMetric, { color: riskInfo.color }]}>
            {riskInfo.label}
          </Text>
          <Text style={styles.toolMetricLabel}>Risk Level</Text>
        </View>
      </View>
      <Text style={styles.toolInsight}>
        Key Players: {data.keyPlayerCount} | Potential Blockers: {data.blockerCount}
      </Text>
    </View>
  );
}

/**
 * Render Tool 5: Data Flow Friction Summary
 */
function Tool5Summary({ data }: { data: Tool5Aggregation }) {
  return (
    <View>
      <View style={styles.toolSummaryHeader}>
        <View>
          <Text style={styles.toolMetric}>{formatCurrencyPDF(data.totalFrictionCost)}</Text>
          <Text style={styles.toolMetricLabel}>Total Friction Cost</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.toolMetric}>{data.frictionPointCount}</Text>
          <Text style={styles.toolMetricLabel}>Friction Points</Text>
        </View>
      </View>
      <Text style={styles.toolInsight}>
        Journeys Analyzed: {data.journeyCount} | Critical Issues: {data.criticalFrictionCount}
      </Text>
    </View>
  );
}

/**
 * Render Tool 6: Communication Diagnostic Summary
 */
function Tool6Summary({ data }: { data: Tool6Aggregation }) {
  const healthInfo = getHealthStatusInfo(data.healthStatus);
  return (
    <View>
      <View style={styles.toolSummaryHeader}>
        <View>
          <Text style={styles.toolMetric}>{data.healthScore}</Text>
          <Text style={styles.toolMetricLabel}>Health Score (0-100)</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.toolMetric, { color: healthInfo.color }]}>
            {healthInfo.label}
          </Text>
          <Text style={styles.toolMetricLabel}>Status</Text>
        </View>
      </View>
      <Text style={styles.toolInsight}>
        Patterns Detected: {data.patternsDetected} | Interventions Recommended: {data.interventionsRecommended}
      </Text>
    </View>
  );
}

/**
 * Not Completed Summary
 */
function NotCompletedSummary() {
  return (
    <View>
      <Text style={[styles.toolInsight, { color: brandColors.muted, fontStyle: 'italic' }]}>
        This tool was not completed in the diagnostic.
      </Text>
    </View>
  );
}

/**
 * PDF Tool Summary
 *
 * Renders a card-style summary for a single diagnostic tool.
 * Handles all 6 tool types with appropriate metrics display.
 */
export function PDFToolSummary({
  toolNumber,
  toolName,
  data,
}: PDFToolSummaryProps) {
  return (
    <View style={styles.toolSummaryCard}>
      {/* Header */}
      <Text style={styles.toolNumber}>TOOL {toolNumber}</Text>
      <Text style={styles.toolName}>{toolName}</Text>

      {/* Content based on tool type */}
      {!data ? (
        <NotCompletedSummary />
      ) : toolNumber === 1 ? (
        <Tool1Summary data={data as Tool1Aggregation} />
      ) : toolNumber === 2 ? (
        <Tool2Summary data={data as Tool2Aggregation} />
      ) : toolNumber === 3 ? (
        <Tool3Summary data={data as Tool3Aggregation} />
      ) : toolNumber === 4 ? (
        <Tool4Summary data={data as Tool4Aggregation} />
      ) : toolNumber === 5 ? (
        <Tool5Summary data={data as Tool5Aggregation} />
      ) : toolNumber === 6 ? (
        <Tool6Summary data={data as Tool6Aggregation} />
      ) : (
        <NotCompletedSummary />
      )}
    </View>
  );
}

/**
 * All Tools Summary Page Section
 *
 * Renders all 6 tool summaries in a consistent layout.
 */
export function PDFAllToolsSummary({
  data,
}: {
  data: {
    tool1: Tool1Aggregation | null;
    tool2: Tool2Aggregation | null;
    tool3: Tool3Aggregation | null;
    tool4: Tool4Aggregation | null;
    tool5: Tool5Aggregation | null;
    tool6: Tool6Aggregation | null;
  };
}) {
  const tools = [
    { number: 1, name: 'Organizational Alignment Assessment', data: data.tool1 },
    { number: 2, name: 'Meeting Audit Calculator', data: data.tool2 },
    { number: 3, name: 'Decision Velocity Scorecard', data: data.tool3 },
    { number: 4, name: 'Stakeholder Power/Interest Map', data: data.tool4 },
    { number: 5, name: 'Data Flow Friction Analysis', data: data.tool5 },
    { number: 6, name: 'Communication Pattern Diagnostic', data: data.tool6 },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.pageTitle}>Diagnostic Tool Results</Text>
      <Text style={styles.body}>
        Summary of findings from each diagnostic tool in the assessment.
      </Text>

      {tools.map((tool) => (
        <PDFToolSummary
          key={tool.number}
          toolNumber={tool.number}
          toolName={tool.name}
          data={tool.data}
        />
      ))}
    </View>
  );
}
