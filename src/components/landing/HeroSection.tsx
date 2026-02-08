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

      <Button
        asChild
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-medium px-8 py-6"
      >
        <Link href="/calculator">Start Diagnostic</Link>
      </Button>
    </section>
  );
}
