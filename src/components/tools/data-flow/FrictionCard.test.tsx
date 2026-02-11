/**
 * Tests for FrictionCard component
 *
 * Story 12.2: Friction Point Identification
 * Task 8.4: Unit tests for FrictionCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FrictionCard } from './FrictionCard';
import type { FrictionPoint } from './friction-constants';
import type { DataStage } from './journey-constants';

describe('FrictionCard', () => {
  const mockFrictionPoint: FrictionPoint = {
    id: 'friction_1',
    journeyId: 'journey_1',
    stageId: 'stage_1',
    category: 'access_bureaucracy',
    description: 'IT ticket required for every schema change',
    severity: { frequency: 2, effort: 2, impact: 3 },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockStage: DataStage = {
    id: 'stage_1',
    type: 'source',
    systemName: 'Salesforce',
    owner: 'Sales Team',
    latency: 2,
    latencyUnit: 'hours',
    order: 0,
  };

  it('renders friction description', () => {
    render(<FrictionCard frictionPoint={mockFrictionPoint} />);

    expect(
      screen.getByText('IT ticket required for every schema change')
    ).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<FrictionCard frictionPoint={mockFrictionPoint} />);

    expect(screen.getByText('Access Bureaucracy')).toBeInTheDocument();
  });

  it('renders severity score', () => {
    render(<FrictionCard frictionPoint={mockFrictionPoint} />);

    // Total is 2+2+3 = 7
    expect(screen.getByText(/7.*High/)).toBeInTheDocument();
  });

  it('renders severity breakdown', () => {
    render(<FrictionCard frictionPoint={mockFrictionPoint} />);

    expect(screen.getByText(/Freq: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Effort: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Impact: 3/)).toBeInTheDocument();
  });

  it('renders stage name when provided', () => {
    render(<FrictionCard frictionPoint={mockFrictionPoint} stage={mockStage} />);

    expect(screen.getByText(/@ Salesforce/)).toBeInTheDocument();
  });

  it('shows Unknown stage when no stage provided', () => {
    render(<FrictionCard frictionPoint={mockFrictionPoint} />);

    expect(screen.getByText(/@ Unknown stage/)).toBeInTheDocument();
  });

  it('shows Edit button when onEdit provided', () => {
    const onEdit = vi.fn();
    render(<FrictionCard frictionPoint={mockFrictionPoint} onEdit={onEdit} />);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('shows Delete button when onDelete provided', () => {
    const onDelete = vi.fn();
    render(<FrictionCard frictionPoint={mockFrictionPoint} onDelete={onDelete} />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('hides buttons when no callbacks provided', () => {
    render(<FrictionCard frictionPoint={mockFrictionPoint} />);

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('calls onEdit with friction point when Edit clicked', () => {
    const onEdit = vi.fn();
    render(<FrictionCard frictionPoint={mockFrictionPoint} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(mockFrictionPoint);
  });

  it('calls onDelete with friction point when Delete clicked', () => {
    const onDelete = vi.fn();
    render(<FrictionCard frictionPoint={mockFrictionPoint} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(mockFrictionPoint);
  });

  it('applies critical styling for high severity', () => {
    const criticalFriction: FrictionPoint = {
      ...mockFrictionPoint,
      severity: { frequency: 3, effort: 3, impact: 3 }, // Total: 9
    };

    const { container } = render(<FrictionCard frictionPoint={criticalFriction} />);

    // Check for critical styling (ring-2 ring-red-500/50)
    expect(container.querySelector('.ring-red-500\\/50')).toBeInTheDocument();
  });

  it('does not apply critical styling for low severity', () => {
    const lowFriction: FrictionPoint = {
      ...mockFrictionPoint,
      severity: { frequency: 1, effort: 1, impact: 1 }, // Total: 3
    };

    const { container } = render(<FrictionCard frictionPoint={lowFriction} />);

    expect(container.querySelector('.ring-red-500\\/50')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FrictionCard frictionPoint={mockFrictionPoint} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders different categories correctly', () => {
    const technicalDebt: FrictionPoint = {
      ...mockFrictionPoint,
      category: 'technical_debt',
    };

    render(<FrictionCard frictionPoint={technicalDebt} />);

    expect(screen.getByText('Technical Debt')).toBeInTheDocument();
  });

  it('renders quality degradation category', () => {
    const qualityDeg: FrictionPoint = {
      ...mockFrictionPoint,
      category: 'quality_degradation',
    };

    render(<FrictionCard frictionPoint={qualityDeg} />);

    expect(screen.getByText('Quality Degradation')).toBeInTheDocument();
  });

  it('renders multiple sources category', () => {
    const multipleSources: FrictionPoint = {
      ...mockFrictionPoint,
      category: 'multiple_sources',
    };

    render(<FrictionCard frictionPoint={multipleSources} />);

    expect(screen.getByText('Multiple Sources of Truth')).toBeInTheDocument();
  });
});
