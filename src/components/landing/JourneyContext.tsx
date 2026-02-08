/**
 * Journey Context Component
 */

export function JourneyContext() {
  return (
    <section
      role="region"
      aria-label="Diagnostic journey context"
      style={{
        maxWidth: '42rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--muted-foreground)',
        padding: '0 1rem',
      }}
    >
      <p>
        This Meeting Audit Calculator is the{' '}
        <span style={{ fontWeight: 500 }}>first step</span> in diagnosing your
        organization&apos;s alignment tax. Based on the framework from{' '}
        <cite style={{ fontWeight: 500, fontStyle: 'normal' }}>The Last Paradigm</cite>, you&apos;ll
        uncover how misalignment costs you time and money.
      </p>
    </section>
  );
}
