import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock calculator store with module-level mocks
const mockMigrateToServer = vi.fn();
const mockClearSession = vi.fn();

vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: vi.fn(),
}));

import { useCalculatorStore } from '@/lib/store/calculator-store';
import { SessionMigrator } from './SessionMigrator';

describe('SessionMigrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no data to migrate', () => {
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: null,
      results: null,
      migrateToServer: mockMigrateToServer,
      clearSession: mockClearSession,
    } as never);

    const { container } = render(<SessionMigrator />);

    expect(container.firstChild).toBeNull();
  });

  it('shows migrating state when data exists', async () => {
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: { meetingCount: 10 },
      results: null,
      migrateToServer: vi.fn().mockImplementation(() => new Promise(() => {})),
      clearSession: mockClearSession,
    } as never);

    render(<SessionMigrator />);

    await waitFor(() => {
      expect(screen.getByText(/saving your progress/i)).toBeInTheDocument();
    });
  });

  it('shows success message after migration', async () => {
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: { meetingCount: 10 },
      results: null,
      migrateToServer: vi.fn().mockResolvedValue('session-123'),
      clearSession: mockClearSession,
    } as never);

    render(<SessionMigrator />);

    await waitFor(() => {
      expect(screen.getByText(/your meeting audit data has been saved/i)).toBeInTheDocument();
    });
  });

  it('clears session after successful migration', async () => {
    const clearSession = vi.fn();
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: { meetingCount: 10 },
      results: null,
      migrateToServer: vi.fn().mockResolvedValue('session-123'),
      clearSession,
    } as never);

    render(<SessionMigrator />);

    await waitFor(() => {
      expect(clearSession).toHaveBeenCalled();
    });
  });

  it('refreshes router after successful migration', async () => {
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: { meetingCount: 10 },
      results: null,
      migrateToServer: vi.fn().mockResolvedValue('session-123'),
      clearSession: mockClearSession,
    } as never);

    render(<SessionMigrator />);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows error when migration returns null', async () => {
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: { meetingCount: 10 },
      results: null,
      migrateToServer: vi.fn().mockResolvedValue(null),
      clearSession: mockClearSession,
    } as never);

    render(<SessionMigrator />);

    await waitFor(() => {
      expect(screen.getByText(/could not save your progress/i)).toBeInTheDocument();
    });
  });

  it('shows error when migration throws', async () => {
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: { meetingCount: 10 },
      results: null,
      migrateToServer: vi.fn().mockRejectedValue(new Error('Network error')),
      clearSession: mockClearSession,
    } as never);

    render(<SessionMigrator />);

    await waitFor(() => {
      expect(screen.getByText(/could not save your progress/i)).toBeInTheDocument();
    });
  });

  it('migrates when only results exist', async () => {
    const migrateToServer = vi.fn().mockResolvedValue('session-123');
    vi.mocked(useCalculatorStore).mockReturnValue({
      meetingData: null,
      results: { meetingWaste: 50000 },
      migrateToServer,
      clearSession: mockClearSession,
    } as never);

    render(<SessionMigrator />);

    await waitFor(() => {
      expect(migrateToServer).toHaveBeenCalled();
    });
  });
});
