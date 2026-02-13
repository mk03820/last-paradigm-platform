import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/tool/meeting-audit',
}));

// Mock UserMenu to simplify tests
vi.mock('./UserMenu', () => ({
  UserMenu: ({ user }: { user: { email?: string } }) => (
    <div data-testid="user-menu">{user.email}</div>
  ),
}));

import { useSession } from 'next-auth/react';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand name by default', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByText('The Last Paradigm')).toBeInTheDocument();
  });

  it('hides brand name when showBrand is false', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<Header showBrand={false} />);

    expect(screen.queryByText('The Last Paradigm')).not.toBeInTheDocument();
  });

  it('shows loading skeleton while session loads', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    });

    render(<Header />);

    // Should show skeleton, not sign in or user menu
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
  });

  it('shows Sign In link for unauthenticated users', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<Header />);

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/auth/signin?callbackUrl=%2Ftool%2Fmeeting-audit');
  });

  it('shows UserMenu for authenticated users', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { email: 'test@example.com', id: '123' },
        expires: '2099-01-01',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  it('includes callback URL for current page in sign in link', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<Header />);

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    // Should include encoded /tool/meeting-audit path
    expect(signInLink).toHaveAttribute('href', expect.stringContaining('callbackUrl=%2Ftool%2Fmeeting-audit'));
  });
});
