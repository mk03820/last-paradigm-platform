'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalculateButtonProps {
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  className?: string;
}

/**
 * CalculateButton Component
 *
 * Primary action button for submitting the meeting audit form.
 * Shows loading state during calculation.
 * Disabled when form has validation errors.
 *
 * Covers: FR10 - Form submission and validation
 * AC: 4 - Form-level validation prevents calculation with invalid data
 */
export function CalculateButton({
  disabled = false,
  onClick,
  className,
}: CalculateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading || !onClick) return;

    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn('w-full h-14 text-lg font-semibold', className)}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          Calculating...
        </>
      ) : (
        'Calculate Meeting Waste'
      )}
    </Button>
  );
}
