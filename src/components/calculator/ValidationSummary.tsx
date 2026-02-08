'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationError {
  field: string;
  message: string;
  fieldId?: string;
}

interface ValidationSummaryProps {
  errors: ValidationError[];
  className?: string;
}

/**
 * ValidationSummary Component
 *
 * Displays a form-level validation error summary at the top of the form.
 * Shows only after first submission attempt when errors exist.
 * Provides links to scroll to the specific field with the error.
 *
 * Covers: FR10 - Form validation with helpful error messages
 * AC: 4, 5 - Form-level validation and error explanations
 */
export function ValidationSummary({ errors, className }: ValidationSummaryProps) {
  if (errors.length === 0) {
    return null;
  }

  const handleErrorClick = (fieldId?: string) => {
    if (fieldId) {
      const element = document.getElementById(fieldId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  return (
    <div
      role="alert"
      aria-labelledby="validation-summary-heading"
      className={cn(
        'rounded-lg border border-destructive/50 bg-destructive/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 text-destructive shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <h3
            id="validation-summary-heading"
            className="text-sm font-medium text-destructive"
          >
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
            {errors.map((error, index) => (
              <li key={`${error.field}-${index}`}>
                {error.fieldId ? (
                  <button
                    type="button"
                    onClick={() => handleErrorClick(error.fieldId)}
                    className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded"
                  >
                    {error.field}: {error.message}
                  </button>
                ) : (
                  <span>
                    {error.field}: {error.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
