/**
 * HealthIndicatorRow Component Tests
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 9.2: Unit tests for HealthIndicatorRow
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthIndicatorRow, HealthIndicatorCard } from './HealthIndicatorRow';
import type { HealthIndicator, HealthIndicatorResult } from './comm-constants';

// Mock indicator
const mockIndicator: HealthIndicator = {
  id: 'test-indicator',
  name: 'Test Indicator',
  description: 'A test indicator for unit testing',
  category: 'email',
  unit: 'hours',
  direction: 'lower-is-better',
  thresholds: {
    healthy: 4,
    warning: 12,
    crisis: 24,
  },
  getValue: () => 8,
};

const mockPercentageIndicator: HealthIndicator = {
  id: 'test-percentage',
  name: 'Test Percentage',
  description: 'A percentage indicator',
  category: 'chat',
  unit: '%',
  direction: 'higher-is-better',
  thresholds: {
    healthy: 70,
    warning: 40,
    crisis: 25,
  },
  getValue: () => 50,
};

// Mock results
const healthyResult: HealthIndicatorResult = {
  indicatorId: 'test-indicator',
  value: 2,
  status: 'healthy',
  evidence: 'Value is within healthy range',
};

const warningResult: HealthIndicatorResult = {
  indicatorId: 'test-indicator',
  value: 8,
  status: 'warning',
  evidence: 'Value exceeds healthy threshold',
};

const crisisResult: HealthIndicatorResult = {
  indicatorId: 'test-indicator',
  value: 30,
  status: 'crisis',
  evidence: 'Value exceeds crisis threshold',
};

const nullResult: HealthIndicatorResult = {
  indicatorId: 'test-indicator',
  value: null,
  status: 'warning',
  evidence: 'No data available',
};

// Wrapper for table rows
const TableWrapper = ({ children }: { children: React.ReactNode }) => (
  <table>
    <tbody>{children}</tbody>
  </table>
);

describe('HealthIndicatorRow', () => {
  it('renders indicator name', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={warningResult} />
      </TableWrapper>
    );

    expect(screen.getByText('Test Indicator')).toBeInTheDocument();
  });

  it('renders value with correct formatting', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={warningResult} />
      </TableWrapper>
    );

    expect(screen.getByText('8hr')).toBeInTheDocument();
  });

  it('renders healthy status with green indicator', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={healthyResult} />
      </TableWrapper>
    );

    expect(screen.getByText('🟢')).toBeInTheDocument();
    expect(screen.getByText('2hr')).toBeInTheDocument();
  });

  it('renders warning status with yellow indicator', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={warningResult} />
      </TableWrapper>
    );

    expect(screen.getByText('🟡')).toBeInTheDocument();
  });

  it('renders crisis status with red indicator', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={crisisResult} />
      </TableWrapper>
    );

    expect(screen.getByText('🔴')).toBeInTheDocument();
    expect(screen.getByText('30hr')).toBeInTheDocument();
  });

  it('renders dash for null values', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={nullResult} />
      </TableWrapper>
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders threshold values for lower-is-better indicator', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={warningResult} />
      </TableWrapper>
    );

    expect(screen.getByText('<4')).toBeInTheDocument(); // Healthy threshold
    expect(screen.getByText('<12')).toBeInTheDocument(); // Warning threshold
    expect(screen.getByText('>24')).toBeInTheDocument(); // Crisis threshold
  });

  it('renders threshold values for higher-is-better indicator', () => {
    const percentageResult: HealthIndicatorResult = {
      ...warningResult,
      indicatorId: 'test-percentage',
      value: 50,
    };

    render(
      <TableWrapper>
        <HealthIndicatorRow
          indicator={mockPercentageIndicator}
          result={percentageResult}
        />
      </TableWrapper>
    );

    expect(screen.getByText('>70%')).toBeInTheDocument(); // Healthy threshold
    expect(screen.getByText('>40%')).toBeInTheDocument(); // Warning threshold
    expect(screen.getByText('<25%')).toBeInTheDocument(); // Crisis threshold
  });

  it('has tooltip trigger for description', () => {
    render(
      <TableWrapper>
        <HealthIndicatorRow indicator={mockIndicator} result={warningResult} />
      </TableWrapper>
    );

    const infoButton = screen.getByRole('button', {
      name: /info about test indicator/i,
    });
    expect(infoButton).toBeInTheDocument();
  });
});

describe('HealthIndicatorCard', () => {
  it('renders indicator name and description', () => {
    render(
      <HealthIndicatorCard indicator={mockIndicator} result={warningResult} />
    );

    expect(screen.getByText('Test Indicator')).toBeInTheDocument();
    expect(
      screen.getByText('A test indicator for unit testing')
    ).toBeInTheDocument();
  });

  it('renders value with status badge', () => {
    render(
      <HealthIndicatorCard indicator={mockIndicator} result={warningResult} />
    );

    expect(screen.getByText('8hr')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders healthy status with correct styling', () => {
    render(
      <HealthIndicatorCard indicator={mockIndicator} result={healthyResult} />
    );

    expect(screen.getByText('🟢')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('renders crisis status with correct styling', () => {
    render(
      <HealthIndicatorCard indicator={mockIndicator} result={crisisResult} />
    );

    expect(screen.getByText('🔴')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders all threshold values', () => {
    render(
      <HealthIndicatorCard indicator={mockIndicator} result={warningResult} />
    );

    expect(screen.getByText(/Healthy:/)).toBeInTheDocument();
    expect(screen.getByText(/Warning:/)).toBeInTheDocument();
    expect(screen.getByText(/Crisis:/)).toBeInTheDocument();
  });

  it('renders evidence text', () => {
    render(
      <HealthIndicatorCard indicator={mockIndicator} result={warningResult} />
    );

    expect(screen.getByText('Value exceeds healthy threshold')).toBeInTheDocument();
  });
});
