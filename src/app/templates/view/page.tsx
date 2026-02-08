import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Web-Viewable Template Page
 *
 * Read-only browser view of the Meeting Audit Calculator template.
 * Designed for enterprise environments where external tools may be blocked.
 *
 * Covers: FR1.5-3
 */

export const metadata = {
  title: 'View Template | Meeting Audit Calculator',
  description: 'View the Meeting Audit Calculator template in your browser with all formulas visible.',
};

// Salary band rates (visible for transparency)
const SALARY_BANDS = [
  { name: 'Executive', rate: 150, description: 'C-suite, VP, Executive compensation level' },
  { name: 'Senior', rate: 100, description: 'Director-level, Senior management' },
  { name: 'Mid-Level', rate: 65, description: 'Manager, Senior Individual Contributor' },
  { name: 'Entry', rate: 35, description: 'Junior staff, Entry-level' },
];

export default function ViewTemplatePage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Meeting Audit Calculator
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem' }}>
            Step 1 of 7: Quantify Your Meeting Waste
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
            From &quot;The Last Paradigm&quot; methodology
          </p>
        </div>

        {/* Instructions */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <CardTitle style={{ fontSize: '1rem' }}>How to Use This Template</CardTitle>
          </CardHeader>
          <CardContent>
            <ol style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', paddingLeft: '1.25rem', margin: 0 }}>
              <li style={{ marginBottom: '0.25rem' }}>Note the input fields and their example values below</li>
              <li style={{ marginBottom: '0.25rem' }}>Use the formulas shown to calculate your own meeting waste</li>
              <li style={{ marginBottom: '0.25rem' }}>For easier calculation, download the Excel template or use our guided calculator</li>
            </ol>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <CardTitle style={{ fontSize: '1rem' }}>Meeting Details (Input Fields)</CardTitle>
            <CardDescription>Enter your own values when using the downloadable template</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}>Field</div>
              <div style={{ fontWeight: 600, padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}>Example Value</div>
              <div style={{ fontWeight: 600, padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}>Description</div>

              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>Number of Meetings</div>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', backgroundColor: '#FFFBEB' }}>10</div>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>Recurring meetings per week</div>

              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>Average Attendees</div>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', backgroundColor: '#FFFBEB' }}>6</div>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>People per meeting</div>

              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>Duration (minutes)</div>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', backgroundColor: '#FFFBEB' }}>60</div>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>Average meeting length</div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Bands */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <CardTitle style={{ fontSize: '1rem' }}>Salary Band Distribution</CardTitle>
            <CardDescription>Distribute attendees across bands (must equal total attendees)</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}>Band</div>
              <div style={{ fontWeight: 600, padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}>Count</div>
              <div style={{ fontWeight: 600, padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}>Hourly Rate</div>
              <div style={{ fontWeight: 600, padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}>Description</div>

              {SALARY_BANDS.map((band, i) => (
                <>
                  <div key={`${band.name}-name`} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>{band.name}</div>
                  <div key={`${band.name}-count`} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', backgroundColor: '#FFFBEB' }}>{i === 0 ? 1 : i === 3 ? 1 : 2}</div>
                  <div key={`${band.name}-rate`} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'monospace' }}>${band.rate}/hr</div>
                  <div key={`${band.name}-desc`} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>{band.description}</div>
                </>
              ))}

              <div style={{ padding: '0.5rem', fontWeight: 600 }}>Total</div>
              <div style={{ padding: '0.5rem', fontWeight: 600, fontFamily: 'monospace' }}>6</div>
              <div style={{ padding: '0.5rem', gridColumn: 'span 2', color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>Must equal Average Attendees</div>
            </div>
          </CardContent>
        </Card>

        {/* Formulas */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <CardTitle style={{ fontSize: '1rem' }}>Calculation Formulas</CardTitle>
            <CardDescription>All formulas are transparent and match our platform methodology</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '0.5rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Weighted Hourly Rate</div>
                <code style={{ display: 'block', padding: '0.5rem', backgroundColor: 'var(--background)', borderRadius: '0.25rem', fontSize: '0.8125rem' }}>
                  = (Exec×$150 + Senior×$100 + Mid×$65 + Entry×$35) ÷ Total
                </code>
                <div style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                  Example: (1×150 + 2×100 + 2×65 + 1×35) ÷ 6 = <strong>$85.83/hr</strong>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '0.5rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Cost per Meeting</div>
                <code style={{ display: 'block', padding: '0.5rem', backgroundColor: 'var(--background)', borderRadius: '0.25rem', fontSize: '0.8125rem' }}>
                  = Attendees × (Duration ÷ 60) × Weighted Rate
                </code>
                <div style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                  Example: 6 × (60 ÷ 60) × $85.83 = <strong>$515.00</strong>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '0.5rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Weekly Meeting Waste</div>
                <code style={{ display: 'block', padding: '0.5rem', backgroundColor: 'var(--background)', borderRadius: '0.25rem', fontSize: '0.8125rem' }}>
                  = Number of Meetings × Cost per Meeting
                </code>
                <div style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                  Example: 10 × $515.00 = <strong>$5,150/week</strong>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#FFFBEB', borderRadius: '0.5rem', border: '2px solid var(--accent)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent)' }}>Annual Meeting Waste</div>
                <code style={{ display: 'block', padding: '0.5rem', backgroundColor: 'var(--background)', borderRadius: '0.25rem', fontSize: '0.8125rem' }}>
                  = Weekly Waste × 52 weeks
                </code>
                <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                  Example: $5,150 × 52 = $267,800/year
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alignment Tax Context */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <CardTitle style={{ fontSize: '1rem' }}>Alignment Tax Estimate</CardTitle>
            <CardDescription>Meeting waste typically represents 25-30% of total alignment tax</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Low Estimate (30%)</div>
                <code style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>$267,800 ÷ 0.30</code>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>$892,667</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>High Estimate (25%)</div>
                <code style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>$267,800 ÷ 0.25</code>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>$1,071,200</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTAs */}
        <Card style={{ marginBottom: '1.5rem', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>
              For integrated analysis, PDF export, and the complete 7-step diagnostic:
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button asChild variant="secondary">
                <Link href="/calculator">Use Guided Calculator</Link>
              </Button>
              <Button asChild variant="outline" style={{ borderColor: 'var(--primary-foreground)', color: 'var(--primary-foreground)' }}>
                <a href="/api/templates/excel" download>Download Excel</a>
              </Button>
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
