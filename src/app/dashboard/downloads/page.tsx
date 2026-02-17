/**
 * Download Portal Page
 *
 * Secure portal for downloading generated toolkit documents.
 *
 * Story 18.5: Download Portal Page
 * Task 1: Create download portal page route and layout
 * Covers: AC1 (page load), AC2 (secure access), AC3-6 (file display and download)
 *
 * Story 18.6: Generation Progress & Status UI
 * Covers: AC1-4 (progress display, status indicators, retry)
 *
 * Story 18.7: Post-Generation Success Experience
 * Covers: AC1-4 (success celebration, download all, guidance)
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUserDocuments } from '@/lib/services/download-service';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DownloadPortalClient } from './DownloadPortalClient';

export default async function DownloadPortalPage() {
  const session = await auth();

  // Redirect to sign-in if not authenticated (AC2)
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard/downloads');
  }

  // Check purchase status (AC2)
  const user = await db
    .select({
      purchaseStatus: users.purchaseStatus,
      hasPb2Access: users.hasPb2Access,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const userData = user[0];
  const hasPurchased = userData?.purchaseStatus === 'completed' || userData?.hasPb2Access;

  // Show access denied if not purchased
  if (!hasPurchased) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Toolkit Not Available
        </h1>
        <p className="text-slate-600 mb-6 text-center max-w-md">
          The download portal is only available after purchasing the Playbook 2
          toolkit. Complete your purchase to access your personalized documents.
        </p>
        <Button asChild>
          <Link href="/preview">View Toolkit Preview</Link>
        </Button>
      </div>
    );
  }

  // Fetch documents (server-side initial load)
  const documents = await getUserDocuments(session.user.id);

  // Pass to client component for interactivity
  return <DownloadPortalClient initialDocuments={documents} />;
}
