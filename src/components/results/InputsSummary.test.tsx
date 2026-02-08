import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputsSummary } from './InputsSummary';
import type { MeetingAuditInput } from '@/types/calculator.types';

describe('InputsSummary', () => {
  // Use unique values to avoid duplicate text matching issues
  const defaultInputs: MeetingAuditInput = {
    meetingCount: 15,
    averageAttendees: 7,
    averageDuration: 45,
    salaryDistribution: {
      executive: 1,
      senior: 2,
      midLevel: 3,
      entry: 4,
    },
  };

  describe('rendering', () => {
    it('displays the section heading', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Your Inputs')).toBeInTheDocument();
    });

    it('displays meetings per week label and value', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Meetings per week')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('displays average attendees label and value', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Average attendees')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays average duration with minutes label', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Average duration')).toBeInTheDocument();
      expect(screen.getByText('45 minutes')).toBeInTheDocument();
    });

    it('displays total in salary bands (sum of distribution)', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Total in salary bands')).toBeInTheDocument();
      // 1 + 2 + 3 + 4 = 10
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('salary distribution', () => {
    it('displays salary distribution heading', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Salary Distribution')).toBeInTheDocument();
    });

    it('displays executive count', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Executive')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('displays senior count', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Senior')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays mid-level count', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Mid-level')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays entry count', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      expect(screen.getByText('Entry')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('different values', () => {
    it('displays correctly with different input values', () => {
      const customInputs: MeetingAuditInput = {
        meetingCount: 25,
        averageAttendees: 8,
        averageDuration: 30,
        salaryDistribution: {
          executive: 2,
          senior: 3,
          midLevel: 4,
          entry: 5,
        },
      };

      render(<InputsSummary inputs={customInputs} />);

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
    });

    it('handles zero values gracefully', () => {
      const zeroInputs: MeetingAuditInput = {
        meetingCount: 0,
        averageAttendees: 0,
        averageDuration: 0,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 0,
        },
      };

      render(<InputsSummary inputs={zeroInputs} />);

      // Should render without errors
      expect(screen.getByText('Your Inputs')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('uses definition list semantics', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      // Check for definition list elements
      const dlElements = document.querySelectorAll('dl');
      expect(dlElements.length).toBeGreaterThan(0);
    });

    it('uses proper dt/dd pairs', () => {
      render(<InputsSummary inputs={defaultInputs} />);

      const dtElements = document.querySelectorAll('dt');
      const ddElements = document.querySelectorAll('dd');

      expect(dtElements.length).toBeGreaterThan(0);
      expect(ddElements.length).toBeGreaterThan(0);
      expect(dtElements.length).toBe(ddElements.length);
    });
  });
});
