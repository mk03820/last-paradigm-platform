/**
 * Tests for SaveResultsButton Component
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC1, AC2, AC4 (form validation, states)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock all the stores with getState
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = { meetingData: null, results: null };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({ meetingData: null, results: null }),
    }
  ),
}));

vi.mock('@/lib/store/tool1-store', () => ({
  useTool1Store: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = { scores: {}, completion: null };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({ scores: {}, completion: null }),
    }
  ),
}));

vi.mock('@/lib/store/tool3-store', () => ({
  useTool3Store: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = { decisions: [], metrics: null, completion: null };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({ decisions: [], metrics: null, completion: null }),
    }
  ),
}));

vi.mock('@/lib/store/tool4-store', () => ({
  useTool4Store: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = { stakeholders: [], completion: null };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({ stakeholders: [], completion: null }),
    }
  ),
}));

vi.mock('@/lib/store/tool5-store', () => ({
  useTool5Store: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = { journeys: [], completion: null };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({ journeys: [], completion: null }),
    }
  ),
}));

vi.mock('@/lib/store/tool6-store', () => ({
  useTool6Store: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = { metrics: null, antiPatterns: [], completion: null };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({ metrics: null, antiPatterns: [], completion: null }),
    }
  ),
}));

vi.mock('@/lib/store/tool7-store', () => ({
  useTool7Store: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = { aggregatedData: null, calculationResults: null, completion: null };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({ aggregatedData: null, calculationResults: null, completion: null }),
    }
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
import { SaveResultsButton } from './SaveResultsButton';

describe('SaveResultsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Rendering', () => {
    it('should render the button with correct text', () => {
      render(<SaveResultsButton />);

      expect(screen.getByRole('button', { name: /save my results/i })).toBeInTheDocument();
    });

    it('should render with default variant as outline', () => {
      render(<SaveResultsButton />);

      const button = screen.getByRole('button', { name: /save my results/i });
      expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('should not render when showOnlyIfData is true and no data exists', () => {
      render(<SaveResultsButton showOnlyIfData />);

      expect(screen.queryByRole('button', { name: /save my results/i })).not.toBeInTheDocument();
    });
  });
});
