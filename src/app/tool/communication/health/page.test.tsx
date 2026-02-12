/**
 * Health Dashboard Page Tests
 *
 * Story 13.3: Health Indicators Dashboard
 * Integration tests for the health dashboard page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthDashboardPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock the store
const mockStoreState = {
  email: null as null | { urgentResponseTimeHours: number; distributionListCount: number; avgListSize: number; replyAllFrequency: string },
  chat: null as null | { dmRatioPercent: number; activeChannels: number; crossChannelRedundancyPercent: number; atHereFrequency: string },
  meetings: null as null | { decisionDocumentationRatePercent: number; infoCascadeMeetingsPerWeek: number; pulledFromTool2: boolean },
  analysisResults: null as null | { results: Array<{ patternId: string; detected: boolean; severity: string }> },
  isComplete: false,
};

vi.mock('@/lib/store/tool6-store', () => ({
  useTool6Store: (selector: (state: typeof mockStoreState) => unknown) => selector(mockStoreState),
}));

// Mock Header component
vi.mock('@/components/layout', () => ({
  Header: () => <header data-testid="mock-header">Header</header>,
}));

// Mock ProgressStepper
vi.mock('@/components/diagnostic', () => ({
  ProgressStepper: () => <div data-testid="progress-stepper">Progress Stepper</div>,
}));

describe('HealthDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    mockStoreState.email = null;
    mockStoreState.chat = null;
    mockStoreState.meetings = null;
    mockStoreState.analysisResults = null;
    mockStoreState.isComplete = false;
  });

  describe('with no metrics data', () => {
    it('renders no metrics warning when no data available', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByText('No Metrics Data')).toBeInTheDocument();
      expect(
        screen.getByText(/Please complete the communication metrics input first/)
      ).toBeInTheDocument();
    });

    it('disables continue button when no metrics', () => {
      render(<HealthDashboardPage />);

      const continueButton = screen.getByRole('button', {
        name: /Continue to Interventions/i,
      });
      expect(continueButton).toBeDisabled();
    });

    it('shows link to metrics input', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByRole('link', { name: /Go to Metrics Input/i })).toHaveAttribute(
        'href',
        '/tool/communication'
      );
    });
  });

  describe('with metrics data', () => {
    beforeEach(() => {
      mockStoreState.email = {
        urgentResponseTimeHours: 4,
        distributionListCount: 10,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
      };
      mockStoreState.chat = {
        dmRatioPercent: 30,
        activeChannels: 50,
        crossChannelRedundancyPercent: 10,
        atHereFrequency: 'sometimes',
      };
      mockStoreState.meetings = {
        decisionDocumentationRatePercent: 70,
        infoCascadeMeetingsPerWeek: 2,
        pulledFromTool2: false,
      };
    });

    it('renders health score component when metrics exist', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByText('Overall Health Score')).toBeInTheDocument();
    });

    it('renders health indicators table when metrics exist', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByText('Health Indicators')).toBeInTheDocument();
    });

    it('enables continue button when metrics exist', () => {
      render(<HealthDashboardPage />);

      const continueButton = screen.getByRole('button', {
        name: /Continue to Interventions/i,
      });
      expect(continueButton).not.toBeDisabled();
    });

    it('shows analysis not run message when no analysis results', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByText('Analysis Not Run')).toBeInTheDocument();
    });
  });

  describe('with analysis results', () => {
    beforeEach(() => {
      mockStoreState.email = {
        urgentResponseTimeHours: 4,
        distributionListCount: 10,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
      };
      mockStoreState.analysisResults = {
        results: [
          { patternId: 'broadcast-overload', detected: true, severity: 'high' },
          { patternId: 'tribal-knowledge', detected: true, severity: 'medium' },
          { patternId: 'tool-sprawl', detected: false, severity: 'none' },
        ],
      };
    });

    it('renders detected anti-patterns section', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByText('Detected Anti-Patterns')).toBeInTheDocument();
    });

    it('shows correct count of detected patterns', () => {
      render(<HealthDashboardPage />);

      // 2 of 5 patterns detected
      expect(screen.getByText(/2 of 5 anti-patterns detected/)).toBeInTheDocument();
    });

    it('displays detected pattern names', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByText('Broadcast Overload')).toBeInTheDocument();
      expect(screen.getByText('Tribal Knowledge')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      mockStoreState.email = {
        urgentResponseTimeHours: 4,
        distributionListCount: 10,
        avgListSize: 25,
        replyAllFrequency: 'sometimes',
      };
    });

    it('renders back to analysis link', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByRole('link', { name: /Back to Analysis/i })).toHaveAttribute(
        'href',
        '/tool/communication/analysis'
      );
    });

    it('renders progress stepper', () => {
      render(<HealthDashboardPage />);

      expect(screen.getByTestId('progress-stepper')).toBeInTheDocument();
    });
  });

  describe('page structure', () => {
    it('renders page header', () => {
      render(<HealthDashboardPage />);

      expect(
        screen.getByRole('heading', { name: /Communication Health Dashboard/i })
      ).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<HealthDashboardPage />);

      expect(
        screen.getByText(/See how your communication metrics compare against healthy/)
      ).toBeInTheDocument();
    });
  });
});
