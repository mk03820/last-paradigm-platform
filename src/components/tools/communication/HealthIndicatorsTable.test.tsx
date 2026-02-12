/**
 * HealthIndicatorsTable Component Tests
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 9.3: Unit tests for HealthIndicatorsTable
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthIndicatorsTable, IndicatorStatusSummary } from './HealthIndicatorsTable';
import type { HealthIndicatorResult } from './comm-constants';
import { HEALTH_INDICATORS } from './comm-constants';

// Generate mock results for all indicators
const createMockResults = (
  statusMap: Record<string, { value: number | null; status: 'healthy' | 'warning' | 'crisis' }>
): HealthIndicatorResult[] => {
  return HEALTH_INDICATORS.map((indicator) => {
    const override = statusMap[indicator.id] || { value: 10, status: 'warning' };
    return {
      indicatorId: indicator.id,
      value: override.value,
      status: override.status,
      evidence: `Test evidence for ${indicator.id}`,
    };
  });
};

// Default results - all warning status
const defaultResults = createMockResults({});

// All healthy results
const allHealthyResults = createMockResults({
  'email-response-time': { value: 2, status: 'healthy' },
  'broadcast-intensity': { value: 200, status: 'healthy' },
  'dm-ratio': { value: 20, status: 'healthy' },
  'channel-count': { value: 30, status: 'healthy' },
  'cross-post-rate': { value: 5, status: 'healthy' },
  'decision-doc-rate': { value: 80, status: 'healthy' },
  'info-cascade-meetings': { value: 1, status: 'healthy' },
});

// Mixed results
const mixedResults = createMockResults({
  'email-response-time': { value: 2, status: 'healthy' },
  'broadcast-intensity': { value: 2000, status: 'warning' },
  'dm-ratio': { value: 80, status: 'crisis' },
  'channel-count': { value: 30, status: 'healthy' },
  'cross-post-rate': { value: 40, status: 'warning' },
  'decision-doc-rate': { value: 15, status: 'crisis' },
  'info-cascade-meetings': { value: 1, status: 'healthy' },
});

describe('HealthIndicatorsTable', () => {
  it('renders table headers correctly', () => {
    render(<HealthIndicatorsTable results={defaultResults} />);

    expect(screen.getByText('Health Indicators')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Metric' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'My Value' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Healthy' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Warning' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Crisis' })).toBeInTheDocument();
  });

  it('renders all category headers', () => {
    render(<HealthIndicatorsTable results={defaultResults} />);

    // Use getAllByText since categories appear in both desktop table and mobile view
    expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chat/Messaging').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Meetings').length).toBeGreaterThanOrEqual(1);
  });

  it('renders category icons', () => {
    render(<HealthIndicatorsTable results={defaultResults} />);

    // Icons appear in both desktop and mobile views
    expect(screen.getAllByText('📧').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('💬').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('📅').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all indicator names', () => {
    render(<HealthIndicatorsTable results={defaultResults} />);

    // Indicator names appear in both desktop and mobile views
    expect(screen.getAllByText('Urgent Email Response Time').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Distribution List Intensity').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Direct Message Ratio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Active Channel Count').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cross-Channel Redundancy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Decision Documentation Rate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Information Cascade Meetings').length).toBeGreaterThanOrEqual(1);
  });

  it('renders status indicators for healthy results', () => {
    render(<HealthIndicatorsTable results={allHealthyResults} />);

    // Should have multiple green indicators
    const greenIndicators = screen.getAllByText('🟢');
    expect(greenIndicators.length).toBeGreaterThan(0);
  });

  it('renders mixed status indicators', () => {
    render(<HealthIndicatorsTable results={mixedResults} />);

    // Should have a mix of indicators
    expect(screen.getAllByText('🟢').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🟡').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🔴').length).toBeGreaterThan(0);
  });

  it('handles empty results gracefully', () => {
    render(<HealthIndicatorsTable results={[]} />);

    // Should still render category headers (in both desktop and mobile views)
    expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(1);
  });
});

describe('IndicatorStatusSummary', () => {
  it('renders correct counts for all healthy', () => {
    render(<IndicatorStatusSummary results={allHealthyResults} />);

    expect(screen.getByText('7 Healthy')).toBeInTheDocument();
    expect(screen.getByText('0 Warning')).toBeInTheDocument();
    expect(screen.getByText('0 Crisis')).toBeInTheDocument();
  });

  it('renders correct counts for mixed results', () => {
    render(<IndicatorStatusSummary results={mixedResults} />);

    expect(screen.getByText('3 Healthy')).toBeInTheDocument();
    expect(screen.getByText('2 Warning')).toBeInTheDocument();
    expect(screen.getByText('2 Crisis')).toBeInTheDocument();
  });

  it('renders status icons', () => {
    render(<IndicatorStatusSummary results={mixedResults} />);

    expect(screen.getByText('🟢')).toBeInTheDocument();
    expect(screen.getByText('🟡')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('excludes null values from counts', () => {
    const resultsWithNull: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: 1, status: 'healthy', evidence: '' },
      { indicatorId: 'b', value: null, status: 'warning', evidence: '' },
      { indicatorId: 'c', value: 3, status: 'crisis', evidence: '' },
    ];

    render(<IndicatorStatusSummary results={resultsWithNull} />);

    // Null values shouldn't count as warnings
    expect(screen.getByText('1 Healthy')).toBeInTheDocument();
    expect(screen.getByText('0 Warning')).toBeInTheDocument();
    expect(screen.getByText('1 Crisis')).toBeInTheDocument();
  });
});
