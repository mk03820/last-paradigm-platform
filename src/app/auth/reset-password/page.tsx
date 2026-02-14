'use client';

/**
 * Reset Password Page
 *
 * User sets a new password using the reset token.
 *
 * Covers: Story 15.5 Task 5, FR42 (Password reset flow)
 */

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getPasswordStrength } from '@/lib/auth/password';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const password = watch('password', '');
  const passwordStrength = getPasswordStrength(password);

  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ];

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setSubmitError('Invalid reset link.');
      setErrorType('INVALID_TOKEN');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrorType(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store access token
        if (result.data?.accessToken) {
          sessionStorage.setItem('accessToken', result.data.accessToken);
        }
        setSubmitSuccess(true);
        // Redirect to dashboard after brief success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setSubmitError(result.error?.message || 'Something went wrong.');
        setErrorType(result.error?.code);
      }
    } catch (error) {
      console.error('[ResetPassword] Submit error:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <div className="flex flex-col items-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1">Invalid Link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid. Please request a new one.
          </p>
        </div>
        <Link href="/auth/forgot-password">
          <Button>Request New Link</Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1">Password Reset!</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. Redirecting to dashboard...
          </p>
        </div>
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  // Error state for expired/used tokens
  if (errorType === 'EXPIRED' || errorType === 'ALREADY_USED' || errorType === 'INVALID_TOKEN') {
    return (
      <div className="flex flex-col items-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1">
            {errorType === 'EXPIRED' ? 'Link Expired' : 'Link Invalid'}
          </h2>
          <p className="text-sm text-muted-foreground">{submitError}</p>
        </div>
        <Link href="/auth/forgot-password">
          <Button>Request New Link</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-2 text-center">Set New Password</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter your new password below
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && !errorType && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className={cn(
                'h-12 pr-10',
                errors.password && touchedFields.password && 'border-destructive'
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && touchedFields.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}

          {/* Password Strength */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      index <= passwordStrength.score
                        ? strengthColors[passwordStrength.score]
                        : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength: {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className={cn(
                'h-12 pr-10',
                errors.confirmPassword && touchedFields.confirmPassword && 'border-destructive'
              )}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && touchedFields.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          Based on the methodology from <em>The Last Paradigm</em>
        </p>
      </div>
    </div>
  );
}
