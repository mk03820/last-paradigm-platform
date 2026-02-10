/**
 * Tests for DiagnosticProgress component
 *
 * Story 8.5: Diagnostic Tool Hub
 * Story 8.7: Guided Diagnostic Flow (time estimates)
 * Task 8.3: Unit tests for DiagnosticProgress component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagnosticProgress } from './DiagnosticProgress';
import { DIAGNOSTIC_TOOLS } from './diagnostic-constants';

// Mock the useToolStatus hooks
vi.mock('./useToolStatus', () => ({
  useDiagnosticProgress: vi.fn(),
  useToolsWithStatus: vi.fn(),
}));

import { useDiagnosticProgress, useToolsWithStatus } from './useToolStatus';

const mockUseDiagnosticProgress = vi.mocked(useDiagnosticProgress);
const mockUseToolsWithStatus = vi.mocked(useToolsWithStatus);

// Create mock tools with status
const createMockToolsWithStatus = (completedCount: number) =>
  DIAGNOSTIC_TOOLS.map((tool, index) => ({
    ...tool,
    status: index < completedCount ? ('completed' as const) : ('not_started' as const),
    resultSummary: null,
  }));

describe('DiagnosticProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useToolsWithStatus
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(0));
  });

  it('displays completion count correctly', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 3,
      inProgressCount: 1,
      totalTools: 7,
      percentage: 43,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(3));

    render(<DiagnosticProgress />);

    expect(screen.getByText('3 of 7 tools completed')).toBeInTheDocument();
  });

  it('displays percentage correctly', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 4,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 57,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(4));

    render(<DiagnosticProgress />);

    expect(screen.getByText('57%')).toBeInTheDocument();
  });

  it('shows in-progress count when present', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 2,
      inProgressCount: 2,
      totalTools: 7,
      percentage: 29,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(2));

    render(<DiagnosticProgress />);

    expect(screen.getByText('(2 in progress)')).toBeInTheDocument();
  });

  it('does not show in-progress count when zero', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 2,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 29,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(2));

    render(<DiagnosticProgress />);

    expect(screen.queryByText(/in progress/)).not.toBeInTheDocument();
  });

  it('shows start message when no tools completed', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 0,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 0,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(0));

    render(<DiagnosticProgress />);

    expect(screen.getByText('Start with any tool to begin your diagnostic journey')).toBeInTheDocument();
  });

  it('shows completion message when all tools completed', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 7,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 100,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(7));

    render(<DiagnosticProgress />);

    expect(screen.getByText('All tools completed! View your Total Cost of Misalignment.')).toBeInTheDocument();
  });

  it('shows remaining tools message for partial progress', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 3,
      inProgressCount: 1,
      totalTools: 7,
      percentage: 43,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(3));

    render(<DiagnosticProgress />);

    expect(screen.getByText('Keep going! 4 tools remaining.')).toBeInTheDocument();
    expect(screen.queryByText('All tools completed! View your Total Cost of Misalignment.')).not.toBeInTheDocument();
  });

  it('renders progress bar with correct aria-label', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 3,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 43,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(3));

    render(<DiagnosticProgress />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Diagnostic progress: 43%');
  });

  it('applies custom className', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 0,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 0,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(0));

    const { container } = render(<DiagnosticProgress className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows remaining time estimate', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 2,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 29,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(2));

    render(<DiagnosticProgress />);

    // Should show remaining time (total - completed tools' time)
    expect(screen.getByText(/~\d+ min remaining/)).toBeInTheDocument();
  });

  it('shows total time when no tools completed', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 0,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 0,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(0));

    render(<DiagnosticProgress />);

    // Should show total time estimate
    expect(screen.getByText(/Total: ~\d+ min/)).toBeInTheDocument();
  });

  it('hides time estimate when showTimeEstimate is false', () => {
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 2,
      inProgressCount: 0,
      totalTools: 7,
      percentage: 29,
    });
    mockUseToolsWithStatus.mockReturnValue(createMockToolsWithStatus(2));

    render(<DiagnosticProgress showTimeEstimate={false} />);

    expect(screen.queryByText(/~\d+ min remaining/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total: ~\d+ min/)).not.toBeInTheDocument();
  });
});
