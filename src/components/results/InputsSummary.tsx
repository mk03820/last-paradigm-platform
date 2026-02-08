'use client';

import type { MeetingAuditInput } from '@/types/calculator.types';

/**
 * InputsSummary Component
 *
 * Displays all user inputs used in the calculation for transparency.
 * Shows meetings per week, average attendees, duration, and salary distribution.
 *
 * Covers: FR17 - Show all inputs used in calculation
 * AC: 1 - Users see all inputs when expanding transparency section
 */

interface InputsSummaryProps {
  /** The user inputs from the calculation */
  inputs: MeetingAuditInput;
}

export function InputsSummary({ inputs }: InputsSummaryProps) {
  const {
    meetingCount,
    averageAttendees,
    averageDuration,
    salaryDistribution,
  } = inputs;

  const totalAttendees =
    salaryDistribution.executive +
    salaryDistribution.senior +
    salaryDistribution.midLevel +
    salaryDistribution.entry;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Your Inputs</h3>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div className="space-y-1">
          <dt className="text-muted-foreground">Meetings per week</dt>
          <dd className="font-medium text-foreground">{meetingCount}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground">Average attendees</dt>
          <dd className="font-medium text-foreground">{averageAttendees}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground">Average duration</dt>
          <dd className="font-medium text-foreground">{averageDuration} minutes</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground">Total in salary bands</dt>
          <dd className="font-medium text-foreground">{totalAttendees}</dd>
        </div>
      </dl>

      {/* Salary Distribution Breakdown */}
      <div className="pt-2">
        <h4 className="text-sm text-muted-foreground mb-2">Salary Distribution</h4>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Executive</dt>
            <dd className="font-medium text-foreground">{salaryDistribution.executive}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Senior</dt>
            <dd className="font-medium text-foreground">{salaryDistribution.senior}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Mid-level</dt>
            <dd className="font-medium text-foreground">{salaryDistribution.midLevel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Entry</dt>
            <dd className="font-medium text-foreground">{salaryDistribution.entry}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
