/**
 * SuccessHero Component
 *
 * Celebration hero section with confetti animation and success message.
 * Uses Executive Clarity theme with reduced motion support.
 *
 * Story 17.6: Purchase Success Page
 * Task 2: Create celebration hero component (AC: 2)
 * Covers: AC2 (celebration moment with visual feedback)
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle2 } from 'lucide-react';
import { useWindowSize, useReducedMotion } from '@/hooks';

/**
 * Props for SuccessHero component
 */
interface SuccessHeroProps {
  /** User's name for personalized greeting */
  userName: string;
}

/**
 * SuccessHero - Celebration section with confetti and success message
 *
 * Features:
 * - Confetti animation that stops after 5 seconds
 * - Animated success checkmark icon
 * - Personalized congratulatory headline
 * - Respects prefers-reduced-motion
 * - Executive Clarity theme (slate-900 background, amber accents)
 *
 * @example
 * ```tsx
 * <SuccessHero userName="Matt" />
 * ```
 */
export function SuccessHero({ userName }: SuccessHeroProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  const prefersReducedMotion = useReducedMotion();

  // Stop confetti after 5 seconds
  useEffect(() => {
    if (prefersReducedMotion) {
      setShowConfetti(false);
      return;
    }

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <section
      className="relative pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 text-center overflow-hidden"
      aria-labelledby="success-headline"
    >
      {/* Confetti - respects reduced motion */}
      {showConfetti && !prefersReducedMotion && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#ffffff']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 50 }}
        />
      )}

      {/* Success Icon */}
      <motion.div
        initial={prefersReducedMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 200,
                damping: 15,
                duration: 0.5,
              }
        }
        className="mx-auto mb-6 sm:mb-8"
      >
        <div className="rounded-full bg-green-500/20 p-4 sm:p-6 w-16 h-16 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
          <CheckCircle2
            className="h-8 w-8 sm:h-12 sm:w-12 text-green-400"
            aria-hidden="true"
          />
        </div>
      </motion.div>

      {/* Congratulations Headline */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                delay: 0.3,
                duration: 0.5,
              }
        }
      >
        <h1
          id="success-headline"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 px-4"
        >
          Congratulations, {userName}!
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto px-4">
          Your transformation journey begins now. You have full access to
          Playbook 2 and all 10 diagnostic tools.
        </p>
      </motion.div>
    </section>
  );
}

export default SuccessHero;
