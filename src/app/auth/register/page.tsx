'use client';

/**
 * Registration Page
 *
 * User registration page with premium UX.
 * Follows Executive Clarity design system.
 *
 * Covers: Story 15.2 Task 5, FR38 (Account creation)
 */

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSuccess = () => {
    // Redirect after a brief delay to show success state
    setTimeout(() => {
      router.push(callbackUrl);
    }, 1500);
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
          <p className="text-muted-foreground">
            Create your account to save your results
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-card border rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Create Account
          </h2>

          <RegisterForm onSuccess={handleSuccess} callbackUrl={callbackUrl} />

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
            href={callbackUrl ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signin'}
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
