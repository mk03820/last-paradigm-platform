import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Download Templates | The Last Paradigm Platform',
  description: 'Download Meeting Audit Calculator templates for Excel, Google Sheets, or view in browser.',
};

export default function TemplatesPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto', padding: '3rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--foreground)',
              marginBottom: '1rem',
            }}
          >
            Run It Yourself
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--muted-foreground)',
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Download our Meeting Audit Calculator template and work offline in your preferred spreadsheet application.
          </p>
        </div>

        {/* Template Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {/* Excel Download */}
          <Card>
            <CardHeader style={{ paddingBottom: '0.5rem' }}>
              <CardTitle style={{ fontSize: '1.125rem' }}>Excel Template</CardTitle>
              <CardDescription>
                Download as .xlsx file for Microsoft Excel or compatible applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ul style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0, paddingLeft: '1.25rem' }}>
                  <li>All formulas visible and editable</li>
                  <li>Works offline</li>
                  <li>Under 500KB for easy sharing</li>
                </ul>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <a href="/api/templates/excel" download>
                    Download Excel
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Sheets */}
          <Card>
            <CardHeader style={{ paddingBottom: '0.5rem' }}>
              <CardTitle style={{ fontSize: '1.125rem' }}>Google Sheets</CardTitle>
              <CardDescription>
                Open in Google Sheets and make your own copy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ul style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0, paddingLeft: '1.25rem' }}>
                  <li>Collaborate with your team</li>
                  <li>Access from any device</li>
                  <li>Auto-saves to cloud</li>
                </ul>
                <Button asChild variant="outline">
                  <Link href="/templates/sheets" target="_blank" rel="noopener noreferrer">
                    Open in Sheets
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Web View */}
          <Card>
            <CardHeader style={{ paddingBottom: '0.5rem' }}>
              <CardTitle style={{ fontSize: '1.125rem' }}>View in Browser</CardTitle>
              <CardDescription>
                Read-only view for enterprise environments with restricted access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ul style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0, paddingLeft: '1.25rem' }}>
                  <li>No downloads required</li>
                  <li>See all formulas transparently</li>
                  <li>Works when external tools are blocked</li>
                </ul>
                <Button asChild variant="outline">
                  <Link href="/templates/view">
                    View Template
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card style={{ marginBottom: '2rem', backgroundColor: 'var(--muted)' }}>
          <CardContent style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              All templates include:
            </h3>
            <ul style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Complete Meeting Audit Calculator with all input fields</li>
              <li>Visible formulas matching our platform methodology exactly</li>
              <li>Clear instructions for offline use</li>
              <li>Salary band rates and calculation assumptions</li>
              <li>Link back to platform for integrated analysis and PDF export</li>
            </ul>
          </CardContent>
        </Card>

        {/* Back to Guided Path */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--muted-foreground)',
              marginBottom: '1rem',
            }}
          >
            Prefer step-by-step guidance?
          </p>
          <Button asChild variant="outline">
            <Link href="/calculator">Use Guided Calculator</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
