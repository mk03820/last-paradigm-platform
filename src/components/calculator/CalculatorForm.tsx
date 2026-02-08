'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MeetingDetailsForm } from './MeetingDetailsForm';
import { SalaryBandSelector } from './SalaryBandSelector';
import { ValidationSummary, type ValidationError } from './ValidationSummary';
import { CalculateButton } from './CalculateButton';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { meetingDetailsSchema } from '@/lib/schemas/meeting-details.schema';
import { validateDistributionTotal } from '@/lib/schemas/salary-distribution.schema';
import type { CalculationResult } from '@/types/calculator.types';

/**
 * CalculatorForm Component
 *
 * Main calculator form that combines all input components with
 * form-level validation and submission handling.
 *
 * Covers: FR5-FR10 - Complete meeting audit input form
 * AC: 1-6 - Form validation, required fields, error handling
 */
export function CalculatorForm() {
  const router = useRouter();
  const { meetingData, setResults, setIsCalculating } = useCalculatorStore();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate meeting details
    if (meetingData) {
      const result = meetingDetailsSchema.safeParse({
        meetingCount: meetingData.meetingCount,
        averageAttendees: meetingData.averageAttendees,
        averageDuration: meetingData.averageDuration,
      });

      if (!result.success) {
        result.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          const fieldLabels: Record<string, string> = {
            meetingCount: 'Number of meetings',
            averageAttendees: 'Average attendees',
            averageDuration: 'Average duration',
          };

          errors.push({
            field: fieldLabels[field] || field,
            message: err.message,
            fieldId: field,
          });
        });
      }

      // Validate salary distribution total
      if (meetingData.salaryDistribution && meetingData.averageAttendees) {
        const distResult = validateDistributionTotal(
          meetingData.salaryDistribution,
          meetingData.averageAttendees
        );

        if (!distResult.isValid && distResult.error) {
          errors.push({
            field: 'Salary Distribution',
            message: distResult.error,
            fieldId: 'salary-band-executive',
          });
        }
      }
    } else {
      // No meeting data at all
      errors.push({
        field: 'Meeting Details',
        message: 'Please fill in the meeting details',
        fieldId: 'meetingCount',
      });
    }

    return errors;
  }, [meetingData]);

  const isFormValid = useCallback((): boolean => {
    if (!meetingData) return false;

    // Check meeting details
    const meetingResult = meetingDetailsSchema.safeParse({
      meetingCount: meetingData.meetingCount,
      averageAttendees: meetingData.averageAttendees,
      averageDuration: meetingData.averageDuration,
    });

    if (!meetingResult.success) return false;

    // Check salary distribution
    if (meetingData.salaryDistribution && meetingData.averageAttendees) {
      const distResult = validateDistributionTotal(
        meetingData.salaryDistribution,
        meetingData.averageAttendees
      );

      if (!distResult.isValid) return false;
    } else {
      return false;
    }

    return true;
  }, [meetingData]);

  const handleCalculate = async () => {
    setHasSubmitted(true);
    setApiError(null);
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length > 0) {
      // Scroll to validation summary
      const summary = document.querySelector('[role="alert"]');
      if (summary) {
        summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (!meetingData) return;

    // Call the calculation API
    setIsCalculating(true);
    try {
      const response = await fetch('/api/calculate/meeting-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      });

      const result = await response.json();

      if (result.success) {
        setResults(result.data as CalculationResult);
        router.push('/results');
      } else {
        setApiError(result.error || 'Calculation failed. Please try again.');
      }
    } catch (error) {
      console.error('Calculation API error:', error);
      setApiError('Unable to calculate. Please check your connection and try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* API Error Message */}
      {apiError && (
        <div
          role="alert"
          className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{apiError}</p>
        </div>
      )}

      {/* Validation Summary - shown after first submit attempt */}
      {hasSubmitted && validationErrors.length > 0 && (
        <ValidationSummary errors={validationErrors} />
      )}

      {/* Meeting Details Form Section */}
      <section aria-labelledby="meeting-details-heading">
        <h2 id="meeting-details-heading" className="sr-only">
          Meeting Details
        </h2>
        <div className="bg-card rounded-lg border p-8">
          <MeetingDetailsForm />
        </div>
      </section>

      {/* Salary Band Selector Section */}
      <section aria-labelledby="salary-distribution-heading">
        <h2 id="salary-distribution-heading" className="sr-only">
          Salary Distribution
        </h2>
        <div className="bg-card rounded-lg border p-8">
          <SalaryBandSelector />
        </div>
      </section>

      {/* Calculate Button */}
      <CalculateButton
        disabled={hasSubmitted && !isFormValid()}
        onClick={handleCalculate}
      />
    </div>
  );
}
