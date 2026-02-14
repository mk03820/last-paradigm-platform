/**
 * Save Results Button Component
 *
 * Button that triggers a modal for saving PB1 results via email link.
 * Collects session data from all tool stores and sends to preservation API.
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC1 (Save my results button), AC2 (email input), AC4 (email sent)
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool1Store } from '@/lib/store/tool1-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';
import { useTool7Store } from '@/lib/store/tool7-store';
import type { PreservedSessionData, PreserveSessionResponse } from '@/types/auth.types';

type SaveState = 'idle' | 'loading' | 'success' | 'error';

interface SaveResultsButtonProps {
  /** Variant of the button */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Size of the button */
  size?: 'default' | 'sm' | 'lg';
  /** Custom class name */
  className?: string;
  /** Show only if there's unsaved data */
  showOnlyIfData?: boolean;
}

/**
 * Collect session data from all tool stores
 */
function collectSessionData(): PreservedSessionData {
  const calculator = useCalculatorStore.getState();
  const tool1 = useTool1Store.getState();
  const tool3 = useTool3Store.getState();
  const tool4 = useTool4Store.getState();
  const tool5 = useTool5Store.getState();
  const tool6 = useTool6Store.getState();
  const tool7 = useTool7Store.getState();

  const sessionData: PreservedSessionData = {
    preservedAt: new Date().toISOString(),
  };

  // Tool 1: Alignment Assessment
  if (Object.keys(tool1.scores).length > 0) {
    sessionData.tool1 = {
      scores: tool1.scores,
      compositeScore: tool1.completion?.compositeScore,
      completedAt: tool1.completion?.completedAt,
    };
  }

  // Tool 2: Meeting Audit
  if (calculator.meetingData) {
    sessionData.tool2 = {
      inputs: calculator.meetingData,
      results: calculator.results
        ? {
            totalMeetingHours: 0,
            totalMeetingCost: 0,
            wastedHours: 0,
            wastedCost: calculator.results.meetingWaste,
            effectiveHours: 0,
            effectiveCost: 0,
          }
        : undefined,
      completedAt: calculator.results?.calculatedAt,
    };
  }

  // Tool 3: Decision Velocity
  if (tool3.decisions && tool3.decisions.length > 0) {
    sessionData.tool3 = {
      decisions: tool3.decisions,
      metrics: tool3.metrics,
      completedAt: tool3.completion?.completedAt,
    };
  }

  // Tool 4: Stakeholder Map
  if (tool4.stakeholders && tool4.stakeholders.length > 0) {
    sessionData.tool4 = {
      stakeholders: tool4.stakeholders,
      completedAt: tool4.completion?.completedAt,
    };
  }

  // Tool 5: Data Flow Friction
  if (tool5.journeys && tool5.journeys.length > 0) {
    sessionData.tool5 = {
      journeys: tool5.journeys,
      frictionCost: tool5.completion?.totalFrictionCost,
      completedAt: tool5.completion?.completedAt,
    };
  }

  // Tool 6: Communication Pattern
  if (tool6.metrics) {
    sessionData.tool6 = {
      metrics: tool6.metrics,
      antiPatterns: tool6.antiPatterns,
      completedAt: tool6.completion?.completedAt,
    };
  }

  // Tool 7: Total Cost
  if (tool7.completion) {
    sessionData.tool7 = {
      totalCost: tool7.completion.totalCost,
      alignmentTaxPercent: tool7.calculationResults?.confidenceLevel === 'high' ? 5 : 3,
      completedAt: tool7.completion.completedAt,
    };
  }

  // Determine last tool completed
  if (sessionData.tool7?.completedAt) sessionData.lastToolCompleted = 7;
  else if (sessionData.tool6?.completedAt) sessionData.lastToolCompleted = 6;
  else if (sessionData.tool5?.completedAt) sessionData.lastToolCompleted = 5;
  else if (sessionData.tool4?.completedAt) sessionData.lastToolCompleted = 4;
  else if (sessionData.tool3?.completedAt) sessionData.lastToolCompleted = 3;
  else if (sessionData.tool2?.completedAt) sessionData.lastToolCompleted = 2;
  else if (sessionData.tool1?.completedAt) sessionData.lastToolCompleted = 1;

  return sessionData;
}

/**
 * Check if there's any session data worth saving
 */
function hasSessionData(): boolean {
  const calculator = useCalculatorStore.getState();
  const tool1 = useTool1Store.getState();
  const tool3 = useTool3Store.getState();
  const tool4 = useTool4Store.getState();
  const tool5 = useTool5Store.getState();
  const tool6 = useTool6Store.getState();
  const tool7 = useTool7Store.getState();

  return (
    calculator.meetingData !== null ||
    Object.keys(tool1.scores).length > 0 ||
    (tool3.decisions && tool3.decisions.length > 0) ||
    (tool4.stakeholders && tool4.stakeholders.length > 0) ||
    (tool5.journeys && tool5.journeys.length > 0) ||
    tool6.metrics !== null ||
    tool7.aggregatedData !== null
  );
}

export function SaveResultsButton({
  variant = 'outline',
  size = 'default',
  className,
  showOnlyIfData = false,
}: SaveResultsButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Subscribe to store changes for conditional rendering
  const calculatorData = useCalculatorStore((s) => s.meetingData);
  const tool1Scores = useTool1Store((s) => s.scores);

  // Check if we should show the button
  const hasData = React.useMemo(() => {
    return hasSessionData();
  }, [calculatorData, tool1Scores]);

  // Don't render if showOnlyIfData is true and there's no data
  if (showOnlyIfData && !hasData) {
    return null;
  }

  // Validate email format
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setSaveState('loading');
    setErrorMessage('');

    try {
      const sessionData = collectSessionData();

      const response = await fetch('/api/session/preserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sessionData,
        }),
      });

      const data: PreserveSessionResponse = await response.json();

      if (data.success) {
        setSaveState('success');
      } else {
        setSaveState('error');
        setErrorMessage(data.error?.message || 'Failed to save results');
      }
    } catch (error) {
      console.error('[SaveResultsButton] Error:', error);
      setSaveState('error');
      setErrorMessage('Failed to connect to the server');
    }
  }

  // Reset state when dialog opens/closes
  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      // Reset after a delay to avoid flicker
      setTimeout(() => {
        setSaveState('idle');
        setEmail('');
        setErrorMessage('');
      }, 200);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Save className="h-4 w-4 mr-2" />
          Save My Results
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {saveState === 'success' ? (
          // Success State
          <>
            <DialogHeader>
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <DialogTitle className="text-center">Check Your Email!</DialogTitle>
              <DialogDescription className="text-center">
                We&apos;ve sent a recovery link to <strong>{email}</strong>.
                The link is valid for 7 days.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Form State
          <>
            <DialogHeader>
              <DialogTitle>Save Your Results</DialogTitle>
              <DialogDescription>
                Enter your email and we&apos;ll send you a link to recover your
                diagnostic progress from any device.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="save-email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="save-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={saveState === 'loading'}
                      className="pl-10"
                      aria-invalid={!!errorMessage}
                      required
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errorMessage}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Your results will be saved for 7 days. Create an account to
                  save them permanently.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={saveState === 'loading'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveState === 'loading' || !email}
                >
                  {saveState === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Recovery Link'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
