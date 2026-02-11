/**
 * StageEditor Component
 *
 * Editable card for a single data journey stage.
 * Captures system name, owner, and latency.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC2 (stage types), AC3 (stage details)
 */

'use client';

import * as React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
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
import type { DataStage, LatencyUnit } from './journey-constants';
import { getStageTypeInfo, SYSTEM_SUGGESTIONS } from './journey-constants';

export interface StageEditorProps {
  stage: DataStage;
  /** Callback when stage is updated */
  onUpdate: (updates: Partial<Omit<DataStage, 'id'>>) => void;
  /** Callback when stage is removed */
  onRemove: () => void;
  /** Whether to show drag handle (for reordering) */
  showDragHandle?: boolean;
  /** Whether remove is disabled (e.g., minimum stages) */
  removeDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const StageEditor = React.memo(function StageEditor({
  stage,
  onUpdate,
  onRemove,
  showDragHandle = false,
  removeDisabled = false,
  className,
}: StageEditorProps) {
  const typeInfo = getStageTypeInfo(stage.type);
  const suggestions = SYSTEM_SUGGESTIONS[stage.type];
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter suggestions based on current input
  const filteredSuggestions = React.useMemo(() => {
    if (!stage.systemName) return suggestions.slice(0, 5);
    const lower = stage.systemName.toLowerCase();
    return suggestions
      .filter((s) => s.toLowerCase().includes(lower))
      .slice(0, 5);
  }, [stage.systemName, suggestions]);

  const handleSystemNameChange = (value: string) => {
    onUpdate({ systemName: value });
  };

  const handleSuggestionClick = (suggestion: string) => {
    onUpdate({ systemName: suggestion });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleLatencyChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onUpdate({ latency: num });
    } else if (value === '') {
      onUpdate({ latency: 0 });
    }
  };

  const handleLatencyUnitChange = (unit: LatencyUnit) => {
    onUpdate({ latencyUnit: unit });
  };

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4',
        typeInfo.bgColor,
        typeInfo.borderColor,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {showDragHandle && (
            <GripVertical
              className="h-4 w-4 text-muted-foreground cursor-grab"
              aria-hidden="true"
            />
          )}
          <span className={cn('text-sm font-semibold', typeInfo.color)}>
            {typeInfo.label}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={removeDisabled}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${typeInfo.label} stage`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Stage Type Description */}
      <p className="text-xs text-muted-foreground mb-3">{typeInfo.description}</p>

      {/* System Name Input with Autocomplete */}
      <div className="space-y-1.5 mb-3 relative">
        <Label htmlFor={`system-${stage.id}`} className="text-xs">
          System Name
        </Label>
        <Input
          ref={inputRef}
          id={`system-${stage.id}`}
          value={stage.systemName}
          onChange={(e) => handleSystemNameChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder="Enter system name..."
          className="h-9"
          aria-describedby={`system-${stage.id}-suggestions`}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul
            id={`system-${stage.id}-suggestions`}
            className="absolute z-10 w-full bg-popover border rounded-md shadow-md mt-1 py-1"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="option"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Owner Input */}
      <div className="space-y-1.5 mb-3">
        <Label htmlFor={`owner-${stage.id}`} className="text-xs">
          Owner (optional)
        </Label>
        <Input
          id={`owner-${stage.id}`}
          value={stage.owner}
          onChange={(e) => onUpdate({ owner: e.target.value })}
          placeholder="Team or person..."
          className="h-9"
        />
      </div>

      {/* Latency Input */}
      <div className="space-y-1.5">
        <Label htmlFor={`latency-${stage.id}`} className="text-xs">
          Latency
        </Label>
        <div className="flex gap-2">
          <Input
            id={`latency-${stage.id}`}
            type="number"
            min="0"
            step="0.5"
            value={stage.latency}
            onChange={(e) => handleLatencyChange(e.target.value)}
            className="h-9 w-20"
            aria-label="Latency value"
          />
          <Select
            value={stage.latencyUnit}
            onValueChange={(v) => handleLatencyUnitChange(v as LatencyUnit)}
          >
            <SelectTrigger className="h-9 w-24" aria-label="Latency unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">hours</SelectItem>
              <SelectItem value="days">days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});
