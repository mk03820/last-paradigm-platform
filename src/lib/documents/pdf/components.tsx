/**
 * PDF Document Components
 *
 * Reusable React-PDF components for building consistent PDF documents.
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 3.3: Create PDF components
 */

import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import {
  pdfStyles,
  PDF_COLORS,
  ATTRIBUTION_TEXT,
  getScoreColor,
  formatCurrency,
  formatPercent,
  formatScore,
} from './styles';

/**
 * Cover page component
 */
export function CoverPage({
  title,
  subtitle,
  date,
}: {
  title: string;
  subtitle?: string;
  date?: string;
}): React.ReactElement {
  return (
    <Page size="LETTER" style={pdfStyles.coverPage}>
      <Text style={pdfStyles.coverTitle}>{title}</Text>
      {subtitle && <Text style={pdfStyles.coverSubtitle}>{subtitle}</Text>}
      {date && (
        <Text style={[pdfStyles.coverSubtitle, { marginTop: 20 }]}>
          {date}
        </Text>
      )}
      <View style={[pdfStyles.divider, { alignSelf: 'center', marginTop: 30 }]} />
      <Text style={pdfStyles.coverAttribution}>{ATTRIBUTION_TEXT}</Text>
    </Page>
  );
}

/**
 * Standard page with header and footer
 */
export function StandardPage({
  children,
  title,
  pageNumber,
  totalPages,
}: {
  children: React.ReactNode;
  title?: string;
  pageNumber?: number;
  totalPages?: number;
}): React.ReactElement {
  return (
    <Page size="LETTER" style={pdfStyles.page}>
      {title && (
        <View style={pdfStyles.header} fixed>
          <Text style={pdfStyles.headerText}>{title}</Text>
          <Text style={pdfStyles.headerText}>Alignment Assessment</Text>
        </View>
      )}
      <View style={{ marginTop: title ? 20 : 0 }}>{children}</View>
      <View style={pdfStyles.footer} fixed>
        <Text style={pdfStyles.footerText}>{ATTRIBUTION_TEXT}</Text>
        {pageNumber && (
          <Text style={pdfStyles.pageNumber}>
            Page {pageNumber}{totalPages ? ` of ${totalPages}` : ''}
          </Text>
        )}
      </View>
    </Page>
  );
}

/**
 * Section heading
 */
export function SectionHeading({
  children,
  level = 1,
}: {
  children: string;
  level?: 1 | 2 | 3;
}): React.ReactElement {
  const style =
    level === 1
      ? pdfStyles.heading1
      : level === 2
      ? pdfStyles.heading2
      : pdfStyles.heading3;
  return <Text style={style}>{children}</Text>;
}

/**
 * Body paragraph
 */
export function Paragraph({
  children,
  bold,
}: {
  children: string;
  bold?: boolean;
}): React.ReactElement {
  return <Text style={bold ? pdfStyles.bodyBold : pdfStyles.body}>{children}</Text>;
}

/**
 * Bullet list
 */
