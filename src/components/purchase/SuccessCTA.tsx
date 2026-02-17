/**
 * SuccessCTA Component
 *
 * Primary call-to-action section for the success page.
 * Guides users to start their transformation journey.
 *
 * Story 17.6: Purchase Success Page
 * Task 6: Create primary CTA section (AC: 6)
 * Covers: AC6 (prominent CTA leads to first PB2 tool)
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks';

/**
 * SuccessCTA - Primary action section for success page
 *
 * Features:
 * - Prominent "Start Your Transformation" button
 * - Links to PB2 tools dashboard
 * - Secondary actions for support and receipts
 * - Executive Clarity theme styling
 * - Entrance animation with reduced motion support
 *
 * @example
 * ```tsx
 * <SuccessCTA />
 * ```
 */
export function SuccessCTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="py-12 sm:py-16 bg-slate-800/30"
      aria-labelledby="success-cta-heading"
    >
      <motion.div
        className="container mx-auto px-4 max-w-2xl text-center"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5, duration: 0.5 }}
      >
        <h2
          id="success-cta-heading"
          className="text-xl sm:text-2xl font-bold text-white mb-6"
        >
          Ready to Begin?
        </h2>

        {/* Primary CTA Button */}
        <Button
          size="lg"
          asChild
          className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 mb-8"
        >
          <Link href="/pb2/tools">
            Start Your Transformation
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            View Dashboard
          </Link>

          <span className="hidden sm:inline text-slate-600" aria-hidden="true">
            |
          </span>

          <a
            href="mailto:support@lastparadigm.com"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Contact Support
          </a>
        </div>
      </motion.div>
    </section>
  );
}

export default SuccessCTA;
