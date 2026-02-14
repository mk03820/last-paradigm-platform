/**
 * PersonalizedMessage Component Tests
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 7.4: Unit tests for PersonalizedMessage component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonalizedMessage } from './PersonalizedMessage';
import { getSavingsContext } from '@/lib/services/savings-calculator';

describe('PersonalizedMessage', () => {
  const normalContext = getSavingsContext(1);
  const significantContext = getSavingsContext(3);
  const crisisContext = getSavingsContext(5);
  const existentialContext = getSavingsContext(10);

  describe('severity levels', () => {
    it('renders normal level messaging', () => {
      render(<PersonalizedMessage context={normalContext} />);

      expect(screen.getByText('Normal Range')).toBeInTheDocument();
      expect(screen.getByText('Fine-tune your operations')).toBeInTheDocument();
      expect(
        screen.getByText(/Your alignment tax is within normal ranges/)
      ).toBeInTheDocument();
    });

    it('renders significant level messaging', () => {
      render(<PersonalizedMessage context={significantContext} />);

      expect(screen.getByText('Significant Impact')).toBeInTheDocument();
      expect(screen.getByText('Meaningful savings await')).toBeInTheDocument();
      expect(
        screen.getByText(/Your alignment tax is above average/)
      ).toBeInTheDocument();
    });

    it('renders crisis level messaging', () => {
      render(<PersonalizedMessage context={crisisContext} />);

      expect(screen.getByText('Crisis Level')).toBeInTheDocument();
      expect(screen.getByText('Urgent intervention required')).toBeInTheDocument();
      expect(
        screen.getByText(/Your alignment tax is at crisis level/)
      ).toBeInTheDocument();
    });

    it('renders existential level messaging', () => {
      render(<PersonalizedMessage context={existentialContext} />);

      expect(screen.getByText('Existential Threat')).toBeInTheDocument();
      expect(screen.getByText('Transform or face extinction')).toBeInTheDocument();
      expect(
        screen.getByText(/Your alignment tax poses an existential threat/)
      ).toBeInTheDocument();
    });
  });

  describe('supporting statistics', () => {
    it('displays total alignment tax when provided', () => {
      render(
        <PersonalizedMessage
          context={crisisContext}
          totalAlignmentTax={4800000}
        />
      );

      expect(screen.getByText(/\$4\.8M/)).toBeInTheDocument();
      // Check that statistics section exists (contains the formatted amount)
      const statsSection = screen.getByText(/\$4\.8M/).closest('p');
      expect(statsSection).toHaveClass('mt-4');
    });

    it('displays percentage of revenue when provided', () => {
      render(
        <PersonalizedMessage
          context={crisisContext}
          percentOfRevenue={5.2}
        />
      );

      expect(screen.getByText(/5\.2%/)).toBeInTheDocument();
      expect(screen.getByText(/of revenue/)).toBeInTheDocument();
    });

    it('displays both statistics when both provided', () => {
      render(
        <PersonalizedMessage
          context={crisisContext}
          totalAlignmentTax={4800000}
          percentOfRevenue={5.2}
        />
      );

      expect(screen.getByText(/\$4\.8M/)).toBeInTheDocument();
      expect(screen.getByText(/5\.2%/)).toBeInTheDocument();
      expect(screen.getByText(/represents/)).toBeInTheDocument();
    });

    it('does not display statistics section when neither provided', () => {
      render(<PersonalizedMessage context={crisisContext} />);

      // The statistics section has mt-4 class, should not exist
      const statsSection = document.querySelector('p.mt-4');
      expect(statsSection).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies correct colors for normal level', () => {
      const { container } = render(
        <PersonalizedMessage context={normalContext} />
      );

      expect(container.querySelector('[class*="green"]')).toBeInTheDocument();
    });

    it('applies correct colors for significant level', () => {
      const { container } = render(
        <PersonalizedMessage context={significantContext} />
      );

      expect(container.querySelector('[class*="yellow"]')).toBeInTheDocument();
    });

    it('applies correct colors for crisis level', () => {
      const { container } = render(
        <PersonalizedMessage context={crisisContext} />
      );

      expect(container.querySelector('[class*="orange"]')).toBeInTheDocument();
    });

    it('applies correct colors for existential level', () => {
      const { container } = render(
        <PersonalizedMessage context={existentialContext} />
      );

      expect(container.querySelector('[class*="red"]')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PersonalizedMessage context={normalContext} className="custom-class" />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('has correct role and label', () => {
      render(<PersonalizedMessage context={normalContext} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute(
        'aria-label',
        'Personalized assessment message'
      );
    });

    it('renders icon with aria-hidden', () => {
      render(<PersonalizedMessage context={normalContext} />);

      const icon = document.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('icons', () => {
    it('renders CheckCircle icon for normal level', () => {
      const { container } = render(
        <PersonalizedMessage context={normalContext} />
      );

      // Check that an SVG exists in the badge
      const badge = container.querySelector('.rounded-full');
      expect(badge?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders different icons for different severity levels', () => {
      const { rerender, container } = render(
        <PersonalizedMessage context={normalContext} />
      );
      const normalIcon = container.querySelector('svg')?.innerHTML;

      rerender(<PersonalizedMessage context={crisisContext} />);
      const crisisIcon = container.querySelector('svg')?.innerHTML;

      // Icons should be different
      expect(normalIcon).not.toEqual(crisisIcon);
    });
  });
});
