/**
 * PDF Recommendations Component
 *
 * Displays action items and recommended next steps based on diagnostic findings.
 * Provides prioritized recommendations tailored to the organization's situation.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Recommended actions)
 */

import { View, Text } from '@react-pdf/renderer';
import {
  diagnosticPDFStyles as styles,
  brandColors,
} from './DiagnosticPDFStyles';
import type {
  AlignmentTaxResult,
  AggregatedToolData,
  InterpretationLevel,
} from '../cost-constants';
import { getLargestCostSource, getCostSourceLabel } from '../calculation-engine';

interface PDFRecommendationsProps {
  /** Alignment tax calculation result */
  result: AlignmentTaxResult;
  /** Aggregated data from all tools */
  aggregatedData: AggregatedToolData;
}

/**
 * Recommendation item with priority
 */
interface Recommendation {
  number: number;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium';
  timeframe: string;
}

/**
 * Generate recommendations based on diagnostic results
 */
function generateRecommendations(
  result: AlignmentTaxResult,
  aggregatedData: AggregatedToolData
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let num = 1;

  // Priority based on interpretation level
  const interpretationPriority: Record<InterpretationLevel, 'Critical' | 'High' | 'Medium'> = {
    existential: 'Critical',
    crisis: 'Critical',
    significant: 'High',
    normal: 'Medium',
  };
  const basePriority = interpretationPriority[result.interpretation.level];

  // 1. Address largest cost source first
  const largestSource = getLargestCostSource(result);
  if (largestSource) {
    const sourceLabel = getCostSourceLabel(largestSource.id);
    recommendations.push({
      number: num++,
      title: `Prioritize ${sourceLabel} Reduction`,
      description: `${sourceLabel} represents your largest alignment tax component. Focus immediate efforts on reducing this cost through targeted interventions.`,
      priority: basePriority,
      timeframe: '0-3 months',
    });
  }

  // 2. Meeting audit findings (Tool 2)
  if (aggregatedData.tool2 && aggregatedData.tool2.annualizedWaste > 100000) {
    recommendations.push({
      number: num++,
      title: 'Implement Meeting Hygiene Program',
      description: `With ${aggregatedData.tool2.meetingsPerWeek} meetings per week, implement meeting-free days, required agendas, and strict time limits. Target 20-30% reduction in recurring meetings.`,
      priority: basePriority === 'Critical' ? 'Critical' : 'High',
      timeframe: '0-6 months',
    });
  }

  // 3. Decision velocity (Tool 3)
  if (aggregatedData.tool3 && aggregatedData.tool3.avgDecisionLatencyDays > 10) {
    recommendations.push({
      number: num++,
      title: 'Streamline Decision-Making Processes',
      description: `Average decision latency of ${aggregatedData.tool3.avgDecisionLatencyDays} days indicates bottlenecks. Establish clear decision rights, implement RAPID framework, and create escalation paths.`,
      priority: 'High',
      timeframe: '3-6 months',
    });
  }

  // 4. Communication patterns (Tool 6)
  if (aggregatedData.tool6 && aggregatedData.tool6.healthStatus !== 'healthy') {
    recommendations.push({
      number: num++,
      title: 'Address Communication Anti-Patterns',
      description: `${aggregatedData.tool6.patternsDetected} communication anti-patterns detected. Implement recommended interventions and establish communication norms and protocols.`,
      priority: aggregatedData.tool6.healthStatus === 'crisis' ? 'Critical' : 'High',
      timeframe: '1-3 months',
    });
  }

  // 5. Data flow friction (Tool 5)
  if (aggregatedData.tool5 && aggregatedData.tool5.criticalFrictionCount > 0) {
    recommendations.push({
      number: num++,
      title: 'Resolve Critical Data Friction Points',
      description: `${aggregatedData.tool5.criticalFrictionCount} critical data friction points identified. Prioritize automation, integration, and process improvement for high-impact data flows.`,
      priority: 'High',
      timeframe: '3-9 months',
    });
  }

  // 6. Stakeholder management (Tool 4)
  if (aggregatedData.tool4 && aggregatedData.tool4.riskLevel !== 'low') {
    recommendations.push({
      number: num++,
      title: 'Execute Stakeholder Engagement Plan',
      description: `${aggregatedData.tool4.blockerCount} potential blockers identified. Develop targeted engagement strategies for key players and address blocker concerns proactively.`,
      priority: aggregatedData.tool4.riskLevel === 'high' ? 'High' : 'Medium',
      timeframe: 'Ongoing',
    });
  }

  // 7. Alignment assessment (Tool 1)
  if (aggregatedData.tool1) {
    const category = aggregatedData.tool1.category;
    if (category === 'chaos' || category === 'siloed') {
      recommendations.push({
        number: num++,
        title: `Strengthen ${aggregatedData.tool1.weakestDimension}`,
        description: `Your weakest dimension is ${aggregatedData.tool1.weakestDimension}. Focus improvement efforts here for maximum alignment impact.`,
        priority: category === 'chaos' ? 'Critical' : 'High',
        timeframe: '3-12 months',
      });
    }
  }

  // 8. General recommendation for any level
  recommendations.push({
    number: num++,
    title: 'Establish Alignment Metrics Dashboard',
    description: 'Create visibility into key alignment metrics. Track meeting waste, decision velocity, and communication health on an ongoing basis to measure improvement.',
    priority: 'Medium',
    timeframe: '1-2 months',
  });

  // 9. High severity - executive engagement
  if (result.interpretation.level === 'crisis' || result.interpretation.level === 'existential') {
    recommendations.push({
      number: num++,
      title: 'Secure Executive Sponsorship',
      description: 'At this severity level, successful transformation requires active executive sponsorship. Brief C-suite on findings and secure commitment to change initiatives.',
      priority: 'Critical',
      timeframe: 'Immediate',
    });
  }

  // Sort by priority: Critical > High > Medium
  const priorityOrder = { Critical: 0, High: 1, Medium: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Renumber after sorting
  return recommendations.map((r, i) => ({ ...r, number: i + 1 }));
}

/**
 * Get priority color
 */
function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    Critical: '#dc2626',
    High: '#d97706',
    Medium: '#0284c7',
  };
  return colors[priority] || brandColors.muted;
}

