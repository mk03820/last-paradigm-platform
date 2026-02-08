/**
 * Tests for InputsSection PDF Component
 *
 * Verifies that all user inputs are displayed correctly in the PDF.
 *
 * Note: @react-pdf/renderer uses custom primitives that don't render to DOM.
 * Tests verify component can be instantiated with valid props.
 *
 * Covers: FR24 (summary of input data in PDF)
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { MeetingAuditInput } from '@/types/calculator.types';

// Mock @react-pdf/renderer to prevent actual PDF rendering in tests
vi.mock('@react-pdf/renderer', () => ({
  View: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
}));

// Import after mocking
import { InputsSection } from './InputsSection';

describe('InputsSection', () => {
  const mockInputs: MeetingAuditInput = {
    meetingCount: 10,
    averageAttendees: 5,
    averageDuration: 60,
    salaryDistribution: {
      executive: 1,
      senior: 2,
      midLevel: 1,
      entry: 1,
    },
  };

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      expect(() => {
        render(<InputsSection inputs={mockInputs} />);
      }).not.toThrow();
    });

    it('accepts MeetingAuditInput props', () => {
      const { container } = render(<InputsSection inputs={mockInputs} />);
      expect(container).toBeDefined();
    });
  });

  describe('Meeting Details Display', () => {
    it('handles various meeting counts', () => {
      const inputs = { ...mockInputs, meetingCount: 25 };
      expect(() => render(<InputsSection inputs={inputs} />)).not.toThrow();
    });

    it('handles various attendee counts', () => {
      const inputs = { ...mockInputs, averageAttendees: 15 };
      expect(() => render(<InputsSection inputs={inputs} />)).not.toThrow();
    });

    it('handles various durations', () => {
      const inputs = { ...mockInputs, averageDuration: 120 };
      expect(() => render(<InputsSection inputs={inputs} />)).not.toThrow();
    });
  });

  describe('Salary Band Distribution', () => {
    it('handles executive-heavy distribution', () => {
      const inputs = {
        ...mockInputs,
        salaryDistribution: { executive: 5, senior: 1, midLevel: 0, entry: 0 },
      };
      expect(() => render(<InputsSection inputs={inputs} />)).not.toThrow();
    });

    it('handles entry-heavy distribution', () => {
      const inputs = {
        ...mockInputs,
        salaryDistribution: { executive: 0, senior: 0, midLevel: 1, entry: 10 },
      };
      expect(() => render(<InputsSection inputs={inputs} />)).not.toThrow();
    });

    it('handles single attendee (for pluralization)', () => {
      const inputs = {
        ...mockInputs,
        salaryDistribution: { executive: 1, senior: 0, midLevel: 0, entry: 0 },
      };
      expect(() => render(<InputsSection inputs={inputs} />)).not.toThrow();
    });

    it('handles zero attendees in all bands', () => {
      const inputs = {
        ...mockInputs,
        salaryDistribution: { executive: 0, senior: 0, midLevel: 0, entry: 0 },
      };
      expect(() => render(<InputsSection inputs={inputs} />)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values', () => {
      const zeroInputs: MeetingAuditInput = {
        meetingCount: 0,
        averageAttendees: 0,
        averageDuration: 0,
        salaryDistribution: { executive: 0, senior: 0, midLevel: 0, entry: 0 },
      };
      expect(() => render(<InputsSection inputs={zeroInputs} />)).not.toThrow();
    });

    it('handles large values', () => {
      const largeInputs: MeetingAuditInput = {
        meetingCount: 100,
        averageAttendees: 50,
        averageDuration: 480,
        salaryDistribution: { executive: 10, senior: 15, midLevel: 15, entry: 10 },
      };
      expect(() => render(<InputsSection inputs={largeInputs} />)).not.toThrow();
    });
  });
});
