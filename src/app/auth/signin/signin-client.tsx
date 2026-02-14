'use client';

/**
 * Sign In Client Component
 *
 * Client-side authentication form with password and magic link options.
 *
 * Covers: Story 15.3, FR41 (User login)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';
import { LoginForm } from '@/components/auth/LoginForm';

interface SignInClientProps {
  callbackUrl?: string;
  error?: string;
}

export function SignInClient({ callbackUrl, error }: SignInClientProps) {
  const router = useRouter();
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  const handleLoginSuccess = () => {
    router.push(callbackUrl || '/dashboard');
  };

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

      {showPasswordLogin ? (
        <>
          <LoginForm onSuccess={handleLoginSuccess} callbackUrl={callbackUrl} />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordLogin(false)}
            className="w-full py-3 px-4 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Sign in with magic link
          </button>
        </>
      ) : (
        <>
          <AuthForm callbackUrl={callbackUrl} />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordLogin(true)}
            className="w-full py-3 px-4 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Sign in with password
          </button>
        </>
      )}

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground pt-2">
        Don&apos;t have an account?{' '}
        <Link
          href={callbackUrl ? `/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/register'}
          className="text-primary hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
