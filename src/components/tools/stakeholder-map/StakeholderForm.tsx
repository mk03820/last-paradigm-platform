'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HelpCircle, X } from 'lucide-react';
import {
  ROLE_SUGGESTIONS,
  POWER_CALIBRATION,
  INTEREST_CALIBRATION,
  SENTIMENTS,
  SENTIMENT_STYLES,
  getQuadrant,
  getQuadrantInfo,
  validateStakeholder,
  type Stakeholder,
  type CalibrationLevel,
  type StakeholderSentiment,
} from './stakeholder-constants';

interface StakeholderFormProps {
  /** Existing stakeholder data for edit mode */
  stakeholder?: Stakeholder;
  /** Called when form is submitted successfully */
  onSubmit: (data: Omit<Stakeholder, 'id'>) => void;
  /** Called when form is cancelled */
  onCancel: () => void;
  /** Whether this is editing an existing stakeholder */
  isEditing?: boolean;
}

/**
 * StakeholderForm Component
 *
 * Form for adding or editing stakeholder details with power/interest sliders.
 * Includes role autocomplete and calibration guidance.
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: AC1 (form fields), AC2 (calibration guidance)
 */
export function StakeholderForm({
  stakeholder,
  onSubmit,
  onCancel,
  isEditing = false,
}: StakeholderFormProps) {
  const [name, setName] = React.useState(stakeholder?.name || '');
  const [role, setRole] = React.useState(stakeholder?.role || '');
  const [power, setPower] = React.useState(stakeholder?.power || 5);
  const [interest, setInterest] = React.useState(stakeholder?.interest || 5);
  const [sentiment, setSentiment] = React.useState<StakeholderSentiment | undefined>(
    stakeholder?.sentiment
  );
  const [showRoleSuggestions, setShowRoleSuggestions] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const roleInputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLUListElement>(null);

  // Filter role suggestions based on input
  const filteredSuggestions = React.useMemo(() => {
    if (!role.trim()) return ROLE_SUGGESTIONS.slice(0, 10);
    const lower = role.toLowerCase();
    return ROLE_SUGGESTIONS.filter((r) =>
      r.toLowerCase().includes(lower)
    ).slice(0, 8);
  }, [role]);

  // Get current quadrant preview
  const quadrantPreview = React.useMemo(() => {
    const quadrantId = getQuadrant(power, interest);
    return getQuadrantInfo(quadrantId);
  }, [power, interest]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { name: name.trim(), role: role.trim(), power, interest, sentiment };
    const validation = validateStakeholder(data);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit(data);
  };

  // Handle role suggestion selection
  const selectRole = (selectedRole: string) => {
    setRole(selectedRole);
    setShowRoleSuggestions(false);
    setErrors((prev) => {
      const { role: _, ...rest } = prev;
      return rest;
    });
  };

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        roleInputRef.current &&
        !roleInputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowRoleSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          {isEditing ? 'Edit Stakeholder' : 'Add Stakeholder'}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="stakeholder-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stakeholder-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => {
                  const { name: _, ...rest } = prev;
                  return rest;
                });
              }}
              placeholder="Enter stakeholder name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="h-12"
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Role Field with Autocomplete */}
          <div className="space-y-2 relative">
            <Label htmlFor="stakeholder-role">
              Role / Title <span className="text-destructive">*</span>
            </Label>
            <Input
              ref={roleInputRef}
              id="stakeholder-role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setShowRoleSuggestions(true);
                setErrors((prev) => {
                  const { role: _, ...rest } = prev;
                  return rest;
                });
              }}
              onFocus={() => setShowRoleSuggestions(true)}
              placeholder="e.g., VP Engineering, CFO"
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? 'role-error' : undefined}
              aria-autocomplete="list"
              aria-controls="role-suggestions"
              aria-expanded={showRoleSuggestions && filteredSuggestions.length > 0}
              className="h-12"
            />
            {showRoleSuggestions && filteredSuggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                id="role-suggestions"
                role="listbox"
                className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto"
              >
                {filteredSuggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    role="option"
                    aria-selected={role === suggestion}
                    className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                    onClick={() => selectRole(suggestion)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') selectRole(suggestion);
                    }}
                    tabIndex={0}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            {errors.role && (
              <p id="role-error" className="text-sm text-destructive">
                {errors.role}
              </p>
            )}
          </div>

          {/* Power Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="stakeholder-power">
                Power: {power}
              </Label>
              <CalibrationTooltip
                levels={POWER_CALIBRATION}
                label="Power Level Guide"
              />
            </div>
            <SliderWithLabels
              id="stakeholder-power"
              value={power}
              onChange={setPower}
              calibration={POWER_CALIBRATION}
              ariaLabel="Stakeholder power level"
            />
            <p className="text-xs text-muted-foreground">
              {getPowerDescription(power)}
            </p>
          </div>

          {/* Interest Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="stakeholder-interest">
                Interest: {interest}
              </Label>
              <CalibrationTooltip
                levels={INTEREST_CALIBRATION}
                label="Interest Level Guide"
              />
            </div>
            <SliderWithLabels
              id="stakeholder-interest"
              value={interest}
              onChange={setInterest}
              calibration={INTEREST_CALIBRATION}
              ariaLabel="Stakeholder interest level"
            />
            <p className="text-xs text-muted-foreground">
              {getInterestDescription(interest)}
            </p>
          </div>

          {/* Sentiment Selector */}
          <div className="space-y-2">
            <Label>Sentiment (Optional)</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Stakeholder sentiment">
              {SENTIMENTS.map((s) => {
                const styles = SENTIMENT_STYLES[s.id];
                const isSelected = sentiment === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSentiment(isSelected ? undefined : s.id)}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm font-medium rounded-md border-2 transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      isSelected
                        ? cn(styles.border, styles.text, 'bg-opacity-10',
                            s.id === 'supporter' && 'bg-green-50 dark:bg-green-900/20',
                            s.id === 'neutral' && 'bg-yellow-50 dark:bg-yellow-900/20',
                            s.id === 'blocker' && 'bg-red-50 dark:bg-red-900/20'
                          )
                        : 'border-muted text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            {sentiment && (
              <p className="text-xs text-muted-foreground">
                {SENTIMENTS.find((s) => s.id === sentiment)?.description}
              </p>
            )}
          </div>

          {/* Quadrant Preview */}
          <div
            className={cn(
              'p-3 rounded-md border',
              quadrantPreview.color === 'blue' && 'bg-blue-50 border-blue-200',
              quadrantPreview.color === 'purple' && 'bg-purple-50 border-purple-200',
              quadrantPreview.color === 'teal' && 'bg-teal-50 border-teal-200',
              quadrantPreview.color === 'gray' && 'bg-gray-50 border-gray-200'
            )}
          >
            <p className="text-sm font-medium">
              Quadrant: {quadrantPreview.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {quadrantPreview.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              {isEditing ? 'Save Changes' : 'Add Stakeholder'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Slider component with tick labels
 */
interface SliderWithLabelsProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  calibration: CalibrationLevel[];
  ariaLabel: string;
}

function SliderWithLabels({
  id,
  value,
  onChange,
  calibration,
  ariaLabel,
}: SliderWithLabelsProps) {
  return (
    <div className="space-y-1">
      <input
        type="range"
        id={id}
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>1</span>
        <span>Low</span>
        <span>5</span>
        <span>High</span>
        <span>10</span>
      </div>
    </div>
  );
}

/**
 * Calibration tooltip showing all levels
 */
interface CalibrationTooltipProps {
  levels: CalibrationLevel[];
  label: string;
}

function CalibrationTooltip({ levels, label }: CalibrationTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p className="font-semibold mb-2">{label}</p>
        <ul className="space-y-2 text-sm">
          {levels.map((level) => (
            <li key={level.range}>
              <span className="font-medium">{level.range}:</span>{' '}
              {level.guidance}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Get description text for power level
 */
function getPowerDescription(power: number): string {
  if (power >= 8) return 'Very High - Can unilaterally approve or veto';
  if (power >= 6) return 'High - Significant influence on key decisions';
  if (power >= 4) return 'Medium - Can influence but not directly control';
  return 'Low - Limited formal authority';
}

/**
 * Get description text for interest level
 */
function getInterestDescription(interest: number): string {
  if (interest >= 8) return 'Very High - Their work changes significantly';
  if (interest >= 6) return 'High - Materially impacted by outcomes';
  if (interest >= 4) return 'Medium - Indirectly affected';
  return 'Low - Minimal impact on their work';
}
