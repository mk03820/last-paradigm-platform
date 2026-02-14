/**
 * Preview Hero Component
 *
 * Hero section displaying estimated savings with animated count-up.
 * Uses "Executive Clarity" theme with Navy background and Gold accents.
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 3: Create hero section with animated savings display
 * Covers: AC2, AC4, AC7 (FR43, FR65)
 */

'use client';

import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { BookAttribution } from './BookAttribution';
import { PersonalizedMessage } from './PersonalizedMessage';
import type { SavingsContext } from '@/lib/services/savings-calculator';

interface PreviewHeroProps {
  /** Estimated annual savings */
  estimatedSavings: number;
  /** Total alignment tax amount */
  totalAlignmentTax: number;
  /** Alignment tax as percentage of revenue */
  percentOfRevenue: number;
  /** Savings context with severity-based messaging */
  savingsContext: SavingsContext;
}

/**
 * PreviewHero - Main hero section with animated savings display
 *
 * Features:
 * - Animated count-up for savings amount
 * - Executive Clarity theme (Navy #1e293b background, Gold #b45309 accents)
 * - 48px headline typography (32px on mobile)
 * - Book attribution per FR65
 * - Personalized messaging based on severity
 * - Entrance animations respecting prefers-reduced-motion
 */
export function PreviewHero({
  estimatedSavings,
  totalAlignmentTax,
  percentOfRevenue,
  savingsContext,
}: PreviewHeroProps) {
  return (
    <section
      className="bg-slate-900 text-white py-12 md:py-16 lg:py-24"
      aria-labelledby="savings-headline"
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Book Attribution */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BookAttribution className="mb-8" variant="subtle" />
          </motion.div>

          {/* Savings Headline */}
          <div className="text-center">
            {/* Supporting copy */}
            <motion.p
              className="text-slate-400 text-lg md:text-xl mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Based on your diagnostic, you could save
            </motion.p>

            {/* Main savings amount */}
            <motion.h1
              id="savings-headline"
              className="text-3xl md:text-4xl lg:text-6xl font-bold mb-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AnimatedNumber
                value={estimatedSavings}
                format="currency"
                duration={1.5}
                className="text-white"
              />
            </motion.h1>

            {/* "annually" text with gold accent */}
            <motion.p
              className="text-2xl md:text-3xl lg:text-4xl font-medium text-amber-500 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              annually
            </motion.p>

            {/* Personalized Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <PersonalizedMessage
                context={savingsContext}
                totalAlignmentTax={totalAlignmentTax}
                percentOfRevenue={percentOfRevenue}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
