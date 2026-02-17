/**
 * WelcomeSection Component Tests
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 2: Create welcome section component (AC: 1)
 * Task 8.1: Unit tests for WelcomeSection component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';

// Mock the time for consistent greeting tests
const mockDate = (hour: number) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  vi.useFakeTimers();
  vi.setSystemTime(date);
};

describe('WelcomeSection', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('User display', () => {
    it('displays user email when provided', () => {
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it('displays user name when provided', () => {
      render(
        <WelcomeSection user={{ email: 'test@example.com', name: 'John Doe' }} />
      );

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('prefers name over email when both are provided', () => {
      render(
        <WelcomeSection user={{ email: 'test@example.com', name: 'John Doe' }} />
      );

      // Name should be in the greeting
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('John Doe');
    });

    it('falls back to email when name is not provided', () => {
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('test@example.com');
    });
  });

  describe('Time-based greeting', () => {
    it('shows "Good morning" between 5am and 12pm', () => {
      mockDate(9);
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      expect(screen.getByText(/Good morning/i)).toBeInTheDocument();
    });

    it('shows "Good afternoon" between 12pm and 5pm', () => {
      mockDate(14);
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      expect(screen.getByText(/Good afternoon/i)).toBeInTheDocument();
    });

    it('shows "Good evening" between 5pm and 9pm', () => {
      mockDate(19);
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      expect(screen.getByText(/Good evening/i)).toBeInTheDocument();
    });

    it('shows "Good evening" after 9pm', () => {
      mockDate(22);
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      expect(screen.getByText(/Good evening/i)).toBeInTheDocument();
    });

    it('shows "Good evening" before 5am', () => {
      mockDate(3);
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      expect(screen.getByText(/Good evening/i)).toBeInTheDocument();
    });
  });

  describe('Last login display', () => {
    it('displays last login date when provided', () => {
      const lastLogin = new Date('2026-02-10T10:30:00Z');
      render(
        <WelcomeSection
          user={{ email: 'test@example.com' }}
          lastLogin={lastLogin}
        />
      );

      expect(screen.getByText(/Last login/i)).toBeInTheDocument();
    });

    it('does not display last login when not provided', () => {
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      expect(screen.queryByText(/Last login/i)).not.toBeInTheDocument();
    });

    it('formats last login date in a readable format', () => {
      const lastLogin = new Date('2026-02-10T10:30:00Z');
      render(
        <WelcomeSection
          user={{ email: 'test@example.com' }}
          lastLogin={lastLogin}
        />
      );

      // Should show a human-readable date (Feb 10)
      expect(screen.getByText(/Feb 10/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has an h1 heading for the page title', () => {
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('uses proper semantic structure', () => {
      render(<WelcomeSection user={{ email: 'test@example.com' }} />);

      // Should have a section wrapper with accessible name
      const section = screen.getByRole('region', { name: /welcome/i });
      expect(section).toBeInTheDocument();
    });
  });
});
