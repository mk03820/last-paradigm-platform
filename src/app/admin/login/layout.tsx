/**
 * Admin Login Layout
 *
 * Standalone layout for login page that bypasses the protected admin layout.
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 4: Create admin login page (AC: 1)
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth/admin-auth';

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default async function LoginLayout({ children }: LoginLayoutProps) {
  // Check if already logged in
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token) {
    const adminSession = await verifyAdminToken(token);
    if (adminSession) {
      // Already logged in, redirect to dashboard
      redirect('/admin');
    }
  }

  // Not logged in, show login page
  return <>{children}</>;
}
