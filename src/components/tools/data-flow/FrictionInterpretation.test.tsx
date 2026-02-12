/**
 * Tests for FrictionInterpretation component
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 8.2: Unit tests for FrictionInterpretation component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FrictionInterpretation } from './FrictionInterpretation';
import type { FrictionCategory } from './friction-constants';

describe('FrictionInterpretation', () => {
  // Organizational dominant: >= 70% organizational
  const organizationalDominant: Record<FrictionCategory, number> = {
    access_bureaucracy: 45000,
    quality_degradation: 35000,
    multiple_sources: 10000, // Total org: 90,000 (90%)
    technical_debt: 10000, // Total tech: 10,000 (10%)
  };

  // Technical dominant: <= 30% organizational
  const technicalDominant: Record<FrictionCategory, number> = {
    access_bureaucracy: 5000,
    quality_degradation: 5000,
    multiple_sources: 5000, // Total org: 15,000 (15%)
    technical_debt: 85000, // Total tech: 85,000 (85%)
  };

  // Balanced: between 30% and 70% organizational
  const balancedFriction: Record<FrictionCategory, number> = {
    access_bureaucracy: 25000,
    quality_degradation: 15000,
    multiple_sources: 10000, // Total org: 50,000 (50%)
    technical_debt: 50000, // Total tech: 50,000 (50%)
  };

  describe('organizational dominant interpretation', () => {
    it('shows organizational headline', () => {
      render(<FrictionInterpretation costByCategory={organizationalDominant} />);

      expect(
        screen.getByText(/Friction is primarily organizational/i)
      ).toBeInTheDocument();
    });

    it('shows organizational percentage badge', () => {
      render(<FrictionInterpretation costByCategory={organizationalDominant} />);

      expect(screen.getByText('90% Organizational')).toBeInTheDocument();
    });

    it('shows organizational recommendations', () => {
      render(<FrictionInterpretation costByCategory={organizationalDominant} />);

      expect(
        screen.getByText(/Review data access policies and approval workflows/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Establish single sources of truth/)
      ).toBeInTheDocument();
    });

    it('shows organizational description', () => {
      render(<FrictionInterpretation costByCategory={organizationalDominant} />);

      expect(
        screen.getByText(/Most data friction comes from process and governance issues/)
      ).toBeInTheDocument();
    });
  });

  describe('technical dominant interpretation', () => {
    it('shows technical headline', () => {
      render(<FrictionInterpretation costByCategory={technicalDominant} />);

      expect(
        screen.getByText(/Friction is primarily technical/i)
      ).toBeInTheDocument();
    });

    it('shows technical percentage badge', () => {
      render(<FrictionInterpretation costByCategory={technicalDominant} />);

      // The badge shows the organizational percentage, but type label says "Technical"
      // when technical is dominant
      expect(screen.getByText('15% Technical')).toBeInTheDocument();
    });

    it('shows technical recommendations', () => {
      render(<FrictionInterpretation costByCategory={technicalDominant} />);

      expect(
        screen.getByText(/Prioritize technical debt reduction/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Evaluate modern data platform options/)
      ).toBeInTheDocument();
    });
  });

  describe('balanced interpretation', () => {
    it('shows balanced headline', () => {
      render(<FrictionInterpretation costByCategory={balancedFriction} />);

      expect(
        screen.getByText(/Friction is balanced across organizational and technical factors/i)
      ).toBeInTheDocument();
    });

    it('shows balanced recommendations', () => {
      render(<FrictionInterpretation costByCategory={balancedFriction} />);

      expect(
        screen.getByText(/Address quick-win organizational improvements first/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Create roadmap for technical modernization/)
      ).toBeInTheDocument();
    });
  });

  describe('tool references', () => {
    it('shows Tool 6 reference', () => {
      render(<FrictionInterpretation costByCategory={organizationalDominant} />);

      expect(screen.getByText('Tool 6: Data Governance')).toBeInTheDocument();
    });

    it('shows Tool 7 reference', () => {
      render(<FrictionInterpretation costByCategory={organizationalDominant} />);

      expect(screen.getByText('Tool 7: Total Cost of Friction')).toBeInTheDocument();
    });
  });

  it('handles zero cost data', () => {
    const zeroCosts: Record<FrictionCategory, number> = {
      access_bureaucracy: 0,
      quality_degradation: 0,
      multiple_sources: 0,
      technical_debt: 0,
    };

    render(<FrictionInterpretation costByCategory={zeroCosts} />);

    // Should default to balanced interpretation
    expect(
      screen.getByText(/Friction is balanced/i)
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FrictionInterpretation
        costByCategory={organizationalDominant}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
