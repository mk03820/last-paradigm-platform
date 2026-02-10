'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, ArrowUpDown, Users } from 'lucide-react';
import {
  getQuadrant,
  getQuadrantInfo,
  MAX_STAKEHOLDERS,
  SENTIMENT_STYLES,
  SENTIMENTS,
  type Stakeholder,
  type StakeholderQuadrant,
  type StakeholderSentiment,
} from './stakeholder-constants';

type SortField = 'name' | 'power' | 'interest' | 'quadrant';
type SortDirection = 'asc' | 'desc';

interface StakeholderListProps {
  /** List of stakeholders to display */
  stakeholders: Stakeholder[];
  /** Called when edit is requested for a stakeholder */
  onEdit: (stakeholder: Stakeholder) => void;
  /** Called when delete is confirmed for a stakeholder */
  onDelete: (id: string) => void;
}

/**
 * StakeholderList Component
 *
 * Displays a sortable list of stakeholders with edit/delete actions.
 * Shows quadrant badges and power/interest scores.
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: AC3 (up to 50 stakeholders), AC4 (edit/remove), AC7 (count display)
 */
export function StakeholderList({
  stakeholders,
  onEdit,
  onDelete,
}: StakeholderListProps) {
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  // Sort stakeholders
  const sortedStakeholders = React.useMemo(() => {
    return [...stakeholders].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'power':
          comparison = a.power - b.power;
          break;
        case 'interest':
          comparison = a.interest - b.interest;
          break;
        case 'quadrant':
          comparison = getQuadrant(a.power, a.interest).localeCompare(
            getQuadrant(b.power, b.interest)
          );
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [stakeholders, sortField, sortDirection]);

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  // Cancel delete confirmation after timeout
  React.useEffect(() => {
    if (deleteConfirmId) {
      const timeout = setTimeout(() => setDeleteConfirmId(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [deleteConfirmId]);

  if (stakeholders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Stakeholders Added</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Add stakeholders to map their power and interest levels.
            You&apos;ll need at least 3 for meaningful analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Stakeholders</span>
          <span className="text-sm font-normal text-muted-foreground">
            {stakeholders.length} of {MAX_STAKEHOLDERS}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b">
                <SortHeader
                  label="Name"
                  field="name"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={toggleSort}
                />
                <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <SortHeader
                  label="Power"
                  field="power"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={toggleSort}
                  className="text-center"
                />
                <SortHeader
                  label="Interest"
                  field="interest"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={toggleSort}
                  className="text-center"
                />
                <SortHeader
                  label="Quadrant"
                  field="quadrant"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={toggleSort}
                />
                <th className="py-2 px-2 text-sm font-medium text-muted-foreground">
                  Sentiment
                </th>
                <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStakeholders.map((stakeholder) => {
                const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
                const quadrantInfo = getQuadrantInfo(quadrant);
                const isDeleting = deleteConfirmId === stakeholder.id;

                return (
                  <tr
                    key={stakeholder.id}
                    className="border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2 font-medium">{stakeholder.name}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {stakeholder.role}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <ScoreBadge score={stakeholder.power} type="power" />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <ScoreBadge score={stakeholder.interest} type="interest" />
                    </td>
                    <td className="py-3 px-2">
                      <QuadrantBadge quadrant={quadrant} label={quadrantInfo.label} />
                    </td>
                    <td className="py-3 px-2">
                      <SentimentBadge sentiment={stakeholder.sentiment} />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(stakeholder)}
                          aria-label={`Edit ${stakeholder.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={isDeleting ? 'destructive' : 'ghost'}
                          size="icon"
                          onClick={() => handleDeleteClick(stakeholder.id)}
                          aria-label={
                            isDeleting
                              ? `Confirm delete ${stakeholder.name}`
                              : `Delete ${stakeholder.name}`
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {sortedStakeholders.map((stakeholder) => {
            const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
            const quadrantInfo = getQuadrantInfo(quadrant);
            const isDeleting = deleteConfirmId === stakeholder.id;

            return (
              <div
                key={stakeholder.id}
                className="p-3 border rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{stakeholder.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {stakeholder.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SentimentBadge sentiment={stakeholder.sentiment} />
                    <QuadrantBadge quadrant={quadrant} label={quadrantInfo.label} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-sm">
                    <span>
                      Power: <ScoreBadge score={stakeholder.power} type="power" />
                    </span>
                    <span>
                      Interest:{' '}
                      <ScoreBadge score={stakeholder.interest} type="interest" />
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(stakeholder)}
                      aria-label={`Edit ${stakeholder.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isDeleting ? 'destructive' : 'ghost'}
                      size="sm"
                      onClick={() => handleDeleteClick(stakeholder.id)}
                      aria-label={
                        isDeleting
                          ? `Confirm delete ${stakeholder.name}`
                          : `Delete ${stakeholder.name}`
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Sortable table header
 */
interface SortHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  className,
}: SortHeaderProps) {
  const isActive = currentField === field;

  return (
    <th className={cn('py-2 px-2', className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'flex items-center gap-1 text-sm font-medium',
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

/**
 * Score badge for power/interest
 */
interface ScoreBadgeProps {
  score: number;
  type: 'power' | 'interest';
}

function ScoreBadge({ score, type }: ScoreBadgeProps) {
  const getColor = () => {
    if (score >= 8) return 'bg-red-100 text-red-800';
    if (score >= 6) return 'bg-orange-100 text-orange-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium',
        getColor()
      )}
      aria-label={`${type} level ${score}`}
    >
      {score}
    </span>
  );
}

/**
 * Quadrant badge
 */
interface QuadrantBadgeProps {
  quadrant: StakeholderQuadrant;
  label: string;
}

function QuadrantBadge({ quadrant, label }: QuadrantBadgeProps) {
  const getVariant = (): 'default' | 'secondary' | 'outline' => {
    switch (quadrant) {
      case 'key_players':
        return 'default';
      case 'keep_satisfied':
      case 'keep_informed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getVariant()} className="text-xs whitespace-nowrap">
      {label}
    </Badge>
  );
}

/**
 * Sentiment badge
 */
interface SentimentBadgeProps {
  sentiment: StakeholderSentiment | undefined;
}

function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  if (!sentiment) {
    return (
      <span className="text-xs text-muted-foreground">-</span>
    );
  }

  const styles = SENTIMENT_STYLES[sentiment];
  const info = SENTIMENTS.find((s) => s.id === sentiment);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        styles.text
      )}
      aria-label={`Sentiment: ${info?.label}`}
    >
      <span
        className={cn('w-2 h-2 rounded-full', styles.bg)}
        aria-hidden="true"
      />
      {info?.label}
    </span>
  );
}
