/**
 * Tests for ProgressStepper component
 *
 * Story 8.6: Progress Stepper Navigation
 * Task 9.1: Unit tests for ProgressStepper component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressStepper } from './ProgressStepper';
import { DIAGNOSTIC_TOOLS } from './diagnostic-constants';

// Mock useToolsWithStatus hook
vi.mock('./useToolStatus', () => ({
  useToolsWithStatus: vi.fn(),
  useDiagnosticProgress: vi.fn(),
}));

// Mock useToolAccess hook
vi.mock('./useToolAccess', () => ({
  useToolAccess: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { useToolsWithStatus, useDiagnosticProgress } from './useToolStatus';
import { useToolAccess } from './useToolAccess';

const mockUseToolsWithStatus = vi.mocked(useToolsWithStatus);
const mockUseDiagnosticProgress = vi.mocked(useDiagnosticProgress);
const mockUseToolAccess = vi.mocked(useToolAccess);

// Create mock tools with status info
const mockToolsWithStatus = DIAGNOSTIC_TOOLS.map((tool, index) => ({
  ...tool,
  status: index < 2 ? ('completed' as const) : index === 2 ? ('in_progress' as const) : ('not_started' as const),
  resultSummary: index < 2 ? 'Completed' : null,
}));

describe('ProgressStepper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToolsWithStatus.mockReturnValue(mockToolsWithStatus);
    mockUseDiagnosticProgress.mockReturnValue({
      completedCount: 2,
      inProgressCount: 1,
      totalTools: 7,
      percentage: 29,
    });
    mockUseToolAccess.mockReturnValue({
      checkAccess: () => ({ canAccess: true, requiresAuth: false }),
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('renders navigation with correct aria-label', () => {
    render(<ProgressStepper currentToolId="alignment" />);

    expect(screen.getByRole('navigation', { name: 'Diagnostic progress' })).toBeInTheDocument();
  });

  it('shows progress summary text', () => {
    render(<ProgressStepper currentToolId="alignment" />);

    expect(screen.getByText('2 of 7 completed (1 in progress)')).toBeInTheDocument();
  });

  it('highlights current tool with aria-current', () => {
    render(<ProgressStepper currentToolId="alignment" />);

    const currentLink = screen.getByRole('link', { name: /Tool 1.*current/i });
    expect(currentLink).toHaveAttribute('aria-current', 'step');
  });

  it('shows completed status for completed tools', () => {
    render(<ProgressStepper currentToolId="decision-velocity" />);

    // Tools 1 and 2 should be marked as completed in the accessible name
    const tool1Link = screen.getByRole('link', { name: /Tool 1.*completed/i });
    expect(tool1Link).toBeInTheDocument();
  });

  it('renders all 7 tool links on desktop', () => {
    render(<ProgressStepper currentToolId="alignment" />);

    const links = screen.getAllByRole('link');
    // 7 tool links in desktop nav
    expect(links.length).toBeGreaterThanOrEqual(7);
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProgressStepper currentToolId="alignment" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows loading state when isLoading is true', () => {
    mockUseToolAccess.mockReturnValue({
      checkAccess: () => ({ canAccess: true, requiresAuth: false }),
      isAuthenticated: false,
      isLoading: true,
    });

    render(<ProgressStepper currentToolId="alignment" />);

    // Should not show navigation when loading
    expect(screen.queryByRole('navigation', { name: 'Diagnostic progress' })).not.toBeInTheDocument();
  });

  it('links to correct tool routes', () => {
    render(<ProgressStepper currentToolId="alignment" />);

    const meetingAuditLink = screen.getByRole('link', { name: /Tool 2/i });
    expect(meetingAuditLink).toHaveAttribute('href', '/tool/meeting-audit');
  });

  describe('mobile stepper', () => {
    it('renders mobile dropdown button', () => {
      render(<ProgressStepper currentToolId="alignment" />);

      const mobileButton = screen.getByRole('button', { name: /Tool 1 of 7/i });
      expect(mobileButton).toBeInTheDocument();
    });

    it('shows current tool name in mobile button', () => {
      render(<ProgressStepper currentToolId="decision-velocity" />);

      expect(screen.getByText(/Tool 3 of 7: Decisions/)).toBeInTheDocument();
    });
  });

  describe('progress without in-progress tools', () => {
    it('does not show in-progress count when zero', () => {
      mockUseDiagnosticProgress.mockReturnValue({
        completedCount: 2,
        inProgressCount: 0,
        totalTools: 7,
        percentage: 29,
      });

      render(<ProgressStepper currentToolId="alignment" />);

      expect(screen.getByText('2 of 7 completed')).toBeInTheDocument();
      expect(screen.queryByText(/in progress/)).not.toBeInTheDocument();
    });
  });
});
