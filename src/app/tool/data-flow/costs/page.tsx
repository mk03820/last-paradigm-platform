/**
 * Cost Analysis Page
 *
 * Step 3 of Tool 5: Data Flow Friction Analysis.
 * Users add cost estimates to friction points.
 *
 * Story 12.3: Friction Cost Calculation
 * Covers: AC1-AC5 (FTE cost, opportunity cost, totals, aggregation, methodology)
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTool5Store } from '@/lib/store/tool5-store';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import {
  CostForm,
  CostCard,
  CostSummary,
  StagePipeline,
} from '@/components/tools/data-flow';
import type { FrictionPointWithCost } from '@/components/tools/data-flow/cost-constants';
import type { CostFormData } from '@/components/tools/data-flow/CostForm';

export default function CostsPage() {
  const {
    journeys,
    frictionPoints,
    updateFrictionCost,
    getFrictionPointsByJourney,
  } = useTool5Store();

  // State
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    journeys[0]?.id || ''
  );
  const [editingFriction, setEditingFriction] = useState<FrictionPointWithCost | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Get selected journey and its friction points
  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);
  const journeyFrictionPoints = useMemo(
    () => (selectedJourneyId ? getFrictionPointsByJourney(selectedJourneyId) : []),
    [selectedJourneyId, getFrictionPointsByJourney, frictionPoints]
  );

  // Group friction points by stage
  const frictionByStage = useMemo(() => {
    const map = new Map<string, FrictionPointWithCost[]>();
    for (const fp of journeyFrictionPoints) {
      const existing = map.get(fp.stageId) || [];
      existing.push(fp);
      map.set(fp.stageId, existing);
    }
    return map;
  }, [journeyFrictionPoints]);

  // Get friction counts by stage for the pipeline
  const frictionCountsByStage = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fp of journeyFrictionPoints) {
      counts[fp.stageId] = (counts[fp.stageId] || 0) + 1;
    }
    return counts;
  }, [journeyFrictionPoints]);

  // Handlers
  const handleAddCost = (friction: FrictionPointWithCost) => {
    setEditingFriction(friction);
    setIsFormOpen(true);
  };

  const handleEditCost = (friction: FrictionPointWithCost) => {
    setEditingFriction(friction);
    setIsFormOpen(true);
  };

  const handleRemoveCost = (friction: FrictionPointWithCost) => {
    updateFrictionCost(friction.id, null);
  };

  const handleFormSubmit = (data: CostFormData) => {
    if (editingFriction) {
      updateFrictionCost(editingFriction.id, data);
    }
    setIsFormOpen(false);
    setEditingFriction(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingFriction(null);
  };

  // Empty state - no journeys
  if (journeys.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProgressStepper currentToolId="data-flow" />

        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Before calculating friction costs, you need to map journeys and
            identify friction points. Go back and complete those steps first.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/tool/data-flow">Map Data Journeys</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - no friction points
  if (frictionPoints.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProgressStepper currentToolId="data-flow" />

        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Before calculating friction costs, you need to identify friction
            points. Go back and document friction points on your journeys.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/tool/data-flow/friction">Identify Friction Points</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <ProgressStepper currentToolId="data-flow" />

      <ToolGuidance toolId="data-flow" className="mt-6" />

      {/* Page Header */}
      <header className="mt-8 mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Friction Cost Analysis
        </h1>
        <p className="mt-2 text-muted-foreground">
          Estimate the annual cost of each friction point to quantify the impact
          of data inefficiency on your organization.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Left: Friction points with cost forms */}
        <div className="space-y-6">
          {/* Journey Selector */}
          <div className="flex items-center gap-4">
            <label htmlFor="journey-select" className="text-sm font-medium">
              Journey:
            </label>
            <Select
              value={selectedJourneyId}
              onValueChange={setSelectedJourneyId}
            >
              <SelectTrigger id="journey-select" className="w-64">
                <SelectValue placeholder="Select a journey" />
              </SelectTrigger>
              <SelectContent>
                {journeys.map((journey) => (
                  <SelectItem key={journey.id} value={journey.id}>
                    {journey.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Pipeline */}
          {selectedJourney && (
            <StagePipeline
              stages={selectedJourney.stages}
              frictionCounts={frictionCountsByStage}
            />
          )}

          {/* Friction Points grouped by stage */}
          {selectedJourney && (
            <div className="space-y-6">
              {selectedJourney.stages.map((stage) => {
                const stageFriction = frictionByStage.get(stage.id) || [];
                if (stageFriction.length === 0) return null;

                return (
                  <div key={stage.id}>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                      {stage.systemName || stage.type} ({stageFriction.length} friction point{stageFriction.length !== 1 ? 's' : ''})
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {stageFriction.map((friction) => (
                        <CostCard
                          key={friction.id}
                          frictionPoint={friction}
                          stage={stage}
                          onAddCost={handleAddCost}
                          onEditCost={handleEditCost}
                          onRemoveCost={handleRemoveCost}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No friction points for selected journey */}
          {selectedJourney && journeyFrictionPoints.length === 0 && (
            <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
              <p className="text-muted-foreground">
                No friction points documented for this journey.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/tool/data-flow/friction">Add Friction Points</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Right: Cost Summary */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <CostSummary
            frictionPoints={frictionPoints}
            journeys={journeys}
            selectedJourneyId={selectedJourneyId}
          />
        </aside>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/tool/data-flow/friction">Back to Friction Points</Link>
        </Button>
        <Button asChild>
          <Link href="/tool/data-flow/results">View Results</Link>
        </Button>
      </div>

      {/* Cost Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFriction?.cost ? 'Edit Cost Estimate' : 'Add Cost Estimate'}
            </DialogTitle>
            <DialogDescription>
              Estimate the annual cost of this friction point.
            </DialogDescription>
          </DialogHeader>
          {editingFriction && (
            <>
              <div className="mb-4 rounded-md bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {editingFriction.description}
                </p>
              </div>
              <CostForm
                initialData={editingFriction.cost ?? undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isEdit={!!editingFriction.cost}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
