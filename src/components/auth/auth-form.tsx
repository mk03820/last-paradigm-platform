'use client';

/**
 * Auth Form Component
 *
 * Email input form for magic link authentication.
 * Handles email validation, loading states, and success feedback.
 *
 * Covers: FR2-1, FR2-2 (Magic link authentication)
 * AC1: Email submission triggers magic link send
 * AC6: Invalid email format shows validation error
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface AuthFormProps {
  callbackUrl?: string;
}

export function AuthForm({ callbackUrl = '/dashboard' }: AuthFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await signIn('resend', {
        email: data.email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setStatus('error');
        setErrorMessage('Failed to send magic link. Please try again.');
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to{' '}
            <span className="font-medium text-foreground">{getValues('email')}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Click the link in the email to sign in. The link expires in 15 minutes.
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-sm"
          onClick={() => setStatus('idle')}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="pl-10 h-12"
            disabled={status === 'loading'}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email.message}
          </p>
        )}
      </div>

      {status === 'error' && errorMessage && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending magic link...
          </>
        ) : (
          'Send magic link'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        No password needed. We&apos;ll send you a secure sign-in link.
      </p>
    </form>
  );
}
