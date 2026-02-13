/**
 * Diagnostic PDF Styles
 *
 * Extended styles for the Complete Diagnostic PDF Export.
 * Uses "Executive Clarity" theme with brand colors.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Premium PDF export, board-room quality)
 */

import { StyleSheet } from '@react-pdf/renderer';

/**
 * Brand Color Palette - The Last Paradigm
 */
export const brandColors = {
  // Primary brand colors
  navy: '#1e3a5f',      // Dark navy for headers and accents
  gold: '#d4a574',      // Gold for highlights and emphasis

  // Text colors
  heading: '#1e293b',
  body: '#374151',
  muted: '#6b7280',
  light: '#9ca3af',

  // Background colors
  background: '#ffffff',
  cardBackground: '#f8fafc',
  lightGold: '#fdf7f0',
  lightNavy: '#f0f4f8',
  border: '#e5e7eb',

  // Status colors
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0284c7',
};

/**
 * Interpretation level colors for PDF
 */
export const interpretationColors = {
  normal: { text: '#059669', bg: '#ecfdf5' },
  significant: { text: '#d97706', bg: '#fffbeb' },
  crisis: { text: '#ea580c', bg: '#fff7ed' },
  existential: { text: '#dc2626', bg: '#fef2f2' },
};

/**
 * Main stylesheet for Diagnostic PDF
 */
