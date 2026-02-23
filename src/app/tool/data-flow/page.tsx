'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  JourneyList,
  JourneyForm,
  Tool5SessionLoader,
  canProceedToFriction,
  STAGE_TYPES,
  generateStageId,
} from '@/components/tools/data-flow';
import { useTool5Store } from '@/lib/store/tool5-store';

/**
 * Tool 5: Data Flow Friction Analysis - Main Page
 *
 * Entry point for mapping data journeys before identifying friction points.
 *
 * Story 12.1: Data Journey Mapping Interface
 * C3-S6: Session persistence integration
 * Covers: FR2-21 (Map data journeys with friction points)
 */
export default function DataFlowPage() {
  const router = useRouter();
  const [showJourneyForm, setShowJourneyForm] = React.useState(false);

  const journeys = useTool5Store((state) => state.journeys);
  const addJourney = useTool5Store((state) => state.addJourney);
  const removeJourney = useTool5Store((state) => state.removeJourney);
  const applyTemplate = useTool5Store((state) => state.applyTemplate);

  const canProceed = canProceedToFriction(journeys);

  const handleCreateJourney = (data: { name: string; templateId?: string }) => {
    if (data.templateId) {
      // Apply template
      const journeyId = applyTemplate(data.templateId, data.name);
      if (journeyId) {
        setShowJourneyForm(false);
        router.push(`/tool/data-flow/${journeyId}`);
      }
    } else {
      // Create blank journey with default stages
      const defaultStages = STAGE_TYPES.map((type, index) => ({
        id: generateStageId(),
        type: type.id,
        systemName: '',
        owner: '',
        latency: 0,
        latencyUnit: 'hours' as const,
        order: index,
      }));

      const journeyId = addJourney({
        name: data.name,
        stages: defaultStages,
      });

      setShowJourneyForm(false);
      router.push(`/tool/data-flow/${journeyId}`);
    }
  };

  const handleQuickStart = (templateId: string) => {
    const journeyId = applyTemplate(templateId);
    if (journeyId) {
      router.push(`/tool/data-flow/${journeyId}`);
    }
  };

  const handleEditJourney = (journeyId: string) => {
    router.push(`/tool/data-flow/${journeyId}`);
  };

  const handleDeleteJourney = (journeyId: string) => {
    // TODO: Add confirmation dialog
    removeJourney(journeyId);
  };

  const handleContinue = () => {
    // Navigate to friction analysis (Story 12.2)
    router.push('/tool/data-flow/friction');
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
            <ProgressStepper currentToolId="data-flow" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="data-flow" className="mb-6" />

          {/* Session Loader for authenticated users */}
          <Suspense fallback={null}>
            <Tool5SessionLoader />
          </Suspense>

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Data Flow Friction Analysis
            </h1>
            <p className="mt-2 text-muted-foreground">
              Map how data flows through your organization to identify where it
              gets stuck, degraded, or duplicated. Document friction points to
              quantify the cost of data inefficiency.
            </p>
          </header>

          {/* Instructions */}
          <div className="mb-8 rounded-lg border bg-muted/50 p-4">
            <h2 className="font-semibold mb-2">How to Map Data Journeys</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Pick critical journeys:</strong> Focus on data that
                drives decisions or customer experience.
              </li>
              <li>
                <strong>Map the flow:</strong> Source → Extraction → Storage →
                Transformation → Consumption.
              </li>
              <li>
                <strong>Note latency:</strong> How long does each step take?
                Where are the delays?
              </li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Map 3-5 journeys for comprehensive analysis. You can add up to 10.
            </p>
          </div>

          {/* Journey List */}
          <JourneyList
            journeys={journeys}
            onAddJourney={() => setShowJourneyForm(true)}
            onEditJourney={handleEditJourney}
            onDeleteJourney={handleDeleteJourney}
            onQuickStart={handleQuickStart}
            className="mb-8"
          />

          {/* Continue Button */}
          {journeys.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={!canProceed}
                size="lg"
              >
                Continue to Friction Points
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Journey Dialog */}
      <Dialog open={showJourneyForm} onOpenChange={setShowJourneyForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Data Journey</DialogTitle>
          </DialogHeader>
          <JourneyForm
            onSubmit={handleCreateJourney}
            onCancel={() => setShowJourneyForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
