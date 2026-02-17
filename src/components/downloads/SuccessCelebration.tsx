/**
 * Success Celebration Component
 *
 * Displays success message when all documents are complete.
 *
 * Story 18.7: Post-Generation Success Experience
 * Task 1: Create SuccessCelebration component
 * Covers: AC1 (success message), AC2 (Download All CTA)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessCelebrationProps {
  documentCount: number;
  onDownloadAll: () => void;
  className?: string;
}

export function SuccessCelebration({
  documentCount,
  onDownloadAll,
  className,
}: SuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show confetti animation on mount
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-200',
        className
      )}
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-amber-400 animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Success Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Your Toolkit is Ready!
      </h2>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        All {documentCount} documents have been successfully generated and
        personalized with your diagnostic findings.
      </p>

      {/* Download All CTA */}
      <Button size="lg" onClick={onDownloadAll} className="gap-2">
        <Download className="h-5 w-5" />
        Download All Documents
      </Button>

      {/* Secondary Message */}
      <p className="text-sm text-slate-500 mt-4">
        Download links are valid for 24 hours
      </p>
    </div>
  );
}

export default SuccessCelebration;
