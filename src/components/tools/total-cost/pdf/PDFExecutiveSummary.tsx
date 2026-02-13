/**
 * PDF Executive Summary Component
 *
 * Displays the headline alignment tax with interpretation for executives.
 * First content page of the Complete Diagnostic PDF.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Executive Summary with headline alignment tax)
 */

import { View, Text } from '@react-pdf/renderer';
import {
  diagnosticPDFStyles as styles,
  brandColors,
  getInterpretationStyle,
  formatCurrencyPDF,
  formatPercentPDF,
} from './DiagnosticPDFStyles';
import type { AlignmentTaxResult } from '../cost-constants';

interface PDFExecutiveSummaryProps {
  /** Alignment tax calculation result */
  result: AlignmentTaxResult;
  /** Number of tools completed */
  toolsCompleted: number;
}

/**
 * PDF Executive Summary
 *
 * Renders executive summary section with:
 * - Headline alignment tax amount
 * - Percentage of revenue
 * - Interpretation and severity indicator
 * - Key findings overview
 */
export function PDFExecutiveSummary({
  result,
  toolsCompleted,
}: PDFExecutiveSummaryProps) {
  const interpretationStyle = getInterpretationStyle(result.interpretation.level);

  return (
    <View style={styles.section}>
      {/* Page Title */}
      <Text style={styles.pageTitle}>Executive Summary</Text>

      {/* Headline Box */}
      <View style={styles.executiveBox}>
        <Text style={styles.executiveLabel}>YOUR TOTAL ALIGNMENT TAX</Text>
        <Text style={styles.executiveNumber}>
          {formatCurrencyPDF(result.total)}
        </Text>
        <Text style={styles.executiveSubtext}>
          {formatPercentPDF(result.percentOfRevenue)} of annual revenue
        </Text>
      </View>

      {/* Interpretation Badge */}
      <View
        style={[
          styles.interpretationBadge,
          { backgroundColor: interpretationStyle.bg },
        ]}
      >
        <Text
          style={[
            styles.interpretationText,
            { color: interpretationStyle.text },
          ]}
        >
          {result.interpretation.label.toUpperCase()} LEVEL
        </Text>
      </View>

      {/* Interpretation Description */}
      <View style={styles.sectionHighlight}>
        <Text style={styles.subHeader}>What This Means</Text>
        <Text style={styles.body}>{result.interpretation.description}</Text>
      </View>

      {/* Key Statistics */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Analysis Overview</Text>
        <View style={styles.twoColumn}>
          {/* Left Column */}
          <View style={styles.column}>
            <View style={styles.costCategoryRow}>
              <Text style={styles.costCategoryName}>Tools Analyzed</Text>
              <Text style={styles.costCategoryAmount}>{toolsCompleted} of 6</Text>
            </View>
            <View style={styles.costCategoryRow}>
              <Text style={styles.costCategoryName}>Annual Revenue</Text>
              <Text style={styles.costCategoryAmount}>
                {formatCurrencyPDF(result.revenue)}
              </Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            <View style={styles.costCategoryRow}>
              <Text style={styles.costCategoryName}>From Diagnostic Tools</Text>
              <Text style={styles.costCategoryAmount}>
                {formatCurrencyPDF(result.toolsSubtotal)}
              </Text>
            </View>
            <View style={styles.costCategoryRow}>
              <Text style={styles.costCategoryName}>Additional Costs</Text>
              <Text style={styles.costCategoryAmount}>
                {formatCurrencyPDF(result.additionalSubtotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Context Callout */}
      <View style={styles.callout}>
        <Text style={styles.calloutText}>
          The alignment tax represents the hidden operational cost that erodes
          productivity and growth. This comprehensive analysis aggregates data
          from {toolsCompleted} diagnostic tools and additional cost inputs to
          quantify the total burden of organizational misalignment on your
          business.
        </Text>
      </View>
    </View>
  );
}
