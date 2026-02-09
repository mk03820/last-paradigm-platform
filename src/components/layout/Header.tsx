'use client';

/**
 * Header Component
 *
 * Site header with authentication UI. Shows Sign In link for anonymous users
 * and UserMenu dropdown for authenticated users.
 *
 * Story 8.4: AC1 (Sign In link), AC2 (User menu for authenticated), AC5 (callbackUrl)
 */

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { LogIn } from 'lucide-react';

interface HeaderProps {
  /**
   * Whether to show the logo/brand name
   * @default true
   */
  showBrand?: boolean;
}

export function Header({ showBrand = true }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Build sign-in URL with callback to return to current page
  const callbackUrl = encodeURIComponent(pathname);
  const signInUrl = `/auth/signin?callbackUrl=${callbackUrl}`;

  return (
    <header
      className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        {showBrand ? (
          <Link
            href="/"
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            The Last Paradigm
          </Link>
        ) : (
          <div />
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            // Skeleton while loading
            <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          ) : session?.user ? (
            // Authenticated: Show user menu
            <UserMenu user={session.user} />
          ) : (
            // Anonymous: Show sign in link
            <Button variant="ghost" size="sm" asChild>
              <Link href={signInUrl}>
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
