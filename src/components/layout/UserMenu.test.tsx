import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserMenu } from './UserMenu';

// Mock next-auth/react
const mockSignOut = vi.fn();
vi.mock('next-auth/react', () => ({
  signOut: (options: unknown) => mockSignOut(options),
}));

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user avatar with initial', () => {
    render(<UserMenu user={{ email: 'test@example.com' }} />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of email
  });

  it('shows email in trigger button on larger screens', () => {
    render(<UserMenu user={{ email: 'test@example.com' }} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders trigger with dropdown menu attributes', () => {
    render(<UserMenu user={{ email: 'test@example.com' }} />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('handles missing email gracefully', () => {
    render(<UserMenu user={{ email: null }} />);

    // Should show ? as fallback initial
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('handles user with name but no email', () => {
    render(<UserMenu user={{ name: 'Test User', email: undefined }} />);

    // Should show ? as fallback since we use email for initials
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('capitalizes first letter of email for avatar', () => {
    render(<UserMenu user={{ email: 'john@example.com' }} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
