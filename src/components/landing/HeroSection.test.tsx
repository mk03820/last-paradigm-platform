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

  it('renders dual CTA buttons for mode selection', () => {
    render(<HeroSection />);

    // Should have "Let Us Guide You" button linking to /calculator
    const guidedButton = screen.getByRole('link', { name: /let us guide you/i });
    expect(guidedButton).toBeInTheDocument();
    expect(guidedButton).toHaveAttribute('href', '/calculator');

    // Should have "Run It Yourself" button linking to /templates
    const templateButton = screen.getByRole('link', { name: /run it yourself/i });
    expect(templateButton).toBeInTheDocument();
    expect(templateButton).toHaveAttribute('href', '/templates');
  });

  it('displays "(Recommended)" text for guided option', () => {
    render(<HeroSection />);

    // Should show recommended indicator for guided path
    const recommendedText = screen.getByText(/\(recommended\)/i);
    expect(recommendedText).toBeInTheDocument();
  });

  it('displays mode selection helper text', () => {
    render(<HeroSection />);

    // Should have "Choose your path" text
    const chooseText = screen.getByText(/choose your path/i);
    expect(chooseText).toBeInTheDocument();

    // Should have explanation of the two options
    const explanationText = screen.getByText(/guided for step-by-step|download a template/i);
    expect(explanationText).toBeInTheDocument();
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

    // Mode selection group should have aria-label
    const modeGroup = screen.getByRole('group', { name: /choose your diagnostic path/i });
    expect(modeGroup).toBeInTheDocument();
  });

  it('CTA buttons are keyboard accessible', () => {
    render(<HeroSection />);

    const guidedButton = screen.getByRole('link', { name: /let us guide you/i });
    const templateButton = screen.getByRole('link', { name: /run it yourself/i });

    // Links are inherently keyboard accessible, verify they're focusable
    expect(guidedButton).not.toHaveAttribute('tabindex', '-1');
    expect(templateButton).not.toHaveAttribute('tabindex', '-1');
  });

  it('guided option has descriptive aria-label for screen readers', () => {
    render(<HeroSection />);

    const guidedButton = screen.getByRole('link', { name: /let us guide you.*recommended/i });
    expect(guidedButton).toBeInTheDocument();
  });
});
