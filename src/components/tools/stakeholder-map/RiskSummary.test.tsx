/**
 * Tests for RiskSummary component
 *
 * Story 11.3: Sentiment Overlay and Risk Identification
 * Task 6.3: Unit tests for RiskSummary component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskSummary } from './RiskSummary';
import type { Stakeholder } from './stakeholder-constants';

// Helper to create stakeholders
function createStakeholder(
  overrides: Partial<Stakeholder> = {}
): Stakeholder {
  return {
    id: `sh_${Math.random().toString(36).slice(2)}`,
    name: 'Test Stakeholder',
    role: 'Manager',
    power: 5,
    interest: 5,
    ...overrides,
  };
}

describe('RiskSummary', () => {
  it('renders component title', () => {
    render(<RiskSummary stakeholders={[]} />);
    expect(screen.getByText('Risk Summary')).toBeInTheDocument();
  });

  it('shows sentiment distribution section', () => {
    render(<RiskSummary stakeholders={[]} />);
    expect(screen.getByText('Sentiment Distribution')).toBeInTheDocument();
  });

  it('displays sentiment counts correctly', () => {
    const stakeholders = [
      createStakeholder({ sentiment: 'supporter' }),
      createStakeholder({ sentiment: 'supporter' }),
      createStakeholder({ sentiment: 'neutral' }),
      createStakeholder({ sentiment: 'blocker' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('2 Supporters')).toBeInTheDocument();
    expect(screen.getByText('1 Neutral')).toBeInTheDocument();
    expect(screen.getByText('1 Blocker')).toBeInTheDocument();
  });

  it('shows singular form for single supporter/blocker', () => {
    const stakeholders = [
      createStakeholder({ sentiment: 'supporter' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('1 Supporter')).toBeInTheDocument();
  });

  it('shows unassigned count when stakeholders have no sentiment', () => {
    const stakeholders = [
      createStakeholder({ sentiment: 'supporter' }),
      createStakeholder({}), // no sentiment
      createStakeholder({}), // no sentiment
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('2 stakeholders without sentiment assigned')).toBeInTheDocument();
  });

  it('shows prompt to assign sentiment when no sentiment assigned', () => {
    const stakeholders = [
      createStakeholder({}),
      createStakeholder({}),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('Assign Sentiment to Identify Risks')).toBeInTheDocument();
  });

  it('shows no risks message when all stakeholders are supporters', () => {
    const stakeholders = [
      createStakeholder({ power: 8, sentiment: 'supporter' }),
      createStakeholder({ power: 9, sentiment: 'supporter' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('No Critical Risks Detected')).toBeInTheDocument();
  });

  it('displays high-power blocker risk', () => {
    const stakeholders = [
      createStakeholder({ name: 'John CEO', power: 9, sentiment: 'blocker' }),
      createStakeholder({ power: 8, sentiment: 'supporter' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('High-Power Blocker')).toBeInTheDocument();
    expect(screen.getByText('1 stakeholder affected')).toBeInTheDocument();
  });

  it('displays no champion risk when no high-power supporters', () => {
    const stakeholders = [
      createStakeholder({ power: 5, sentiment: 'supporter' }),
      createStakeholder({ power: 4, sentiment: 'neutral' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('No High-Power Champion')).toBeInTheDocument();
  });

  it('displays disengaged implementer risk', () => {
    const stakeholders = [
      // keep_informed quadrant (low power, high interest) with blocker sentiment
      createStakeholder({ power: 3, interest: 8, sentiment: 'blocker' }),
      createStakeholder({ power: 9, sentiment: 'supporter' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('Disengaged Implementer')).toBeInTheDocument();
  });

  it('shows risk count badge when risks exist', () => {
    const stakeholders = [
      createStakeholder({ power: 9, sentiment: 'blocker' }),
      createStakeholder({ power: 8, sentiment: 'supporter' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    expect(screen.getByText('1 risk')).toBeInTheDocument();
  });

  it('shows plural risks badge when multiple risks', () => {
    const stakeholders = [
      createStakeholder({ power: 9, sentiment: 'blocker' }),
      createStakeholder({ power: 3, interest: 8, sentiment: 'blocker' }),
      createStakeholder({ power: 5, sentiment: 'neutral' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    // Should have critical, high (no champion), and medium risks
    expect(screen.getByText(/\d+ risks/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <RiskSummary stakeholders={[]} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('RiskSummary risk details', () => {
  it('shows affected stakeholders in risk item', async () => {
    const stakeholders = [
      createStakeholder({ name: 'Jane CEO', role: 'CEO', power: 9, sentiment: 'blocker' }),
      createStakeholder({ power: 8, sentiment: 'supporter' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    // Click to expand the risk item
    const trigger = screen.getByText('High-Power Blocker');
    trigger.click();

    // Should show affected stakeholder details
    expect(await screen.findByText('Jane CEO')).toBeInTheDocument();
    expect(screen.getByText('(CEO)')).toBeInTheDocument();
  });

  it('shows mitigation suggestion in risk item', async () => {
    const stakeholders = [
      createStakeholder({ power: 9, sentiment: 'blocker' }),
      createStakeholder({ power: 8, sentiment: 'supporter' }),
    ];

    render(<RiskSummary stakeholders={stakeholders} />);

    // Click to expand the risk item
    const trigger = screen.getByText('High-Power Blocker');
    trigger.click();

    expect(await screen.findByText('Suggested Mitigation:')).toBeInTheDocument();
    expect(screen.getByText(/Schedule direct conversations/)).toBeInTheDocument();
  });
});
