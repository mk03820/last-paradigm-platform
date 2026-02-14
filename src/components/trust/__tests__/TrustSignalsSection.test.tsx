import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrustSignalsSection } from '../TrustSignalsSection';
import type { Testimonial } from '@/lib/data/testimonials';

const customTestimonial: Testimonial = {
  id: 'custom-1',
  quote: 'Custom testimonial for testing purposes.',
  author: {
    name: 'Test User',
    title: 'Test Title',
    company: 'Test Company',
  },
};

describe('TrustSignalsSection', () => {
  it('renders as a section element', () => {
    render(<TrustSignalsSection />);

    const section = screen.getByRole('region', { name: /Trust and security information/i });
    expect(section).toBeInTheDocument();
  });

  it('has proper aria-label for accessibility', () => {
    render(<TrustSignalsSection />);

    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('aria-label', 'Trust and security information');
  });

  it('renders the GuaranteeBadge component', () => {
    render(<TrustSignalsSection />);

    expect(screen.getByText(/30-Day Money-Back Guarantee/i)).toBeInTheDocument();
  });

  it('renders the SecurePaymentIcons component', () => {
    render(<TrustSignalsSection />);

    expect(screen.getByRole('img', { name: /Powered by Stripe/i })).toBeInTheDocument();
    expect(screen.getByText(/Secure Checkout/i)).toBeInTheDocument();
  });

  it('renders the MethodologyAttribution component', () => {
    render(<TrustSignalsSection />);

    expect(screen.getByText(/The Last Paradigm/i)).toBeInTheDocument();
    expect(screen.getByText(/methodology/i)).toBeInTheDocument();
  });

  it('renders the featured testimonial by default', () => {
    render(<TrustSignalsSection />);

    // Should render the featured testimonial from testimonials.ts
    expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument();
  });

  it('hides testimonial when showTestimonial is false', () => {
    render(<TrustSignalsSection showTestimonial={false} />);

    // Should not render any testimonial
    expect(screen.queryByText(/Sarah Chen/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
  });

  it('uses custom testimonial when provided', () => {
    render(<TrustSignalsSection customTestimonial={customTestimonial} />);

    expect(screen.getByText(/Custom testimonial for testing/i)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<TrustSignalsSection className="custom-section-class" />);

    const section = screen.getByRole('region');
    expect(section.className).toContain('custom-section-class');
  });

  it('has proper visual hierarchy with spacing', () => {
    render(<TrustSignalsSection />);

    const section = screen.getByRole('region');

    // Should have responsive padding
    expect(section.className).toContain('py-8');
    expect(section.className).toContain('md:py-12');
  });

  it('has max-width constraint for readability', () => {
    render(<TrustSignalsSection />);

    const section = screen.getByRole('region');
    const innerContainer = section.querySelector('.max-w-2xl');
    expect(innerContainer).toBeInTheDocument();
  });

  it('renders components in correct visual order', () => {
    render(<TrustSignalsSection />);

    // Get key elements
    const guaranteeBadge = screen.getByText(/30-Day Money-Back Guarantee/i);
    const secureCheckout = screen.getByText(/Secure Checkout/i);
    const testimonial = screen.getByText(/Sarah Chen/i);
    const methodology = screen.getByText(/methodology/i);

    // Check document order: Guarantee -> Payment Icons -> Testimonial -> Methodology
    expect(
      guaranteeBadge.compareDocumentPosition(secureCheckout) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(
      secureCheckout.compareDocumentPosition(testimonial) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(
      testimonial.compareDocumentPosition(methodology) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('centers all child components', () => {
    render(<TrustSignalsSection />);

    // Check that containers have justify-center
    const guaranteeContainer = screen.getByText(/30-Day Money-Back Guarantee/i).closest('.flex.justify-center') ||
      screen.getByText(/30-Day Money-Back Guarantee/i).parentElement?.parentElement;

    // The structure uses flex justify-center divs for centering
    const section = screen.getByRole('region');
    const centerDivs = section.querySelectorAll('.justify-center');
    expect(centerDivs.length).toBeGreaterThanOrEqual(3);
  });

  it('has background color from theme', () => {
    render(<TrustSignalsSection />);

    const section = screen.getByRole('region');
    expect(section.className).toContain('bg-background');
  });
});
