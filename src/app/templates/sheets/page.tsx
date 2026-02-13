'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Google Sheets Template Page
 *
 * Provides access to the Meeting Audit Calculator as a Google Sheets template.
 * Users can make a copy to their own Google Drive.
 *
 * Covers: FR1.5-2
 */

// Google Sheets template URL - update this with the actual published template URL
// Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/copy
const GOOGLE_SHEETS_TEMPLATE_URL = 'https://docs.google.com/spreadsheets/d/1example-sheet-id/copy';

// Set to true when the Google Sheet is ready
const TEMPLATE_READY = false;

export default function GoogleSheetsPage() {
  // Auto-redirect to Google Sheets if template is ready
  useEffect(() => {
    if (TEMPLATE_READY) {
      window.open(GOOGLE_SHEETS_TEMPLATE_URL, '_blank', 'noopener,noreferrer');
    }
  }, []);

  if (TEMPLATE_READY) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto', padding: '3rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Opening Google Sheets...
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
            A new tab should open with the template. Click &quot;Make a copy&quot; to save it to your Google Drive.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button asChild>
              <a href={GOOGLE_SHEETS_TEMPLATE_URL} target="_blank" rel="noopener noreferrer">
                Open Template Manually
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/templates">Back to Templates</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Template not ready - show coming soon with Excel alternative
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto', padding: '3rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Google Sheets Template
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Access the Meeting Audit Calculator in Google Sheets
          </p>
        </div>

        {/* Coming Soon Notice */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Google Sheets template is being prepared
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
              Our Google Sheets template will include:
            </p>
            <ul style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
              <li>One-click &quot;Make a copy&quot; to your Google Drive</li>
              <li>All formulas visible and matching our platform methodology</li>
              <li>Real-time collaboration with your team</li>
              <li>Access from any device with a browser</li>
              <li>Automatic cloud saving</li>
            </ul>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <Card style={{ marginBottom: '2rem', backgroundColor: 'var(--muted)' }}>
          <CardContent style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              In the meantime, try these alternatives:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>Download Excel and upload to Google Drive</span>
                <Button asChild size="sm" variant="outline">
                  <a href="/api/templates/excel" download>Download Excel</a>
                </Button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>Use our guided calculator online</span>
                <Button asChild size="sm" variant="outline">
                  <Link href="/tool/meeting-audit">Start Calculator</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div style={{ textAlign: 'center' }}>
          <Button asChild variant="ghost">
            <Link href="/templates">← Back to Templates</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