export function BulletList({
  items,
}: {
  items: string[];
}): React.ReactElement {
  return (
    <View style={pdfStyles.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={pdfStyles.bulletItem}>
          <Text style={pdfStyles.bulletPoint}>•</Text>
          <Text style={pdfStyles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Key-value pair
 */
export function KeyValue({
  label,
  value,
}: {
  label: string;
  value: string | number;
}): React.ReactElement {
  return (
    <View style={pdfStyles.keyValueRow}>
      <Text style={pdfStyles.keyValueLabel}>{label}</Text>
      <Text style={pdfStyles.keyValueValue}>{String(value)}</Text>
    </View>
  );
}

/**
 * Metric box (highlighted value)
 */
export function MetricBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}): React.ReactElement {
  return (
    <View style={highlight ? pdfStyles.metricBoxHighlight : pdfStyles.metricBox}>
      <Text style={highlight ? pdfStyles.metricValueHighlight : pdfStyles.metricValue}>
        {String(value)}
      </Text>
      <Text style={highlight ? pdfStyles.metricLabelHighlight : pdfStyles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Metrics row (multiple metrics side by side)
 */
export function MetricsRow({
  metrics,
}: {
  metrics: Array<{ label: string; value: string | number; highlight?: boolean }>;
}): React.ReactElement {
  return (
    <View style={[pdfStyles.row, { gap: 12, marginBottom: 16 }]}>
      {metrics.map((metric, index) => (
        <View key={index} style={pdfStyles.flex1}>
          <MetricBox
            label={metric.label}
            value={metric.value}
            highlight={metric.highlight}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Data table
 */
export function DataTable({
  headers,
  rows,
  columnWidths,
}: {
  headers: string[];
  rows: (string | number)[][];
  columnWidths?: number[];
}): React.ReactElement {
  const getWidth = (index: number) => {
    if (columnWidths && columnWidths[index]) {
      return `${columnWidths[index]}%`;
    }
    return `${100 / headers.length}%`;
  };

  return (
    <View style={pdfStyles.table}>
      {/* Header row */}
      <View style={pdfStyles.tableHeader}>
        {headers.map((header, index) => (
          <Text
            key={index}
            style={[pdfStyles.tableHeaderCell, { width: getWidth(index) }]}
          >
            {header}
          </Text>
        ))}
      </View>

      {/* Data rows */}
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={rowIndex % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}
        >
          {row.map((cell, cellIndex) => (
            <Text
              key={cellIndex}
              style={[pdfStyles.tableCell, { width: getWidth(cellIndex) }]}
            >
              {String(cell)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Score indicator (colored circle with score)
 */
export function ScoreIndicator({
  score,
  label,
}: {
  score: number;
  label?: string;
}): React.ReactElement {
  return (
    <View style={[pdfStyles.row, { alignItems: 'center', marginBottom: 8 }]}>
      <View
        style={[
          pdfStyles.scoreIndicator,
          { backgroundColor: getScoreColor(score) },
        ]}
      >
        <Text style={pdfStyles.scoreText}>{Math.round(score)}</Text>
      </View>
      {label && (
        <Text style={[pdfStyles.body, { marginLeft: 12 }]}>{label}</Text>
      )}
    </View>
  );
}

/**
 * Divider line
 */
export function Divider(): React.ReactElement {
  return <View style={pdfStyles.divider} />;
}

/**
 * Spacer
 */
export function Spacer({ height = 20 }: { height?: number }): React.ReactElement {
  return <View style={{ height }} />;
}

/**
 * Two-column layout
 */
export function TwoColumns({
  left,
  right,
  gap = 24,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  gap?: number;
}): React.ReactElement {
  return (
    <View style={[pdfStyles.row, { gap }]}>
      <View style={pdfStyles.flex1}>{left}</View>
      <View style={pdfStyles.flex1}>{right}</View>
    </View>
  );
}

/**
 * Call-out box
 */
export function CalloutBox({
  title,
  children,
  type = 'info',
}: {
  title?: string;
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'success';
}): React.ReactElement {
  const backgroundColor =
    type === 'warning'
      ? PDF_COLORS.amber + '20'
      : type === 'success'
      ? PDF_COLORS.green + '20'
      : PDF_COLORS.lightGray;

  const borderColor =
    type === 'warning'
      ? PDF_COLORS.amber
      : type === 'success'
      ? PDF_COLORS.green
      : PDF_COLORS.navy;

  return (
    <View
      style={{
        backgroundColor,
        borderLeftWidth: 4,
        borderLeftColor: borderColor,
        padding: 12,
        marginVertical: 12,
      }}
    >
      {title && (
        <Text style={[pdfStyles.bodyBold, { marginBottom: 8 }]}>{title}</Text>
      )}
      {children}
    </View>
  );
}

/**
 * Page break
 */
export function PageBreak(): React.ReactElement {
  return <View break />;
}
