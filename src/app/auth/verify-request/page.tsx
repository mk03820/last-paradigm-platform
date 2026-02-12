/**
 * Verify Request Page
 *
 * Shown after user submits their email for magic link.
 * Instructs user to check their email for the sign-in link.
 *
 * Covers: FR2-1, FR2-2 (Magic link flow)
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
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyRequestPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md min-w-[320px] space-y-6">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              A sign-in link has been sent to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to sign in to your account.
              </p>
              <p className="text-sm text-muted-foreground">
                The link will expire in <strong className="text-foreground">15 minutes</strong>.
              </p>
            </div>

            <div className="border-t pt-6 space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Didn&apos;t receive the email?
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/signin">Try a different email</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
