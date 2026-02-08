'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import {
  meetingDetailsSchema,
  type MeetingDetailsFormData,
} from '@/lib/schemas/meeting-details.schema';
import type { MeetingAuditInput } from '@/types/calculator.types';

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
 * Meeting Details Form Component
 *
 * Collects meeting audit inputs: count, attendees, and duration.
 * Integrates with Zustand store for session persistence.
 *
 * Covers: FR5, FR6, FR7, FR10 (functional requirements)
 * AC: 2, 3, 4, 5, 6, 7 (acceptance criteria)
 */
export function MeetingDetailsForm() {
  const { meetingData, setMeetingData } = useCalculatorStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm<MeetingDetailsFormData>({
    resolver: zodResolver(meetingDetailsSchema),
    mode: 'onBlur',
    defaultValues: {
      meetingCount: meetingData?.meetingCount ?? undefined,
      averageAttendees: meetingData?.averageAttendees ?? undefined,
      averageDuration: meetingData?.averageDuration ?? undefined,
    },
  });

  // Load existing data from store on mount
  useEffect(() => {
    if (meetingData) {
      if (meetingData.meetingCount !== undefined) {
        setValue('meetingCount', meetingData.meetingCount);
      }
      if (meetingData.averageAttendees !== undefined) {
        setValue('averageAttendees', meetingData.averageAttendees);
      }
      if (meetingData.averageDuration !== undefined) {
        setValue('averageDuration', meetingData.averageDuration);
      }
    }
  }, [meetingData, setValue]);

  // Debounced save to store
  const saveToStore = useCallback(
    (data: Partial<MeetingDetailsFormData>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        // Build partial MeetingAuditInput with current form values
        const currentData = meetingData || {
          meetingCount: 0,
          averageAttendees: 0,
          averageDuration: 0,
          salaryDistribution: {
            executive: 0,
            senior: 0,
            midLevel: 0,
            entry: 0,
          },
        };

        const updatedData: MeetingAuditInput = {
          ...currentData,
          ...(data.meetingCount !== undefined && !isNaN(data.meetingCount)
            ? { meetingCount: data.meetingCount }
            : {}),
          ...(data.averageAttendees !== undefined && !isNaN(data.averageAttendees)
            ? { averageAttendees: data.averageAttendees }
            : {}),
          ...(data.averageDuration !== undefined && !isNaN(data.averageDuration)
            ? { averageDuration: data.averageDuration }
            : {}),
        };

        setMeetingData(updatedData);
      }, 300);
    },
    [meetingData, setMeetingData]
  );

  // Watch form changes and save to store
  useEffect(() => {
    const subscription = watch((formData) => {
      saveToStore(formData as Partial<MeetingDetailsFormData>);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watch, saveToStore]);

  return (
    <div className="space-y-6">
      {/* Required Field Legend */}
      <p className="text-sm text-muted-foreground">
        <span className="text-destructive">*</span> Required
      </p>

      {/* Meeting Count Field */}
      <div className="space-y-2">
        <Label
          htmlFor="meetingCount"
          className="text-sm font-medium"
        >
          Number of recurring meetings
          <RequiredIndicator />
        </Label>
        <Input
          id="meetingCount"
          type="number"
          inputMode="numeric"
          className="h-12 text-base"
          aria-invalid={errors.meetingCount ? 'true' : 'false'}
          aria-describedby={errors.meetingCount ? 'meetingCount-error' : undefined}
          {...register('meetingCount', { valueAsNumber: true })}
        />
        {errors.meetingCount && (
          <p
            id="meetingCount-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.meetingCount.message}
          </p>
        )}
      </div>

      {/* Average Attendees Field */}
      <div className="space-y-2">
        <Label
          htmlFor="averageAttendees"
          className="text-sm font-medium"
        >
          Average attendees per meeting
          <RequiredIndicator />
        </Label>
        <Input
          id="averageAttendees"
          type="number"
          inputMode="numeric"
          className="h-12 text-base"
          aria-invalid={errors.averageAttendees ? 'true' : 'false'}
          aria-describedby={errors.averageAttendees ? 'averageAttendees-error' : undefined}
          {...register('averageAttendees', { valueAsNumber: true })}
        />
        {errors.averageAttendees && (
          <p
            id="averageAttendees-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.averageAttendees.message}
          </p>
        )}
      </div>

      {/* Average Duration Field */}
      <div className="space-y-2">
        <Label
          htmlFor="averageDuration"
          className="text-sm font-medium"
        >
          Average meeting duration (minutes)
          <RequiredIndicator />
        </Label>
        <Input
          id="averageDuration"
          type="number"
          inputMode="numeric"
          className="h-12 text-base"
          aria-invalid={errors.averageDuration ? 'true' : 'false'}
          aria-describedby={errors.averageDuration ? 'averageDuration-error' : undefined}
          {...register('averageDuration', { valueAsNumber: true })}
        />
        {errors.averageDuration && (
          <p
            id="averageDuration-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.averageDuration.message}
          </p>
        )}
      </div>
    </div>
  );
}
