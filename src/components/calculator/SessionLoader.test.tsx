import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionLoader } from './SessionLoader';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock calculator store
const mockLoadFromServer = vi.fn();
const mockSetSessionId = vi.fn();
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: () => ({
    loadFromServer: mockLoadFromServer,
    sessionId: null,
    setSessionId: mockSetSessionId,
  }),
}));

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

describe('SessionLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no session ID in URL', () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => null,
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    } as never);

    const { container } = render(<SessionLoader />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when user not authenticated', () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => 'session-123',
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as never);

    const { container } = render(<SessionLoader />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing while auth is loading', () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => 'session-123',
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
    } as never);

    const { container } = render(<SessionLoader />);

    expect(container.firstChild).toBeNull();
  });

  it('shows loading state while fetching session', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => 'session-123',
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    } as never);
    mockLoadFromServer.mockImplementation(() => new Promise(() => {}));

    render(<SessionLoader />);

    await waitFor(() => {
      expect(screen.getByText(/loading your saved progress/i)).toBeInTheDocument();
    });
  });

  it('calls loadFromServer with session ID', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => 'session-123',
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    } as never);
    mockLoadFromServer.mockResolvedValue(true);

    render(<SessionLoader />);

    await waitFor(() => {
      expect(mockLoadFromServer).toHaveBeenCalledWith('session-123');
    });
  });

  it('shows error when loadFromServer returns false', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => 'session-123',
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    } as never);
    mockLoadFromServer.mockResolvedValue(false);

    render(<SessionLoader />);

    await waitFor(() => {
      expect(screen.getByText(/could not load session/i)).toBeInTheDocument();
    });
  });

  it('shows error when loadFromServer throws', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => 'session-123',
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    } as never);
    mockLoadFromServer.mockRejectedValue(new Error('Network error'));

    render(<SessionLoader />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load session/i)).toBeInTheDocument();
    });
  });

  it('renders nothing after successful load', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => 'session-123',
    } as never);
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    } as never);
    mockLoadFromServer.mockResolvedValue(true);

    const { container } = render(<SessionLoader />);

    await waitFor(() => {
      expect(mockLoadFromServer).toHaveBeenCalled();
    });

    // After successful load, should render nothing
    await waitFor(() => {
      expect(container.querySelector('.bg-destructive')).toBeNull();
    });
  });
});
