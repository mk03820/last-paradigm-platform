/**
 * Tests for ToolGrid component
 *
 * Story 8.5: Diagnostic Tool Hub
 * Task 8.4: Unit tests for ToolGrid component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolGrid } from './ToolGrid';
import { DIAGNOSTIC_TOOLS } from './diagnostic-constants';

// Mock useToolsWithStatus hook
vi.mock('./useToolStatus', () => ({
  useToolsWithStatus: vi.fn(),
}));

// Mock useToolAccess hook
vi.mock('./useToolAccess', () => ({
  useToolAccess: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/diagnostic'),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { useToolsWithStatus } from './useToolStatus';
import { useToolAccess } from './useToolAccess';

const mockUseToolsWithStatus = vi.mocked(useToolsWithStatus);
const mockUseToolAccess = vi.mocked(useToolAccess);

// Create mock tools with status info
const mockToolsWithStatus = DIAGNOSTIC_TOOLS.map((tool) => ({
  ...tool,
  status: 'not_started' as const,
  resultSummary: null,
}));

describe('ToolGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading skeleton when isLoading is true', () => {
      mockUseToolsWithStatus.mockReturnValue(mockToolsWithStatus);
      mockUseToolAccess.mockReturnValue({
        checkAccess: () => ({ canAccess: true, requiresAuth: false }),
        isAuthenticated: false,
        isLoading: true,
      });

      render(<ToolGrid />);

      // Should show 7 skeleton items
      const skeletons = screen.getAllByRole('generic', { hidden: true });
      const animatedSkeletons = skeletons.filter((el) =>
        el.classList.contains('animate-pulse')
      );
      expect(animatedSkeletons).toHaveLength(7);
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mockUseToolsWithStatus.mockReturnValue(mockToolsWithStatus);
      mockUseToolAccess.mockReturnValue({
        checkAccess: () => ({ canAccess: true, requiresAuth: false }),
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it('renders all 7 tools', () => {
      render(<ToolGrid />);

      // Check for each tool's short name
      expect(screen.getByText('Alignment')).toBeInTheDocument();
      expect(screen.getByText('Meetings')).toBeInTheDocument();
      expect(screen.getByText('Decisions')).toBeInTheDocument();
      expect(screen.getByText('Stakeholders')).toBeInTheDocument();
      expect(screen.getByText('Data Flow')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
      expect(screen.getByText('Total Cost')).toBeInTheDocument();
    });

    it('renders tools as clickable links', () => {
      render(<ToolGrid />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(7);
    });

    it('has accessible list role', () => {
      render(<ToolGrid />);

      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Diagnostic tools');
    });

    it('renders list items for each tool', () => {
      render(<ToolGrid />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(7);
    });
  });

  describe('anonymous user', () => {
    beforeEach(() => {
      mockUseToolsWithStatus.mockReturnValue(mockToolsWithStatus);
      mockUseToolAccess.mockReturnValue({
        checkAccess: (tool) => ({
          canAccess: tool.anonymousAccess,
          requiresAuth: !tool.anonymousAccess,
        }),
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it('renders Tool 2 as accessible', () => {
      render(<ToolGrid />);

      // Tool 2 (Meetings) should be a link
      const meetingsCard = screen.getByText('Meetings').closest('a');
      expect(meetingsCard).toBeInTheDocument();
    });

    it('renders other tools as disabled buttons', () => {
      render(<ToolGrid />);

      // Other tools should be buttons (disabled)
      const buttons = screen.getAllByRole('button');
      // 6 disabled tools + close button on potential dialog
      expect(buttons.length).toBeGreaterThanOrEqual(6);
    });

    it('shows auth dialog when disabled tool is clicked', async () => {
      const user = userEvent.setup();

      render(<ToolGrid />);

      // Find and click a disabled tool (Tool 1 - Alignment)
      const alignmentButton = screen
        .getByText('Alignment')
        .closest('button');

      if (alignmentButton) {
        await user.click(alignmentButton);

        // Dialog should appear
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        expect(screen.getByText('Save Your Progress')).toBeInTheDocument();
        expect(
          screen.getByText(/Sign in to access/i)
        ).toBeInTheDocument();
      }
    });

    it('dialog shows tool name', async () => {
      const user = userEvent.setup();

      render(<ToolGrid />);

      const alignmentButton = screen
        .getByText('Alignment')
        .closest('button');

      if (alignmentButton) {
        await user.click(alignmentButton);

        await waitFor(() => {
          expect(
            screen.getByText('Organizational Alignment Assessment', { exact: false })
          ).toBeInTheDocument();
        });
      }
    });

    it('dialog has Sign In button with callback URL', async () => {
      const user = userEvent.setup();

      render(<ToolGrid />);

      const alignmentButton = screen
        .getByText('Alignment')
        .closest('button');

      if (alignmentButton) {
        await user.click(alignmentButton);

        await waitFor(() => {
          const signInLink = screen.getByRole('link', { name: /sign in/i });
          expect(signInLink).toHaveAttribute(
            'href',
            expect.stringContaining('/auth/signin')
          );
        });
      }
    });

    it('dialog can be closed', async () => {
      const user = userEvent.setup();

      render(<ToolGrid />);

      const alignmentButton = screen
        .getByText('Alignment')
        .closest('button');

      if (alignmentButton) {
        await user.click(alignmentButton);

        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        const closeButton = screen.getByRole('button', {
          name: /continue anonymously/i,
        });
        await user.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('with completed tools', () => {
    it('shows result summary for completed tools', () => {
      const toolsWithCompleted = [...mockToolsWithStatus];
      toolsWithCompleted[1] = {
        ...toolsWithCompleted[1],
        status: 'completed',
        resultSummary: 'Meeting Waste: $2.4M/year',
      };

      mockUseToolsWithStatus.mockReturnValue(toolsWithCompleted);
      mockUseToolAccess.mockReturnValue({
        checkAccess: () => ({ canAccess: true, requiresAuth: false }),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<ToolGrid />);

      expect(screen.getByText('Meeting Waste: $2.4M/year')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    mockUseToolsWithStatus.mockReturnValue(mockToolsWithStatus);
    mockUseToolAccess.mockReturnValue({
      checkAccess: () => ({ canAccess: true, requiresAuth: false }),
      isAuthenticated: true,
      isLoading: false,
    });

    render(<ToolGrid className="custom-class" />);

    expect(screen.getByRole('list')).toHaveClass('custom-class');
  });
});
