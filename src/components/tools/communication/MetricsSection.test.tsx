/**
 * MetricsSection Tests
 *
 * Story 13.1: Communication Metrics Input
 * Task 9.6: Unit tests for MetricsSection
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricsSection, getSectionStatus } from './MetricsSection';

describe('MetricsSection', () => {
  const defaultProps = {
    id: 'test-section',
    title: 'Test Section',
    icon: '📧',
    description: 'Test section description',
    status: 'not-started' as const,
    children: <div data-testid="child-content">Child content</div>,
  };

  it('should render section title and description', () => {
    render(<MetricsSection {...defaultProps} />);

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test section description')).toBeInTheDocument();
  });

  it('should render section icon', () => {
    render(<MetricsSection {...defaultProps} />);

    expect(screen.getByRole('img', { name: 'Test Section' })).toHaveTextContent('📧');
  });

  it('should render children content when expanded', async () => {
    const user = userEvent.setup();
    render(<MetricsSection {...defaultProps} defaultOpen />);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should toggle content visibility on click', async () => {
    const user = userEvent.setup();
    render(<MetricsSection {...defaultProps} />);

    // Initially collapsed (not defaultOpen)
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();

    // Click to expand
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  describe('status badges', () => {
    it('should show "Not Started" badge for not-started status', () => {
      render(<MetricsSection {...defaultProps} status="not-started" />);

      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('should show "In Progress" badge for in-progress status', () => {
      render(<MetricsSection {...defaultProps} status="in-progress" />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should show "Complete" badge with checkmark for complete status', () => {
      render(<MetricsSection {...defaultProps} status="complete" />);

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MetricsSection {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should be expanded by default when defaultOpen is true', () => {
    render(<MetricsSection {...defaultProps} defaultOpen />);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should be collapsed by default when defaultOpen is false', () => {
    render(<MetricsSection {...defaultProps} defaultOpen={false} />);

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should render inside a Card component', () => {
    const { container } = render(<MetricsSection {...defaultProps} />);

    // Card component should add the card class or data-slot
    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
  });
});

describe('getSectionStatus', () => {
  it('should return "not-started" when no data and not complete', () => {
    expect(getSectionStatus(false, false)).toBe('not-started');
  });

  it('should return "in-progress" when has data but not complete', () => {
    expect(getSectionStatus(true, false)).toBe('in-progress');
  });

  it('should return "complete" when isComplete is true', () => {
    expect(getSectionStatus(true, true)).toBe('complete');
  });

  it('should return "complete" even if hasAnyData is false but isComplete is true', () => {
    // Edge case - complete takes priority
    expect(getSectionStatus(false, true)).toBe('complete');
  });
});
