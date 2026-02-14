'use client';

import { cn } from '@/lib/utils';
import { GuaranteeBadge } from './GuaranteeBadge';
import { SecurePaymentIcons } from './SecurePaymentIcons';
import { Testimonial } from './Testimonial';
import { MethodologyAttribution } from './MethodologyAttribution';
import { getFeaturedTestimonial, type Testimonial as TestimonialType } from '@/lib/data/testimonials';

interface TrustSignalsSectionProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the testimonial section */
  showTestimonial?: boolean;
  /** Optional custom testimonial to display */
  customTestimonial?: TestimonialType;
}

/**
 * Trust Signals Section Layout Component
 * Composes all trust signal elements with proper visual hierarchy
 * Meets AC4, AC5, AC7 requirements
 */
export function TrustSignalsSection({
  className,
  showTestimonial = true,
  customTestimonial,
}: TrustSignalsSectionProps) {
  const testimonial = customTestimonial || getFeaturedTestimonial();

  return (
    <section
      className={cn(
        'py-8 md:py-12',
        'bg-background',
        className
      )}
      aria-label="Trust and security information"
    >
      <div className="max-w-2xl mx-auto px-4 space-y-8 md:space-y-10">
        {/* Primary: Guarantee Badge - most prominent */}
        <div className="flex justify-center">
          <GuaranteeBadge />
        </div>

        {/* Secondary: Payment security */}
        <div className="flex justify-center">
          <SecurePaymentIcons />
        </div>

        {/* Tertiary: Social proof - testimonial */}
        {showTestimonial && testimonial && (
          <div className="max-w-xl mx-auto">
            <Testimonial testimonial={testimonial} />
          </div>
        )}

        {/* Attribution - subtle credibility element */}
        <div className="flex justify-center pt-2">
          <MethodologyAttribution />
        </div>
      </div>
    </section>
  );
}
