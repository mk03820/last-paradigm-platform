/**
 * PDF ROI Summary Component
 *
 * Displays ROI projections for transformation investment in the PDF.
 * Shows conservative, moderate, and aggressive scenarios.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (ROI projections)
 */

import { View, Text } from '@react-pdf/renderer';
import {
  diagnosticPDFStyles as styles,
  brandColors,
  formatCurrencyPDF,
  formatFullCurrencyPDF,
  formatPercentPDF,
} from './DiagnosticPDFStyles';
import type {
  ROIResult,
  ROIScenarioType,
} from '../cost-constants';
import {
  ROI_SCENARIOS,
  formatROIRatio,
  formatPaybackPeriod,
} from '../cost-constants';

interface PDFROISummaryProps {
  /** Total alignment tax (current annual cost) */
  alignmentTax: number;
  /** Proposed investment amount */
  investment: number;
  /** ROI results for all three scenarios */
  results: ROIResult[];
}

/**
 * Get scenario color
 */
function getScenarioColor(type: ROIScenarioType): string {
  const colors: Record<ROIScenarioType, string> = {
    conservative: '#0284c7',
    moderate: '#059669',
    aggressive: '#7c3aed',
  };
  return colors[type] || brandColors.muted;
}

/**
 * PDF ROI Summary
 *
 * Renders ROI projection section with:
 * - Three scenario cards (conservative, moderate, aggressive)
 * - Key metrics: annual savings, 3-year NPV, ROI ratio, payback period
 * - Investment context
 */
export function PDFROISummary({
  alignmentTax,
  investment,
  results,
}: PDFROISummaryProps) {
  // Sort results by scenario type order
  const orderedResults = ['conservative', 'moderate', 'aggressive']
    .map((type) => results.find((r) => r.scenarioType === type))
    .filter(Boolean) as ROIResult[];

  return (
    <View style={styles.section}>
      <Text style={styles.pageTitle}>ROI Projections</Text>
      <Text style={styles.body}>
        Potential return on investment for addressing your alignment tax.
      </Text>

      {/* Investment Context */}
      <View style={styles.sectionHighlight}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.label}>CURRENT ALIGNMENT TAX</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: brandColors.heading }}>
              {formatCurrencyPDF(alignmentTax)}
            </Text>
            <Text style={styles.bodySmall}>per year</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color: brandColors.muted }}>&#8594;</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>PROPOSED INVESTMENT</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: brandColors.navy }}>
              {formatCurrencyPDF(investment)}
            </Text>
            <Text style={styles.bodySmall}>transformation budget</Text>
          </View>
        </View>
      </View>

      {/* Scenario Cards */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Scenario Analysis</Text>

        {orderedResults.map((result) => {
          const scenario = ROI_SCENARIOS.find((s) => s.type === result.scenarioType);
          const color = getScenarioColor(result.scenarioType);

          return (
            <View
              key={result.scenarioType}
              style={{
                backgroundColor: brandColors.cardBackground,
                padding: 14,
                borderRadius: 4,
                marginBottom: 10,
                borderLeftWidth: 4,
                borderLeftColor: color,
              }}
            >
              {/* Scenario Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <View>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: color }}>
                    {result.scenarioLabel.toUpperCase()}
                  </Text>
                  <Text style={styles.bodySmall}>
                    {scenario?.description || ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      fontSize: 8,
                      color: brandColors.muted,
                      textTransform: 'uppercase',
                    }}
                  >
                    Probability
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: color }}>
                    {result.probability}%
                  </Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <View style={{ width: '48%', marginBottom: 8 }}>
                  <Text style={styles.label}>Annual Savings</Text>
                  <Text style={{ fontSize: 12, fontWeight: 700, color: brandColors.heading }}>
                    {formatCurrencyPDF(result.annualSavings)}
                  </Text>
                </View>
                <View style={{ width: '48%', marginBottom: 8, alignItems: 'flex-end' }}>
                  <Text style={styles.label}>ROI</Text>
                  <Text style={{ fontSize: 12, fontWeight: 700, color: brandColors.gold }}>
                    {formatROIRatio(result.roiRatio)}
                  </Text>
                </View>
                <View style={{ width: '48%', marginBottom: 8 }}>
                  <Text style={styles.label}>3-Year NPV</Text>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: brandColors.body }}>
                    {formatCurrencyPDF(result.npv)}
                  </Text>
                </View>
                <View style={{ width: '48%', marginBottom: 8, alignItems: 'flex-end' }}>
                  <Text style={styles.label}>Payback Period</Text>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: brandColors.body }}>
                    {formatPaybackPeriod(result.paybackMonths)}
                  </Text>
                </View>
              </View>

              {/* Target Reduction */}
              <View
                style={{
                  backgroundColor: brandColors.background,
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 4,
                }}
              >
                <Text style={styles.bodySmall}>
                  Target: Reduce alignment tax by{' '}
                  <Text style={{ fontWeight: 700, color: color }}>
                    {result.targetReduction}%
                  </Text>{' '}
                  over {result.timelineMonths} months
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Methodology Note */}
      <View style={styles.callout}>
        <Text style={styles.calloutText}>
          ROI projections use Net Present Value (NPV) calculations with a 10%
          discount rate over a 3-year period. The probability estimates reflect
          typical achievement rates based on transformation scope and
          organizational readiness.
        </Text>
      </View>
    </View>
  );
}

/**
 * Default ROI Summary when no ROI data is available
 */
export function PDFROIPlaceholder({ alignmentTax }: { alignmentTax: number }) {
  const estimatedSavings = alignmentTax * 0.5; // Assume 50% reduction potential

  return (
    <View style={styles.section}>
      <Text style={styles.pageTitle}>Transformation Potential</Text>

      <View style={styles.sectionHighlight}>
        <Text style={styles.subHeader}>Potential Annual Savings</Text>
        <Text style={styles.body}>
          With focused transformation efforts, organizations typically reduce
          their alignment tax by 25-75% within 12-24 months.
        </Text>
      </View>

      <View style={styles.sectionGold}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.label}>Conservative (25%)</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: brandColors.heading }}>
              {formatCurrencyPDF(alignmentTax * 0.25)}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.label}>Moderate (50%)</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: brandColors.gold }}>
              {formatCurrencyPDF(estimatedSavings)}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.label}>Aggressive (75%)</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: brandColors.heading }}>
              {formatCurrencyPDF(alignmentTax * 0.75)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.body}>
        Contact The Last Paradigm to develop a customized transformation
        roadmap with detailed ROI projections tailored to your organization.
      </Text>
    </View>
  );
}
