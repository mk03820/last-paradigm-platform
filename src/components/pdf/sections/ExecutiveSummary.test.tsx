/**
 * ExecutiveSummary Tests
 *
 * Tests for the PDF Executive Summary section component.
 * Uses mocked @react-pdf/renderer to allow DOM testing.
 *
 * Content Requirements (Story 4-2):
 * - Display headline meeting waste number prominently
 * - Use Gold accent (#b45309) for headline number
 * - Include context paragraph about alignment tax
 * - Premium typography for executive audience
 *
 * Covers: Story 4-2 Task 5
 */

import { describe, it, expect, vi } from 'vitest';

// Mock @react-pdf/renderer to enable DOM testing
vi.mock('@react-pdf/renderer', () => ({
  View: ({ children, style }: { children: React.ReactNode; style?: unknown }) => (
    <div data-testid="pdf-view" data-style={JSON.stringify(style)}>{children}</div>
  ),
  Text: ({ children, style }: { children: React.ReactNode; style?: unknown }) => (
    <span data-testid="pdf-text" data-style={JSON.stringify(style)}>{children}</span>
  ),
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
}));

import { render, screen } from '@testing-library/react';
import { ExecutiveSummary } from './ExecutiveSummary';

describe('ExecutiveSummary', () => {
  describe('component definition', () => {
    it('is a function component', () => {
      expect(typeof ExecutiveSummary).toBe('function');
    });

    it('renders without throwing', () => {
      expect(() => render(<ExecutiveSummary meetingWaste={150000} />)).not.toThrow();
    });
  });

  describe('headline number display', () => {
    it('displays the formatted meeting waste amount', () => {
      render(<ExecutiveSummary meetingWaste={150000} />);

      // The formatted currency should appear
      expect(screen.getByText('$150,000')).toBeInTheDocument();
    });

    it('formats large numbers with commas', () => {
      render(<ExecutiveSummary meetingWaste={1234567} />);

      expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    });

    it('rounds decimal amounts to whole dollars', () => {
      render(<ExecutiveSummary meetingWaste={100000.99} />);

      expect(screen.getByText('$100,001')).toBeInTheDocument();
    });

    it('displays "per year" label', () => {
      render(<ExecutiveSummary meetingWaste={150000} />);

      expect(screen.getByText('per year')).toBeInTheDocument();
    });
  });

  describe('context paragraph', () => {
    it('includes executive summary section header', () => {
      render(<ExecutiveSummary meetingWaste={150000} />);

      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    it('mentions alignment tax in context', () => {
      render(<ExecutiveSummary meetingWaste={150000} />);

      // Check for alignment tax explanation (multiple occurrences expected)
      const alignmentTaxElements = screen.getAllByText(/alignment tax/i);
      expect(alignmentTaxElements.length).toBeGreaterThan(0);
    });

    it('references The Last Paradigm book', () => {
      render(<ExecutiveSummary meetingWaste={150000} />);

      expect(screen.getByText(/The Last Paradigm/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero meeting waste', () => {
      render(<ExecutiveSummary meetingWaste={0} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles small amounts', () => {
      render(<ExecutiveSummary meetingWaste={50} />);

      expect(screen.getByText('$50')).toBeInTheDocument();
    });

    it('handles very large amounts', () => {
      render(<ExecutiveSummary meetingWaste={10000000} />);

      expect(screen.getByText('$10,000,000')).toBeInTheDocument();
    });
  });
});
