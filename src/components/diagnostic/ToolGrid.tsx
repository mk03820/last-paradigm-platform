/**
 * ToolGrid Component
 *
 * Displays all 7 diagnostic tools in a responsive grid.
 *
 * Story 8.5: Diagnostic Tool Hub
 * Covers: AC1 (all tools), AC7 (responsive layout)
 */

'use client';

import { useState } from 'react';
import { ToolCard } from './ToolCard';
import { useToolsWithStatus } from './useToolStatus';
import { useToolAccess } from './useToolAccess';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface ToolGridProps {
  className?: string;
}

export function ToolGrid({ className }: ToolGridProps) {
  const tools = useToolsWithStatus();
  const { checkAccess, isLoading } = useToolAccess();
  const pathname = usePathname();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedToolName, setSelectedToolName] = useState('');

  const handleDisabledClick = (toolName: string) => {
    setSelectedToolName(toolName);
    setShowAuthDialog(true);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-lg border bg-muted/50 animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className || ''}`}
        role="list"
        aria-label="Diagnostic tools"
      >
        {tools.map((tool) => {
          const access = checkAccess(tool);
          return (
            <div key={tool.id} role="listitem">
              <ToolCard
                tool={tool}
                status={tool.status}
                resultSummary={tool.resultSummary}
                disabled={!access.canAccess}
                onDisabledClick={() => handleDisabledClick(tool.name)}
              />
            </div>
          );
        })}
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Progress</DialogTitle>
            <DialogDescription>
              Sign in to access <strong>{selectedToolName}</strong> and save your diagnostic
              progress across sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Creating an account lets you:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Access all 7 diagnostic tools</li>
              <li>Save progress and continue later</li>
              <li>View results across devices</li>
              <li>Export complete diagnostic reports</li>
            </ul>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Continue Anonymously
            </Button>
            <Button asChild>
              <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}>
                Sign In
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
