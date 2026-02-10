/**
 * Engagement Action Table Component
 *
 * Displays stakeholders with engagement recommendations and editable owner field.
 *
 * Story 11.4: Engagement Strategy Generation
 * Covers: AC3 (action table), AC4 (exportable)
 */

'use client';

import React, { memo, useState, useCallback } from 'react';
import { Download, ArrowUpDown, Check, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Stakeholder, StakeholderQuadrant } from './stakeholder-constants';
import { getQuadrant, getQuadrantInfo, SENTIMENT_STYLES } from './stakeholder-constants';
import { getRecommendedAction, downloadCSV } from './engagement-strategies';
import { cn } from '@/lib/utils';

export interface EngagementActionTableProps {
  stakeholders: Stakeholder[];
  owners: Record<string, string>;
  onOwnerChange: (stakeholderId: string, owner: string) => void;
  className?: string;
}

type SortField = 'name' | 'quadrant' | 'sentiment' | 'owner';
type SortDirection = 'asc' | 'desc';

const QUADRANT_ORDER: Record<StakeholderQuadrant, number> = {
  key_players: 0,
  keep_satisfied: 1,
  keep_informed: 2,
  monitor: 3,
};

const SENTIMENT_ORDER: Record<string, number> = {
  blocker: 0,
  neutral: 1,
  supporter: 2,
  undefined: 3,
};

export const EngagementActionTable = memo(function EngagementActionTable({
  stakeholders,
  owners,
  onOwnerChange,
  className,
}: EngagementActionTableProps) {
  const [sortField, setSortField] = useState<SortField>('quadrant');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Sort stakeholders
  const sortedStakeholders = React.useMemo(() => {
    return [...stakeholders].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quadrant':
          comparison =
            QUADRANT_ORDER[getQuadrant(a.power, a.interest)] -
            QUADRANT_ORDER[getQuadrant(b.power, b.interest)];
          break;
        case 'sentiment':
          comparison =
            SENTIMENT_ORDER[a.sentiment || 'undefined'] -
            SENTIMENT_ORDER[b.sentiment || 'undefined'];
          break;
        case 'owner':
          comparison = (owners[a.id] || '').localeCompare(owners[b.id] || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [stakeholders, owners, sortField, sortDirection]);

  const toggleSort = useCallback((field: SortField) => {
    setSortField((current) => {
      if (current === field) {
        setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        return current;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const startEditing = useCallback((id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId) {
      onOwnerChange(editingId, editValue.trim());
      setEditingId(null);
      setEditValue('');
    }
  }, [editingId, editValue, onOwnerChange]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, []);

  const handleExport = useCallback(() => {
    downloadCSV(stakeholders, owners);
  }, [stakeholders, owners]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit]
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Engagement Action Plan</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {stakeholders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No stakeholders to display. Add stakeholders to see engagement recommendations.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="grid">
              <thead>
                <tr className="border-b">
                  <SortHeader
                    label="Name"
                    field="name"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <SortHeader
                    label="Quadrant"
                    field="quadrant"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <SortHeader
                    label="Sentiment"
                    field="sentiment"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                    Recommended Action
                  </th>
                  <SortHeader
                    label="Owner"
                    field="owner"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedStakeholders.map((stakeholder) => {
                  const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
                  const quadrantInfo = getQuadrantInfo(quadrant);
                  const action = getRecommendedAction(stakeholder);
                  const owner = owners[stakeholder.id] || '';
                  const isEditing = editingId === stakeholder.id;

                  return (
                    <tr
                      key={stakeholder.id}
                      className="border-b last:border-b-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{stakeholder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {stakeholder.role}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <QuadrantBadge quadrant={quadrant} label={quadrantInfo.label} />
                      </td>
                      <td className="py-3 px-2">
                        <SentimentBadge sentiment={stakeholder.sentiment} />
                      </td>
                      <td className="py-3 px-2 max-w-xs">
                        <p className="text-sm">{action}</p>
                      </td>
                      <td className="py-3 px-2">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-8 w-32"
                              placeholder="Enter owner"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={saveEdit}
                              aria-label="Save owner"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={cancelEdit}
                              aria-label="Cancel editing"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditing(stakeholder.id, owner)}
                            className={cn(
                              'flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted transition-colors',
                              owner ? 'text-foreground' : 'text-muted-foreground'
                            )}
                            aria-label={`Edit owner for ${stakeholder.name}`}
                          >
                            {owner || 'Assign owner'}
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Sort header component
interface SortHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: SortHeaderProps) {
  const isActive = currentField === field;

  return (
    <th className="py-2 px-2">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'flex items-center gap-1 font-medium',
          isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <ArrowUpDown
          className={cn('h-3 w-3', isActive && 'text-primary')}
          aria-hidden="true"
        />
        {isActive && (
          <span className="sr-only">
            {direction === 'asc' ? 'ascending' : 'descending'}
          </span>
        )}
      </button>
    </th>
  );
}

// Quadrant badge
function QuadrantBadge({
  quadrant,
  label,
}: {
  quadrant: StakeholderQuadrant;
  label: string;
}) {
  const colors: Record<StakeholderQuadrant, string> = {
    key_players: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    keep_satisfied: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
    keep_informed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200',
    monitor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
  };

  return (
    <Badge className={cn('text-xs whitespace-nowrap', colors[quadrant])}>
      {label}
    </Badge>
  );
}

// Sentiment badge
function SentimentBadge({
  sentiment,
}: {
  sentiment: string | undefined;
}) {
  if (!sentiment) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const styles = SENTIMENT_STYLES[sentiment as keyof typeof SENTIMENT_STYLES];
  const label = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

  return (
    <span className={cn('flex items-center gap-1 text-xs font-medium', styles.text)}>
      <span className={cn('w-2 h-2 rounded-full', styles.bg)} aria-hidden="true" />
      {label}
    </span>
  );
}
