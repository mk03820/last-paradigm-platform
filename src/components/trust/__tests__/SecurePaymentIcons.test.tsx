import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecurePaymentIcons } from '../SecurePaymentIcons';

describe('SecurePaymentIcons', () => {
  it('renders the component', () => {
    render(<SecurePaymentIcons />);

    // Should have the main container with proper ARIA
    const container = screen.getByRole('img', {
      name: /We accept Visa, Mastercard, American Express. Payments secured by Stripe./i,
    });
    expect(container).toBeInTheDocument();
  });

  it('renders the Stripe badge', () => {
    render(<SecurePaymentIcons />);

    // Stripe badge should have proper ARIA label
    const stripeBadge = screen.getByRole('img', { name: /Powered by Stripe/i });
    expect(stripeBadge).toBeInTheDocument();
  });

  it('renders the Visa logo', () => {
    render(<SecurePaymentIcons />);

    const visaLogo = screen.getByRole('img', { name: /Visa accepted/i });
    expect(visaLogo).toBeInTheDocument();
  });

  it('renders the Mastercard logo', () => {
    render(<SecurePaymentIcons />);

    const mastercardLogo = screen.getByRole('img', { name: /Mastercard accepted/i });
    expect(mastercardLogo).toBeInTheDocument();
  });

  it('renders the American Express logo', () => {
    render(<SecurePaymentIcons />);

    const amexLogo = screen.getByRole('img', { name: /American Express accepted/i });
    expect(amexLogo).toBeInTheDocument();
  });

  it('renders the secure checkout indicator', () => {
    render(<SecurePaymentIcons />);

    // Should have lock icon with label
    const secureLock = screen.getByRole('img', { name: /Secure checkout/i });
    expect(secureLock).toBeInTheDocument();

    // Should have "Secure Checkout" text
    expect(screen.getByText(/Secure Checkout/i)).toBeInTheDocument();
  });

  it('has proper accessibility for all payment icons', () => {
    render(<SecurePaymentIcons />);

    // All SVGs should have role="img" and proper aria-labels
    const paymentIcons = screen.getAllByRole('img');

    // Should have: container (1) + Stripe (1) + Visa (1) + MC (1) + Amex (1) + Lock (1) = 6
    expect(paymentIcons.length).toBe(6);

    // Each should have an aria-label
    paymentIcons.forEach((icon) => {
      expect(
        icon.getAttribute('aria-label') || icon.closest('[aria-label]')
      ).toBeTruthy();
    });
  });

  it('applies custom className when provided', () => {
    render(<SecurePaymentIcons className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('uses muted colors for professional appearance', () => {
    render(<SecurePaymentIcons />);

    // Container should have muted color class
    const container = screen.getByRole('img', {
      name: /We accept Visa, Mastercard, American Express/i,
    });
    expect(container.className).toContain('text-slate-400');
  });

  it('has responsive layout classes', () => {
    render(<SecurePaymentIcons />);

    const container = screen.getByRole('img', {
      name: /We accept Visa, Mastercard, American Express/i,
    });

    // Should have flex column on mobile, row on larger screens
    expect(container.className).toContain('flex-col');
    expect(container.className).toContain('sm:flex-row');
  });
});