/**
 * PDF Recommendations
 *
 * Renders prioritized action items based on diagnostic findings.
 * Includes timeframes and priority indicators.
 */
export function PDFRecommendations({
  result,
  aggregatedData,
}: PDFRecommendationsProps) {
  const recommendations = generateRecommendations(result, aggregatedData);

  return (
    <View style={styles.section}>
      <Text style={styles.pageTitle}>Recommended Actions</Text>
      <Text style={styles.body}>
        Prioritized actions based on your diagnostic findings. Focus on
        critical and high-priority items for maximum impact.
      </Text>

      {/* Priority Legend */}
      <View
        style={{
          flexDirection: 'row',
          gap: 16,
          marginBottom: 16,
          paddingVertical: 8,
        }}
      >
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: '#dc2626' }]} />
          <Text style={styles.bodySmall}>Critical</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: '#d97706' }]} />
          <Text style={styles.bodySmall}>High</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: '#0284c7' }]} />
          <Text style={styles.bodySmall}>Medium</Text>
        </View>
      </View>

      {/* Recommendations List */}
      <View style={styles.recommendationsList}>
        {recommendations.map((rec) => (
          <View
            key={rec.number}
            style={{
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: brandColors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: getPriorityColor(rec.priority),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: brandColors.background,
                  }}
                >
                  {rec.number}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: 700, color: brandColors.heading, flex: 1 }}>
                    {rec.title}
                  </Text>
                  <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                    <Text
                      style={{
                        fontSize: 7,
                        fontWeight: 700,
                        color: getPriorityColor(rec.priority),
                        textTransform: 'uppercase',
                      }}
                    >
                      {rec.priority}
                    </Text>
                    <Text style={{ fontSize: 7, color: brandColors.muted }}>
                      {rec.timeframe}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bodySmall}>{rec.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Next Steps Callout */}
      <View style={styles.sectionGold}>
        <Text style={styles.subHeader}>Getting Started</Text>
        <Text style={styles.body}>
          We recommend addressing the top 3 critical/high priority items within
          the first 90 days. This focused approach typically yields the fastest
          return on transformation investment.
        </Text>
      </View>
    </View>
  );
}
