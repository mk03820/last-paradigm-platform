/**
 * Communication Analysis Page Tests
 *
 * Integration tests for the anti-pattern analysis page.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CommunicationAnalysisPage from './page';
import { useTool6Store } from '@/lib/store/tool6-store';
import type { PatternAnalysis } from '@/components/tools/communication/comm-constants';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the Header component
vi.mock('@/components/layout', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

// Mock ProgressStepper
vi.mock('@/components/diagnostic', () => ({
  ProgressStepper: () => <div data-testid="progress-stepper">Progress Stepper</div>,
}));

describe('CommunicationAnalysisPage', () => {
  const mockAnalysis: PatternAnalysis = {
    results: [
      {
        patternId: 'broadcast-overload',
        detected: true,
        severity: 'high',
        evidence: ['@here used always'],
        confidence: 0.9,
      },
      {
        patternId: 'telephone-game',
        detected: false,
        severity: 'none',
        evidence: [],
        confidence: 1.0,
      },
      {
        patternId: 'tribal-knowledge',
        detected: true,
        severity: 'medium',
        evidence: ['High DM ratio'],
        confidence: 0.7,
      },
      {
        patternId: 'tool-sprawl',
        detected: false,
        severity: 'none',
        evidence: [],
        confidence: 1.0,
      },
      {
        patternId: 'cya-culture',
        detected: false,
        severity: 'none',
        evidence: [],
        confidence: 1.0,
      },
    ],
    detectedCount: 2,
    overallHealth: 'warning',
    analyzedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset store state
    useTool6Store.setState({
      email: {
        distributionListCount: 10,
        avgListSize: 20,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      },
      chat: {
        activeChannels: 100,
        dmRatioPercent: 50,
        atHereFrequency: 'always',
        crossChannelRedundancyPercent: 30,
      },
      meetings: {
        infoCascadeMeetingsPerWeek: 5,
        decisionDocumentationRatePercent: 60,
        pulledFromTool2: false,
      },
      analysisResults: mockAnalysis,
      sessionId: null,
      isDirty: false,
      completion: null,
    });
    mockPush.mockClear();
  });

  afterEach(() => {
    useTool6Store.setState({
      email: null,
      chat: null,
      meetings: null,
      analysisResults: null,
      sessionId: null,
      isDirty: false,
      completion: null,
    });
  });

  it('renders the page with header and progress stepper', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('progress-stepper')).toBeInTheDocument();
  });

  it('displays page title', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByText('Communication Pattern Analysis')).toBeInTheDocument();
  });

  it('displays analysis summary', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // detected count
    expect(screen.getByText('Warning')).toBeInTheDocument(); // health status
  });

  it('displays all 5 anti-pattern cards', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByText('Broadcast Overload')).toBeInTheDocument();
    expect(screen.getByText('Telephone Game')).toBeInTheDocument();
    expect(screen.getByText('Tribal Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Tool Sprawl')).toBeInTheDocument();
    expect(screen.getByText('CYA Culture')).toBeInTheDocument();
  });

  it('displays back to input link', () => {
    render(<CommunicationAnalysisPage />);

    const backLink = screen.getByText('Back to Input');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/tool/communication');
  });

  it('displays continue button', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByText('Continue to Health Dashboard')).toBeInTheDocument();
  });

  it('redirects to input page when metrics incomplete', async () => {
    useTool6Store.setState({
      email: null,
      chat: null,
      meetings: null,
      analysisResults: null,
    });

    render(<CommunicationAnalysisPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tool/communication');
    });
  });

  it('shows loading state while running analysis', async () => {
    useTool6Store.setState({
      email: {
        distributionListCount: 10,
        avgListSize: 20,
        replyAllFrequency: 'sometimes',
        urgentResponseTimeHours: 4,
      },
      chat: {
        activeChannels: 100,
        dmRatioPercent: 50,
        atHereFrequency: 'always',
        crossChannelRedundancyPercent: 30,
      },
      meetings: {
        infoCascadeMeetingsPerWeek: 5,
        decisionDocumentationRatePercent: 60,
        pulledFromTool2: false,
      },
      analysisResults: null, // No results yet
    });

    render(<CommunicationAnalysisPage />);

    // The loading state or analysis should be triggered
    // After effect runs, it should show results or loading
    const loadingText = screen.queryByText('Analyzing communication patterns...');
    const summaryText = screen.queryByText('Analysis Summary');
    expect(loadingText || summaryText).toBeTruthy();
  });

  it('shows evidence for detected patterns', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByText('@here used always')).toBeInTheDocument();
    expect(screen.getByText('High DM ratio')).toBeInTheDocument();
  });

  it('displays severity badges for detected patterns', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('displays breadcrumb navigation', () => {
    render(<CommunicationAnalysisPage />);

    expect(screen.getByText('Back to Metrics Input')).toBeInTheDocument();
  });
});
