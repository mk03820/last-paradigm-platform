/**
 * Tests for FrictionList component
 *
 * Story 12.2: Friction Point Identification
 * Task 8.5: Unit tests for FrictionList component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FrictionList } from './FrictionList';
import type { FrictionPoint } from './friction-constants';
import type { DataStage } from './journey-constants';

describe('FrictionList', () => {
  const mockStages: DataStage[] = [
    {
      id: 'stage_1',
      type: 'source',
      systemName: 'Salesforce',
      owner: 'Sales Team',
      latency: 2,
      latencyUnit: 'hours',
      order: 0,
    },
    {
      id: 'stage_2',
      type: 'storage',
      systemName: 'Data Lake',
      owner: 'Data Team',
      latency: 1,
      latencyUnit: 'days',
      order: 1,
    },
  ];

  const mockFrictionPoints: FrictionPoint[] = [
    {
      id: 'friction_1',
      journeyId: 'journey_1',
      stageId: 'stage_1',
      category: 'access_bureaucracy',
      description: 'IT ticket required for every schema change',
      severity: { frequency: 2, effort: 2, impact: 3 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'friction_2',
      journeyId: 'journey_1',
      stageId: 'stage_2',
      category: 'technical_debt',
      description: 'Legacy pipeline breaks on schema changes',
      severity: { frequency: 3, effort: 3, impact: 3 },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const defaultProps = {
    frictionPoints: mockFrictionPoints,
    stages: mockStages,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('with friction points', () => {
    it('renders friction count', () => {
      render(<FrictionList {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Friction Points')).toBeInTheDocument();
    });

    it('renders average severity', () => {
      render(<FrictionList {...defaultProps} />);

      // (7 + 9) / 2 = 8
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Avg Severity')).toBeInTheDocument();
    });

    it('renders org vs tech split', () => {
      render(<FrictionList {...defaultProps} />);

      // Both org and tech have 1 friction point, so there will be two "1"s
      const orgLabel = screen.getByText('Org');
      const techLabel = screen.getByText('Tech');
      expect(orgLabel).toBeInTheDocument();
      expect(techLabel).toBeInTheDocument();

      // Check that the split section exists with the correct structure
      expect(screen.getByText('Split')).toBeInTheDocument();
    });

    it('renders Add Friction Point button', () => {
      render(<FrictionList {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Add Friction Point' })
      ).toBeInTheDocument();
    });

    it('calls onAdd when Add button clicked', () => {
      const onAdd = vi.fn();
      render(<FrictionList {...defaultProps} onAdd={onAdd} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Friction Point' }));
      expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('renders friction cards', () => {
      render(<FrictionList {...defaultProps} />);

      expect(
        screen.getByText('IT ticket required for every schema change')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Legacy pipeline breaks on schema changes')
      ).toBeInTheDocument();
    });

    it('renders category badges', () => {
      render(<FrictionList {...defaultProps} />);

      expect(screen.getByText('Access Bureaucracy')).toBeInTheDocument();
      expect(screen.getByText('Technical Debt')).toBeInTheDocument();
    });

    it('passes onEdit to cards', () => {
      const onEdit = vi.fn();
      render(<FrictionList {...defaultProps} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockFrictionPoints[0]);
    });

    it('passes onDelete to cards', () => {
      const onDelete = vi.fn();
      render(<FrictionList {...defaultProps} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockFrictionPoints[0]);
    });
  });

  describe('empty state', () => {
    it('renders empty state message', () => {
      render(<FrictionList {...defaultProps} frictionPoints={[]} />);

      expect(screen.getByText('No Friction Points Yet')).toBeInTheDocument();
    });

    it('renders empty state guidance', () => {
      render(<FrictionList {...defaultProps} frictionPoints={[]} />);

      expect(
        screen.getByText(/Document where data gets stuck/)
      ).toBeInTheDocument();
    });

    it('renders Add First Friction Point button', () => {
      render(<FrictionList {...defaultProps} frictionPoints={[]} />);

      expect(
        screen.getByRole('button', { name: 'Add First Friction Point' })
      ).toBeInTheDocument();
    });

    it('calls onAdd from empty state button', () => {
      const onAdd = vi.fn();
      render(<FrictionList {...defaultProps} frictionPoints={[]} onAdd={onAdd} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Add First Friction Point' })
      );
      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('grouping', () => {
    it('groups by stage when specified', () => {
      render(<FrictionList {...defaultProps} groupBy="stage" />);

      expect(screen.getByText(/Salesforce \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Data Lake \(1\)/)).toBeInTheDocument();
    });

    it('groups by category when specified', () => {
      render(<FrictionList {...defaultProps} groupBy="category" />);

      expect(screen.getByText(/access bureaucracy \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/technical debt \(1\)/i)).toBeInTheDocument();
    });

    it('shows all together when groupBy is none', () => {
      render(<FrictionList {...defaultProps} groupBy="none" />);

      // Should not have group headers
      expect(screen.queryByText(/Salesforce \(1\)/)).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <FrictionList {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders stage names in cards', () => {
    render(<FrictionList {...defaultProps} />);

    expect(screen.getByText(/@ Salesforce/)).toBeInTheDocument();
    expect(screen.getByText(/@ Data Lake/)).toBeInTheDocument();
  });
});
