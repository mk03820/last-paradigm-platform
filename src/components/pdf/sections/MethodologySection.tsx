/**
 * Methodology Section
 *
 * Explains the alignment tax concept from "The Last Paradigm" book
 * and how meeting waste fits into the larger diagnostic framework.
 *
 * Key content:
 * - What is alignment tax (from the book)
 * - Meeting waste as a diagnostic component (25-30% of total)
 * - How the calculation works (high-level)
 * - This is "Step 1 of 7" toward complete diagnosis
 *
 * Covers: FR23 (methodology explanation)
 */

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../PdfStyles';

export function MethodologySection() {
  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionHeader}>Methodology</Text>

      {/* What is Alignment Tax */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Understanding Alignment Tax</Text>
        <Text style={pdfStyles.body}>
          Alignment tax is the hidden cost organizations pay when people, processes,
          and priorities are not effectively synchronized. Introduced in "The Last
          Paradigm," this framework reveals how misalignment manifests as wasted time,
          redundant effort, delayed decisions, and missed opportunities.
        </Text>
        <Text style={pdfStyles.body}>
          Unlike visible operational costs, alignment tax often goes unmeasured and
          unmanaged. Organizations typically underestimate these costs by 3-5x because
          they lack systematic methods to identify and quantify them.
        </Text>
      </View>

      {/* Meeting Waste as Component */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Meeting Waste: A Key Indicator</Text>
        <Text style={pdfStyles.body}>
          Research and organizational assessments consistently show that meeting waste
          represents approximately 25-30% of an organization&apos;s total alignment tax.
          This makes it one of the most significant—and most measurable—components
          of hidden organizational cost.
        </Text>
        <View style={pdfStyles.callout}>
          <Text style={pdfStyles.calloutText}>
            "Meetings are where alignment either happens or fails. They are the
            most visible symptom of how well—or poorly—an organization coordinates
            its collective intelligence."
          </Text>
          <Text style={[pdfStyles.label, { marginTop: 8 }]}>
            — The Last Paradigm
          </Text>
        </View>
      </View>

      {/* Calculation Methodology */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>How We Calculate Meeting Waste</Text>
        <Text style={pdfStyles.body}>
          Our calculation uses a salary-weighted approach that accounts for the true
          cost of attendee time:
        </Text>
        <View style={pdfStyles.bulletList}>
          <View style={pdfStyles.bulletItem}>
            <Text style={pdfStyles.bulletPoint}>1.</Text>
            <Text style={pdfStyles.bulletText}>
              We calculate the average hourly cost per attendee based on your
              organization&apos;s salary distribution across four bands (Executive,
              Senior, Mid-Level, and Entry).
            </Text>
          </View>
          <View style={pdfStyles.bulletItem}>
            <Text style={pdfStyles.bulletPoint}>2.</Text>
            <Text style={pdfStyles.bulletText}>
              We multiply this weighted average by the total hours spent in
              recurring meetings (meeting count x duration x attendees).
            </Text>
          </View>
          <View style={pdfStyles.bulletItem}>
            <Text style={pdfStyles.bulletPoint}>3.</Text>
            <Text style={pdfStyles.bulletText}>
              We annualize the result using 50 working weeks to account for
              holidays and time off.
            </Text>
          </View>
        </View>
      </View>

      {/* Step 1 of 7 Framing */}
      <View style={pdfStyles.sectionWithBackground}>
        <Text style={pdfStyles.subHeader}>Step 1 of 7: Meeting Audit</Text>
        <Text style={pdfStyles.body}>
          This meeting waste analysis is the first of seven diagnostic steps in the
          complete alignment tax assessment. By starting with meetings, you gain
          immediate visibility into a major cost driver while establishing baseline
          metrics for organizational efficiency.
        </Text>
        <Text style={pdfStyles.body}>
          The remaining six components—including decision velocity, information flow,
          and strategic coherence—together account for the other 70-75% of your
          total alignment tax. Complete the full diagnostic to understand your
          organization&apos;s total hidden operational cost.
        </Text>
      </View>
    </View>
  );
}
