import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuaranteeBadge } from '../GuaranteeBadge';

describe('GuaranteeBadge', () => {
  it('renders the guarantee badge with headline text', () => {
    render(<GuaranteeBadge />);

    expect(screen.getByText(/30-Day Money-Back Guarantee/i)).toBeInTheDocument();
  });

  it('renders the subheadline text', () => {
    render(<GuaranteeBadge />);

    expect(screen.getByText(/Full refund, no questions asked/i)).toBeInTheDocument();
  });

  it('has an expandable trigger button', () => {
    render(<GuaranteeBadge />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands to show refund policy on click', async () => {
    const user = userEvent.setup();
    render(<GuaranteeBadge />);

    const trigger = screen.getByRole('button');

    // Initially collapsed - policy details should not be visible
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    await user.click(trigger);

    // Should now be expanded
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Full policy text should be visible
    expect(
      screen.getByText(/If you're not satisfied with your Playbook 2 toolkit/i)
    ).toBeInTheDocument();
  });

  it('collapses when clicked again', async () => {
    const user = userEvent.setup();
    render(<GuaranteeBadge />);

    const trigger = screen.getByRole('button');

    // Expand
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Collapse
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper aria-controls attribute', () => {
    render(<GuaranteeBadge />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-controls', 'refund-policy-details');
  });

  it('includes screen reader text for expand/collapse action', () => {
    render(<GuaranteeBadge />);

    expect(screen.getByText(/View refund policy details/i)).toBeInTheDocument();
  });

  it('displays the shield icon', () => {
    render(<GuaranteeBadge />);

    // Shield icon should be present (using aria-hidden)
    const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('has focus-visible styling for keyboard navigation', () => {
    render(<GuaranteeBadge />);

    const trigger = screen.getByRole('button');
    expect(trigger.className).toContain('focus-visible:');
  });

  it('applies custom className when provided', () => {
    render(<GuaranteeBadge className="custom-class" />);

    // The Collapsible component should have the custom class
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('shows complete refund policy text when expanded', async () => {
    const user = userEvent.setup();
    render(<GuaranteeBadge />);

    await user.click(screen.getByRole('button'));

    // Check for key policy elements
    expect(screen.getByText(/30 days of purchase/i)).toBeInTheDocument();
    expect(screen.getByText(/contact us for a full refund/i)).toBeInTheDocument();
    expect(screen.getByText(/No questions asked/i)).toBeInTheDocument();
    expect(screen.getByText(/Your satisfaction is our priority/i)).toBeInTheDocument();
  });

  it('meets minimum touch target size requirement', () => {
    render(<GuaranteeBadge />);

    const trigger = screen.getByRole('button');
    // Check that the class includes the 44px minimum height for touch targets
    expect(trigger.className).toContain('min-h-[44px]');
  });
});
