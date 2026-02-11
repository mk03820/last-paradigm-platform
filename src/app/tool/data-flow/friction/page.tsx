/**
 * Friction Point Identification Page
 *
 * Step 2 of Tool 5: Data Flow Friction Analysis.
 * Users document friction points along their data journeys.
 *
 * Story 12.2: Friction Point Identification
 * Covers: AC1-AC5 (friction CRUD, categories, severity, stage association)
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTool5Store } from '@/lib/store/tool5-store';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import {
  FrictionForm,
  FrictionList,
  StagePipeline,
} from '@/components/tools/data-flow';
import type { FrictionFormData } from '@/components/tools/data-flow/FrictionForm';
import type { FrictionPoint } from '@/components/tools/data-flow/friction-constants';

export default function FrictionPage() {
  const router = useRouter();
  const {
    journeys,
    frictionPoints,
    addFrictionPoint,
    updateFrictionPoint,
    removeFrictionPoint,
    getFrictionPointsByJourney,
  } = useTool5Store();

  // State
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    journeys[0]?.id || ''
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFriction, setEditingFriction] = useState<FrictionPoint | null>(
    null
  );
  const [deletingFriction, setDeletingFriction] = useState<FrictionPoint | null>(
    null
  );
  const [preselectedStageId, setPreselectedStageId] = useState<string | null>(
    null
  );

  // Get selected journey and its friction points
  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);
  const journeyFrictionPoints = useMemo(
    () => (selectedJourneyId ? getFrictionPointsByJourney(selectedJourneyId) : []),
    [selectedJourneyId, getFrictionPointsByJourney, frictionPoints]
  );

  // Get friction counts by stage for the pipeline
  const frictionCountsByStage = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fp of journeyFrictionPoints) {
      counts[fp.stageId] = (counts[fp.stageId] || 0) + 1;
    }
    return counts;
  }, [journeyFrictionPoints]);

  // Handlers
  const handleAddFriction = (stageId?: string) => {
    setEditingFriction(null);
    setPreselectedStageId(stageId || null);
    setIsFormOpen(true);
  };

  const handleEditFriction = (friction: FrictionPoint) => {
    setEditingFriction(friction);
    setPreselectedStageId(null);
    setIsFormOpen(true);
  };

  const handleDeleteFriction = (friction: FrictionPoint) => {
    setDeletingFriction(friction);
  };

  const handleConfirmDelete = () => {
    if (deletingFriction) {
      removeFrictionPoint(deletingFriction.id);
      setDeletingFriction(null);
    }
  };

  const handleFormSubmit = (data: FrictionFormData) => {
    if (editingFriction) {
      updateFrictionPoint(editingFriction.id, data);
    } else {
      addFrictionPoint({
        ...data,
        journeyId: selectedJourneyId,
      });
    }
    setIsFormOpen(false);
    setEditingFriction(null);
    setPreselectedStageId(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingFriction(null);
    setPreselectedStageId(null);
  };

  // Empty state - no journeys
  if (journeys.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProgressStepper currentToolId="data-flow" />

        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Before identifying friction points, you need to map at least one data
            journey. Go back and create a journey first.
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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <ProgressStepper currentToolId="data-flow" />

      <ToolGuidance toolId="data-flow" className="mt-6" />

      {/* Journey Selector */}
      <div className="mt-8 flex items-center gap-4">
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

      {/* Stage Pipeline with friction counts */}
      {selectedJourney && (
        <div className="mt-6">
          <StagePipeline
            stages={selectedJourney.stages}
            frictionCounts={frictionCountsByStage}
            onStageClick={(stageId) => handleAddFriction(stageId)}
            clickable
          />
        </div>
      )}

      {/* Friction Point List */}
      {selectedJourney && (
        <div className="mt-8">
          <FrictionList
            frictionPoints={journeyFrictionPoints}
            stages={selectedJourney.stages}
            onAdd={() => handleAddFriction()}
            onEdit={handleEditFriction}
            onDelete={handleDeleteFriction}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/tool/data-flow">Back to Journeys</Link>
        </Button>
        <Button asChild>
          <Link href="/tool/data-flow/costs">Continue to Cost Analysis</Link>
        </Button>
      </div>

      {/* Friction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFriction ? 'Edit Friction Point' : 'Add Friction Point'}
            </DialogTitle>
            <DialogDescription>
              {editingFriction
                ? 'Update the details of this friction point.'
                : 'Document a friction point where data flow is impeded.'}
            </DialogDescription>
          </DialogHeader>
          {selectedJourney && (
            <FrictionForm
              stages={selectedJourney.stages}
              initialData={
                editingFriction
                  ? {
                      category: editingFriction.category,
                      stageId: editingFriction.stageId,
                      description: editingFriction.description,
                      severity: editingFriction.severity,
                    }
                  : preselectedStageId
                  ? { stageId: preselectedStageId }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isEdit={!!editingFriction}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingFriction}
        onOpenChange={(open) => !open && setDeletingFriction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Friction Point?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this friction point. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
