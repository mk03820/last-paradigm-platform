/**
 * Shared Results Page
 *
 * Public read-only view of diagnostic results via share token.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 5.4: Create shared results page (AC: 5)
 * Covers: FR64 (Shared view without edit options)
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { diagnosticResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ArrowRight, Lock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ResultsHero, ResultsGrid } from '@/components/dashboard/results';
import type { ResultsHeroData, ToolResultsData } from '@/components/dashboard/results';

interface SharedResultsPageProps {
  params: Promise<{
    token: string;
  }>;
}

/**
 * Decode and validate share token
 */
function decodeShareToken(token: string): { rid: string; exp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const data = JSON.parse(decoded);

    if (!data.rid || !data.exp) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export default async function SharedResultsPage({ params }: SharedResultsPageProps) {
  const { token } = await params;

  // Decode the share token
  const tokenData = decodeShareToken(token);

  if (!tokenData) {
    notFound();
  }

  // Check if token is expired
  if (Date.now() > tokenData.exp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold mb-2">Link Expired</h1>
            <p className="text-muted-foreground mb-6">
              This shared results link has expired. Please request a new link from the
              results owner.
            </p>
            <Button asChild>
              <Link href="/">
                Go to Homepage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch the diagnostic result
  const result = await db
    .select({
      id: diagnosticResults.id,
      toolResults: diagnosticResults.toolResults,
      totalAlignmentTax: diagnosticResults.totalAlignmentTax,
      estimatedSavings: diagnosticResults.estimatedSavings,
      completedAt: diagnosticResults.completedAt,
    })
    .from(diagnosticResults)
    .where(eq(diagnosticResults.id, tokenData.rid))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const diagnosticResult = result[0];

  // Prepare hero data
  const tool1Data = diagnosticResult.toolResults?.tool1;
  const compositeScore = tool1Data?.compositeScore ?? null;

  const heroData: ResultsHeroData = {
    totalAlignmentTax: diagnosticResult.totalAlignmentTax
      ? Number(diagnosticResult.totalAlignmentTax)
      : null,
    estimatedSavings: diagnosticResult.estimatedSavings
      ? Number(diagnosticResult.estimatedSavings)
      : null,
    compositeScore,
    completedAt: diagnosticResult.completedAt?.toISOString() || null,
    sessionName: null, // Don't expose session name in shared view
  };

  const toolResults = diagnosticResult.toolResults as ToolResultsData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-primary/5 border-b px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Shared Diagnostic Results</span>
            <span className="text-muted-foreground/50">|</span>
            <span>The Last Paradigm</span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/">Run Your Own Diagnostic</Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Read-only indicator */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground">
          <Lock className="h-3 w-3" />
          Read-only view
        </div>

        {/* Hero Section (no share/recalculate buttons in shared view) */}
        <ResultsHero results={heroData} />

        {/* Tool Results Grid */}
        <ResultsGrid toolResults={toolResults} />

        {/* CTA to run own diagnostic */}
        <div className="mt-12 p-8 bg-primary/5 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">
            Want to Know Your Organization&apos;s Alignment Tax?
          </h2>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Run the complete 7-tool diagnostic from &quot;The Last Paradigm&quot; methodology
            to uncover your organization&apos;s hidden costs.
          </p>
          <Button asChild size="lg">
            <Link href="/">
              Start Your Diagnostic
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>
          Powered by{' '}
          <Link href="/" className="text-foreground hover:underline">
            The Last Paradigm
          </Link>
        </p>
      </footer>
    </div>
  );
}
