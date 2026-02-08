/**
 * MethodologySection Tests
 *
 * Tests for the PDF Methodology section component.
 * Uses mocked @react-pdf/renderer to allow DOM testing.
 *
 * Content Requirements (Story 4-2):
 * - Explain alignment tax concept clearly
 * - Reference "The Last Paradigm" book
 * - Explain meeting waste as 25-30% of total alignment tax
 * - Keep language executive-friendly
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
import { MethodologySection } from './MethodologySection';

describe('MethodologySection', () => {
  describe('component definition', () => {
    it('is a function component', () => {
      expect(typeof MethodologySection).toBe('function');
    });

    it('renders without throwing', () => {
      expect(() => render(<MethodologySection />)).not.toThrow();
    });
  });

  describe('section headers', () => {
    it('includes Methodology as main section header', () => {
      render(<MethodologySection />);

      expect(screen.getByText('Methodology')).toBeInTheDocument();
    });

    it('includes Understanding Alignment Tax subsection', () => {
      render(<MethodologySection />);

      expect(screen.getByText('Understanding Alignment Tax')).toBeInTheDocument();
    });

    it('includes Meeting Waste: A Key Indicator subsection', () => {
      render(<MethodologySection />);

      expect(screen.getByText('Meeting Waste: A Key Indicator')).toBeInTheDocument();
    });

    it('includes How We Calculate Meeting Waste subsection', () => {
      render(<MethodologySection />);

      expect(screen.getByText('How We Calculate Meeting Waste')).toBeInTheDocument();
    });

    it('includes Step 1 of 7 framing', () => {
      render(<MethodologySection />);

      expect(screen.getByText(/Step 1 of 7/i)).toBeInTheDocument();
    });
  });

  describe('alignment tax content', () => {
    it('explains alignment tax concept', () => {
      render(<MethodologySection />);

      // Should explain what alignment tax is
      expect(screen.getByText(/hidden cost/i)).toBeInTheDocument();
    });

    it('references The Last Paradigm book', () => {
      render(<MethodologySection />);

      // Multiple references expected (content + quote attribution)
      const bookReferences = screen.getAllByText(/The Last Paradigm/i);
      expect(bookReferences.length).toBeGreaterThan(0);
    });

    it('mentions 25-30% relationship', () => {
      render(<MethodologySection />);

      expect(screen.getByText(/25-30%/)).toBeInTheDocument();
    });
  });

  describe('calculation methodology', () => {
    it('explains salary-weighted calculation approach', () => {
      render(<MethodologySection />);

      expect(screen.getByText(/salary-weighted/i)).toBeInTheDocument();
    });

    it('mentions salary bands in calculation', () => {
      render(<MethodologySection />);

      // Should reference the four salary bands
      expect(screen.getByText(/Executive.*Senior.*Mid-Level.*Entry/i)).toBeInTheDocument();
    });

    it('mentions annualization', () => {
      render(<MethodologySection />);

      expect(screen.getByText(/50 working weeks/i)).toBeInTheDocument();
    });
  });

  describe('Step 1 of 7 framing', () => {
    it('includes diagnostic step context', () => {
      render(<MethodologySection />);

      expect(screen.getByText(/first of seven diagnostic steps/i)).toBeInTheDocument();
    });

    it('mentions remaining alignment tax percentage', () => {
      render(<MethodologySection />);

      expect(screen.getByText(/70-75%/)).toBeInTheDocument();
    });
  });
});
