'use client';

/**
 * User Menu Component
 *
 * Dropdown menu for authenticated users showing their email/avatar
 * with links to Dashboard and Sign Out.
 *
 * Story 8.4: AC2 (Show email/avatar and Sign Out for authenticated users)
 */

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  user: {
    email?: string | null;
    name?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const email = user.email || '';
  const initials = email ? email.charAt(0).toUpperCase() : '?';

  function handleSignOut() {
    signOut({ callbackUrl: '/' });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label="User menu"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block max-w-[150px] truncate text-sm">
            {email}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
