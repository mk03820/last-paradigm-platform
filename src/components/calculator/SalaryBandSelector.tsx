'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { cn } from '@/lib/utils';
import type { SalaryBandDistribution } from '@/types/calculator.types';

interface SalaryBand {
  key: keyof SalaryBandDistribution;
  label: string;
  description: string;
}

const SALARY_BANDS: SalaryBand[] = [
  { key: 'executive', label: 'Executive', description: 'C-suite, VPs' },
  { key: 'senior', label: 'Senior', description: 'Directors, Senior Managers' },
  { key: 'midLevel', label: 'Mid-level', description: 'Managers, Senior ICs' },
  { key: 'entry', label: 'Entry', description: 'Junior staff, ICs' },
];

/**
 * Required Field Indicator Component
 * Displays a red asterisk to indicate required fields.
 */
function RequiredIndicator() {
  return (
    <span className="text-destructive ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

/**
 * SalaryBandSelector Component
 *
 * Allows users to distribute meeting attendees across preset salary bands.
 * Shows running total vs required total with visual feedback.
 *
 * Covers: FR8, FR9, FR10 - Salary band distribution for attendee allocation
 */
export function SalaryBandSelector() {
  const { meetingData, setMeetingData } = useCalculatorStore();

  const requiredTotal = meetingData?.averageAttendees ?? 0;
  const distribution = meetingData?.salaryDistribution ?? {
    executive: 0,
    senior: 0,
    midLevel: 0,
    entry: 0,
  };

  const currentTotal =
    distribution.executive +
    distribution.senior +
    distribution.midLevel +
    distribution.entry;

  const isValid = currentTotal === requiredTotal;

  const handleChange = (band: keyof SalaryBandDistribution, value: string) => {
    const numericValue = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);

    const newDistribution: SalaryBandDistribution = {
      ...distribution,
      [band]: numericValue,
    };

    setMeetingData({
      meetingCount: meetingData?.meetingCount ?? 0,
      averageAttendees: meetingData?.averageAttendees ?? 0,
      averageDuration: meetingData?.averageDuration ?? 0,
      salaryDistribution: newDistribution,
    });
  };

  return (
    <section aria-labelledby="salary-band-heading" className="space-y-6">
      <h2
        id="salary-band-heading"
        className="text-xl font-semibold leading-none tracking-tight"
      >
        Attendee Salary Distribution
      </h2>

      {/* Required Field Legend */}
      <p className="text-sm text-muted-foreground">
        <span className="text-destructive">*</span> Required
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {SALARY_BANDS.map((band) => (
          <div key={band.key} className="space-y-2">
            <Label htmlFor={`salary-band-${band.key}`}>
              {band.label}
              <RequiredIndicator />
              <span className="ml-2 text-xs text-muted-foreground">
                ({band.description})
              </span>
            </Label>
            <Input
              id={`salary-band-${band.key}`}
              type="number"
              min="0"
              value={distribution[band.key]}
              onChange={(e) => handleChange(band.key, e.target.value)}
              className="h-12"
              aria-describedby="allocation-status"
            />
          </div>
        ))}
      </div>

      <div
        data-status={isValid ? 'valid' : 'invalid'}
        className={cn(
          'rounded-md p-4 text-center font-medium',
          isValid
            ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
            : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
        )}
      >
        <p id="allocation-status" role="status" aria-live="polite">
          {currentTotal} of {requiredTotal} attendees allocated
        </p>
      </div>

      {!isValid && (
        <p
          role="alert"
          className="text-sm text-destructive"
          aria-live="assertive"
        >
          Total allocations must equal {requiredTotal} attendees
        </p>
      )}
    </section>
  );
}
