import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionCard } from './SessionCard';
import type { SessionSummary } from '@/types/session.types';

describe('SessionCard', () => {
  const mockSession: SessionSummary = {
    id: 'session-123',
    name: 'Q1 Diagnostic',
    status: 'in_progress',
    toolsCompleted: 3,
    progressPercent: 43,
    lastToolCompleted: 'Meeting Audit Calculator',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnContinue = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders session name', () => {
    render(
      <SessionCard
        session={mockSession}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Q1 Diagnostic')).toBeInTheDocument();
  });

  it('shows "Untitled Session" when name is empty', () => {
    render(
      <SessionCard
        session={{ ...mockSession, name: '' }}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Untitled Session')).toBeInTheDocument();
  });

  it('displays progress information', () => {
    render(
      <SessionCard
        session={mockSession}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('3 of 7 tools')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('displays last completed tool', () => {
    render(
      <SessionCard
        session={mockSession}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Meeting Audit Calculator')).toBeInTheDocument();
  });

  it('shows Continue button for in-progress sessions', () => {
    render(
      <SessionCard
        session={mockSession}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('shows View Results button for completed sessions', () => {
    render(
      <SessionCard
        session={{ ...mockSession, status: 'completed' }}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('calls onContinue when Continue button clicked', async () => {
    render(
      <SessionCard
        session={mockSession}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(mockOnContinue).toHaveBeenCalledWith('session-123');
  });

  it('calls onDelete when Delete button clicked', async () => {
    render(
      <SessionCard
        session={mockSession}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockOnDelete).toHaveBeenCalledWith('session-123');
  });

  it('displays "today" for sessions created today', () => {
    render(
      <SessionCard
        session={mockSession}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/created today/i)).toBeInTheDocument();
  });

  it('displays "yesterday" for sessions created yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    render(
      <SessionCard
        session={{ ...mockSession, createdAt: yesterday }}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/created yesterday/i)).toBeInTheDocument();
  });

  it('displays days ago for recent sessions', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    render(
      <SessionCard
        session={{ ...mockSession, createdAt: threeDaysAgo }}
        onContinue={mockOnContinue}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/created 3 days ago/i)).toBeInTheDocument();
  });
});
