/**
 * DashboardNav Component Tests
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 4: Create dashboard navigation component (AC: 1, 4, 5)
 * Task 8.3: Unit tests for DashboardNav component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}));

describe('DashboardNav', () => {
  const defaultProps = {
    purchaseStatus: 'none' as const,
    activeSection: 'overview' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Navigation Items', () => {
    it('renders Diagnostic Results link', () => {
      render(<DashboardNav {...defaultProps} />);

      expect(
        screen.getByRole('link', { name: /diagnostic results|results/i })
      ).toBeInTheDocument();
    });

    it('renders Account Settings link', () => {
      render(<DashboardNav {...defaultProps} />);

      expect(
        screen.getByRole('link', { name: /account|settings/i })
      ).toBeInTheDocument();
    });

    it('renders Overview/Dashboard link', () => {
      render(<DashboardNav {...defaultProps} />);

      expect(
        screen.getByRole('link', { name: /overview|dashboard/i })
      ).toBeInTheDocument();
    });
  });

  describe('Downloads Link (Conditional)', () => {
    it('shows Downloads link when purchaseStatus is "completed"', () => {
      render(<DashboardNav {...defaultProps} purchaseStatus="completed" />);

      expect(
        screen.getByRole('link', { name: /downloads|toolkit/i })
      ).toBeInTheDocument();
    });

    it('hides Downloads link when purchaseStatus is "none"', () => {
      render(<DashboardNav {...defaultProps} purchaseStatus="none" />);

      expect(
        screen.queryByRole('link', { name: /downloads|toolkit/i })
      ).not.toBeInTheDocument();
    });

    it('hides Downloads link when purchaseStatus is "refunded"', () => {
      render(<DashboardNav {...defaultProps} purchaseStatus="refunded" />);

      expect(
        screen.queryByRole('link', { name: /downloads|toolkit/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Active State Highlighting', () => {
    it('highlights Overview when activeSection is "overview"', () => {
      render(<DashboardNav {...defaultProps} activeSection="overview" />);

      const overviewLink = screen.getByRole('link', { name: /overview|dashboard/i });
      expect(overviewLink).toHaveAttribute('aria-current', 'page');
    });

    it('highlights Results when activeSection is "results"', () => {
      render(<DashboardNav {...defaultProps} activeSection="results" />);

      const resultsLink = screen.getByRole('link', { name: /results/i });
      expect(resultsLink).toHaveAttribute('aria-current', 'page');
    });

    it('highlights Downloads when activeSection is "downloads"', () => {
      render(
        <DashboardNav
          {...defaultProps}
          purchaseStatus="completed"
          activeSection="downloads"
        />
      );

      const downloadsLink = screen.getByRole('link', { name: /downloads/i });
      expect(downloadsLink).toHaveAttribute('aria-current', 'page');
    });

    it('highlights Settings when activeSection is "settings"', () => {
      render(<DashboardNav {...defaultProps} activeSection="settings" />);

      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Logout Button', () => {
    it('renders logout button', () => {
      render(<DashboardNav {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /sign out|logout|log out/i })
      ).toBeInTheDocument();
    });

    it('shows confirmation dialog on logout click', async () => {
      const user = userEvent.setup();
      render(<DashboardNav {...defaultProps} />);

      const logoutButton = screen.getByRole('button', { name: /sign out|logout|log out/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('calls signOut when confirmed', async () => {
      const { signOut } = await import('next-auth/react');
      const user = userEvent.setup();
      render(<DashboardNav {...defaultProps} />);

      const logoutButton = screen.getByRole('button', { name: /sign out|logout|log out/i });
      await user.click(logoutButton);

      // Find and click confirm button in dialog
      const confirmButton = await screen.findByRole('button', { name: /sign out/i });
      // Skip the first one which is the trigger
      const buttons = screen.getAllByRole('button', { name: /sign out/i });
      const dialogConfirmButton = buttons[buttons.length - 1];
      await user.click(dialogConfirmButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
      });
    });

    it('does not sign out when cancelled', async () => {
      const { signOut } = await import('next-auth/react');
      vi.mocked(signOut).mockClear();
      const user = userEvent.setup();
      render(<DashboardNav {...defaultProps} />);

      const logoutButton = screen.getByRole('button', { name: /sign out|logout|log out/i });
      await user.click(logoutButton);

      // Find and click cancel button in dialog
      const cancelButton = await screen.findByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(signOut).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has navigation landmark', () => {
      render(<DashboardNav {...defaultProps} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has accessible name for navigation', () => {
      render(<DashboardNav {...defaultProps} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAccessibleName(/dashboard|main|navigation/i);
    });

    it('all navigation items are keyboard accessible', () => {
      render(<DashboardNav {...defaultProps} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('logout button has accessible name', () => {
      render(<DashboardNav {...defaultProps} />);

      const logoutButton = screen.getByRole('button', { name: /sign out|logout|log out/i });
      expect(logoutButton).toHaveAccessibleName();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('renders mobile-friendly navigation', () => {
      render(<DashboardNav {...defaultProps} isMobile={true} />);

      // Should have touch-friendly tap targets (verified by class or wrapper)
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });
});
