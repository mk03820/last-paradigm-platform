import Link from 'next/link';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';

export default function CalculatorPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', padding: '2rem 1rem' }}>
        {/* Back Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.875rem',
              color: 'var(--muted-foreground)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span aria-hidden="true">&larr;</span>
            Back to Home
          </Link>
        </nav>

        <div style={{ marginBottom: '2rem' }}>
          <StepIndicator currentStep={1} totalSteps={7} stepLabel="Meeting Audit Calculator" />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>
            Meeting Audit Calculator
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)' }}>
            Calculate the alignment tax on your organization&apos;s meetings.
          </p>
        </div>

        {/* Calculator Form with Validation */}
        <CalculatorForm />
      </div>
    </main>
  );
}
