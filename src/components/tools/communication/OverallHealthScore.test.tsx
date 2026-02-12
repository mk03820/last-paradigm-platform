/**
 * OverallHealthScore Component Tests
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 9.4: Unit tests for OverallHealthScore
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverallHealthScore, HealthScoreBadge } from './OverallHealthScore';
import type { HealthEvaluationResult, HealthIndicatorResult } from './comm-constants';

// Helper to create mock evaluation results
const createMockEvaluation = (
  score: number,
  status: 'healthy' | 'warning' | 'crisis',
  indicatorResults?: HealthIndicatorResult[]
): HealthEvaluationResult => ({
  overallScore: score,
  overallStatus: status,
  evaluatedAt: new Date().toISOString(),
  indicators: indicatorResults || [
    { indicatorId: 'test-1', value: 10, status: 'healthy', evidence: '' },
    { indicatorId: 'test-2', value: 20, status: 'warning', evidence: '' },
    { indicatorId: 'test-3', value: 30, status: 'crisis', evidence: '' },
  ],
});

describe('OverallHealthScore', () => {
  describe('score display', () => {
    it('renders the score value', () => {
      const result = createMockEvaluation(75, 'healthy');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('/100')).toBeInTheDocument();
    });

    it('renders score of 0', () => {
      const result = createMockEvaluation(0, 'crisis');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders score of 100', () => {
      const result = createMockEvaluation(100, 'healthy');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('status display', () => {
    it('renders healthy status with correct label', () => {
      const result = createMockEvaluation(85, 'healthy');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('renders warning status with correct label', () => {
      const result = createMockEvaluation(55, 'warning');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('renders crisis status with correct label', () => {
      const result = createMockEvaluation(25, 'crisis');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('🚨')).toBeInTheDocument();
    });
  });

  describe('interpretation text', () => {
    it('shows healthy interpretation for healthy status', () => {
      const result = createMockEvaluation(85, 'healthy');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('Healthy Communication')).toBeInTheDocument();
      expect(
        screen.getByText(/demonstrates strong communication patterns/i)
      ).toBeInTheDocument();
    });

    it('shows warning interpretation for warning status', () => {
      const result = createMockEvaluation(55, 'warning');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('Mixed Communication Health')).toBeInTheDocument();
      expect(
        screen.getByText(/some communication patterns need attention/i)
      ).toBeInTheDocument();
    });

    it('shows crisis interpretation for crisis status', () => {
      const result = createMockEvaluation(25, 'crisis');
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('Critical Communication Issues')).toBeInTheDocument();
      expect(
        screen.getByText(/immediate intervention is recommended/i)
      ).toBeInTheDocument();
    });
  });

  describe('indicator summary', () => {
    it('renders indicator status counts', () => {
      const indicators: HealthIndicatorResult[] = [
        { indicatorId: '1', value: 1, status: 'healthy', evidence: '' },
        { indicatorId: '2', value: 2, status: 'healthy', evidence: '' },
        { indicatorId: '3', value: 3, status: 'warning', evidence: '' },
        { indicatorId: '4', value: 4, status: 'crisis', evidence: '' },
      ];
      const result = createMockEvaluation(50, 'warning', indicators);
      render(<OverallHealthScore result={result} />);

      expect(screen.getByText('2 Healthy')).toBeInTheDocument();
      expect(screen.getByText('1 Warning')).toBeInTheDocument();
      expect(screen.getByText('1 Crisis')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('provides score information in accessible format', () => {
      const result = createMockEvaluation(67, 'warning');
      render(<OverallHealthScore result={result} />);

      expect(
        screen.getByLabelText(/score: 67 out of 100/i)
      ).toBeInTheDocument();
    });
  });
});

describe('HealthScoreBadge', () => {
  it('renders score in compact format', () => {
    render(<HealthScoreBadge score={75} status="healthy" />);

    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('renders healthy status icon', () => {
    render(<HealthScoreBadge score={85} status="healthy" />);

    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders warning status icon', () => {
    render(<HealthScoreBadge score={55} status="warning" />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders crisis status icon', () => {
    render(<HealthScoreBadge score={20} status="crisis" />);

    expect(screen.getByText('🚨')).toBeInTheDocument();
  });
});
