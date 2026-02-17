/**
 * NextSteps Component
 *
 * Displays numbered action steps for getting started with Playbook 2.
 * Each step includes an icon, description, and actionable link.
 *
 * Story 17.6: Purchase Success Page
 * Task 4: Create next steps component (AC: 4)
 * Covers: AC4 (numbered action list showing how to begin)
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutGrid, Map, PlayCircle, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks';

/**
 * Step configuration type
 */
interface Step {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  cta: string;
}

/**
 * Steps configuration
 */
const steps: Step[] = [
  {
    number: 1,
    icon: LayoutGrid,
    title: 'Explore Your Tools',
    description:
      'Access all 10 diagnostic tools designed to identify and quantify your alignment tax.',
    href: '/pb2/tools',
    cta: 'View Tools',
  },
  {
    number: 2,
    icon: Map,
    title: 'Review Your Roadmap',
    description:
      'See your personalized transformation roadmap based on your PB1 diagnostic results.',
    href: '/pb2/roadmap',
    cta: 'View Roadmap',
  },
  {
    number: 3,
    icon: PlayCircle,
    title: 'Start Your First Assessment',
    description:
      'Begin with the recommended tool to maximize your transformation impact.',
    href: '/pb2/tools/1',
    cta: 'Get Started',
  },
];

/**
 * Animation variants for staggered reveal
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * NextSteps - Action steps section for getting started
 *
 * Features:
 * - Numbered step indicators
 * - Icon and descriptive text for each step
 * - Actionable links with hover states
 * - Staggered animation on load
 * - Respects prefers-reduced-motion
 * - Mobile-responsive layout
 *
 * @example
 * ```tsx
 * <NextSteps />
 * ```
 */
export function NextSteps() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="py-12 sm:py-16"
      aria-labelledby="next-steps-heading"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <h2
          id="next-steps-heading"
          className="text-2xl font-bold text-white text-center mb-8 sm:mb-12"
        >
          What&apos;s Next?
        </h2>

        <motion.div
          className="space-y-4 sm:space-y-6"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                {/* Step Number */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-600/20 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-amber-500">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <step.icon
                      className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500"
                      aria-hidden="true"
                    />
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-400 mb-4">
                    {step.description}
                  </p>

                  {/* Mobile CTA - shown inline on small screens */}
                  <Link
                    href={step.href}
                    className="inline-flex sm:hidden items-center gap-2 text-amber-500 hover:text-amber-400 font-medium text-sm transition-colors"
                  >
                    {step.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                {/* Desktop CTA - shown to the right on larger screens */}
                <Link
                  href={step.href}
                  className="hidden sm:flex flex-shrink-0 items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  {step.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default NextSteps;
