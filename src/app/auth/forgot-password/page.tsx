'use client';

/**
 * Forgot Password Page
 *
 * User enters email to receive password reset link.
 *
 * Covers: Story 15.5 Task 4, FR42 (Password reset flow)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(result.error?.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('[ForgotPassword] Submit error:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary mb-2">
              The Last Paradigm
            </h1>
          </Link>
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-card border rounded-lg p-6 shadow-lg">
          {submitSuccess ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1">Check Your Email</h2>
                <p className="text-sm text-muted-foreground">
                  If an account exists with that email, you&apos;ll receive a password reset link shortly.
                </p>
              </div>
              <Link
                href="/auth/signin"
                className="text-primary hover:underline text-sm font-medium"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Forgot Password
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Enter your email and we&apos;ll send you a reset link
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={cn(
                      'h-12',
                      errors.email && touchedFields.email && 'border-destructive'
                    )}
                    {...register('email')}
                  />
                  {errors.email && touchedFields.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          Based on the methodology from <em>The Last Paradigm</em>
        </p>
      </div>
    </div>
  );
}
