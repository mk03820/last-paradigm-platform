/**
 * Dashboard Layout
 *
 * Provides the dashboard layout structure with sidebar navigation.
 * Fetches user data and purchase status for conditional rendering.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Story 19.2: Diagnostic Results Display
 * Task 1.2: Create `/app/dashboard/layout.tsx` with sidebar/header navigation
 * Covers: FR64 (Dashboard layout), NFR23 (<2s load), NFR24 (Mobile responsive)
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface DashboardLayoutRootProps {
  children: React.ReactNode;
}

type ActiveSection = 'overview' | 'results' | 'downloads' | 'settings';

/**
 * Determine active section from the URL path
 */
function getActiveSection(pathname: string): ActiveSection {
  if (pathname.includes('/dashboard/results')) {
    return 'results';
  }
  if (pathname.includes('/dashboard/downloads')) {
    return 'downloads';
  }
  if (pathname.includes('/dashboard/settings')) {
    return 'settings';
  }
  return 'overview';
}

export default async function DashboardLayoutRoot({
  children,
}: DashboardLayoutRootProps) {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  // Get the current URL path from headers
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/dashboard';
  const activeSection = getActiveSection(pathname);

  // Fetch user data for purchase status
  const user = await db
    .select({
      purchaseStatus: users.purchaseStatus,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const userData = user[0];
  const purchaseStatus = (userData?.purchaseStatus as 'none' | 'pending' | 'completed' | 'refunded') || 'none';

  return (
    <DashboardLayout
      purchaseStatus={purchaseStatus}
      activeSection={activeSection}
      userEmail={userData?.email || session.user.email}
    >
      {children}
    </DashboardLayout>
  );
}
