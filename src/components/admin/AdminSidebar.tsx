'use client';

/**
 * Admin Sidebar Navigation Component
 *
 * Desktop-first sidebar with navigation to all admin sections.
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 5: Create admin dashboard layout (AC: 4, 6)
 * Covers: AC4 (navigation to all sections), AC6 (desktop-first design)
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  RefreshCcw,
  Webhook,
  BarChart3,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation items for admin sidebar
 */
const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Invoice Requests',
    href: '/admin/invoices',
    icon: FileText,
  },
  {
    name: 'Refunds',
    href: '/admin/refunds',
    icon: RefreshCcw,
  },
  {
    name: 'Webhooks',
    href: '/admin/webhooks',
    icon: Webhook,
  },
  {
    name: 'Conversion Metrics',
    href: '/admin/metrics',
    icon: BarChart3,
  },
];

interface AdminSidebarProps {
  adminName?: string | null;
  adminEmail?: string;
}

export function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500">
            <ShieldCheck className="h-6 w-6 text-slate-900" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin Portal</h1>
            <p className="text-xs text-slate-400">Last Paradigm</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-amber-500 text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700">
        {(adminName || adminEmail) && (
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-white truncate">
              {adminName || 'Admin'}
            </p>
            <p className="text-xs text-slate-400 truncate">{adminEmail}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
