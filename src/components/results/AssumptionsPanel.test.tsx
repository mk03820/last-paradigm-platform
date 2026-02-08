import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssumptionsPanel } from './AssumptionsPanel';

describe('AssumptionsPanel', () => {
  describe('rendering', () => {
    it('displays the section heading', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Assumptions')).toBeInTheDocument();
    });

    it('displays salary band hourly rates heading', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Salary Band Hourly Rates')).toBeInTheDocument();
    });

    it('displays other assumptions heading', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Other Assumptions')).toBeInTheDocument();
    });
  });

  describe('salary band rates table', () => {
    it('displays Executive rate of $150/hour', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Executive')).toBeInTheDocument();
      expect(screen.getByText('$150/hour')).toBeInTheDocument();
    });

    it('displays Senior rate of $100/hour', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Senior')).toBeInTheDocument();
      expect(screen.getByText('$100/hour')).toBeInTheDocument();
    });

    it('displays Mid-level rate of $65/hour', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Mid-level')).toBeInTheDocument();
      expect(screen.getByText('$65/hour')).toBeInTheDocument();
    });

    it('displays Entry rate of $35/hour', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Entry')).toBeInTheDocument();
      expect(screen.getByText('$35/hour')).toBeInTheDocument();
    });

    it('displays all four salary bands', () => {
      render(<AssumptionsPanel />);

      const table = screen.getByRole('table');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(4);
    });
  });

  describe('other assumptions', () => {
    it('displays weeks per year assumption', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText('Weeks per year')).toBeInTheDocument();
      expect(screen.getByText('52')).toBeInTheDocument();
    });
  });

  describe('methodology context', () => {
    it('references The Last Paradigm book', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText(/The Last Paradigm/)).toBeInTheDocument();
    });

    it('explains rates are based on alignment tax methodology', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByText(/alignment tax methodology/)).toBeInTheDocument();
    });

    it('mentions fully-loaded compensation costs', () => {
      render(<AssumptionsPanel />);

      expect(
        screen.getByText(/fully-loaded compensation costs/)
      ).toBeInTheDocument();
    });
  });

  describe('table structure', () => {
    it('has table header with Salary Band column', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByRole('columnheader', { name: 'Salary Band' })).toBeInTheDocument();
    });

    it('has table header with Hourly Rate column', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByRole('columnheader', { name: 'Hourly Rate' })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(<AssumptionsPanel />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Assumptions');
    });

    it('uses semantic table markup', () => {
      render(<AssumptionsPanel />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
