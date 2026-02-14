'use client';

import { cn } from '@/lib/utils';
import { QuoteIcon } from '@/components/icons/PaymentIcons';
import type { Testimonial as TestimonialType } from '@/lib/data/testimonials';

interface TestimonialProps {
  /** Testimonial data to display */
  testimonial: TestimonialType;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Testimonial Component
 * Displays a social proof quote with author attribution
 * Meets AC3, AC7 requirements
 */
export function Testimonial({ testimonial, className }: TestimonialProps) {
  const { quote, author } = testimonial;

  return (
    <figure
      className={cn(
        'relative bg-slate-50 border border-slate-100 rounded-lg p-6 md:p-8',
        'border-l-4 border-l-amber-600', // Gold accent per Executive Clarity theme
        className
      )}
    >
      {/* Decorative quote mark */}
      <div
        className="absolute top-4 right-4 text-slate-200 opacity-50"
        aria-hidden="true"
      >
        <QuoteIcon className="h-10 w-10 md:h-12 md:w-12" />
      </div>

      {/* Quote content */}
      <blockquote className="relative">
        <p className="text-base md:text-lg leading-relaxed text-foreground italic pr-8 md:pr-12">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>

      {/* Author attribution */}
      <figcaption className="mt-4 flex items-center gap-3">
        {/* Avatar placeholder - shows initials if no avatar URL */}
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <div
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium"
            aria-hidden="true"
          >
            {getInitials(author.name)}
          </div>
        )}

        <div>
          <cite className="not-italic font-medium text-foreground">
            {author.name}
          </cite>
          <p className="text-sm text-muted-foreground">
            {author.title}
            {author.company && `, ${author.company}`}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

/**
 * Get initials from a full name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
