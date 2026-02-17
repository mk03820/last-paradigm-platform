/**
 * DashboardNav Component
 *
 * Dashboard navigation with conditional links based on purchase status
 * and active state highlighting.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 4: Create dashboard navigation component (AC: 1, 4, 5)
 * Covers: FR64 (Navigation to Results, Downloads, Account Settings)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
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
} from '@/components/ui/alert-dialog';
import {
  LayoutDashboard,
  BarChart3,
  Download,
  Settings,
  LogOut,
} from 'lucide-react';

type PurchaseStatus = 'none' | 'pending' | 'completed' | 'refunded';
type ActiveSection = 'overview' | 'results' | 'downloads' | 'settings';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section: ActiveSection;
  requiresPurchase?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'overview',
  },
  {
    label: 'Diagnostic Results',
    href: '/dashboard/results',
    icon: BarChart3,
    section: 'results',
  },
  {
    label: 'Downloads',
    href: '/dashboard/downloads',
    icon: Download,
    section: 'downloads',
    requiresPurchase: true,
  },
  {
    label: 'Account Settings',
    href: '/dashboard/settings',
    icon: Settings,
    section: 'settings',
  },
];

interface DashboardNavProps {
  purchaseStatus: PurchaseStatus;
  activeSection: ActiveSection;
  isMobile?: boolean;
}

export function DashboardNav({
  purchaseStatus,
  activeSection,
  isMobile = false,
}: DashboardNavProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const hasPurchased = purchaseStatus === 'completed';

  const visibleNavItems = navItems.filter(
    (item) => !item.requiresPurchase || hasPurchased
  );

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <nav
        aria-label="Dashboard navigation"
        className={cn(
          'flex flex-col gap-1',
          isMobile && 'min-h-[44px]' // Touch-friendly minimum height
        )}
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.section;

          return (
            <Link
              key={item.section}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'min-h-[44px]', // Touch target minimum
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogoutClick}
            className={cn(
              'w-full justify-start gap-3 text-muted-foreground hover:text-destructive',
              'min-h-[44px]' // Touch target minimum
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You&apos;ll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
