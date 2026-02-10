'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper } from '@/components/diagnostic';
import { StakeholderInput } from '@/components/tools/stakeholder-map';

/**
 * Tool 4: Stakeholder Power/Interest Mapping Page
 *
 * Allows users to add stakeholders with power and interest levels
 * for mapping on a 2x2 matrix.
 *
 * Story 11.1: Stakeholder Input Interface
 * Story 8.6: Progress Stepper Navigation
 * Covers: FR2-16 (Add stakeholders with power and interest scores), FR2-38 (Progress stepper)
 */
export default function StakeholderMapPage() {
  const router = useRouter();

  const handleProceed = () => {
    router.push('/tool/stakeholder-map/matrix');
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/diagnostic"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Diagnostic Hub
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="stakeholder-map" />
          </div>

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Stakeholder Power/Interest Mapping
            </h1>
            <p className="mt-2 text-muted-foreground">
              Map the stakeholders who can influence or are affected by your
              transformation initiative. Identify key players, potential blockers,
              and engagement priorities.
            </p>
          </header>

          {/* Instructions */}
          <div className="mb-8 rounded-lg border bg-muted/50 p-4">
            <h2 className="font-semibold mb-2">How to Map Stakeholders</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Power (1-10):</strong> Can they approve, veto, or control
                resources?
              </li>
              <li>
                <strong>Interest (1-10):</strong> How much does the outcome affect
                their work?
              </li>
              <li>
                <strong>Tip:</strong> Start with executives and work down to key
                implementers.
              </li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Add at least 3 stakeholders for meaningful analysis. You can add up
              to 50.
            </p>
          </div>

          {/* Stakeholder Input Component */}
          <StakeholderInput onProceed={handleProceed} />
        </div>
      </main>
    </>
  );
}
