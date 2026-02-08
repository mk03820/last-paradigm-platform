import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section
      role="region"
      aria-labelledby="hero-heading"
      style={{
        padding: '3rem 1rem',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <h1
        id="hero-heading"
        style={{
          fontSize: '2.25rem',
          fontWeight: 600,
          lineHeight: 1.25,
          marginBottom: '1.5rem',
          color: 'var(--foreground)',
        }}
      >
        Your CEO handed you a book. Now what?
      </h1>

      <p
        style={{
          fontSize: '1.125rem',
          lineHeight: 1.625,
          marginBottom: '2rem',
          color: 'var(--muted-foreground)',
          maxWidth: '32rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Quantify the hidden cost of misaligned meetings and discover exactly
        how much &quot;alignment tax&quot; your organization pays every week.
      </p>

      {/* Mode Selection */}
      <div
        role="group"
        aria-label="Choose your diagnostic path"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
            marginBottom: '0.5rem',
          }}
        >
          Choose your path:
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%',
            maxWidth: '20rem',
          }}
        >
          {/* Primary CTA - Guided Path */}
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-medium px-8 py-6 w-full"
          >
            <Link href="/calculator" aria-label="Let Us Guide You - Recommended option for step-by-step analysis">
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span>Let Us Guide You</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>(Recommended)</span>
              </span>
            </Link>
          </Button>

          {/* Secondary CTA - Download Path */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base font-medium px-8 py-6 w-full border-2"
          >
            <Link href="/templates" aria-label="Run It Yourself - Download templates for offline work">
              Run It Yourself
            </Link>
          </Button>
        </div>

        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--muted-foreground)',
            marginTop: '0.5rem',
            maxWidth: '24rem',
          }}
        >
          Choose guided for step-by-step analysis, or download a template for offline work.
        </p>
      </div>
    </section>
  );
}
