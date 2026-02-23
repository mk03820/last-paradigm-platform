import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionList } from './SessionList';
import type { SessionSummary } from '@/types/session.types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SessionList', () => {
  const mockSessions: SessionSummary[] = [
    {
      id: 'session-1',
      name: 'Q1 Diagnostic',
      status: 'in_progress',
      toolsCompleted: 3,
      progressPercent: 43,
      lastToolCompleted: 'Meeting Audit',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'session-2',
      name: 'Q2 Diagnostic',
      status: 'completed',
      toolsCompleted: 7,
      progressPercent: 100,
      lastToolCompleted: 'Total Cost Calculator',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders sessions from initialSessions prop', () => {
    render(<SessionList initialSessions={mockSessions} />);

    expect(screen.getByText('Q1 Diagnostic')).toBeInTheDocument();
    expect(screen.getByText('Q2 Diagnostic')).toBeInTheDocument();
  });

  it('shows loading state when fetching sessions', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = render(<SessionList />);

    // Should show loading indicator - check for container with centered flex
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no sessions exist', () => {
    render(<SessionList initialSessions={[]} />);

    expect(screen.getByText('No sessions yet')).toBeInTheDocument();
    expect(screen.getByText(/start a new diagnostic/i)).toBeInTheDocument();
  });

  it('fetches sessions on mount when no initialSessions', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: { sessions: mockSessions } }),
    });

    render(<SessionList />);

    await waitFor(() => {
      expect(screen.getByText('Q1 Diagnostic')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/sessions');
  });

  it('shows error state when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: { message: 'Server error' } }),
    });

    render(<SessionList />);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('navigates to diagnostic hub when Continue is clicked', async () => {
    render(<SessionList initialSessions={mockSessions} />);

    const continueButtons = screen.getAllByRole('button', { name: /continue/i });
    fireEvent.click(continueButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/diagnostic?session=session-1');
  });

  it('has delete button for each session', () => {
    render(<SessionList initialSessions={mockSessions} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // One delete button per session
    expect(deleteButtons).toHaveLength(2);
  });

  it('retries fetch when Try again is clicked', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false, error: { message: 'Error' } }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: { sessions: mockSessions } }),
      });

    render(<SessionList />);

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try again'));

    await waitFor(() => {
      expect(screen.getByText('Q1 Diagnostic')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
