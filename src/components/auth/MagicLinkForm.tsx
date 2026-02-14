'use client';

/**
 * Magic Link Request Form Component
 *
 * Form for requesting a magic link for passwordless authentication.
 * Implements inline validation, loading states, and premium UX (FR56).
 *
 * Covers: Story 15.4 Task 4, AC1, AC5
 * Accessibility: NFR14 (Keyboard navigation)
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  magicLinkRequestSchema,
  type MagicLinkRequestInput,
} from '@/lib/schemas/magic-link.schema';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface MagicLinkFormProps {
  /** Callback when magic link is successfully requested */
  onSuccess?: () => void;
  /** Optional class name for styling */
  className?: string;
}

export function MagicLinkForm({ onSuccess, className }: MagicLinkFormProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch,
  } = useForm<MagicLinkRequestInput>({
    resolver: zodResolver(magicLinkRequestSchema),
    mode: 'onBlur', // Inline validation on blur (FR56)
    defaultValues: {
      email: '',
    },
  });

  const email = watch('email');

  const onSubmit = useCallback(
    async (data: MagicLinkRequestInput) => {
      setFormState('submitting');
      setErrorMessage('');

      try {
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: data.email }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          // Handle rate limiting specifically
          if (result.error?.code === 'RATE_LIMITED') {
            setErrorMessage('Too many requests. Please wait a few minutes before trying again.');
          } else {
            setErrorMessage(
              result.error?.message || 'Something went wrong. Please try again.'
            );
          }
          setFormState('error');
          return;
        }

        // Success!
        setSubmittedEmail(data.email);
        setFormState('success');
        onSuccess?.();
      } catch (error) {
        console.error('[MagicLinkForm] Submit error:', error);
        setErrorMessage('Network error. Please check your connection and try again.');
        setFormState('error');
      }
    },
    [onSuccess]
  );

  const handleRequestNew = useCallback(() => {
    setFormState('idle');
    setErrorMessage('');
    setSubmittedEmail('');
    reset();
  }, [reset]);

  // Success state: show confirmation message
  if (formState === 'success') {
    return (
      <div className={className} role="status" aria-live="polite">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Check Your Email
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              We sent a sign-in link to{' '}
              <span className="font-medium text-foreground">{submittedEmail}</span>.
              Click the link to sign in.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            The link expires in 15 minutes.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRequestNew}
            className="mt-4"
          >
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={className}
      noValidate
      aria-label="Sign in with magic link"
    >
      <div className="space-y-4">
        {/* Error Alert */}
        {formState === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="magic-link-email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="magic-link-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={formState === 'submitting'}
              aria-invalid={touchedFields.email && !!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="pl-10"
              {...register('email')}
            />
          </div>
          {/* Inline validation error */}
          {touchedFields.email && errors.email && (
            <p
              id="email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={formState === 'submitting' || (touchedFields.email && !isValid)}
        >
          {formState === 'submitting' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Link...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link
            </>
          )}
        </Button>

        {/* Help Text */}
        <p className="text-xs text-center text-muted-foreground">
          We'll send you a secure link to sign in. No password required.
        </p>
      </div>
    </form>
  );
}

export default MagicLinkForm;
