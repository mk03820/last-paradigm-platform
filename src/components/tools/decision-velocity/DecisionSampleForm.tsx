'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateSampleDates, type DecisionSample } from './constants';

/**
 * DecisionSampleForm Component
 *
 * Form for entering a single decision sample with dates.
 *
 * Story 10.1: Decision Sample Input Interface
 * Covers: AC2, AC3 (sample entry with dates)
 */

export interface DecisionSampleFormProps {
  sample?: DecisionSample;
  onSave: (sample: Omit<DecisionSample, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

export function DecisionSampleForm({
  sample,
  onSave,
  onCancel,
  onDelete,
  isEditing = false,
}: DecisionSampleFormProps) {
  const [description, setDescription] = useState(sample?.description || '');
  const [requestDate, setRequestDate] = useState(sample?.requestDate || '');
  const [decisionDate, setDecisionDate] = useState(sample?.decisionDate || '');
  const [implementationDate, setImplementationDate] = useState(
    sample?.implementationDate || ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate description
      if (!description.trim()) {
        setError('Description is required');
        return;
      }
      if (description.trim().length < 5) {
        setError('Description must be at least 5 characters');
        return;
      }
      if (description.trim().length > 200) {
        setError('Description must be less than 200 characters');
        return;
      }

      // Validate dates
      const dateError = validateSampleDates({
        requestDate,
        decisionDate,
        implementationDate: implementationDate || undefined,
      });
      if (dateError) {
        setError(dateError);
        return;
      }

      setError(null);
      onSave({
        description: description.trim(),
        requestDate,
        decisionDate,
        implementationDate: implementationDate || undefined,
      });
    },
    [description, requestDate, decisionDate, implementationDate, onSave]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Decision Description <span className="text-destructive">*</span>
        </label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Approved new CRM platform selection"
          maxLength={200}
          aria-describedby="description-hint"
        />
        <p id="description-hint" className="text-xs text-muted-foreground">
          Brief description of the decision ({description.length}/200)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="requestDate" className="text-sm font-medium">
            Request Date <span className="text-destructive">*</span>
          </label>
          <Input
            id="requestDate"
            type="date"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            aria-describedby="requestDate-hint"
          />
          <p id="requestDate-hint" className="text-xs text-muted-foreground">
            When was approval requested?
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="decisionDate" className="text-sm font-medium">
            Decision Date <span className="text-destructive">*</span>
          </label>
          <Input
            id="decisionDate"
            type="date"
            value={decisionDate}
            onChange={(e) => setDecisionDate(e.target.value)}
            min={requestDate}
            aria-describedby="decisionDate-hint"
          />
          <p id="decisionDate-hint" className="text-xs text-muted-foreground">
            When was approval granted?
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="implementationDate" className="text-sm font-medium">
            Implementation Date
          </label>
          <Input
            id="implementationDate"
            type="date"
            value={implementationDate}
            onChange={(e) => setImplementationDate(e.target.value)}
            min={decisionDate}
            aria-describedby="implementationDate-hint"
          />
          <p id="implementationDate-hint" className="text-xs text-muted-foreground">
            When did work begin? (optional)
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {isEditing && onDelete && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update' : 'Add Decision'}
        </Button>
      </div>
    </form>
  );
}
