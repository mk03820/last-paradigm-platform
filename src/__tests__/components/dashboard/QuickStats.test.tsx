/**
 * QuickStats Component Tests
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 3: Create quick stats summary component (AC: 1)
 * Task 8.2: Unit tests for QuickStats component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuickStats } from '@/components/dashboard/QuickStats';

describe('QuickStats', () => {
  describe('Alignment Tax Display', () => {
    it('displays total alignment tax when provided', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 7,
            totalAlignmentTax: 250000,
            estimatedSavings: 75000,
            lastCompletedAt: new Date().toISOString(),
          }}
        />
      );

      expect(screen.getByText(/\$250,000/)).toBeInTheDocument();
    });

    it('formats large numbers with proper separators', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 7,
            totalAlignmentTax: 1500000,
            estimatedSavings: 450000,
            lastCompletedAt: new Date().toISOString(),
          }}
        />
      );

      expect(screen.getByText(/\$1,500,000/)).toBeInTheDocument();
    });

    it('handles null alignment tax gracefully', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 3,
            totalAlignmentTax: null,
            estimatedSavings: null,
            lastCompletedAt: null,
          }}
        />
      );

      // Should show "In Progress" for alignment tax
      const inProgressElements = screen.getAllByText(/In Progress/i);
      expect(inProgressElements.length).toBeGreaterThan(0);
    });
  });

  describe('Estimated Savings Display', () => {
    it('displays estimated savings when provided', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 7,
            totalAlignmentTax: 250000,
            estimatedSavings: 75000,
            lastCompletedAt: new Date().toISOString(),
          }}
        />
      );

      expect(screen.getByText(/\$75,000/)).toBeInTheDocument();
    });

    it('labels the savings amount clearly', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 7,
            totalAlignmentTax: 250000,
            estimatedSavings: 75000,
            lastCompletedAt: new Date().toISOString(),
          }}
        />
      );

      expect(screen.getByText(/estimated savings/i)).toBeInTheDocument();
    });
  });

  describe('Completion Status', () => {
    it('shows 7 of 7 when all tools are complete', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 7,
            totalAlignmentTax: 250000,
            estimatedSavings: 75000,
            lastCompletedAt: new Date().toISOString(),
          }}
        />
      );

      expect(screen.getByText(/7 of 7/)).toBeInTheDocument();
    });

    it('shows partial completion status', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 3,
            totalAlignmentTax: null,
            estimatedSavings: null,
            lastCompletedAt: null,
          }}
        />
      );

      expect(screen.getByText(/3 of 7/)).toBeInTheDocument();
    });

    it('shows remaining tools message when not complete', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 3,
            totalAlignmentTax: null,
            estimatedSavings: null,
            lastCompletedAt: null,
          }}
        />
      );

      expect(screen.getByText(/4 tools remaining/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('handles null diagnosticSummary gracefully', () => {
      render(<QuickStats diagnosticSummary={null} />);

      expect(screen.getByText(/No Diagnostic Started/i)).toBeInTheDocument();
    });

    it('shows call to action when no diagnostics completed', () => {
      render(<QuickStats diagnosticSummary={null} />);

      expect(screen.getByRole('link', { name: /start diagnostic/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has section heading', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 7,
            totalAlignmentTax: 250000,
            estimatedSavings: 75000,
            lastCompletedAt: new Date().toISOString(),
          }}
        />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('uses semantic structure for stats', () => {
      render(
        <QuickStats
          diagnosticSummary={{
            completedTools: 7,
            totalAlignmentTax: 250000,
            estimatedSavings: 75000,
            lastCompletedAt: new Date().toISOString(),
          }}
        />
      );

      // Stats should be in a region
      const region = screen.getByRole('region', { name: /stats|summary|overview/i });
      expect(region).toBeInTheDocument();
    });
  });
});
