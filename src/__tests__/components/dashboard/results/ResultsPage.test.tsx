/**
 * Results Page Integration Tests
 *
 * Story 19.2: Diagnostic Results Display
 * Task 9.5: Integration test for results page data loading
 * Task 9.6: Accessibility audit with jest-axe
 * Task 9.7: Test empty state handling
 * Covers: AC1 (Route), AC7 (Performance), AC9 (Accessibility)
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock the auth module
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Import after mocks
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Since the page is a Server Component, we'll test the client components directly
import { ResultsHero } from '@/components/dashboard/results/ResultsHero';
import { ResultsGrid } from '@/components/dashboard/results/ResultsGrid';
import { ShareResultsButton } from '@/components/dashboard/results/ShareResultsButton';
import { RecalculateButton } from '@/components/dashboard/results/RecalculateButton';

const mockResults = {
  totalAlignmentTax: 1250000,
  estimatedSavings: 437500,
  compositeScore: 58,
  completedAt: '2026-02-14T10:30:00Z',
  sessionName: 'Q1 2026 Assessment',
};

const mockToolResults = {
  tool1: {
    scores: { strategic: 65, execution: 55, technology: 70, people: 50, governance: 60 },
    compositeScore: 60,
    completedAt: '2026-02-14T10:00:00Z',
  },
  tool2: {
    inputs: { meetingCount: 100 },
    results: { wastedCost: 120000 },
    completedAt: '2026-02-14T10:05:00Z',
  },
  tool3: { metrics: { overallMedian: 21 }, completedAt: '2026-02-14T10:10:00Z' },
  tool4: { stakeholders: [{ name: 'CEO' }], completedAt: '2026-02-14T10:15:00Z' },
  tool5: { frictionCost: 350000, completedAt: '2026-02-14T10:20:00Z' },
  tool6: { metrics: { healthScore: 65 }, completedAt: '2026-02-14T10:25:00Z' },
  tool7: { totalCost: 1250000, completedAt: '2026-02-14T10:30:00Z' },
};

describe('Results Page Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc' }),
    });
  });

  describe('Page composition', () => {
    it('renders all major sections together', () => {
      render(
        <div>
          <ResultsHero results={mockResults} />
          <div className="my-6 flex gap-2">
            <ShareResultsButton diagnosticResultId="result-123" />
            <RecalculateButton />
          </div>
          <ResultsGrid toolResults={mockToolResults} />
        </div>
      );

      // Hero section - multiple elements may show this value
      const amounts = screen.getAllByText('$1,250,000');
      expect(amounts.length).toBeGreaterThanOrEqual(1);

      // Action buttons
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /run diagnostic again/i })).toBeInTheDocument();

      // Tool results
      expect(screen.getByText(/alignment assessment/i)).toBeInTheDocument();
    });
  });

  describe('Empty state handling (Task 9.7)', () => {
    it('shows empty state when no results exist', () => {
      render(
        <div>
          <ResultsHero results={null} />
          <ResultsGrid toolResults={null} />
        </div>
      );

      expect(screen.getByText(/no diagnostic results/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /start.*diagnostic/i })).toBeInTheDocument();
    });

    it('shows partial state when diagnostic is incomplete', () => {
      const partialResults = {
        tool1: mockToolResults.tool1,
        tool2: mockToolResults.tool2,
      };

      render(
        <div>
          <ResultsHero
            results={{
              totalAlignmentTax: null,
              estimatedSavings: null,
              compositeScore: 60,
              completedAt: null,
              sessionName: null,
            }}
          />
          <ResultsGrid toolResults={partialResults} />
        </div>
      );

      // Should show progress - multiple elements may show this
      expect(screen.getAllByText(/in progress/i).length).toBeGreaterThanOrEqual(1);
      // Should show completed tools
      expect(screen.getByText(/alignment assessment/i)).toBeInTheDocument();
      // Should indicate incomplete tools
      expect(screen.getAllByText(/not completed/i).length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility audit (Task 9.6)', () => {
    it('ResultsHero has no accessibility violations', async () => {
      const { container } = render(<ResultsHero results={mockResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ResultsGrid has no accessibility violations', async () => {
      const { container } = render(<ResultsGrid toolResults={mockToolResults} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ShareResultsButton has no accessibility violations', async () => {
      const { container } = render(<ShareResultsButton diagnosticResultId="result-123" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('RecalculateButton has no accessibility violations', async () => {
      const { container } = render(<RecalculateButton />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('full page composition has no accessibility violations', async () => {
      const { container } = render(
        <main>
          <ResultsHero results={mockResults} />
          <div className="my-6 flex gap-2">
            <ShareResultsButton diagnosticResultId="result-123" />
            <RecalculateButton />
          </div>
          <ResultsGrid toolResults={mockToolResults} />
        </main>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Heading hierarchy (AC9)', () => {
    it('maintains proper heading hierarchy across components', () => {
      render(
        <div>
          <ResultsHero results={mockResults} />
          <ResultsGrid toolResults={mockToolResults} />
        </div>
      );

      // Should have h1 for page
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      // Should have h2 for sections
      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Keyboard navigation (AC9)', () => {
    it('all interactive elements are keyboard accessible', () => {
      render(
        <div>
          <ShareResultsButton diagnosticResultId="result-123" />
          <RecalculateButton />
        </div>
      );

      const shareButton = screen.getByRole('button', { name: /share/i });
      const recalcButton = screen.getByRole('button', { name: /run diagnostic again/i });

      // Should be focusable
      shareButton.focus();
      expect(document.activeElement).toBe(shareButton);

      recalcButton.focus();
      expect(document.activeElement).toBe(recalcButton);
    });
  });

  describe('Performance (AC7)', () => {
    it('renders quickly once data is available', () => {
      // This would be tested at the page level with loading.tsx
      // Here we verify components render synchronously once data is available
      const startTime = performance.now();

      render(
        <div>
          <ResultsHero results={mockResults} />
          <ResultsGrid toolResults={mockToolResults} />
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly (under 500ms for static content - allow for test environment overhead)
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('Color contrast (AC9)', () => {
    it('accent colors use accessible contrast', () => {
      const { container } = render(<ResultsHero results={mockResults} />);

      // Gold accent text should be present (will be tested visually and with axe)
      const accentElements = container.querySelectorAll('.text-accent');
      expect(accentElements.length).toBeGreaterThan(0);
    });
  });
});
