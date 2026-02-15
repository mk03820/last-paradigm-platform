'use client';

/**
 * Magic Link Verification Page
 *
 * Landing page for magic link verification.
 * Automatically verifies the token and redirects on success.
 *
 * Covers: Story 15.4 Task 5, AC2, AC3, AC4
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

type VerificationState =
  | 'loading'
  | 'success'
  | 'expired'
  | 'used'
  | 'invalid'
  | 'error';

interface VerificationResult {
  state: VerificationState;
  redirectUrl?: string;
  errorMessage?: string;
}

function VerifyMagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [result, setResult] = useState<VerificationResult>({
    state: 'loading',
  });

  const token = searchParams.get('token');
  const callbackUrl = searchParams.get('callbackUrl');

  const verifyToken = useCallback(async () => {
    if (!token) {
      setResult({
        state: 'invalid',
        errorMessage: 'No verification token provided.',
      });
      return;
    }

    try {
      const url = new URL('/api/auth/verify-magic-link', window.location.origin);
      url.searchParams.set('token', token);
      if (callbackUrl) {
        url.searchParams.set('callbackUrl', callbackUrl);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        // Store auth state in Zustand (in-memory, not sessionStorage for security)
        if (data.data?.accessToken && data.data?.user) {
          setAuth(
            {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              purchaseStatus: data.data.user.purchaseStatus || 'none',
            },
            data.data.accessToken
          );
        }

        setResult({
          state: 'success',
          redirectUrl: data.data?.redirectUrl || '/dashboard',
        });

        // Redirect after a brief success message
        setTimeout(() => {
          router.push(data.data?.redirectUrl || '/dashboard');
        }, 1500);
      } else {
        // Map error codes to states
        const errorStateMap: Record<string, VerificationState> = {
          EXPIRED: 'expired',
          ALREADY_USED: 'used',
          INVALID_TOKEN: 'invalid',
          SERVER_ERROR: 'error',
        };

        setResult({
          state: errorStateMap[data.error?.code] || 'error',
          errorMessage: data.error?.message,
        });
      }
    } catch (error) {
      console.error('[verify-magic-link] Verification error:', error);
      setResult({
        state: 'error',
        errorMessage: 'Network error. Please check your connection and try again.',
      });
    }
  }, [token, callbackUrl, router, setAuth]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            The Last Paradigm
          </h1>
          <p className="text-muted-foreground">
            Quantifying Your Alignment Tax
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-lg">
          {/* Loading State */}
          {result.state === 'loading' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1">Verifying Link</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your sign-in link...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {result.state === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1">Sign In Successful</h2>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to your dashboard...
                </p>
              </div>
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          )}

          {/* Expired State */}
          {result.state === 'expired' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-1">Link Expired</h2>
                  <p className="text-sm text-muted-foreground">
                    This sign-in link has expired. Magic links are valid for 15 minutes.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">Request New Link</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Already Used State */}
          {result.state === 'used' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-1">Link Already Used</h2>
                  <p className="text-sm text-muted-foreground">
                    This sign-in link has already been used. Magic links can only be used once.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">Request New Link</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Invalid Token State */}
          {result.state === 'invalid' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-1">Invalid Link</h2>
                  <p className="text-sm text-muted-foreground">
                    {result.errorMessage || 'This sign-in link is invalid. Please request a new one.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">Request New Link</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {result.state === 'error' && (
            <div className="space-y-6">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  {result.errorMessage || 'An error occurred while verifying your link.'}
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-3">
                <Button onClick={verifyToken} className="w-full">
                  Try Again
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/signin">Request New Link</Link>
                </Button>
              </div>
            </div>
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

export default function VerifyMagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <VerifyMagicLinkContent />
    </Suspense>
  );
}
