'use client';

/**
 * PB1 Completion Handoff Component
 *
 * Displays after all 7 PB1 tools are complete, prompting user
 * to create an account to save results and access PB2 preview.
 *
 * Covers: Story 15.6, FR66 (Account creation prompt)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Lock, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface PB1CompletionHandoffProps {
  totalAlignmentTax?: number;
  estimatedSavings?: number;
  className?: string;
}

export function PB1CompletionHandoff({
  totalAlignmentTax,
  estimatedSavings,
  className,
}: PB1CompletionHandoffProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user is already authenticated or dismissed
  if (session?.user || dismissed) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 md:p-8 ${className}`}>
      {/* Success Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <span className="text-green-500 font-medium">Diagnostic Complete</span>
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
        Your Alignment Tax Analysis is Ready
      </h2>

      {/* Results Summary */}
      {totalAlignmentTax && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Total Alignment Tax</p>
              <p className="text-2xl font-bold text-amber-500">
                {formatCurrency(totalAlignmentTax)}
              </p>
            </div>
            {estimatedSavings && (
              <div>
                <p className="text-sm text-slate-400">Potential Savings</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(estimatedSavings)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Value Proposition */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-medium">Save Your Results Permanently</p>
            <p className="text-sm text-slate-400">
              Never lose your diagnostic data. Access anytime from any device.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-medium">See Your Transformation Roadmap</p>
            <p className="text-sm text-slate-400">
              Get personalized recommendations based on your specific results.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-medium">Access Playbook 2 Preview</p>
            <p className="text-sm text-slate-400">
              See which tools will have the biggest impact for your organization.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <Button
          onClick={() => router.push('/auth/register?callbackUrl=/preview')}
          className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg"
        >
          Create Account
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          Continue without account
        </button>
      </div>

      {/* Book Attribution */}
      <p className="text-xs text-slate-500 text-center mt-6">
        Based on the methodology from <em>The Last Paradigm</em>
      </p>
    </div>
  );
}
