import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { InputsSummary } from './InputsSummary';
import { FormulaDisplay } from './FormulaDisplay';
import { AssumptionsPanel } from './AssumptionsPanel';
import type { MeetingAuditInput } from '@/types/calculator.types';

// Mock ResizeObserver for accordion animations
beforeEach(() => {
  vi.stubGlobal('ResizeObserver', vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })));
});

describe('Methodology Transparency Integration', () => {
  const mockInputs: MeetingAuditInput = {
    meetingCount: 10,
    averageAttendees: 5,
    averageDuration: 60,
    salaryDistribution: {
      executive: 1,
      senior: 2,
      midLevel: 3,
      entry: 4,
    },
  };

  // Render the complete methodology transparency section
  const renderMethodologySection = () => {
    return render(
      <Accordion type="single" collapsible>
        <AccordionItem value="methodology">
          <AccordionTrigger>How we calculated this</AccordionTrigger>
          <AccordionContent>
            <InputsSummary inputs={mockInputs} />
            <FormulaDisplay />
            <AssumptionsPanel />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  describe('accordion behavior', () => {
    it('displays the trigger text', () => {
      renderMethodologySection();

      expect(screen.getByText('How we calculated this')).toBeInTheDocument();
    });

    it('is collapsed by default', () => {
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    it('expands when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-state', 'open');
    });

    it('collapses when trigger is clicked again', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });

      // Open
      await user.click(trigger);
      expect(trigger).toHaveAttribute('data-state', 'open');

      // Close
      await user.click(trigger);
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });
  });

  describe('keyboard accessibility', () => {
    it('trigger is focusable', () => {
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('expands on Enter key', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(trigger).toHaveAttribute('data-state', 'open');
    });

    it('expands on Space key', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      trigger.focus();
      await user.keyboard(' ');

      expect(trigger).toHaveAttribute('data-state', 'open');
    });

    it('can be tabbed to', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      await user.tab();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      expect(trigger).toHaveFocus();
    });
  });

  describe('content display when expanded', () => {
    it('shows InputsSummary when expanded', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      await user.click(trigger);

      expect(screen.getByText('Your Inputs')).toBeInTheDocument();
    });

    it('shows FormulaDisplay when expanded', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      await user.click(trigger);

      expect(screen.getByText('Calculation Formula')).toBeInTheDocument();
    });

    it('shows AssumptionsPanel when expanded', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      await user.click(trigger);

      expect(screen.getByText('Assumptions')).toBeInTheDocument();
    });
  });

  describe('aria attributes', () => {
    it('trigger has aria-expanded attribute', () => {
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('aria-expanded is false when collapsed', () => {
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('aria-expanded is true when expanded', async () => {
      const user = userEvent.setup();
      renderMethodologySection();

      const trigger = screen.getByRole('button', { name: /how we calculated this/i });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
