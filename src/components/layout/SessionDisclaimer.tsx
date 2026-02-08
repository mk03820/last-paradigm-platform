import { AlertCircle } from 'lucide-react';

/**
 * Session disclaimer component that warns users their data is session-only.
 */
export function SessionDisclaimer() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderRadius: '0.375rem',
        backgroundColor: 'var(--muted)',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        color: 'var(--muted-foreground)',
      }}
    >
      <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} aria-hidden="true" />
      <p style={{ margin: 0 }}>
        Your data is stored in this browser session only and will be cleared
        when you close this tab.
      </p>
    </div>
  );
}
