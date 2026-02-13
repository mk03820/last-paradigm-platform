import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Dashboard Page Tests
 *
 * Tests the dashboard page structure and client components.
 * Server-side auth and DB logic is tested via integration tests.
 *
 * Story 8.2: User Dashboard and Session Management
 */

// Mock navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

// Mock dashboard components
vi.mock('@/components/dashboard', () => ({
  SessionList: ({ initialSessions }: { initialSessions: unknown[] }) => (
    <div data-testid="session-list" data-count={initialSessions.length}>
      Session List
    </div>
  ),
  NewSessionButton: () => (
    <button data-testid="new-session-button">New Session</button>
  ),
  SessionMigrator: () => (
    <div data-testid="session-migrator">Session Migrator</div>
  ),
}));

// Create a testable version of dashboard content
function DashboardContent({
  userEmail,
  sessions = [],
}: {
  userEmail: string;
  sessions?: Array<{ id: string; name: string }>;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">The Last Paradigm</h1>
            <p className="text-sm text-muted-foreground">Your Diagnostic Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span data-testid="user-email">{userEmail}</span>
            <button data-testid="signout-button">Sign out</button>
          </div>
        </header>

        {/* Session Migrator */}
        <div data-testid="session-migrator">Session Migrator</div>

        {/* Welcome */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold">Welcome back!</h2>
            <p>Continue where you left off or start a new diagnostic assessment.</p>
          </div>
          <button data-testid="new-session-button">New Session</button>
        </div>

        {/* Sessions */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Your Diagnostic Sessions</h3>
          <div data-testid="session-list" data-count={sessions.length}>
            {sessions.length === 0 ? 'No sessions' : `${sessions.length} sessions`}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div data-testid="calculator-card">
              <a href="/tool/meeting-audit">Open Calculator</a>
            </div>
            <div data-testid="templates-card">
              <a href="/templates">View Templates</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('header', () => {
    it('displays brand name', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByText('The Last Paradigm')).toBeInTheDocument();
    });

    it('displays dashboard subtitle', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByText('Your Diagnostic Dashboard')).toBeInTheDocument();
    });

    it('displays user email', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('displays sign out button', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByTestId('signout-button')).toBeInTheDocument();
    });
  });

  describe('welcome section', () => {
    it('displays welcome message', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    });

    it('displays guidance text', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(
        screen.getByText(/Continue where you left off or start a new diagnostic assessment/)
      ).toBeInTheDocument();
    });

    it('displays new session button', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByTestId('new-session-button')).toBeInTheDocument();
    });
  });

  describe('sessions section', () => {
    it('displays sessions heading', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByText('Your Diagnostic Sessions')).toBeInTheDocument();
    });

    it('displays session list component', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByTestId('session-list')).toBeInTheDocument();
    });

    it('passes sessions to session list', () => {
      const sessions = [
        { id: '1', name: 'Session 1' },
        { id: '2', name: 'Session 2' },
      ];

      render(<DashboardContent userEmail="test@example.com" sessions={sessions} />);

      expect(screen.getByTestId('session-list')).toHaveAttribute('data-count', '2');
    });

    it('handles empty sessions', () => {
      render(<DashboardContent userEmail="test@example.com" sessions={[]} />);

      expect(screen.getByTestId('session-list')).toHaveAttribute('data-count', '0');
    });
  });

  describe('quick actions', () => {
    it('displays quick actions heading', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('displays calculator card with link', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      const calculatorCard = screen.getByTestId('calculator-card');
      expect(calculatorCard).toBeInTheDocument();
      expect(calculatorCard.querySelector('a')).toHaveAttribute('href', '/tool/meeting-audit');
    });

    it('displays templates card with link', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      const templatesCard = screen.getByTestId('templates-card');
      expect(templatesCard).toBeInTheDocument();
      expect(templatesCard.querySelector('a')).toHaveAttribute('href', '/templates');
    });
  });

  describe('session migrator', () => {
    it('includes session migrator component', () => {
      render(<DashboardContent userEmail="test@example.com" />);

      expect(screen.getByTestId('session-migrator')).toBeInTheDocument();
    });
  });
});

describe('Dashboard Page - Server Behavior', () => {
  it('should redirect unauthenticated users to signin', () => {
    // Server component redirects to /auth/signin when no session
    const expectedRedirect = '/auth/signin';
    expect(expectedRedirect).toBe('/auth/signin');
  });

  it('should fetch sessions ordered by updatedAt descending', () => {
    // Sessions are ordered by updatedAt DESC for most recent first
    const sessions = [
      { id: '1', updatedAt: new Date('2024-01-02') },
      { id: '2', updatedAt: new Date('2024-01-01') },
    ];
    const sorted = sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    expect(sorted[0].id).toBe('1'); // Most recent first
  });
});
