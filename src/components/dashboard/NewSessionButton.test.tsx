import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewSessionButton } from './NewSessionButton';

/**
 * NewSessionButton Tests
 *
 * Tests the new session creation button behavior.
 *
 * Story 8.2: User Dashboard and Session Management
 */

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

describe('NewSessionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders button with correct text', () => {
    render(<NewSessionButton />);

    expect(screen.getByRole('button')).toHaveTextContent('Start New Diagnostic');
  });

  it('renders Plus icon', () => {
    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('shows loading state when clicked', async () => {
    // Make fetch hang to test loading state
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('navigates to diagnostic hub on successful creation', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            session: { id: 'new-session-123' },
          },
        }),
    });

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/diagnostic?session=new-session-123');
    });
  });

  it('displays error message on API failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
          error: { message: 'Session limit reached' },
        }),
    });

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Session limit reached')).toBeInTheDocument();
    });
  });

  it('displays default error message when no error message provided', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
        }),
    });

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to create session')).toBeInTheDocument();
    });
  });

  it('displays error on network failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to create session')).toBeInTheDocument();
    });
  });

  it('re-enables button after error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('clears previous error on new click', async () => {
    // First call fails
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to create session')).toBeInTheDocument();
    });

    // Set up successful response for second call
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { session: { id: 'session-456' } },
        }),
    });

    // Click again - error should be cleared
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText('Failed to create session')).not.toBeInTheDocument();
    });
  });

  it('calls API with correct method and headers', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { session: { id: 'session-789' } },
        }),
    });

    render(<NewSessionButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    });
  });
});
