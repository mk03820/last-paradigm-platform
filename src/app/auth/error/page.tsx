/**
 * Auth Error Page
 *
 * Displays authentication errors to users.
 * Handles expired tokens, invalid tokens, and other auth failures.
 *
 * Covers:
 * AC3: Expired link error message (15-minute expiry)
 * AC4: Already-used link error message (single-use)
 */

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please try again later.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
  },
  Verification: {
    title: 'Link Expired or Invalid',
    description: 'The magic link has expired or has already been used. Magic links are valid for 15 minutes and can only be used once.',
  },
  OAuthAccountNotLinked: {
    title: 'Email Already in Use',
    description: 'This email is already associated with another account. Please sign in with the original method.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during sign in. Please try again.',
  },
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const error = params.error || 'Default';
  const { title, description } = errorMessages[error] || errorMessages.Default;

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

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link href="/auth/signin">Try signing in again</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Continue without signing in</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-xs text-center text-muted-foreground">
          If you continue to experience issues, please contact support.
        </p>
      </div>
    </main>
  );
}
