/**
 * WelcomeSection Component
 *
 * Displays a personalized welcome message with time-based greeting
 * and optional last login information.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 2: Create welcome section component (AC: 1)
 * Covers: FR64 (Welcome message with user's name/email)
 */

'use client';

import { useMemo } from 'react';

interface WelcomeSectionProps {
  user: {
    email?: string | null;
    name?: string | null;
  };
  lastLogin?: Date | null;
}

/**
 * Get time-based greeting based on current hour
 */
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

/**
 * Format date to readable string
 */
function formatLastLogin(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function WelcomeSection({ user, lastLogin }: WelcomeSectionProps) {
  const displayName = user.name || user.email || 'User';
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <section
      aria-label="Welcome section"
      role="region"
      className="mb-8"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
        {greeting}, {displayName}
      </h1>

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
        {user.name && user.email && (
          <p className="text-sm">{user.email}</p>
        )}

        {lastLogin && (
          <p className="text-sm">
            <span className="hidden sm:inline">•</span>{' '}
            Last login: {formatLastLogin(lastLogin)}
          </p>
        )}
      </div>

      <p className="mt-4 text-muted-foreground">
        Welcome to your dashboard. Track your diagnostic progress, view results, and access your toolkit.
      </p>
    </section>
  );
}
