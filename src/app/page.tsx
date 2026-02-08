import { HeroSection } from '@/components/landing/HeroSection';
import { JourneyContext } from '@/components/landing/JourneyContext';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { SessionDisclaimer } from '@/components/layout/SessionDisclaimer';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', padding: '0 1rem' }}>
        {/* Step indicator */}
        <div style={{ paddingTop: '1.5rem', paddingBottom: '0.5rem' }}>
          <StepIndicator />
        </div>

        {/* Main hero section */}
        <HeroSection />

        {/* Journey context */}
        <div style={{ padding: '1.5rem 0' }}>
          <JourneyContext />
        </div>

        {/* Session disclaimer */}
        <div style={{ padding: '1rem 0', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <SessionDisclaimer />
        </div>
      </div>
    </main>
  );
}
