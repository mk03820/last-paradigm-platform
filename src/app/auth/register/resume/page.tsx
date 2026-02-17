'use client';

/**
 * Resume Registration Page
 *
 * Landing page for users who click the "Complete Registration" link
 * in the abandonment recovery email. Pre-fills email in registration form.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 7, AC3 (Pre-filled email), AC4 (Welcome back message)
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ResumeState = 'loading' | 'ready' | 'invalid' | 'completed' | 'error';

interface ResumeData {
  state: ResumeState;
  email?: string;
  errorMessage?: string;
}

function ResumeRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [resumeData, setResumeData] = useState<ResumeData>({ state: 'loading' });

  // Fetch email from token on mount
  useEffect(() => {
    if (!token) {
      setResumeData({
        state: 'invalid',
        errorMessage: 'No resume token provided.',
      });
      return;
    }

    async function fetchEmail() {
      try {
        const response = await fetch(`/api/auth/resume-registration/${token}`);
        const data = await response.json();

        if (data.success && data.email) {
          setResumeData({
            state: 'ready',
            email: data.email,
          });
        } else if (data.error?.code === 'ALREADY_COMPLETED') {
          setResumeData({
            state: 'completed',
            errorMessage: data.error.message,
          });
        } else if (data.error?.code === 'INVALID_TOKEN') {
          setResumeData({
            state: 'invalid',
            errorMessage: data.error.message,
          });
        } else {
          setResumeData({
            state: 'error',
            errorMessage: data.error?.message || 'An error occurred.',
          });
        }
      } catch (error) {
        console.error('[resume-registration] Error:', error);
        setResumeData({
          state: 'error',
          errorMessage: 'Failed to connect to the server.',
        });
      }
    }

    fetchEmail();
  }, [token]);

  const handleSuccess = () => {
    // Redirect after a brief delay to show success state
    setTimeout(() => {
      router.push(callbackUrl);
    }, 1500);
  };

  // Loading state
  if (resumeData.state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your registration...</p>
        </div>
      </div>
    );
  }

  // Already completed state
  if (resumeData.state === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Already Registered!</h1>
          <p className="text-muted-foreground mb-6">
            It looks like you've already completed your registration.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (resumeData.state === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">
            {resumeData.errorMessage || 'This registration link is not valid.'}
          </p>
          <Button asChild className="w-full mb-3">
            <Link href="/auth/register">Create New Account</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (resumeData.state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
          <p className="text-muted-foreground mb-6">
            {resumeData.errorMessage || 'We could not load your registration.'}
          </p>
          <Button onClick={() => window.location.reload()} className="w-full mb-3">
            Try Again
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/auth/register">Start New Registration</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Ready state - show registration form with pre-filled email
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
          <p className="text-muted-foreground">
            Create your account to save your results
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-card border rounded-lg p-6 shadow-lg">
          {/* Welcome Back Message (AC4) */}
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2">
              <span className="font-semibold">Welcome back!</span> Complete your
              registration to save your diagnostic results.
            </AlertDescription>
          </Alert>

          <h2 className="text-xl font-semibold mb-6 text-center">
            Complete Your Account
          </h2>

          <RegisterForm
            onSuccess={handleSuccess}
            callbackUrl={callbackUrl}
            defaultEmail={resumeData.email}
          />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Magic Link Option */}
          <Link
            href={
              callbackUrl
                ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : '/auth/signin'
            }
            className="block w-full text-center py-3 px-4 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Sign in with magic link
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          Based on the methodology from <em>The Last Paradigm</em>
        </p>
      </div>
    </div>
  );
}

export default function ResumeRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <ResumeRegistrationContent />
    </Suspense>
  );
}
