/**
 * Download Portal Page
 *
 * Secure portal for downloading generated toolkit documents.
 *
 * Story 18.5: Download Portal Page
 * Task 1: Create download portal page route and layout
 * Covers: AC1 (page load), AC2 (secure access), AC3-6 (file display and download)
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, toolkitDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  getUserDocuments,
  getDocumentCategory,
  type DocumentCategory as CategoryType,
} from '@/lib/services/download-service';
import { DocumentCategory, DownloadAllButton } from '@/components/downloads';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { DocumentCardProps } from '@/components/downloads/DocumentCard';

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

  // Fetch documents
  const documents = await getUserDocuments(session.user.id);

  // Calculate status summary
  const completedCount = documents.filter((d) => d.status === 'completed').length;
  const generatingCount = documents.filter((d) => d.status === 'generating').length;
  const failedCount = documents.filter((d) => d.status === 'failed').length;
  const totalCount = documents.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // Group documents by category (AC3)
  const categorizedDocs: Record<CategoryType, DocumentCardProps[]> = {
    strategic: [],
    tools: [],
    presentations: [],
  };

  documents.forEach((doc) => {
    const category = getDocumentCategory(doc.documentType);
    categorizedDocs[category].push({
      id: doc.id,
      documentName: doc.documentName,
      documentType: doc.documentType,
      status: doc.status,
      fileSizeBytes: doc.fileSizeBytes,
      errorMessage: doc.errorMessage,
    });
  });

  // Empty state when no documents exist
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-slate-400 animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Preparing Your Toolkit
        </h1>
        <p className="text-slate-600 mb-6 text-center max-w-md">
          Your documents are being generated. This typically takes 2-3 minutes.
          Refresh this page to check progress.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Your Playbook 2 Toolkit
        </h1>
        <p className="text-slate-600">
          Download your personalized documents customized with your diagnostic
          findings.
        </p>
      </div>

      {/* Status Summary */}
      <div className="bg-slate-50 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          {allCompleted ? (
            <>
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <span className="text-green-700 font-medium">
                All {totalCount} documents ready
              </span>
            </>
          ) : (
            <>
              {generatingCount > 0 && (
                <span className="flex items-center gap-2 text-amber-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {generatingCount} generating
                </span>
              )}
              <span className="text-slate-600">
                {completedCount} of {totalCount} ready
              </span>
              {failedCount > 0 && (
                <span className="text-red-600">{failedCount} failed</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Download All Button (AC6) */}
      {completedCount > 0 && (
        <div className="mb-8 flex justify-center">
          <DownloadAllButton
            completedCount={completedCount}
            totalCount={totalCount}
            isGenerating={generatingCount > 0}
            hasFailed={failedCount > 0}
          />
        </div>
      )}

      {/* Document Categories (AC3) */}
      <DocumentCategory category="strategic" documents={categorizedDocs.strategic} />
      <DocumentCategory category="tools" documents={categorizedDocs.tools} />
      <DocumentCategory category="presentations" documents={categorizedDocs.presentations} />

      {/* Attribution */}
      <div className="mt-8 pt-4 border-t text-center text-sm text-slate-500">
        <p>
          Documents generated using{' '}
          <span className="font-medium">The Last Paradigm</span> methodology
        </p>
        <p className="mt-1">
          <a
            href="https://thelastparadigm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            thelastparadigm.com
          </a>
        </p>
      </div>
    </div>
  );
}
