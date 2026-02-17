/**
 * Admin Layout
 *
 * Protected layout for all admin pages with sidebar navigation.
 * Redirects to login if not authenticated.
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 5: Create admin dashboard layout (AC: 4, 6)
 * Covers: AC1 (admin login required), AC4 (dashboard layout)
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth/admin-auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check for admin token in cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  // If no token, redirect to login (except for login page)
  if (!token) {
    redirect('/admin/login');
  }

  // Verify token
  const adminSession = await verifyAdminToken(token);

  if (!adminSession) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <AdminSidebar
        adminName={adminSession.name}
        adminEmail={adminSession.email}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
