/**
 * PDF Cover Page Component
 *
 * Premium cover page for the Complete Diagnostic PDF.
 * Features "The Last Paradigm" branding with navy background.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Board-room presentation quality)
 */

import { Page, View, Text } from '@react-pdf/renderer';
import { diagnosticPDFStyles as styles, brandColors, formatDatePDF } from './DiagnosticPDFStyles';

interface PDFCoverPageProps {
  /** Organization name (optional) */
  organizationName?: string;
  /** Date the report was generated */
  generatedAt: string;
  /** Total alignment tax headline number */
  totalAlignmentTax: number;
  /** Number of tools completed */
  toolsCompleted: number;
}

/**
 * Format currency for cover page display
 */
function formatHeadlineAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

/**
 * PDF Cover Page
 *
 * Renders a professional cover page with:
 * - "The Last Paradigm" branding
 * - Report title
 * - Organization name (if provided)
 * - Generation date
 * - Headline alignment tax figure
 */
export function PDFCoverPage({
  organizationName,
  generatedAt,
  totalAlignmentTax,
  toolsCompleted,
}: PDFCoverPageProps) {
  return (
    <Page size="LETTER" style={styles.coverPage}>
      {/* Brand Header */}
      <View>
        <Text style={styles.coverBrand}>THE LAST PARADIGM</Text>
      </View>

      {/* Title Section */}
      <View>
        <Text style={styles.coverTitle}>Complete Organizational</Text>
        <Text style={styles.coverTitle}>Alignment Diagnostic</Text>
        <Text style={styles.coverSubtitle}>
          {toolsCompleted}-Tool Analysis Report
        </Text>
      </View>

      {/* Headline Number */}
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: 30,
          borderRadius: 4,
          marginVertical: 30,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: brandColors.light,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          TOTAL ALIGNMENT TAX
        </Text>
        <Text
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: brandColors.gold,
            textAlign: 'center',
          }}
        >
          {formatHeadlineAmount(totalAlignmentTax)}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: brandColors.light,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          annual cost of organizational misalignment
        </Text>
      </View>

      {/* Meta Information */}
      <View style={styles.coverMeta}>
        {organizationName && (
          <Text style={styles.coverMetaText}>
            Prepared for: {organizationName}
          </Text>
        )}
        <Text style={styles.coverDate}>
          Generated: {formatDatePDF(generatedAt)}
        </Text>
        <Text style={styles.coverTagline}>
          &quot;Understanding your alignment tax is the first step toward transformation.&quot;
        </Text>
      </View>
    </Page>
  );
}
