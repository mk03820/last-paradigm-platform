/**
 * Tests for ContinueToNextTool component
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 9.3: Unit tests for ContinueToNextTool component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContinueToNextTool } from './ContinueToNextTool';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ContinueToNextTool', () => {
  it('shows next tool name and route', () => {
    render(<ContinueToNextTool currentToolNumber={1} />);

    // Tool 2 is Meeting Audit
    expect(screen.getByText(/Meeting Audit Calculator/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Continue to Meetings/i })).toHaveAttribute(
      'href',
      '/tool/meeting-audit'
    );
  });

  it('shows time estimate for next tool', () => {
    render(<ContinueToNextTool currentToolNumber={1} />);

    // Tool 2 has 5 min estimate
    expect(screen.getByText(/~5 min/)).toBeInTheDocument();
  });

  it('shows "Up next" label', () => {
    render(<ContinueToNextTool currentToolNumber={1} />);

    expect(screen.getByText('Up next')).toBeInTheDocument();
  });

  it('shows correct next tool for Tool 2', () => {
    render(<ContinueToNextTool currentToolNumber={2} />);

    // Tool 3 is Decision Velocity
    expect(screen.getByText(/Tool 3: Decision Velocity Scorecard/)).toBeInTheDocument();
  });

  it('shows correct next tool for Tool 3', () => {
    render(<ContinueToNextTool currentToolNumber={3} />);

    // Tool 4 is Stakeholder Map
    expect(screen.getByText(/Tool 4: Stakeholder Power\/Interest Mapping/)).toBeInTheDocument();
  });

  it('shows correct next tool for Tool 4', () => {
    render(<ContinueToNextTool currentToolNumber={4} />);

    // Tool 5 is Data Flow
    expect(screen.getByText(/Tool 5: Data Flow Friction Analysis/)).toBeInTheDocument();
  });

  it('shows correct next tool for Tool 5', () => {
    render(<ContinueToNextTool currentToolNumber={5} />);

    // Tool 6 is Communication
    expect(screen.getByText(/Tool 6: Communication Pattern Diagnostic/)).toBeInTheDocument();
  });

  it('shows correct next tool for Tool 6', () => {
    render(<ContinueToNextTool currentToolNumber={6} />);

    // Tool 7 is Total Cost
    expect(screen.getByText(/Tool 7: Total Cost of Misalignment/)).toBeInTheDocument();
  });

  it('shows completion message for Tool 7', () => {
    render(<ContinueToNextTool currentToolNumber={7} />);

    expect(screen.getByText('Diagnostic Complete!')).toBeInTheDocument();
    expect(
      screen.getByText(/completed all 7 diagnostic tools/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /View Full Diagnostic Report/i })
    ).toHaveAttribute('href', '/diagnostic/report');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ContinueToNextTool currentToolNumber={1} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows tool description from guidance', () => {
    render(<ContinueToNextTool currentToolNumber={1} />);

    // Should show whatItMeasures for meeting-audit
    expect(
      screen.getByText(/annual cost of unproductive meeting time/i)
    ).toBeInTheDocument();
  });
});
