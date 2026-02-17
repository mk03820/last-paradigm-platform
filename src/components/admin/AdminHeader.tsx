'use client';

/**
 * Admin Header Component
 *
 * Top header bar for admin pages with page title and actions.
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 5: Create admin dashboard layout (AC: 4, 6)
 * Covers: AC4 (dashboard layout), AC6 (desktop-first design)
 */

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
}

export function AdminHeader({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  actions,
}: AdminHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          )}
          {actions}
        </div>
      </div>
    </header>
  );
}
