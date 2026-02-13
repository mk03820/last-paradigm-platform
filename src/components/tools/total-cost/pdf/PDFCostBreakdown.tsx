/**
 * PDF Cost Breakdown Component
 *
 * Displays the cost category breakdown table in the PDF.
 * Shows all cost sources with amounts and percentages.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Cost breakdown and interpretation)
 */

import { View, Text } from '@react-pdf/renderer';
import {
  diagnosticPDFStyles as styles,
  brandColors,
  formatFullCurrencyPDF,
  formatCurrencyPDF,
  formatPercentPDF,
} from './DiagnosticPDFStyles';
import type { AlignmentTaxResult, CostSourceItem } from '../cost-constants';
import { buildCostSourceItems } from '../calculation-engine';

interface PDFCostBreakdownProps {
  /** Alignment tax calculation result */
  result: AlignmentTaxResult;
}

/**
 * PDF Cost Breakdown
 *
 * Renders a detailed table of all cost categories:
 * - Tool-sourced costs (Meeting Waste, Data Friction)
 * - Additional costs (Project Delays, Rework, Turnover, Opportunity)
 * - Subtotals and grand total
 */
export function PDFCostBreakdown({ result }: PDFCostBreakdownProps) {
  const costItems = buildCostSourceItems(result);
  const toolItems = costItems.filter((item) => item.source === 'tool');
  const inputItems = costItems.filter((item) => item.source === 'input');

  return (
    <View style={styles.section}>
      <Text style={styles.pageTitle}>Cost Breakdown</Text>
      <Text style={styles.body}>
        Detailed breakdown of all alignment tax components by source.
      </Text>

      {/* Table */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Cost Category</Text>
          <Text style={styles.tableHeaderCell}>Source</Text>
          <Text style={styles.tableHeaderCellRight}>Amount</Text>
          <Text style={styles.tableHeaderCellRight}>% of Total</Text>
        </View>

        {/* Tool-sourced costs */}
        {toolItems.length > 0 && (
          <>
            <View
              style={{
                backgroundColor: brandColors.lightNavy,
                paddingVertical: 4,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: brandColors.navy,
                  textTransform: 'uppercase',
                }}
              >
                From Diagnostic Tools
              </Text>
            </View>
            {toolItems.map((item, index) => (
              <View
                key={item.id}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.label}</Text>
                <Text style={styles.tableCell}>Tool {item.toolNumber}</Text>
                <Text style={styles.tableCellRight}>
                  {formatFullCurrencyPDF(item.amount)}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatPercentPDF(item.percentage)}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Subtotal for tools */}
        {toolItems.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: brandColors.cardBackground,
              borderTopWidth: 1,
              borderTopColor: brandColors.border,
            }}
          >
            <Text style={[styles.tableCellBold, { flex: 2 }]}>Subtotal: Tools</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCellRightBold}>
              {formatFullCurrencyPDF(result.toolsSubtotal)}
            </Text>
            <Text style={styles.tableCellRight}>
              {result.total > 0
                ? formatPercentPDF((result.toolsSubtotal / result.total) * 100)
                : '0.0%'}
            </Text>
          </View>
        )}

        {/* Additional costs */}
        {inputItems.length > 0 && (
          <>
            <View
              style={{
                backgroundColor: brandColors.lightGold,
                paddingVertical: 4,
                paddingHorizontal: 10,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: brandColors.gold,
                  textTransform: 'uppercase',
                }}
              >
                Additional Costs
              </Text>
            </View>
            {inputItems.map((item, index) => (
              <View
                key={item.id}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.label}</Text>
                <Text style={styles.tableCell}>Manual Entry</Text>
                <Text style={styles.tableCellRight}>
                  {formatFullCurrencyPDF(item.amount)}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatPercentPDF(item.percentage)}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Subtotal for additional */}
        {inputItems.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: brandColors.cardBackground,
              borderTopWidth: 1,
              borderTopColor: brandColors.border,
            }}
          >
            <Text style={[styles.tableCellBold, { flex: 2 }]}>
              Subtotal: Additional
            </Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCellRightBold}>
              {formatFullCurrencyPDF(result.additionalSubtotal)}
            </Text>
            <Text style={styles.tableCellRight}>
              {result.total > 0
                ? formatPercentPDF((result.additionalSubtotal / result.total) * 100)
                : '0.0%'}
            </Text>
          </View>
        )}

        {/* Grand Total */}
        <View style={styles.tableRowTotal}>
          <Text
            style={{
              flex: 2,
              fontSize: 11,
              fontWeight: 700,
              color: brandColors.navy,
            }}
          >
            TOTAL ALIGNMENT TAX
          </Text>
          <Text style={styles.tableCell}></Text>
          <Text
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 700,
              color: brandColors.navy,
              textAlign: 'right',
            }}
          >
            {formatFullCurrencyPDF(result.total)}
          </Text>
          <Text
            style={{
              flex: 1,
              fontSize: 10,
              fontWeight: 700,
              color: brandColors.gold,
              textAlign: 'right',
            }}
          >
            100%
          </Text>
        </View>
      </View>

      {/* Revenue Context */}
      <View style={styles.sectionGold}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.label}>ANNUAL REVENUE</Text>
            <Text style={{ fontSize: 14, fontWeight: 700, color: brandColors.heading }}>
              {formatCurrencyPDF(result.revenue)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>ALIGNMENT TAX AS % OF REVENUE</Text>
            <Text style={{ fontSize: 14, fontWeight: 700, color: brandColors.gold }}>
              {formatPercentPDF(result.percentOfRevenue)}
            </Text>
          </View>
        </View>
      </View>

      {/* Cost Categories Visual */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Cost Distribution</Text>
        {costItems.map((item) => (
          <View key={item.id} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.bodySmall}>{item.label}</Text>
              <Text style={styles.bodySmall}>
                {formatPercentPDF(item.percentage)}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: brandColors.border,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 8,
                  backgroundColor: item.source === 'tool' ? brandColors.navy : brandColors.gold,
                  width: `${Math.min(item.percentage, 100)}%`,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
