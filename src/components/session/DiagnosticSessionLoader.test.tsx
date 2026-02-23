import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DiagnosticSessionLoader, type SessionSyncStore } from './DiagnosticSessionLoader';

/**
 * DiagnosticSessionLoader Tests
 *
 * C3-S2: Tests for the generic session loader component
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

// Create mock store
function createMockStore(overrides?: Partial<SessionSyncStore>): SessionSyncStore {
  return {
    sessionId: null,
    setSessionId: vi.fn(),
    loadFromServer: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('DiagnosticSessionLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    mockAuthSession.mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    });
  });

  it('renders nothing when there is no session param', () => {
    const mockStore = createMockStore();
    const useStore = () => mockStore;

    const { container } = render(
      <DiagnosticSessionLoader useStore={useStore} toolNumber={1} />
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockStore.loadFromServer).not.toHaveBeenCalled();
  });

  it('renders nothing when user is not authenticated', () => {
    mockSearchParams.set('session', 'test-session-123');
    mockAuthSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const mockStore = createMockStore();
    const useStore = () => mockStore;

    const { container } = render(
      <DiagnosticSessionLoader useStore={useStore} toolNumber={1} />
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockStore.loadFromServer).not.toHaveBeenCalled();
  });

  it('renders nothing when auth is still loading', () => {
    mockSearchParams.set('session', 'test-session-123');
    mockAuthSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    const mockStore = createMockStore();
    const useStore = () => mockStore;

    const { container } = render(
      <DiagnosticSessionLoader useStore={useStore} toolNumber={1} />
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockStore.loadFromServer).not.toHaveBeenCalled();
  });

  it('shows loading state while fetching session', async () => {
    mockSearchParams.set('session', 'test-session-123');

    // Make loadFromServer hang
    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockImplementation(() => new Promise(() => {})),
    });
    const useStore = () => mockStore;

    render(<DiagnosticSessionLoader useStore={useStore} toolNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText('Loading your saved progress...')).toBeInTheDocument();
    });
  });

  it('loads session data when session param and auth are present', async () => {
    mockSearchParams.set('session', 'test-session-123');

    const mockStore = createMockStore();
    const useStore = () => mockStore;

    render(<DiagnosticSessionLoader useStore={useStore} toolNumber={1} />);

    await waitFor(() => {
      expect(mockStore.loadFromServer).toHaveBeenCalledWith('test-session-123');
    });
  });

  it('sets sessionId on successful load', async () => {
    mockSearchParams.set('session', 'test-session-123');

    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockResolvedValue(true),
    });
    const useStore = () => mockStore;

    render(<DiagnosticSessionLoader useStore={useStore} toolNumber={1} />);

    await waitFor(() => {
      expect(mockStore.setSessionId).toHaveBeenCalledWith('test-session-123');
    });
  });

  it('shows error when load fails', async () => {
    mockSearchParams.set('session', 'test-session-123');

    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockResolvedValue(false),
    });
    const useStore = () => mockStore;

    render(<DiagnosticSessionLoader useStore={useStore} toolNumber={1} />);

    await waitFor(() => {
      expect(
        screen.getByText('Could not load session. It may not exist or you may not have access.')
      ).toBeInTheDocument();
    });
  });

  it('shows error when load throws', async () => {
    mockSearchParams.set('session', 'test-session-123');

    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockRejectedValue(new Error('Network error')),
    });
    const useStore = () => mockStore;

    render(<DiagnosticSessionLoader useStore={useStore} toolNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load session data.')).toBeInTheDocument();
    });
  });

  it('does not reload if sessionId already matches', async () => {
    mockSearchParams.set('session', 'test-session-123');

    const mockStore = createMockStore({
      sessionId: 'test-session-123', // Already loaded
    });
    const useStore = () => mockStore;

    const { container } = render(
      <DiagnosticSessionLoader useStore={useStore} toolNumber={1} />
    );

    // Wait a bit to ensure no async operations happen
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockStore.loadFromServer).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onLoadComplete callback on success', async () => {
    mockSearchParams.set('session', 'test-session-123');
    const onLoadComplete = vi.fn();

    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockResolvedValue(true),
    });
    const useStore = () => mockStore;

    render(
      <DiagnosticSessionLoader
        useStore={useStore}
        toolNumber={1}
        onLoadComplete={onLoadComplete}
      />
    );

    await waitFor(() => {
      expect(onLoadComplete).toHaveBeenCalledWith(true);
    });
  });

  it('calls onLoadError callback on failure', async () => {
    mockSearchParams.set('session', 'test-session-123');
    const onLoadError = vi.fn();

    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockResolvedValue(false),
    });
    const useStore = () => mockStore;

    render(
      <DiagnosticSessionLoader
        useStore={useStore}
        toolNumber={1}
        onLoadError={onLoadError}
      />
    );

    await waitFor(() => {
      expect(onLoadError).toHaveBeenCalledWith(
        'Could not load session. It may not exist or you may not have access.'
      );
    });
  });

  it('has proper accessibility attributes', async () => {
    mockSearchParams.set('session', 'test-session-123');

    // Make loadFromServer hang to keep loading state
    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockImplementation(() => new Promise(() => {})),
    });
    const useStore = () => mockStore;

    render(<DiagnosticSessionLoader useStore={useStore} toolNumber={1} />);

    await waitFor(() => {
      const loadingDiv = screen.getByRole('status');
      expect(loadingDiv).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('shows error with alert role', async () => {
    mockSearchParams.set('session', 'test-session-123');

    const mockStore = createMockStore({
      loadFromServer: vi.fn().mockResolvedValue(false),
    });
    const useStore = () => mockStore;

    render(<DiagnosticSessionLoader useStore={useStore} toolNumber={1} />);

    await waitFor(() => {
      const errorDiv = screen.getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
    });
  });
});
