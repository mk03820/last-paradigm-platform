/**
 * FrictionForm Component
 *
 * Form for creating and editing friction points in a data journey.
 * Allows selecting category, stage, description, and severity scores.
 *
 * Story 12.2: Friction Point Identification
 * Covers: AC1 (categories), AC2 (description), AC3 (severity), AC5 (stage association)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DataStage } from './journey-constants';
import type {
  FrictionCategory,
  SeverityScore,
  SeverityLevel,
  FrictionPoint,
} from './friction-constants';
import {
  FRICTION_CATEGORIES,
  SEVERITY_DIMENSIONS,
  SEVERITY_LEVELS,
  calculateTotalSeverity,
  getSeverityConfig,
  createDefaultSeverity,
  getFrictionCategoryInfo,
} from './friction-constants';

export interface FrictionFormData {
  category: FrictionCategory;
  stageId: string;
  description: string;
  severity: SeverityScore;
}

export interface FrictionFormProps {
  stages: DataStage[];
  initialData?: Partial<FrictionFormData>;
  onSubmit: (data: FrictionFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
  className?: string;
}

export function FrictionForm({
  stages,
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  className,
}: FrictionFormProps) {
  const [category, setCategory] = useState<FrictionCategory | ''>(
    initialData?.category || ''
  );
  const [stageId, setStageId] = useState(initialData?.stageId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [severity, setSeverity] = useState<SeverityScore>(
    initialData?.severity || createDefaultSeverity()
  );

  const [errors, setErrors] = useState<{
    category?: string;
    stageId?: string;
    description?: string;
  }>({});

  // Get selected category info for showing examples
  const selectedCategoryInfo = category
    ? getFrictionCategoryInfo(category)
    : null;

  // Calculate total severity
  const totalSeverity = calculateTotalSeverity(severity);
  const severityConfig = getSeverityConfig(totalSeverity);

  // Clear errors when values change
  useEffect(() => {
    if (category && errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  }, [category, errors.category]);

  useEffect(() => {
    if (stageId && errors.stageId) {
      setErrors((prev) => ({ ...prev, stageId: undefined }));
    }
  }, [stageId, errors.stageId]);

  useEffect(() => {
    if (description.trim() && errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  }, [description, errors.description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!category) {
      newErrors.category = 'Category is required';
    }
    if (!stageId) {
      newErrors.stageId = 'Stage is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      category: category as FrictionCategory,
      stageId,
      description: description.trim(),
      severity,
    });
  };

  const handleSeverityChange = (
    dimension: keyof SeverityScore,
    value: string
  ) => {
    const level = parseInt(value, 10) as SeverityLevel;
    setSeverity((prev) => ({ ...prev, [dimension]: level }));
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Category Selector */}
      <div className="space-y-2">
        <Label htmlFor="friction-category">Friction Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as FrictionCategory)}
        >
          <SelectTrigger id="friction-category" className="w-full">
            <SelectValue placeholder="Select a friction category" />
          </SelectTrigger>
          <SelectContent>
            {FRICTION_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className={cn('inline-block h-2 w-2 rounded-full', cat.bgColor)}
                  />
                  {cat.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}

        {/* Category description and examples */}
        {selectedCategoryInfo && (
          <div
            className={cn(
              'rounded-md border p-3 text-sm',
              selectedCategoryInfo.bgColor,
              selectedCategoryInfo.borderColor
            )}
          >
            <p className={cn('font-medium', selectedCategoryInfo.color)}>
              {selectedCategoryInfo.description}
            </p>
            <p className="mt-2 text-muted-foreground">Examples:</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {selectedCategoryInfo.examples.map((example, idx) => (
                <li key={idx}>{example}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Stage Selector */}
      <div className="space-y-2">
        <Label htmlFor="friction-stage">Associated Stage</Label>
        <Select value={stageId} onValueChange={setStageId}>
          <SelectTrigger id="friction-stage" className="w-full">
            <SelectValue placeholder="Select a stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.systemName || `${stage.type} stage`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.stageId && (
          <p className="text-sm text-destructive">{errors.stageId}</p>
        )}
        {stages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No stages available. Add stages to the journey first.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="friction-description">Description</Label>
        <textarea
          id="friction-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            selectedCategoryInfo
              ? `Describe the specific ${selectedCategoryInfo.label.toLowerCase()} issue...`
              : 'Describe the friction point...'
          }
          rows={3}
          className={cn(
            'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none'
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Severity Scoring */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Severity Scoring</Label>
          <div
            className={cn(
              'rounded-md px-2 py-1 text-sm font-medium',
              severityConfig.bgColor,
              severityConfig.color
            )}
          >
            Total: {totalSeverity} ({severityConfig.label})
          </div>
        </div>

        <div className="space-y-4">
          {(
            Object.entries(SEVERITY_DIMENSIONS) as [
              keyof SeverityScore,
              (typeof SEVERITY_DIMENSIONS)[keyof SeverityScore],
            ][]
          ).map(([dimension, info]) => (
            <div key={dimension} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`severity-${dimension}`} className="text-sm">
                  {info.label}
                </Label>
                <span className="text-sm text-muted-foreground">
                  {SEVERITY_LEVELS[severity[dimension]].label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{info.question}</p>
              <div className="flex gap-2">
                {([1, 2, 3] as SeverityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      handleSeverityChange(dimension, level.toString())
                    }
                    className={cn(
                      'flex-1 rounded-md border px-3 py-2 text-sm transition-colors',
                      severity[dimension] === level
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background hover:bg-accent'
                    )}
                  >
                    {level} - {SEVERITY_LEVELS[level].label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Save Changes' : 'Add Friction Point'}
        </Button>
      </div>
    </form>
  );
}
