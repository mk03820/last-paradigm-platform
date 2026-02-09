'use client';

/**
 * Session Card Component
 *
 * Displays a diagnostic session summary with progress and actions.
 * Covers: AC1, AC2 (Display sessions with metadata)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Trash2, CheckCircle } from 'lucide-react';
import type { SessionSummary } from '@/types/session.types';

interface SessionCardProps {
  session: SessionSummary;
  onContinue: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function SessionCard({ session, onContinue, onDelete }: SessionCardProps) {
  const isCompleted = session.status === 'completed';

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {session.name || 'Untitled Session'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Created {formatDate(session.createdAt)}
              </span>
            </div>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{session.toolsCompleted} of 7 tools</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${session.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Last activity */}
        {session.lastToolCompleted && (
          <p className="text-sm text-muted-foreground">
            Last completed: <span className="text-foreground">{session.lastToolCompleted}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(session.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <Button
            onClick={() => onContinue(session.id)}
            className="gap-1"
          >
            {isCompleted ? 'View Results' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const sessionDate = new Date(date);
  const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return sessionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: sessionDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}
