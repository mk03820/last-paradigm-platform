/**
 * PurchaseStatusSection Component
 *
 * Displays the user's purchase status and toolkit access on the dashboard.
 * Handles all purchase states: none, pending, purchased, refunded.
 *
 * Story 19.3: Purchase Status & Toolkit Access
 * Task 1: Create PurchaseStatusSection component (AC: 1, 2, 3, 4)
 *
 * Covers: FR64 (Account dashboard), FR54 (Analytics tracking)
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Download,
  Loader2,
  Shield,
  FileText,
  Mail,
} from 'lucide-react';
import { analytics } from '@/lib/analytics/service';
import type { ToolkitStatus } from '@/lib/services/toolkit-status';

/**
 * Purchase status type matching the database enum
 */
type PurchaseStatus = 'none' | 'pending' | 'completed' | 'refunded';

/**
 * Diagnostic summary from PB1 results
 */
interface DiagnosticSummary {
  totalAlignmentTax: number | null;
  estimatedSavings: number | null;
  completedTools: number;
}

/**
 * Props for PurchaseStatusSection
 */
interface PurchaseStatusSectionProps {
  purchaseStatus: PurchaseStatus;
  purchasedAt: Date | null;
  hasPb2Access: boolean;
  invoiceRequestedAt: Date | null;
  diagnosticSummary: DiagnosticSummary | null;
  toolkitStatus: ToolkitStatus | null;
}

/**
 * Format currency with proper separators
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date to user's locale
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Track analytics event for preview CTA click
 */
