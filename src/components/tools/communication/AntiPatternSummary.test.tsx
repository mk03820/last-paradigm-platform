/**
 * AntiPatternSummary Component Tests
 *
 * Tests for the analysis summary component.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AntiPatternSummary } from './AntiPatternSummary';
import type { PatternAnalysis, DetectionResult } from './comm-constants';

function createMockAnalysis(overrides: Partial<PatternAnalysis> = {}): PatternAnalysis {
  return {
    results: overrides.results ?? [],
    detectedCount: overrides.detectedCount ?? 0,
    overallHealth: overrides.overallHealth ?? 'healthy',
    analyzedAt: overrides.analyzedAt ?? new Date().toISOString(),
  };
}

function createMockResult(overrides: Partial<DetectionResult> = {}): DetectionResult {
  return {
    patternId: overrides.patternId ?? 'test',
    detected: overrides.detected ?? false,
    severity: overrides.severity ?? 'none',
    evidence: overrides.evidence ?? [],
    confidence: overrides.confidence ?? 1.0,
  };
}

describe('AntiPatternSummary', () => {
  it('renders summary title', () => {
    const analysis = createMockAnalysis();
    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
  });

  it('displays detected count correctly', () => {
    const analysis = createMockAnalysis({ detectedCount: 3 });
    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('of 5')).toBeInTheDocument();
  });

  it('displays zero detected count', () => {
    const analysis = createMockAnalysis({ detectedCount: 0 });
    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows healthy status badge', () => {
    const analysis = createMockAnalysis({ overallHealth: 'healthy' });
    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('shows warning status badge', () => {
    const analysis = createMockAnalysis({ overallHealth: 'warning' });
    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('shows critical status badge', () => {
    const analysis = createMockAnalysis({ overallHealth: 'critical' });
    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('displays severity distribution when patterns detected', () => {
    const results: DetectionResult[] = [
      createMockResult({ patternId: 'a', detected: true, severity: 'high' }),
      createMockResult({ patternId: 'b', detected: true, severity: 'high' }),
      createMockResult({ patternId: 'c', detected: true, severity: 'medium' }),
      createMockResult({ patternId: 'd', detected: true, severity: 'low' }),
      createMockResult({ patternId: 'e', detected: false, severity: 'none' }),
    ];

    const analysis = createMockAnalysis({
      results,
      detectedCount: 4,
      overallHealth: 'critical',
    });

    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('2 High')).toBeInTheDocument();
    expect(screen.getByText('1 Medium')).toBeInTheDocument();
    expect(screen.getByText('1 Low')).toBeInTheDocument();
  });

  it('does not show severity distribution when no patterns detected', () => {
    const analysis = createMockAnalysis({
      results: [
        createMockResult({ patternId: 'a', detected: false, severity: 'none' }),
      ],
      detectedCount: 0,
    });

    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.queryByText('Severity breakdown')).not.toBeInTheDocument();
  });

  it('only shows non-zero severity counts', () => {
    const results: DetectionResult[] = [
      createMockResult({ patternId: 'a', detected: true, severity: 'medium' }),
      createMockResult({ patternId: 'b', detected: false, severity: 'none' }),
    ];

    const analysis = createMockAnalysis({
      results,
      detectedCount: 1,
    });

    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('1 Medium')).toBeInTheDocument();
    expect(screen.queryByText('High')).not.toBeInTheDocument();
    expect(screen.queryByText('Low')).not.toBeInTheDocument();
  });

  it('displays analyzed timestamp', () => {
    const testDate = new Date('2024-01-15T10:30:00Z');
    const analysis = createMockAnalysis({ analyzedAt: testDate.toISOString() });

    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText(/Analyzed:/)).toBeInTheDocument();
  });

  it('renders health indicator bar', () => {
    const analysis = createMockAnalysis({ overallHealth: 'warning' });
    render(<AntiPatternSummary analysis={analysis} />);

    expect(screen.getByText('Communication health')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const analysis = createMockAnalysis();
    const { container } = render(
      <AntiPatternSummary analysis={analysis} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('shows health icon for healthy status', () => {
    const analysis = createMockAnalysis({ overallHealth: 'healthy' });
    render(<AntiPatternSummary analysis={analysis} />);

    // The badge should contain the healthy icon
    const badge = screen.getByText('Healthy').closest('[data-slot="badge"]');
    expect(badge?.textContent).toContain('✅');
  });

  it('shows health icon for warning status', () => {
    const analysis = createMockAnalysis({ overallHealth: 'warning' });
    render(<AntiPatternSummary analysis={analysis} />);

    const badge = screen.getByText('Warning').closest('[data-slot="badge"]');
    expect(badge?.textContent).toContain('⚠️');
  });

  it('shows health icon for critical status', () => {
    const analysis = createMockAnalysis({ overallHealth: 'critical' });
    render(<AntiPatternSummary analysis={analysis} />);

    const badge = screen.getByText('Critical').closest('[data-slot="badge"]');
    expect(badge?.textContent).toContain('🚨');
  });
});
