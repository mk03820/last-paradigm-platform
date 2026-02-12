/**
 * InterventionCard Component Tests
 *
 * Story 13.4: Intervention Recommendations
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InterventionCard, InterventionListItem } from './InterventionCard';
import type { RecommendedIntervention } from './comm-constants';

const mockIntervention: RecommendedIntervention = {
  id: 'test-intervention',
  patternId: 'broadcast-overload',
  title: 'Test Intervention Title',
  description: 'This is a test intervention description.',
  impact: 'high',
  effort: 'low',
  priority: 8.5,
  severity: 'high',
};

describe('InterventionCard', () => {
  it('renders intervention title', () => {
    render(<InterventionCard intervention={mockIntervention} />);
    expect(screen.getByText('Test Intervention Title')).toBeInTheDocument();
  });

  it('renders intervention description', () => {
    render(<InterventionCard intervention={mockIntervention} />);
    expect(screen.getByText('This is a test intervention description.')).toBeInTheDocument();
  });

  it('displays impact badge', () => {
    render(<InterventionCard intervention={mockIntervention} />);
    expect(screen.getByText('High Impact')).toBeInTheDocument();
  });

  it('displays effort badge', () => {
    render(<InterventionCard intervention={mockIntervention} />);
    expect(screen.getByText('Low Effort')).toBeInTheDocument();
  });

  it('shows Quick Win badge for high impact + low effort', () => {
    render(<InterventionCard intervention={mockIntervention} />);
    expect(screen.getByText('Quick Win')).toBeInTheDocument();
  });

  it('does not show Quick Win badge for other combinations', () => {
    const lowImpact: RecommendedIntervention = {
      ...mockIntervention,
      impact: 'medium',
    };
    render(<InterventionCard intervention={lowImpact} />);
    expect(screen.queryByText('Quick Win')).not.toBeInTheDocument();
  });

  it('shows pattern badge when showPattern is true', () => {
    render(<InterventionCard intervention={mockIntervention} showPattern />);
    expect(screen.getByText('Broadcast Overload')).toBeInTheDocument();
  });

  it('hides pattern badge when showPattern is false', () => {
    render(<InterventionCard intervention={mockIntervention} showPattern={false} />);
    expect(screen.queryByText('Addresses:')).not.toBeInTheDocument();
  });

  it('renders Playbook 2 link when available', () => {
    const withPlaybook: RecommendedIntervention = {
      ...mockIntervention,
      playbook2Tool: 'Test Template',
      playbook2Link: 'https://example.com',
    };
    render(<InterventionCard intervention={withPlaybook} />);
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('does not render Playbook 2 link when not available', () => {
    render(<InterventionCard intervention={mockIntervention} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <InterventionCard intervention={mockIntervention} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('displays medium impact correctly', () => {
    const mediumImpact: RecommendedIntervention = {
      ...mockIntervention,
      impact: 'medium',
    };
    render(<InterventionCard intervention={mediumImpact} />);
    expect(screen.getByText('Medium Impact')).toBeInTheDocument();
  });

  it('displays high effort correctly', () => {
    const highEffort: RecommendedIntervention = {
      ...mockIntervention,
      effort: 'high',
    };
    render(<InterventionCard intervention={highEffort} />);
    expect(screen.getByText('High Effort')).toBeInTheDocument();
  });
});

describe('InterventionListItem', () => {
  it('renders intervention title', () => {
    render(<InterventionListItem intervention={mockIntervention} />);
    expect(screen.getByText('Test Intervention Title')).toBeInTheDocument();
  });

  it('renders index number when provided', () => {
    render(<InterventionListItem intervention={mockIntervention} index={0} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not render index when not provided', () => {
    render(<InterventionListItem intervention={mockIntervention} />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows pattern name', () => {
    render(<InterventionListItem intervention={mockIntervention} />);
    expect(screen.getByText(/Broadcast Overload/)).toBeInTheDocument();
  });

  it('shows severity in description', () => {
    render(<InterventionListItem intervention={mockIntervention} />);
    expect(screen.getByText(/high severity/)).toBeInTheDocument();
  });

  it('shows truncated description', () => {
    render(<InterventionListItem intervention={mockIntervention} />);
    expect(screen.getByText('This is a test intervention description.')).toBeInTheDocument();
  });

  it('shows impact badge', () => {
    render(<InterventionListItem intervention={mockIntervention} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <InterventionListItem intervention={mockIntervention} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
