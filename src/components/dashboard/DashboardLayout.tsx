/**
 * DashboardLayout Component
 *
 * Main dashboard layout with responsive sidebar navigation.
 * Uses Executive Clarity design tokens.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 1.3: Implement DashboardLayout component with responsive sidebar
 * Covers: FR64 (Dashboard layout), NFR24 (Mobile responsive)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { DashboardNav } from './DashboardNav';
import { Menu, X } from 'lucide-react';

type PurchaseStatus = 'none' | 'pending' | 'completed' | 'refunded';
type ActiveSection = 'overview' | 'results' | 'downloads' | 'settings';

interface DashboardLayoutProps {
  children: React.ReactNode;
  purchaseStatus: PurchaseStatus;
  activeSection: ActiveSection;
  userEmail?: string | null;
}

export function DashboardLayout({
  children,
  purchaseStatus,
  activeSection,
  userEmail,
}: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header
        role="banner"
        className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-14 items-center px-4 lg:px-6">
          {/* Mobile menu trigger */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="font-semibold text-primary">
                  The Last Paradigm
                </Link>
              </div>
              <div className="p-4">
                <DashboardNav
                  purchaseStatus={purchaseStatus}
                  activeSection={activeSection}
                  isMobile
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="hidden md:flex items-center gap-2 font-semibold text-primary hover:text-primary/90 transition-colors"
          >
            The Last Paradigm
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User info (mobile shows just initial, desktop shows email) */}
          {userEmail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline max-w-[200px] truncate">
                {userEmail}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-14"
          role="complementary"
          aria-label="Dashboard sidebar"
        >
          <div className="flex-1 flex flex-col min-h-0 border-r bg-sidebar">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="px-4">
                <DashboardNav
                  purchaseStatus={purchaseStatus}
                  activeSection={activeSection}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          id="main-content"
          role="main"
          className={cn(
            'flex-1 min-h-[calc(100vh-3.5rem)]',
            'md:ml-64' // Offset for sidebar on desktop
          )}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
