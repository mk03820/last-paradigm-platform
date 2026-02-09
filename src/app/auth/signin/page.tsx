/**
 * Sign In Page
 *
 * Magic link authentication entry point.
 * Users enter their email to receive a sign-in link.
 *
 * Covers: FR2-1 (account creation), FR2-2 (sign in via magic link)
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { AuthForm } from '@/components/auth/auth-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const params = await searchParams;

  // Redirect if already signed in
  if (session?.user) {
    redirect(params.callbackUrl || '/dashboard');
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Sign in card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              <span className="text-primary">The Last Paradigm</span>
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to save your progress and access your diagnostic sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading...</div>}>
              <AuthFormWrapper callbackUrl={params.callbackUrl} error={params.error} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Privacy note */}
        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
          <br />
          We&apos;ll never share your email or data with third parties.
        </p>
      </div>
    </main>
  );
}

function AuthFormWrapper({ callbackUrl, error }: { callbackUrl?: string; error?: string }) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-center">
          <p className="text-sm text-destructive">
            {error === 'OAuthAccountNotLinked'
              ? 'This email is already associated with another account.'
              : error === 'Verification'
              ? 'The magic link has expired or already been used.'
              : 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}
      <AuthForm callbackUrl={callbackUrl} />
    </div>
  );
}
