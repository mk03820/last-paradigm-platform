'use client';

import { cn } from '@/lib/utils';
import {
  StripeBadge,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  SecureLockIcon,
} from '@/components/icons/PaymentIcons';

interface SecurePaymentIconsProps {
  className?: string;
}

/**
 * Secure Payment Icons Component
 * Displays Stripe badge and credit card logos with secure checkout indicator
 * Meets AC2, AC7 requirements
 */
export function SecurePaymentIcons({ className }: SecurePaymentIconsProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6',
        'text-slate-400',
        className
      )}
      role="img"
      aria-label="We accept Visa, Mastercard, American Express. Payments secured by Stripe."
    >
      {/* Stripe Badge */}
      <div className="flex items-center">
        <StripeBadge className="h-6 sm:h-7" />
      </div>

      {/* Divider - hidden on mobile */}
      <div
        className="hidden sm:block w-px h-6 bg-slate-200"
        aria-hidden="true"
      />

      {/* Credit Card Logos */}
      <div className="flex items-center gap-3">
        <VisaLogo className="h-5 sm:h-6" />
        <MastercardLogo className="h-5 sm:h-6" />
        <AmexLogo className="h-5 sm:h-6" />
      </div>

      {/* Divider - hidden on mobile */}
      <div
        className="hidden sm:block w-px h-6 bg-slate-200"
        aria-hidden="true"
      />

      {/* Secure Checkout Indicator */}
      <div className="flex items-center gap-1.5">
        <SecureLockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-xs sm:text-sm font-medium">Secure Checkout</span>
      </div>
    </div>
  );
}
