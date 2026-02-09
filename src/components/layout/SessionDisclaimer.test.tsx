import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionDisclaimer } from './SessionDisclaimer';

describe('SessionDisclaimer', () => {
  it('renders the session disclaimer message', () => {
    render(<SessionDisclaimer />);

    expect(
      screen.getByText(/Your data is stored in this browser session only/i)
    ).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<SessionDisclaimer />);

    const disclaimer = screen.getByRole('status');
    expect(disclaimer).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen readers', () => {
    render(<SessionDisclaimer />);

    const disclaimer = screen.getByRole('status');
    expect(disclaimer).toHaveAttribute('aria-live', 'polite');
  });

  it('mentions data will be cleared when closing the tab', () => {
    render(<SessionDisclaimer />);

    expect(screen.getByText(/will be cleared when you close this tab/i)).toBeInTheDocument();
  });

  it('uses muted styling', () => {
    render(<SessionDisclaimer />);

    const disclaimer = screen.getByRole('status');
    // Component uses inline styles - verify style attribute contains muted variables
    const style = disclaimer.getAttribute('style') || '';
    expect(style).toContain('muted-foreground');
    expect(style).toContain('--muted');
  });

  it('is non-blocking (does not require user action)', () => {
    render(<SessionDisclaimer />);

    // Should not have a button or dismissible element
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
