'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTool4Store } from '@/lib/store/tool4-store';
import { StakeholderForm } from './StakeholderForm';
import { StakeholderList } from './StakeholderList';
import {
  MIN_STAKEHOLDERS,
  MAX_STAKEHOLDERS,
  type Stakeholder,
} from './stakeholder-constants';

interface StakeholderInputProps {
  /** Called when user wants to proceed to matrix view */
  onProceed?: () => void;
}

/**
 * StakeholderInput Component
 *
 * Main container for stakeholder input interface.
 * Combines StakeholderForm and StakeholderList with progress tracking.
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: All ACs (form, list, progress, validation)
 */
export function StakeholderInput({ onProceed }: StakeholderInputProps) {
  const {
    stakeholders,
    addStakeholder,
    updateStakeholder,
    removeStakeholder,
    canProceed,
  } = useTool4Store();

  const [showForm, setShowForm] = React.useState(false);
  const [editingStakeholder, setEditingStakeholder] = React.useState<Stakeholder | null>(null);

  const stakeholderCount = stakeholders.length;
  const isAtLimit = stakeholderCount >= MAX_STAKEHOLDERS;
  const hasMinimum = stakeholderCount >= MIN_STAKEHOLDERS;
  const progressPercent = Math.min((stakeholderCount / MIN_STAKEHOLDERS) * 100, 100);

  // Handle form submission for new stakeholder
  const handleAddSubmit = (data: Omit<Stakeholder, 'id'>) => {
    addStakeholder(data);
    setShowForm(false);
  };

  // Handle form submission for editing stakeholder
  const handleEditSubmit = (data: Omit<Stakeholder, 'id'>) => {
    if (editingStakeholder) {
      updateStakeholder(editingStakeholder.id, data);
      setEditingStakeholder(null);
    }
  };

  // Start editing a stakeholder
  const handleEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setShowForm(false);
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingStakeholder(null);
  };

  // Open add form
  const handleAddClick = () => {
    setEditingStakeholder(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {stakeholderCount} of {MAX_STAKEHOLDERS} stakeholders
          </span>
          <span className="font-medium">
            {hasMinimum ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Ready for analysis
              </span>
            ) : (
              <span className="text-muted-foreground">
                {MIN_STAKEHOLDERS - stakeholderCount} more needed
              </span>
            )}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Warning if below minimum */}
      {!hasMinimum && stakeholderCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Add at least {MIN_STAKEHOLDERS - stakeholderCount} more stakeholder
            {MIN_STAKEHOLDERS - stakeholderCount > 1 ? 's' : ''} for meaningful
            analysis. You have {stakeholderCount} of {MIN_STAKEHOLDERS} required.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Stakeholder Button */}
      {!showForm && !editingStakeholder && (
        <Button
          onClick={handleAddClick}
          disabled={isAtLimit}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Stakeholder
        </Button>
      )}

      {/* Limit reached warning */}
      {isAtLimit && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Maximum of {MAX_STAKEHOLDERS} stakeholders reached. Remove existing
            stakeholders to add new ones.
          </AlertDescription>
        </Alert>
      )}

      {/* Form for adding new stakeholder */}
      {showForm && (
        <StakeholderForm onSubmit={handleAddSubmit} onCancel={handleCancel} />
      )}

      {/* Form for editing existing stakeholder */}
      {editingStakeholder && (
        <StakeholderForm
          stakeholder={editingStakeholder}
          onSubmit={handleEditSubmit}
          onCancel={handleCancel}
          isEditing
        />
      )}

      {/* Stakeholder List */}
      <StakeholderList
        stakeholders={stakeholders}
        onEdit={handleEdit}
        onDelete={removeStakeholder}
      />

      {/* Proceed Button */}
      {stakeholderCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={onProceed}
            disabled={!canProceed()}
            className="flex-1"
            size="lg"
          >
            View Stakeholder Matrix
          </Button>
          {!hasMinimum && (
            <p className="text-sm text-muted-foreground text-center sm:text-left sm:self-center">
              Add {MIN_STAKEHOLDERS - stakeholderCount} more to continue
            </p>
          )}
        </div>
      )}
    </div>
  );
}
