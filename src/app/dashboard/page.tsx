/**
 * User Dashboard Page
 *
 * Shows user's diagnostic sessions and all 7 diagnostic tools with progress.
 *
 * Covers: FR2-3 (View saved sessions), FR2-4 (Cross-device continuity), FR2-37 (Tool Hub)
 * Story 8.2: User Dashboard and Session Management
 * Story 8.5: Diagnostic Tool Hub
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticSessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { SessionList, NewSessionButton, SessionMigrator } from '@/components/dashboard';
import { toSessionSummary } from '@/types/session.types';
import { DiagnosticProgress, ToolGrid } from '@/components/diagnostic';

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch user's sessions server-side for initial render
  const sessions = await db
    .select()
    .from(diagnosticSessions)
    .where(eq(diagnosticSessions.userId, session.user.id))
    .orderBy(desc(diagnosticSessions.updatedAt));

  const sessionSummaries = sessions.map(toSessionSummary);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b mb-8">
          <div>
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
                The Last Paradigm
              </h1>
            </Link>
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

        {/* Session migration for anonymous data */}
        <SessionMigrator />

        {/* Welcome and new session */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Welcome back!
            </h2>
            <p className="text-muted-foreground">
              Continue where you left off or start a new diagnostic assessment.
            </p>
          </div>
          <NewSessionButton />
        </div>

        {/* Diagnostic Progress */}
        <section className="mb-8 p-4 rounded-lg border bg-card" aria-labelledby="progress-heading">
          <h3 id="progress-heading" className="text-lg font-semibold mb-4">Diagnostic Progress</h3>
          <DiagnosticProgress />
        </section>

        {/* Diagnostic Tools */}
        <section className="mb-8" aria-labelledby="tools-heading">
          <h3 id="tools-heading" className="text-lg font-semibold mb-4">Diagnostic Tools</h3>
          <ToolGrid />
        </section>

        {/* Sessions list */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Your Diagnostic Sessions</h3>
          <SessionList initialSessions={sessionSummaries} />
        </section>

        {/* Quick links */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/templates">Download Templates</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
