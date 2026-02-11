/**
 * JourneyForm Component
 *
 * Form for creating or editing a data journey.
 * Supports selecting from templates or starting blank.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC1 (journey name), AC5 (templates)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
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
import { JOURNEY_TEMPLATES, STAGE_TYPES } from './journey-constants';
import type { StageType } from './journey-constants';

export interface JourneyFormProps {
  /** Initial journey name (for editing) */
  initialName?: string;
  /** Initial template ID (for editing) */
  initialTemplateId?: string;
  /** Callback when form is submitted */
  onSubmit: (data: { name: string; templateId?: string }) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Whether this is an edit (vs create) */
  isEdit?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const JourneyForm = React.memo(function JourneyForm({
  initialName = '',
  initialTemplateId,
  onSubmit,
  onCancel,
  isEdit = false,
  className,
}: JourneyFormProps) {
  const [name, setName] = React.useState(initialName);
  const [templateId, setTemplateId] = React.useState<string | undefined>(
    initialTemplateId
  );
  const [nameError, setNameError] = React.useState<string>();

  const selectedTemplate = React.useMemo(
    () => JOURNEY_TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Journey name is required');
      return;
    }

    setNameError(undefined);
    onSubmit({ name: name.trim(), templateId });
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError && value.trim()) {
      setNameError(undefined);
    }
  };

  const handleTemplateChange = (value: string) => {
    if (value === 'blank') {
      setTemplateId(undefined);
      if (!name) {
        setName('');
      }
    } else {
      setTemplateId(value);
      // Pre-fill name from template if empty
      const template = JOURNEY_TEMPLATES.find((t) => t.id === value);
      if (template && !name) {
        setName(template.name);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Journey Name */}
      <div className="space-y-2">
        <Label htmlFor="journey-name">Journey Name</Label>
        <Input
          id="journey-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., Customer 360 for Sales"
          aria-describedby={nameError ? 'name-error' : undefined}
          aria-invalid={!!nameError}
          autoFocus
        />
        {nameError && (
          <p id="name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        )}
      </div>

      {/* Template Selector (only for create) */}
      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="journey-template">Start From Template</Label>
          <Select
            value={templateId || 'blank'}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger id="journey-template">
              <SelectValue placeholder="Choose a template or start blank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blank">Start from scratch</SelectItem>
              {JOURNEY_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-sm text-muted-foreground">
              {selectedTemplate.description}
            </p>
          )}
        </div>
      )}

      {/* Template Preview */}
      {selectedTemplate && !isEdit && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Template includes {selectedTemplate.stages.length} stages:
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedTemplate.stages.map((stage, index) => {
              const typeInfo = STAGE_TYPES.find((t) => t.id === stage.type);
              return (
                <span
                  key={index}
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    typeInfo?.bgColor,
                    typeInfo?.color
                  )}
                >
                  {typeInfo?.shortLabel}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Save Changes' : 'Create Journey'}</Button>
      </div>
    </form>
  );
});
