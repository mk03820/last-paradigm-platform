/**
 * User Dashboard Page
 *
 * Post-authentication landing page showing user's diagnostic sessions.
 * This is a placeholder for Story 8.2 implementation.
 *
 * Covers: AC5 (redirect to dashboard after authentication)
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, LogOut, User } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">The Last Paradigm</h1>
            <p className="text-sm text-muted-foreground">Your Diagnostic Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{session.user.email}</span>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </form>
          </div>
        </header>

        {/* Welcome message */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Your diagnostic sessions will appear here. Start a new assessment to begin quantifying your alignment tax.
          </p>
        </div>

        {/* Placeholder for sessions - will be implemented in Story 8.2 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Diagnostic Sessions</CardTitle>
            <CardDescription>
              No sessions yet. Start your first diagnostic to see it here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Complete the 7-tool diagnostic to quantify your organization&apos;s alignment tax.
              </p>
              <Button asChild>
                <Link href="/calculator">
                  Start New Diagnostic
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meeting Audit Calculator</CardTitle>
              <CardDescription>
                Tool 2: Quantify the cost of unproductive meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/calculator">Open Calculator</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Templates</CardTitle>
              <CardDescription>
                Work offline with Excel or Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/templates">View Templates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
