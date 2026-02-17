/**
 * RecalculateButton Component
 *
 * Provides option to run diagnostic again with confirmation dialog.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 6: Implement recalculation flow (AC: 6)
 * Covers: FR64 (Recalculation option)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function RecalculateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Run Diagnostic Again
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Run Diagnostic Again?</AlertDialogTitle>
          <AlertDialogDescription>
            Running the diagnostic again will update your saved results. Your current
            results will be replaced with the new assessment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This is useful if your organization has changed since your last assessment,
            or if you want to re-evaluate with updated data.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/diagnostic">Continue to Diagnostic</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
