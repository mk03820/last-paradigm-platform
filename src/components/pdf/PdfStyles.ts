/**
 * PDF Styles
 *
 * Shared styles for PDF document generation using @react-pdf/renderer.
 * Implements "Executive Clarity" theme with Navy and Gold colors.
 *
 * Typography follows premium standards for board-room presentation:
 * - Page title: 24pt, bold
 * - Section headers: 18pt, semibold
 * - Body text: 12pt, regular
 * - Labels: 10pt, muted
 *
 * Covers: FR21, FR28 (PDF export, board-room quality)
 */

import { StyleSheet } from '@react-pdf/renderer';

/**
 * Executive Clarity Color Palette
 */
export const pdfColors = {
  // Primary colors
  navy: '#1e293b',
  gold: '#b45309',

  // Text colors
  heading: '#1e293b',
  body: '#374151',
  muted: '#6b7280',

  // Background colors
  background: '#ffffff',
  cardBackground: '#f9fafb',
  border: '#e5e7eb',
};

/**
 * Typography scales
 */
export const pdfTypography = {
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: pdfColors.heading,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 600,
    color: pdfColors.heading,
  },
  subHeader: {
    fontSize: 14,
    fontWeight: 600,
    color: pdfColors.heading,
  },
  body: {
    fontSize: 12,
    fontWeight: 400,
    color: pdfColors.body,
  },
  label: {
    fontSize: 10,
    fontWeight: 400,
    color: pdfColors.muted,
  },
  accent: {
    fontSize: 36,
    fontWeight: 700,
    color: pdfColors.gold,
  },
};

/**
 * Spacing standards (in points)
 */
export const pdfSpacing = {
  page: {
    paddingTop: 72, // 1 inch
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
  },
  section: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 1.5,
  },
};

/**
 * Main stylesheet for PDF document
 */
export const pdfStyles = StyleSheet.create({
  // Page layout
  page: {
    ...pdfSpacing.page,
    backgroundColor: pdfColors.background,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    paddingBottom: 16,
    marginBottom: 24,
    width: '100%',
  },
  headerBrand: {
    fontSize: 14,
    fontWeight: 700,
    color: pdfColors.navy,
  },
  headerDate: {
    fontSize: 10,
    color: pdfColors.muted,
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 72,
    right: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: pdfColors.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: pdfColors.muted,
  },
  pageNumber: {
    fontSize: 9,
    color: pdfColors.muted,
  },

  // Section containers
  section: {
    marginBottom: pdfSpacing.section.marginBottom,
    maxWidth: 468,
  },
  sectionWithBackground: {
    marginBottom: pdfSpacing.section.marginBottom,
    backgroundColor: pdfColors.cardBackground,
    padding: 20,
    borderRadius: 4,
    maxWidth: 468,
  },

  // Typography styles
  pageTitle: {
    ...pdfTypography.pageTitle,
    marginBottom: 16,
    width: '100%',
  },
  sectionHeader: {
    ...pdfTypography.sectionHeader,
    marginBottom: 12,
    width: '100%',
  },
  subHeader: {
    ...pdfTypography.subHeader,
    marginBottom: 8,
  },
  body: {
    ...pdfTypography.body,
    lineHeight: 1.5,
    marginBottom: pdfSpacing.paragraph.marginBottom,
    maxWidth: 468,
  },
  label: {
    ...pdfTypography.label,
    marginBottom: 4,
  },

  // Accent styles for headline numbers
  accentNumber: {
    ...pdfTypography.accent,
    textAlign: 'center',
    marginVertical: 8,
  },
  accentLabel: {
    fontSize: 12,
    color: pdfColors.muted,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Content layout
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Dividers
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    marginVertical: 16,
  },

  // Quote/callout box
  callout: {
    backgroundColor: pdfColors.cardBackground,
    borderLeftWidth: 3,
    borderLeftColor: pdfColors.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  calloutText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: pdfColors.body,
    lineHeight: 1.6,
  },

  // Bullet points
  bulletList: {
    marginVertical: 8,
    paddingLeft: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletPoint: {
    width: 16,
    fontSize: 12,
    color: pdfColors.gold,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: pdfColors.body,
    lineHeight: 1.5,
  },

  // Table styles
  table: {
    marginVertical: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: pdfColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 700,
    color: pdfColors.heading,
  },
  tableHeaderCellRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: 700,
    color: pdfColors.heading,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: pdfColors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: pdfColors.body,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 11,
    color: pdfColors.body,
    textAlign: 'right',
  },

  // Data row for inputs display
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: pdfColors.border,
  },
  dataLabel: {
    fontSize: 11,
    color: pdfColors.body,
  },
  dataValue: {
    fontSize: 11,
    fontWeight: 600,
    color: pdfColors.heading,
  },

  // Formula display
  formulaBox: {
    backgroundColor: pdfColors.cardBackground,
    padding: 16,
    marginVertical: 12,
    borderRadius: 4,
    fontFamily: 'Courier',
  },
  formulaText: {
    fontSize: 10,
    color: pdfColors.body,
    lineHeight: 1.6,
  },

  // Step indicator styles
  stepBadge: {
    backgroundColor: pdfColors.gold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: 700,
    color: pdfColors.background,
  },

  // Next steps numbered list
  numberedList: {
    marginVertical: 8,
  },
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  numberedBullet: {
    width: 24,
    fontSize: 11,
    fontWeight: 600,
    color: pdfColors.gold,
  },
  numberedText: {
    flex: 1,
    fontSize: 11,
    color: pdfColors.body,
    lineHeight: 1.5,
  },

  // CTA box
  ctaBox: {
    backgroundColor: pdfColors.navy,
    padding: 20,
    marginTop: 16,
    borderRadius: 4,
  },
  ctaText: {
    fontSize: 12,
    color: pdfColors.background,
    textAlign: 'center',
    lineHeight: 1.6,
  },
  ctaHighlight: {
    fontSize: 12,
    fontWeight: 700,
    color: pdfColors.gold,
  },
});
