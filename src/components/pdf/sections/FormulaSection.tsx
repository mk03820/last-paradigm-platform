/**
 * PDF Formula Section Component
 *
 * Displays the calculation formula and assumptions used,
 * including the salary band hourly rates table for transparency.
 *
 * Covers: FR25 (formula and assumptions in PDF)
 */

'use client';

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, pdfColors } from '../PdfStyles';
import { StyleSheet } from '@react-pdf/renderer';

// Salary band rates - these are the rates used in calculations
// Note: These match the server-side rates in lib/calculations
const SALARY_BAND_RATES = {
  executive: 150,
  senior: 100,
  midLevel: 65,
  entry: 35,
} as const;

const WEEKS_PER_YEAR = 52;

// Additional styles specific to this section
const localStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  assumptionNote: {
    fontSize: 10,
    color: pdfColors.muted,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 16,
  },
});

/**
 * Formats a rate as currency per hour
 */
function formatRate(rate: number): string {
  return `$${rate}/hour`;
}

export function FormulaSection() {
  return (
    <View style={localStyles.sectionContainer}>
      <Text style={pdfStyles.sectionHeader}>Calculation Methodology</Text>

      {/* Formula Display */}
      <Text style={pdfStyles.subHeader}>Formula</Text>
      <View style={pdfStyles.formulaBox}>
        <Text style={pdfStyles.formulaText}>
          Annual Meeting Waste =
        </Text>
        <Text style={pdfStyles.formulaText}>
          {'  '}meetings x attendees x (duration / 60) x weighted hourly rate x {WEEKS_PER_YEAR} weeks
        </Text>
      </View>

      <Text style={localStyles.assumptionNote}>
        This formula calculates the total annual cost of time spent in recurring meetings,
        using a weighted average hourly rate based on your salary band distribution.
      </Text>

      {/* Salary Band Rates Table */}
      <Text style={pdfStyles.subHeader}>Salary Band Rates Used</Text>

      <View style={pdfStyles.table}>
        {/* Table Header */}
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.tableHeaderCell}>Salary Band</Text>
          <Text style={pdfStyles.tableHeaderCellRight}>Hourly Rate</Text>
        </View>

        {/* Table Rows */}
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCell}>Executive</Text>
          <Text style={pdfStyles.tableCellRight}>{formatRate(SALARY_BAND_RATES.executive)}</Text>
        </View>

        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCell}>Senior</Text>
          <Text style={pdfStyles.tableCellRight}>{formatRate(SALARY_BAND_RATES.senior)}</Text>
        </View>

        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCell}>Mid-level</Text>
          <Text style={pdfStyles.tableCellRight}>{formatRate(SALARY_BAND_RATES.midLevel)}</Text>
        </View>

        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCell}>Entry</Text>
          <Text style={pdfStyles.tableCellRight}>{formatRate(SALARY_BAND_RATES.entry)}</Text>
        </View>
      </View>

      {/* Assumptions */}
      <Text style={pdfStyles.subHeader}>Assumptions</Text>
      <View style={pdfStyles.bulletList}>
        <View style={pdfStyles.bulletItem}>
          <Text style={pdfStyles.bulletPoint}>*</Text>
          <Text style={pdfStyles.bulletText}>
            Calculations assume {WEEKS_PER_YEAR} working weeks per year
          </Text>
        </View>
        <View style={pdfStyles.bulletItem}>
          <Text style={pdfStyles.bulletPoint}>*</Text>
          <Text style={pdfStyles.bulletText}>
            Hourly rates are industry averages based on US compensation data
          </Text>
        </View>
        <View style={pdfStyles.bulletItem}>
          <Text style={pdfStyles.bulletPoint}>*</Text>
          <Text style={pdfStyles.bulletText}>
            Recurring meetings are assumed to occur weekly
          </Text>
        </View>
        <View style={pdfStyles.bulletItem}>
          <Text style={pdfStyles.bulletPoint}>*</Text>
          <Text style={pdfStyles.bulletText}>
            Meeting waste represents direct time cost only, not opportunity cost
          </Text>
        </View>
      </View>
    </View>
  );
}
