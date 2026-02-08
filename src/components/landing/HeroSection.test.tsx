import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders the hero section with headline', () => {
    render(<HeroSection />);

    // Should have a main heading addressing the "CEO handed you a book" moment
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/CEO|book|alignment/i);
  });

  it('renders subheadline explaining meeting waste quantification', () => {
    render(<HeroSection />);

    // Should explain what the calculator does
    const subheadline = screen.getByText(/quantif|meeting|waste|cost/i);
    expect(subheadline).toBeInTheDocument();
  });

  it('renders a prominent CTA button linking to /calculator', () => {
    render(<HeroSection />);

    // Should have a Start Diagnostic button
    const ctaButton = screen.getByRole('link', { name: /start diagnostic/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/calculator');
  });

  it('has proper accessibility attributes', () => {
    render(<HeroSection />);

    // Should have semantic section element
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby');

    // Heading should have an id for aria-labelledby
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveAttribute('id');
  });

  it('CTA button is keyboard accessible', () => {
    render(<HeroSection />);

    const ctaButton = screen.getByRole('link', { name: /start diagnostic/i });
    // Links are inherently keyboard accessible, just verify it exists as focusable
    expect(ctaButton).not.toHaveAttribute('tabindex', '-1');
  });
});
