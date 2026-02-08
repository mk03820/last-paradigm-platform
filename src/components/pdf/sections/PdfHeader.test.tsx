/**
 * PdfHeader Tests
 *
 * Tests for the PDF Header component.
 * Uses mocked @react-pdf/renderer to allow DOM testing.
 *
 * Content Requirements (Story 4-2):
 * - Include "The Last Paradigm" branding
 * - Include generation date
 * - Professional styling
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
import { PdfHeader } from './PdfHeader';

describe('PdfHeader', () => {
  describe('component definition', () => {
    it('is a function component', () => {
      expect(typeof PdfHeader).toBe('function');
    });

    it('renders without throwing', () => {
      expect(() => render(<PdfHeader generatedAt="2024-01-15T10:30:00.000Z" />)).not.toThrow();
    });
  });

  describe('branding', () => {
    it('displays The Last Paradigm brand name', () => {
      render(<PdfHeader generatedAt="2024-01-15T10:30:00.000Z" />);

      expect(screen.getByText('The Last Paradigm')).toBeInTheDocument();
    });
  });

  describe('date formatting', () => {
    it('displays "Generated:" label', () => {
      render(<PdfHeader generatedAt="2024-01-15T10:30:00.000Z" />);

      expect(screen.getByText(/Generated:/)).toBeInTheDocument();
    });

    it('formats date in readable format', () => {
      render(<PdfHeader generatedAt="2024-01-15T10:30:00.000Z" />);

      // Should format as "January 15, 2024" or similar
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    });

    it('handles different dates correctly', () => {
      render(<PdfHeader generatedAt="2024-12-31T23:59:59.999Z" />);

      expect(screen.getByText(/December 31, 2024/)).toBeInTheDocument();
    });
  });

  describe('date edge cases', () => {
    it('handles start of year date', () => {
      render(<PdfHeader generatedAt="2024-01-01T12:00:00.000Z" />);

      // Date may render as Dec 31 or Jan 1 depending on timezone
      expect(screen.getByText(/(January 1|December 31), 202(3|4)/)).toBeInTheDocument();
    });

    it('handles mid-year date', () => {
      render(<PdfHeader generatedAt="2024-06-15T12:00:00.000Z" />);

      expect(screen.getByText(/June 1(4|5), 2024/)).toBeInTheDocument();
    });
  });
});
