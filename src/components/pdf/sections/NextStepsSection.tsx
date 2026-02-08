/**
 * PDF Next Steps Section Component
 *
 * Displays "Step 1 of 7" messaging and explains the path to
 * complete alignment tax diagnosis, encouraging further engagement.
 *
 * Covers: FR26 (Step 1 of 7 framing with path to complete diagnosis)
 */

'use client';

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, pdfColors } from '../PdfStyles';
import { StyleSheet } from '@react-pdf/renderer';

// Additional styles specific to this section
const localStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  stepIntro: {
    fontSize: 12,
    color: pdfColors.body,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  stepHighlight: {
    fontWeight: 700,
    color: pdfColors.gold,
  },
  componentsTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: pdfColors.heading,
    marginBottom: 12,
    marginTop: 8,
  },
  componentItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  componentNumber: {
    width: 20,
    fontSize: 10,
    fontWeight: 600,
    color: pdfColors.gold,
  },
  componentText: {
    flex: 1,
    fontSize: 10,
    color: pdfColors.body,
  },
  componentTextCurrent: {
    flex: 1,
    fontSize: 10,
    fontWeight: 600,
    color: pdfColors.heading,
  },
  ctaContainer: {
    backgroundColor: pdfColors.navy,
    padding: 20,
    marginTop: 20,
    borderRadius: 4,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: pdfColors.background,
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaBody: {
    fontSize: 11,
    color: pdfColors.background,
    textAlign: 'center',
    lineHeight: 1.6,
  },
  ctaHighlight: {
    color: pdfColors.gold,
    fontWeight: 700,
  },
});

// The seven components of alignment tax
const ALIGNMENT_TAX_COMPONENTS = [
  { number: 1, name: 'Meeting Waste', current: true },
  { number: 2, name: 'Decision Latency', current: false },
  { number: 3, name: 'Communication Overhead', current: false },
  { number: 4, name: 'Rework and Revision Cycles', current: false },
  { number: 5, name: 'Context Switching', current: false },
  { number: 6, name: 'Coordination Friction', current: false },
  { number: 7, name: 'Strategic Misalignment', current: false },
] as const;

export function NextStepsSection() {
  return (
    <View style={localStyles.sectionContainer}>
      <View style={pdfStyles.stepBadge}>
        <Text style={pdfStyles.stepBadgeText}>Step 1 of 7</Text>
      </View>

      <Text style={pdfStyles.sectionHeader}>What Comes Next</Text>

      <Text style={localStyles.stepIntro}>
        This analysis represents{' '}
        <Text style={localStyles.stepHighlight}>Step 1 of 7</Text>
        {' '}in diagnosing your organization&apos;s alignment tax. Meeting waste
        is the most visible component, but it typically represents only 25-30%
        of the total hidden cost eroding your organization&apos;s productivity.
      </Text>

      <Text style={localStyles.componentsTitle}>
        The Seven Components of Alignment Tax:
      </Text>

      {ALIGNMENT_TAX_COMPONENTS.map((component) => (
        <View key={component.number} style={localStyles.componentItem}>
          <Text style={localStyles.componentNumber}>{component.number}.</Text>
          <Text
            style={
              component.current
                ? localStyles.componentTextCurrent
                : localStyles.componentText
            }
          >
            {component.name}
            {component.current ? ' (this report)' : ''}
          </Text>
        </View>
      ))}

      <Text style={{ ...pdfStyles.body, marginTop: 16 }}>
        A complete alignment tax diagnosis reveals the full scope of
        organizational inefficiency and provides actionable insights for
        strategic improvement. Understanding all seven components enables
        leadership to make data-driven decisions about where to focus
        transformation efforts.
      </Text>

      {/* Call to Action */}
      <View style={localStyles.ctaContainer}>
        <Text style={localStyles.ctaTitle}>
          Ready to Complete Your Diagnosis?
        </Text>
        <Text style={localStyles.ctaBody}>
          Learn more about the alignment tax framework and how to diagnose
          all seven components in{' '}
          <Text style={localStyles.ctaHighlight}>
            &quot;The Last Paradigm&quot;
          </Text>
          {' '}by Matt Keane. The complete methodology provides the tools
          your organization needs to identify, quantify, and eliminate
          alignment tax.
        </Text>
      </View>
    </View>
  );
}