export const diagnosticPDFStyles = StyleSheet.create({
  // Page layout
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 50,
    paddingRight: 50,
    backgroundColor: brandColors.background,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
  },

  // Cover page styles
  coverPage: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingLeft: 50,
    paddingRight: 50,
    backgroundColor: brandColors.navy,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  coverBrand: {
    fontSize: 14,
    fontWeight: 700,
    color: brandColors.gold,
    letterSpacing: 1,
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: brandColors.background,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 18,
    color: brandColors.gold,
    marginBottom: 60,
  },
  coverMeta: {
    marginTop: 'auto',
  },
  coverMetaText: {
    fontSize: 11,
    color: brandColors.light,
    marginBottom: 4,
  },
  coverDate: {
    fontSize: 11,
    color: brandColors.light,
    marginTop: 12,
  },
  coverTagline: {
    fontSize: 10,
    fontStyle: 'italic',
    color: brandColors.gold,
    marginTop: 24,
  },

  // Header styles for regular pages
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: brandColors.navy,
    paddingBottom: 10,
    marginBottom: 20,
    width: '100%',
  },
  headerBrand: {
    fontSize: 12,
    fontWeight: 700,
    color: brandColors.navy,
  },
  headerTitle: {
    fontSize: 10,
    color: brandColors.muted,
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: brandColors.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: brandColors.muted,
  },
  pageNumber: {
    fontSize: 8,
    color: brandColors.muted,
  },

  // Section containers
  section: {
    marginBottom: 20,
    maxWidth: '100%',
  },
  sectionWithBackground: {
    marginBottom: 20,
    backgroundColor: brandColors.cardBackground,
    padding: 16,
    borderRadius: 4,
  },
  sectionHighlight: {
    marginBottom: 20,
    backgroundColor: brandColors.lightNavy,
    padding: 20,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: brandColors.navy,
  },
  sectionGold: {
    marginBottom: 20,
    backgroundColor: brandColors.lightGold,
    padding: 20,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: brandColors.gold,
  },

  // Typography styles
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: brandColors.heading,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 700,
    color: brandColors.navy,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 13,
    fontWeight: 600,
    color: brandColors.heading,
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    color: brandColors.body,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bodySmall: {
    fontSize: 9,
    color: brandColors.body,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  label: {
    fontSize: 8,
    fontWeight: 600,
    color: brandColors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Accent styles for headline numbers
  accentNumber: {
    fontSize: 42,
    fontWeight: 700,
    color: brandColors.gold,
    textAlign: 'center',
  },
  accentNumberSecondary: {
    fontSize: 32,
    fontWeight: 700,
    color: brandColors.navy,
    textAlign: 'center',
  },
  accentLabel: {
    fontSize: 11,
    color: brandColors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  accentPercent: {
    fontSize: 24,
    fontWeight: 700,
    color: brandColors.navy,
    textAlign: 'center',
  },

  // Executive summary box
  executiveBox: {
    backgroundColor: brandColors.navy,
    padding: 24,
    borderRadius: 4,
    marginBottom: 20,
  },
  executiveNumber: {
    fontSize: 48,
    fontWeight: 700,
    color: brandColors.gold,
    textAlign: 'center',
    marginBottom: 8,
  },
  executiveLabel: {
    fontSize: 12,
    color: brandColors.background,
    textAlign: 'center',
    marginBottom: 4,
  },
  executiveSubtext: {
    fontSize: 10,
    color: brandColors.light,
    textAlign: 'center',
  },

  // Interpretation badge
  interpretationBadge: {
    padding: 8,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 12,
  },
  interpretationText: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
  },

  // Tool summary styles
  toolSummaryCard: {
    backgroundColor: brandColors.cardBackground,
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: brandColors.navy,
  },
  toolSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  toolNumber: {
    fontSize: 8,
    fontWeight: 700,
    color: brandColors.gold,
    marginBottom: 2,
  },
  toolName: {
    fontSize: 11,
    fontWeight: 700,
    color: brandColors.heading,
  },
  toolMetric: {
    fontSize: 16,
    fontWeight: 700,
    color: brandColors.navy,
    textAlign: 'right',
  },
  toolMetricLabel: {
    fontSize: 8,
    color: brandColors.muted,
    textAlign: 'right',
  },
  toolInsight: {
    fontSize: 9,
    color: brandColors.body,
    marginTop: 4,
  },

  // Table styles
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: brandColors.navy,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: brandColors.background,
  },
  tableHeaderCellRight: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: brandColors.background,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: brandColors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: brandColors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: brandColors.cardBackground,
  },
  tableRowTotal: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: brandColors.lightNavy,
    borderTopWidth: 2,
    borderTopColor: brandColors.navy,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: brandColors.body,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 9,
    color: brandColors.body,
    textAlign: 'right',
  },
  tableCellBold: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: brandColors.heading,
  },
  tableCellRightBold: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: brandColors.heading,
    textAlign: 'right',
  },

  // Cost breakdown specific
  costCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: brandColors.border,
  },
  costCategoryName: {
    flex: 2,
    fontSize: 9,
    color: brandColors.body,
  },
  costCategoryAmount: {
    flex: 1,
    fontSize: 9,
    fontWeight: 600,
    color: brandColors.heading,
    textAlign: 'right',
  },
  costCategoryPercent: {
    width: 50,
    fontSize: 8,
    color: brandColors.muted,
    textAlign: 'right',
  },
  costBar: {
    height: 4,
    backgroundColor: brandColors.gold,
    borderRadius: 2,
    marginTop: 4,
  },

  // ROI Summary styles
  roiCard: {
    backgroundColor: brandColors.lightGold,
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
  },
  roiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roiLabel: {
    fontSize: 10,
    color: brandColors.muted,
  },
  roiValue: {
    fontSize: 18,
    fontWeight: 700,
    color: brandColors.navy,
  },
  roiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  roiMetricLabel: {
    fontSize: 9,
    color: brandColors.body,
  },
  roiMetricValue: {
    fontSize: 9,
    fontWeight: 600,
    color: brandColors.heading,
  },

  // Recommendations
  recommendationsList: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recommendationNumber: {
    width: 20,
    fontSize: 10,
    fontWeight: 700,
    color: brandColors.gold,
  },
  recommendationText: {
    flex: 1,
    fontSize: 9,
    color: brandColors.body,
    lineHeight: 1.5,
  },
  recommendationPriority: {
    fontSize: 8,
    fontWeight: 600,
    color: brandColors.navy,
    marginTop: 2,
  },

  // Callout box
  callout: {
    backgroundColor: brandColors.cardBackground,
    borderLeftWidth: 3,
    borderLeftColor: brandColors.gold,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  calloutText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: brandColors.body,
    lineHeight: 1.6,
  },

  // Two column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },

  // CTA box at end
  ctaBox: {
    backgroundColor: brandColors.navy,
    padding: 20,
    borderRadius: 4,
    marginTop: 20,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: brandColors.gold,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 10,
    color: brandColors.background,
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  ctaUrl: {
    fontSize: 10,
    color: brandColors.gold,
    textAlign: 'center',
    fontWeight: 600,
  },

  // Status indicators
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});

/**
 * Get interpretation color styles for PDF
 */
export function getInterpretationStyle(level: string): { text: string; bg: string } {
  return interpretationColors[level as keyof typeof interpretationColors] || interpretationColors.normal;
}

/**
 * Format currency for PDF display
 */
export function formatCurrencyPDF(amount: number): string {
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
 * Format full currency for PDF tables
 */
export function formatFullCurrencyPDF(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format percentage for PDF
 */
export function formatPercentPDF(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format date for PDF
 */
export function formatDatePDF(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
