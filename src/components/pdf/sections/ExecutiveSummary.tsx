/**
 * Executive Summary Section
 *
 * First section of the PDF document. Displays the headline meeting waste
 * number prominently with Gold accent, followed by context about the
 * alignment tax.
 *
 * Per UX Design Requirements:
 * - Headline number: 36pt, bold, Gold (#b45309)
 * - Context paragraph explains alignment tax component
 * - Premium typography for executive audience
 *
 * Covers: FR22 (executive summary with headline number)
 */

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, pdfColors } from '../PdfStyles';

interface ExecutiveSummaryProps {
  /** The meeting waste amount in dollars */
  meetingWaste: number;
}

/**
 * Formats a number as USD currency with commas and no decimal places
 */
function formatCurrency(amount: number): string {
  const roundedAmount = Math.round(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedAmount);
}

export function ExecutiveSummary({ meetingWaste }: ExecutiveSummaryProps) {
  const formattedAmount = formatCurrency(meetingWaste);

  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.pageTitle}>Meeting Waste Analysis</Text>

      {/* Headline Number Display */}
      <View style={pdfStyles.sectionWithBackground}>
        <Text style={pdfStyles.label}>Your organization&apos;s estimated meeting waste:</Text>
        <Text style={pdfStyles.accentNumber}>{formattedAmount}</Text>
        <Text style={pdfStyles.accentLabel}>per year</Text>
      </View>

      {/* Context Paragraph */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionHeader}>Executive Summary</Text>
        <Text style={pdfStyles.body}>
          This figure represents the annual cost of time spent in recurring meetings,
          calculated using salary-weighted attendance data. Meeting waste is one of
          seven components of organizational alignment tax—the hidden operational cost
          that erodes productivity and growth.
        </Text>
        <Text style={pdfStyles.body}>
          The alignment tax framework, introduced in "The Last Paradigm," identifies
          systematic inefficiencies that compound over time. Understanding your meeting
          waste is the first step toward diagnosing and addressing these hidden costs.
        </Text>
      </View>
    </View>
  );
}
