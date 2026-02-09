'use client';

/**
 * Save Progress Prompt Component
 *
 * Shows a non-blocking prompt for anonymous users to save their progress.
 * Can be dismissed and won't show again for the session.
 *
 * Covers: FR2-5 (Anonymous users can still use Tool 2 without signing up)
 * Story 8.3: AC1 (Save Progress prompt), AC4 (Dismissible)
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Save, Sparkles } from 'lucide-react';

const DISMISSED_KEY = 'save-progress-dismissed';

export function SaveProgressPrompt() {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if previously dismissed this session
    const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true';
    setDismissed(wasDismissed);
  }, []);

  // Don't show if:
  // - Not mounted yet (SSR)
  // - User is authenticated
  // - User has dismissed the prompt
  // - Session is still loading
  if (!mounted || status === 'loading' || session?.user || dismissed) {
    return null;
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10 shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              Save your progress
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a free account to save your results and continue the full 7-tool diagnostic on any device.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/auth/signin?callbackUrl=/dashboard">
                  <Save className="w-4 h-4" />
                  Save Progress
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-muted-foreground"
              >
                Continue without saving
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mt-1 -mr-1"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
