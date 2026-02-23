import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Tool1SessionLoader } from './Tool1SessionLoader';

/**
 * Tool1SessionLoader Tests
 *
 * C3-S3: Tests for Tool 1 session loader integration
 */

// Mock next/navigation
const mockSearchParams = new Map<string, string>();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
}));

// Mock next-auth
const mockAuthSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockAuthSession(),
}));

// Mock the tool1 store
const mockLoadFromServer = vi.fn();
const mockSetSessionId = vi.fn();
vi.mock('@/lib/store/tool1-store', () => ({
  useTool1Store: () => ({
    sessionId: null,
    setSessionId: mockSetSessionId,
    loadFromServer: mockLoadFromServer,
  }),
}));

describe('Tool1SessionLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    mockAuthSession.mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    });
    mockLoadFromServer.mockResolvedValue(true);
  });

  it('renders nothing when there is no session param', () => {
    const { container } = render(<Tool1SessionLoader />);
    expect(container).toBeEmptyDOMElement();
    expect(mockLoadFromServer).not.toHaveBeenCalled();
  });

  it('loads session when session param and auth are present', async () => {
    mockSearchParams.set('session', 'test-session-123');

    render(<Tool1SessionLoader />);

    await waitFor(() => {
      expect(mockLoadFromServer).toHaveBeenCalledWith('test-session-123');
    });
  });

  it('sets sessionId on successful load', async () => {
    mockSearchParams.set('session', 'test-session-123');

    render(<Tool1SessionLoader />);

    await waitFor(() => {
      expect(mockSetSessionId).toHaveBeenCalledWith('test-session-123');
    });
  });

  it('shows loading state while fetching', async () => {
    mockSearchParams.set('session', 'test-session-123');
    mockLoadFromServer.mockImplementation(() => new Promise(() => {}));

    render(<Tool1SessionLoader />);

    await waitFor(() => {
      expect(screen.getByText('Loading your saved progress...')).toBeInTheDocument();
    });
  });

  it('shows error when load fails', async () => {
    mockSearchParams.set('session', 'test-session-123');
    mockLoadFromServer.mockResolvedValue(false);

    render(<Tool1SessionLoader />);

    await waitFor(() => {
      expect(
        screen.getByText('Could not load session. It may not exist or you may not have access.')
      ).toBeInTheDocument();
    });
  });
});
