'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema, type EmailFormData } from '@/lib/schemas/email.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FormState = 'idle' | 'submitting' | 'success' | 'dismissed';

/**
 * EmailCaptureForm Component
 *
 * Optional email capture for Phase 2 notification.
 * Users can skip this form - it's non-blocking.
 *
 * Covers:
 * - FR29: Email input capability
 * - FR31: Value proposition messaging
 * - FR32: Optional (can be skipped)
 * - Story 4-4 Task 4
 */
export function EmailCaptureForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: EmailFormData) => {
    setFormState('submitting');
    setServerError(null);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          source: 'meeting-audit-results',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFormState('success');
      } else {
        setServerError(result.error?.message || 'Something went wrong. Please try again.');
        setFormState('idle');
      }
    } catch {
      setServerError('Unable to connect. Please try again later.');
      setFormState('idle');
    }
  };

  const handleDismiss = () => {
    setFormState('dismissed');
  };

  // Don't render if dismissed
  if (formState === 'dismissed') {
    return null;
  }

  // Success state
  if (formState === 'success') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 pb-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-medium text-primary" role="status" aria-live="polite">
              You&apos;re on the list!
            </p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll notify you when the full diagnostic launches.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          Get notified when the full diagnostic launches
        </CardTitle>
        <CardDescription className="text-base">
          You&apos;ve completed Step 1 of 7. When we launch the complete Alignment Tax Diagnostic,
          you&apos;ll be first to know. Enter your email below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={formState === 'submitting'}
              className="text-center"
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
            {serverError && (
              <p
                className="text-sm text-destructive"
                role="alert"
              >
                {serverError}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="submit"
              disabled={formState === 'submitting'}
              size="lg"
            >
              {formState === 'submitting' ? 'Submitting...' : 'Notify Me'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismiss}
              disabled={formState === 'submitting'}
              size="lg"
            >
              Skip
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
