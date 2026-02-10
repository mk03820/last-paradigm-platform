'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DecisionSampleForm } from './DecisionSampleForm';
import type { DecisionSample } from './constants';

/**
 * DecisionSampleList Component
 *
 * Displays a list of decision samples with edit/delete capabilities.
 *
 * Story 10.1: Decision Sample Input Interface
 * Covers: AC2 (manage samples)
 */

export interface DecisionSampleListProps {
  samples: DecisionSample[];
  onUpdate: (sampleId: string, updates: Partial<DecisionSample>) => void;
  onDelete: (sampleId: string) => void;
  disabled?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function DecisionSampleList({
  samples,
  onUpdate,
  onDelete,
  disabled = false,
}: DecisionSampleListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (samples.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        No decisions added yet. Click &quot;Add Decision&quot; to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-2" role="list" aria-label="Decision samples">
      {samples.map((sample, index) => (
        <li key={sample.id}>
          {editingId === sample.id ? (
            <DecisionSampleForm
              sample={sample}
              isEditing
              onSave={(updates) => {
                onUpdate(sample.id, updates);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={() => {
                onDelete(sample.id);
                setEditingId(null);
              }}
            />
          ) : (
            <div
              className={`
                flex items-start justify-between gap-4 p-3 rounded-lg border bg-card
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <p className="text-sm font-medium truncate">
                    {sample.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <span>Requested: {formatDate(sample.requestDate)}</span>
                  <span>Decided: {formatDate(sample.decisionDate)}</span>
                  {sample.implementationDate && (
                    <span>Started: {formatDate(sample.implementationDate)}</span>
                  )}
                </div>
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="text-primary font-medium">
                    Decision: {calculateDays(sample.requestDate, sample.decisionDate)}d
                  </span>
                  {sample.implementationDate && (
                    <span className="text-muted-foreground">
                      To start: {calculateDays(sample.decisionDate, sample.implementationDate)}d
                    </span>
                  )}
                </div>
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(sample.id)}
                  aria-label={`Edit decision: ${sample.description}`}
                >
                  Edit
                </Button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
