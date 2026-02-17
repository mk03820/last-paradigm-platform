/**
 * Purchase Components Barrel Export
 *
 * Story 17.1: Purchase CTA & Guarantee Display
 * Story 17.3: Checkout Transition Experience
 * Story 17.6: Purchase Success Page
 *
 * Components for the purchase flow, including CTA buttons,
 * mobile sticky navigation, checkout transition overlay, and
 * success page celebration components.
 * Re-exports GuaranteeBadge from trust components for convenience.
 */

export { PurchaseCTA } from './PurchaseCTA';
export { StickyCTA } from './StickyCTA';
export { PurchaseCTASection } from './PurchaseCTASection';

// Story 17.6: Success Page Components
export { SuccessHero } from './SuccessHero';
export { PurchaseConfirmation } from './PurchaseConfirmation';
export { NextSteps } from './NextSteps';
export { SuccessAnalytics } from './SuccessAnalytics';
export { SuccessCTA } from './SuccessCTA';
export { SuccessPageSkeleton } from './SuccessPageSkeleton';

// Re-export GuaranteeBadge from trust for convenient access in purchase context
export { GuaranteeBadge } from '@/components/trust';

// Re-export CheckoutTransition from checkout for convenient access in purchase context
export { CheckoutTransition } from '@/components/checkout';
export type { CheckoutTransitionProps, CheckoutTransitionStatus } from '@/components/checkout';
