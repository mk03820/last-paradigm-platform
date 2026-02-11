'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Check, X, Clock } from 'lucide-react';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StageEditor,
  StagePipeline,
  STAGE_TYPES,
  calculateTotalLatency,
  formatLatency,
  generateStageId,
  MIN_STAGES,
} from '@/components/tools/data-flow';
import type { StageType, DataStage } from '@/components/tools/data-flow';
import { useTool5Store } from '@/lib/store/tool5-store';

/**
 * Journey Editor Page
 *
 * Edit a data journey's name and stages.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC1 (journey name), AC2 (stages), AC3 (stage details)
 */
export default function JourneyEditorPage() {
  const router = useRouter();
  const params = useParams();
  const journeyId = params.journeyId as string;

  // Store state
  const journey = useTool5Store((state) =>
    state.journeys.find((j) => j.id === journeyId)
  );
  const updateJourney = useTool5Store((state) => state.updateJourney);
  const addStage = useTool5Store((state) => state.addStage);
  const updateStage = useTool5Store((state) => state.updateStage);
  const removeStage = useTool5Store((state) => state.removeStage);

  // Local state for name editing
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(journey?.name || '');
  const [selectedStageId, setSelectedStageId] = React.useState<string | null>(
    null
  );
  const [addingStageType, setAddingStageType] = React.useState<StageType | null>(
    null
  );

  // Redirect if journey not found
  React.useEffect(() => {
    if (!journey) {
      router.replace('/tool/data-flow');
    }
  }, [journey, router]);

  if (!journey) {
    return null;
  }

  const totalLatencyHours = calculateTotalLatency(journey.stages);
  const sortedStages = [...journey.stages].sort((a, b) => a.order - b.order);
  const selectedStage = journey.stages.find((s) => s.id === selectedStageId);
  const canRemoveStages = journey.stages.length > MIN_STAGES;

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== journey.name) {
      updateJourney(journeyId, { name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleCancelNameEdit = () => {
    setEditedName(journey.name);
    setIsEditingName(false);
  };

  const handleAddStage = () => {
    if (!addingStageType) return;

    const newOrder = journey.stages.length;
    const stageId = addStage(journeyId, {
      type: addingStageType,
      systemName: '',
      owner: '',
      latency: 0,
      latencyUnit: 'hours',
      order: newOrder,
    });

    setSelectedStageId(stageId);
    setAddingStageType(null);
  };

  const handleStageUpdate = (
    stageId: string,
    updates: Partial<Omit<DataStage, 'id'>>
  ) => {
    updateStage(journeyId, stageId, updates);
  };

  const handleStageRemove = (stageId: string) => {
    removeStage(journeyId, stageId);
    if (selectedStageId === stageId) {
      setSelectedStageId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/data-flow"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Journeys
            </Link>
          </nav>

          {/* Journey Name */}
          <header className="mb-8">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold h-auto py-1 px-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelNameEdit();
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveName}
                  aria-label="Save name"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelNameEdit}
                  aria-label="Cancel"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-2xl font-bold tracking-tight sm:text-3xl hover:text-primary transition-colors text-left"
                aria-label="Click to edit journey name"
              >
                {journey.name}
              </button>
            )}
            {journey.description && (
              <p className="mt-2 text-muted-foreground">{journey.description}</p>
            )}
          </header>

          {/* Stage Pipeline Visualization */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Data Flow Pipeline</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Total latency: {formatLatency(totalLatencyHours)}</span>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <StagePipeline
                stages={journey.stages}
                onStageClick={(id) => setSelectedStageId(id)}
                selectedStageId={selectedStageId || undefined}
              />
            </div>
          </div>

          {/* Add Stage */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <Select
                value={addingStageType || ''}
                onValueChange={(v) => setAddingStageType(v as StageType)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add stage type..." />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddStage}
                disabled={!addingStageType}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
            </div>
          </div>

          {/* Stage Editors */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold">Configure Stages</h2>
            <p className="text-sm text-muted-foreground">
              Click a stage in the pipeline above to edit, or configure each
              stage below.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {sortedStages.map((stage) => (
                <StageEditor
                  key={stage.id}
                  stage={stage}
                  onUpdate={(updates) => handleStageUpdate(stage.id, updates)}
                  onRemove={() => handleStageRemove(stage.id)}
                  removeDisabled={!canRemoveStages}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Link href="/tool/data-flow">
              <Button variant="outline">
                <span aria-hidden="true" className="mr-2">
                  &larr;
                </span>
                Back to Journeys
              </Button>
            </Link>
            <Button onClick={() => router.push('/tool/data-flow')}>
              Save and Continue
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