async function trackPreviewClick(
  purchaseStatus: PurchaseStatus,
  hasCompletedDiagnostic: boolean
): Promise<void> {
  await analytics.track({
    name: 'preview_cta_clicked',
    properties: {
      source: 'dashboard_purchase_section',
      purchaseStatus,
      hasCompletedDiagnostic,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track analytics event for toolkit access
 */
async function trackToolkitAccess(): Promise<void> {
  await analytics.track({
    name: 'toolkit_accessed',
    properties: {
      source: 'dashboard',
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Not Purchased State Component (AC1)
 */
function NotPurchasedState({
  diagnosticSummary,
  purchaseStatus,
}: {
  diagnosticSummary: DiagnosticSummary | null;
  purchaseStatus: PurchaseStatus;
}) {
  const hasCompletedDiagnostic = diagnosticSummary?.completedTools === 7;
  const estimatedSavings = diagnosticSummary?.estimatedSavings;

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-slate-50 to-amber-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          Unlock Playbook 2
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value proposition */}
        <div className="space-y-2">
          {estimatedSavings && estimatedSavings > 0 ? (
            <p className="text-slate-700">
              Based on your diagnostic, you could save{' '}
              <span className="font-bold text-green-600">
                {formatCurrency(estimatedSavings)}
              </span>{' '}
              annually with our toolkit.
            </p>
          ) : (
            <p className="text-slate-700">
              Get 10 enterprise-grade documents to transform your organization and reduce your alignment tax.
            </p>
          )}
        </div>

        {/* Trust signals */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>30-day money-back guarantee</span>
        </div>

        {/* CTA Button */}
        <Link
          href="/preview"
          onClick={() => trackPreviewClick(purchaseStatus, hasCompletedDiagnostic)}
          className="inline-flex items-center justify-center w-full sm:w-auto min-h-11 px-6 py-3 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Unlock Playbook 2
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Purchased State Component (AC2)
 */
function PurchasedState({
  purchasedAt,
  toolkitStatus,
}: {
  purchasedAt: Date | null;
  toolkitStatus: ToolkitStatus | null;
}) {
  const isPortalAvailable = toolkitStatus?.available ?? false;
  const documentsReady = toolkitStatus?.documentsReady ?? 0;
  const isGenerating = toolkitStatus?.isGenerating ?? false;
  const totalDocuments = toolkitStatus?.totalDocuments ?? 10;

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-slate-50 purchased-state success-styling green-accent">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Your Toolkit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Purchase confirmation */}
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Access Active</span>
        </div>

        {/* Purchase date */}
        {purchasedAt && (
          <p className="text-sm text-slate-600">
            Purchased on {formatDate(purchasedAt)}
          </p>
        )}

        {/* Document count */}
        <p className="text-sm text-slate-700">
          <span className="font-semibold">{totalDocuments} documents</span> in your toolkit
        </p>

        {/* Portal availability check */}
        {isPortalAvailable ? (
          <Link
            href="/dashboard/downloads"
            onClick={trackToolkitAccess}
            className="inline-flex items-center justify-center w-full sm:w-auto min-h-11 px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Access Downloads
          </Link>
        ) : (
          <DownloadPortalFallback
            documentsReady={documentsReady}
            totalDocuments={totalDocuments}
            isGenerating={isGenerating}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Download Portal Fallback Component (AC6)
 *
 * Shown when Story 18.5 (Download Portal) is not yet available
 * or documents are still being generated.
 */
function DownloadPortalFallback({
  documentsReady,
  totalDocuments,
  isGenerating,
}: {
  documentsReady: number;
  totalDocuments: number;
  isGenerating: boolean;
}) {
  const progressPercent = Math.round((documentsReady / totalDocuments) * 100);

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
      <div className="flex items-center gap-2 text-amber-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-medium">Your toolkit is being prepared...</span>
      </div>

      {documentsReady > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-amber-700">
            {documentsReady} of {totalDocuments} documents ready
          </p>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {isGenerating && (
        <p className="text-sm text-amber-600">
          Document generation in progress...
        </p>
      )}

      <p className="text-sm text-amber-600">
        You&apos;ll receive an email when your complete toolkit is available for download.
      </p>
    </div>
  );
}

/**
 * Pending Invoice State Component (AC3)
 */
function PendingInvoiceState({
  invoiceRequestedAt,
}: {
  invoiceRequestedAt: Date | null;
}) {
  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-slate-50 pending-state amber-styling warning-styling">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          Invoice Requested
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Request date */}
        {invoiceRequestedAt && (
          <p className="text-sm text-slate-600">
            Requested on {formatDate(invoiceRequestedAt)}
          </p>
        )}

        {/* Status message */}
        <div className="flex items-center gap-2 text-amber-700">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            Awaiting payment confirmation
          </span>
        </div>

        {/* Explanation */}
        <p className="text-sm text-slate-600">
          Your invoice has been submitted. Once payment is confirmed, you&apos;ll have access to your complete toolkit.
        </p>

        {/* Support contact */}
        <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 p-3 rounded-lg">
          <Mail className="h-4 w-4 text-slate-500" />
          <span>
            Questions?{' '}
            <a
              href="mailto:billing@thelastparadigm.com"
              className="text-amber-700 hover:text-amber-800 underline"
            >
              billing@thelastparadigm.com
            </a>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Refunded State Component (AC4)
 */
function RefundedState({
  purchaseStatus,
}: {
  purchaseStatus: PurchaseStatus;
}) {
  return (
    <Card className="border border-slate-200 bg-slate-50 refunded-state muted-styling gray-styling expired-styling">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-slate-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-slate-500" />
          Access Expired
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Explanation */}
        <p className="text-sm text-slate-600">
          Your purchase was refunded. You no longer have access to the Playbook 2 toolkit.
        </p>

        {/* Re-purchase CTA */}
        <Link
          href="/preview"
          onClick={() => trackPreviewClick(purchaseStatus, false)}
          className="inline-flex items-center justify-center w-full sm:w-auto min-h-11 px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Re-purchase Toolkit
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Access Expired State (hasPb2Access is false but purchaseStatus is completed)
 *
 * Edge case where the purchase shows as completed but access has been revoked.
 */
function AccessRevokedState() {
  return (
    <Card className="border border-slate-200 bg-slate-50 refunded-state muted-styling gray-styling expired-styling">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-slate-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-slate-500" />
          Access Expired
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Explanation */}
        <p className="text-sm text-slate-600">
          Your toolkit access has expired. Please contact support for assistance.
        </p>

        {/* Support contact */}
        <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 p-3 rounded-lg">
          <Mail className="h-4 w-4 text-slate-500" />
          <span>
            Contact support:{' '}
            <a
              href="mailto:support@thelastparadigm.com"
              className="text-slate-700 hover:text-slate-800 underline"
            >
              support@thelastparadigm.com
            </a>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main PurchaseStatusSection Component
 */
export function PurchaseStatusSection({
  purchaseStatus,
  purchasedAt,
  hasPb2Access,
  invoiceRequestedAt,
  diagnosticSummary,
  toolkitStatus,
}: PurchaseStatusSectionProps) {
  // Determine which state to render
  const renderState = () => {
    // Edge case: purchased but access revoked
    if (purchaseStatus === 'completed' && !hasPb2Access) {
      return <AccessRevokedState />;
    }

    switch (purchaseStatus) {
      case 'completed':
        return (
          <PurchasedState
            purchasedAt={purchasedAt}
            toolkitStatus={toolkitStatus}
          />
        );
      case 'pending':
        return <PendingInvoiceState invoiceRequestedAt={invoiceRequestedAt} />;
      case 'refunded':
        return <RefundedState purchaseStatus={purchaseStatus} />;
      default:
        return (
          <NotPurchasedState
            diagnosticSummary={diagnosticSummary}
            purchaseStatus={purchaseStatus}
          />
        );
    }
  };

  return (
    <section
      aria-label="Purchase status and toolkit access"
      role="region"
      className="mb-8"
    >
      <h2 className="text-lg font-semibold mb-4">Playbook 2 Toolkit</h2>
      {renderState()}
    </section>
  );
}
