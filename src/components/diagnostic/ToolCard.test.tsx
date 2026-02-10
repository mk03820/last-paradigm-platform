/**
 * Tests for ToolCard component
 *
 * Story 8.5: Diagnostic Tool Hub
 * Task 8.2: Unit tests for ToolCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolCard } from './ToolCard';
import type { DiagnosticTool } from './diagnostic-constants';
import { Target } from 'lucide-react';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockTool: DiagnosticTool = {
  id: 'alignment',
  number: 1,
  name: 'Organizational Alignment Assessment',
  shortName: 'Alignment',
  description: 'Score your organization across 5 alignment dimensions',
  icon: Target,
  route: '/tool/alignment',
  storeKey: 'tool1',
  anonymousAccess: false,
  estimatedMinutes: 10,
};

describe('ToolCard', () => {
  it('renders tool information correctly', () => {
    render(
      <ToolCard tool={mockTool} status="not_started" resultSummary={null} />
    );

    expect(screen.getByText('Tool 1')).toBeInTheDocument();
    expect(screen.getByText('Alignment')).toBeInTheDocument();
    expect(screen.getByText('Score your organization across 5 alignment dimensions')).toBeInTheDocument();
    expect(screen.getByText('~10 min')).toBeInTheDocument();
  });

  it('shows "Not Started" badge for not_started status', () => {
    render(
      <ToolCard tool={mockTool} status="not_started" resultSummary={null} />
    );

    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('shows "In Progress" badge for in_progress status', () => {
    render(
      <ToolCard tool={mockTool} status="in_progress" resultSummary="3 of 5 dimensions scored" />
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows "Completed" badge for completed status', () => {
    render(
      <ToolCard tool={mockTool} status="completed" resultSummary="Score: 3.2 (Coordinated)" />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays result summary when provided', () => {
    render(
      <ToolCard
        tool={mockTool}
        status="completed"
        resultSummary="Score: 3.2 (Coordinated)"
      />
    );

    expect(screen.getByText('Score: 3.2 (Coordinated)')).toBeInTheDocument();
  });

  it('does not display result summary when null', () => {
    render(
      <ToolCard tool={mockTool} status="not_started" resultSummary={null} />
    );

    // The specific result summary text should not appear
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
  });

  it('renders as a link when not disabled', () => {
    render(
      <ToolCard tool={mockTool} status="not_started" resultSummary={null} />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/tool/alignment');
  });

  it('renders as a button when disabled', () => {
    render(
      <ToolCard
        tool={mockTool}
        status="not_started"
        resultSummary={null}
        disabled
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('calls onDisabledClick when disabled card is clicked', async () => {
    const user = userEvent.setup();
    const onDisabledClick = vi.fn();

    render(
      <ToolCard
        tool={mockTool}
        status="not_started"
        resultSummary={null}
        disabled
        onDisabledClick={onDisabledClick}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onDisabledClick).toHaveBeenCalledTimes(1);
  });

  it('has accessible label for navigation', () => {
    render(
      <ToolCard tool={mockTool} status="not_started" resultSummary={null} />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Go to Tool 1: Organizational Alignment Assessment');
  });

  it('has accessible label for disabled state', () => {
    render(
      <ToolCard
        tool={mockTool}
        status="not_started"
        resultSummary={null}
        disabled
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Tool 1: Organizational Alignment Assessment - requires sign in');
  });

  it('applies correct article role for semantics', () => {
    render(
      <ToolCard tool={mockTool} status="not_started" resultSummary={null} />
    );

    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
