/**
 * PDF Header Component
 *
 * Displays "The Last Paradigm" branding and generation date at the top
 * of each PDF page. Professional styling for executive audience.
 *
 * Covers: FR28 (board-room presentation quality)
 */

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../PdfStyles';

interface PdfHeaderProps {
  /** ISO 8601 date string for when the document was generated */
  generatedAt: string;
}

/**
 * Formats an ISO date string for display in the PDF header
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function PdfHeader({ generatedAt }: PdfHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.headerBrand}>The Last Paradigm</Text>
      <Text style={pdfStyles.headerDate}>Generated: {formatDate(generatedAt)}</Text>
    </View>
  );
}
