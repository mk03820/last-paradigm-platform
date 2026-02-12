/**
 * AlignmentTaxHeadline Component Tests
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 8.3: Unit tests for display components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlignmentTaxHeadline, AlignmentTaxBadge } from './AlignmentTaxHeadline';

describe('AlignmentTaxHeadline', () => {
  it('should render the formatted amount', () => {
    render(<AlignmentTaxHeadline amount={2900000} animate={false} />);

    expect(screen.getByText('$2.9M')).toBeInTheDocument();
  });

  it('should render "per year" label', () => {
    render(<AlignmentTaxHeadline amount={2900000} animate={false} />);

    expect(screen.getByText('per year')).toBeInTheDocument();
  });

  it('should format millions correctly', () => {
    render(<AlignmentTaxHeadline amount={1500000} animate={false} />);

    expect(screen.getByText('$1.5M')).toBeInTheDocument();
  });

  it('should format thousands correctly', () => {
    render(<AlignmentTaxHeadline amount={350000} animate={false} />);

    expect(screen.getByText('$350K')).toBeInTheDocument();
  });

  it('should format small amounts correctly', () => {
    render(<AlignmentTaxHeadline amount={500} animate={false} />);

    // Multiple elements due to sr-only span
    expect(screen.getAllByText('$500').length).toBeGreaterThan(0);
  });

  it('should have accessible region with announcement', () => {
    render(<AlignmentTaxHeadline amount={2900000} animate={false} />);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute(
      'aria-label',
      expect.stringContaining('alignment tax')
    );
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AlignmentTaxHeadline amount={2900000} animate={false} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle zero amount', () => {
    render(<AlignmentTaxHeadline amount={0} animate={false} />);

    // Multiple elements due to sr-only span
    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
  });
});

describe('AlignmentTaxBadge', () => {
  it('should render the formatted amount', () => {
    render(<AlignmentTaxBadge amount={2900000} />);

    expect(screen.getByText('$2.9M')).toBeInTheDocument();
  });

  it('should show /year suffix', () => {
    render(<AlignmentTaxBadge amount={2900000} />);

    expect(screen.getByText('/year')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AlignmentTaxBadge amount={2900000} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
