/**
 * PDF Inputs Section Component
 *
 * Displays a summary of all user inputs used in the calculation,
 * formatted as a clear data table for transparency and defensibility.
 *
 * Covers: FR24 (summary of input data in PDF)
 */

'use client';

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, pdfColors } from '../PdfStyles';
import type { MeetingAuditInput } from '@/types/calculator.types';
import { StyleSheet } from '@react-pdf/renderer';

interface InputsSectionProps {
  /** User inputs from the calculation */
  inputs: MeetingAuditInput;
}

// Additional styles specific to this section
const localStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  inputsBox: {
    backgroundColor: pdfColors.cardBackground,
    padding: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: pdfColors.heading,
    marginTop: 16,
    marginBottom: 8,
  },
});

/**
 * Calculates total attendees from salary distribution
 */
function getTotalAttendees(distribution: MeetingAuditInput['salaryDistribution']): number {
  return (
    distribution.executive +
    distribution.senior +
    distribution.midLevel +
    distribution.entry
  );
}

export function InputsSection({ inputs }: InputsSectionProps) {
  const totalAttendees = getTotalAttendees(inputs.salaryDistribution);

  return (
    <View style={localStyles.sectionContainer}>
      <Text style={pdfStyles.sectionHeader}>Your Inputs</Text>

      <View style={localStyles.inputsBox}>
        {/* Meeting Details */}
        <View style={pdfStyles.dataRow}>
          <Text style={pdfStyles.dataLabel}>Recurring meetings analyzed</Text>
          <Text style={pdfStyles.dataValue}>{inputs.meetingCount}</Text>
        </View>

        <View style={pdfStyles.dataRow}>
          <Text style={pdfStyles.dataLabel}>Average attendees per meeting</Text>
          <Text style={pdfStyles.dataValue}>{inputs.averageAttendees}</Text>
        </View>

        <View style={pdfStyles.dataRow}>
          <Text style={pdfStyles.dataLabel}>Average meeting duration</Text>
          <Text style={pdfStyles.dataValue}>{inputs.averageDuration} minutes</Text>
        </View>

        {/* Salary Distribution */}
        <Text style={localStyles.subSectionTitle}>Salary Band Distribution</Text>

        <View style={pdfStyles.dataRow}>
          <Text style={pdfStyles.dataLabel}>Executive</Text>
          <Text style={pdfStyles.dataValue}>
            {inputs.salaryDistribution.executive} attendee
            {inputs.salaryDistribution.executive !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={pdfStyles.dataRow}>
          <Text style={pdfStyles.dataLabel}>Senior</Text>
          <Text style={pdfStyles.dataValue}>
            {inputs.salaryDistribution.senior} attendee
            {inputs.salaryDistribution.senior !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={pdfStyles.dataRow}>
          <Text style={pdfStyles.dataLabel}>Mid-level</Text>
          <Text style={pdfStyles.dataValue}>
            {inputs.salaryDistribution.midLevel} attendee
            {inputs.salaryDistribution.midLevel !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={pdfStyles.dataRow}>
          <Text style={pdfStyles.dataLabel}>Entry</Text>
          <Text style={pdfStyles.dataValue}>
            {inputs.salaryDistribution.entry} attendee
            {inputs.salaryDistribution.entry !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={{ ...pdfStyles.dataRow, borderBottomWidth: 0, marginTop: 8 }}>
          <Text style={{ ...pdfStyles.dataLabel, fontWeight: 600 }}>Total attendees</Text>
          <Text style={pdfStyles.dataValue}>{totalAttendees}</Text>
        </View>
      </View>
    </View>
  );
}
