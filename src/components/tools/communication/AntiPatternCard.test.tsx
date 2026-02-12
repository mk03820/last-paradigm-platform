/**
 * AntiPatternCard Component Tests
 *
 * Tests for the anti-pattern display card.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AntiPatternCard } from './AntiPatternCard';
import type { AntiPattern, DetectionResult } from './comm-constants';

const mockPattern: AntiPattern = {
  id: 'test-pattern',
  name: 'Test Pattern',
  description: 'This is a test anti-pattern description.',
  examples: ['Example 1', 'Example 2', 'Example 3'],
  icon: '🧪',
};

describe('AntiPatternCard', () => {
  it('renders pattern name and description', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: false,
      severity: 'none',
      evidence: [],
      confidence: 1.0,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('Test Pattern')).toBeInTheDocument();
    expect(screen.getByText('This is a test anti-pattern description.')).toBeInTheDocument();
  });

  it('renders pattern icon', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: false,
      severity: 'none',
      evidence: [],
      confidence: 1.0,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('🧪')).toBeInTheDocument();
  });

  it('shows Not Detected badge when pattern not detected', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: false,
      severity: 'none',
      evidence: [],
      confidence: 1.0,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('Not Detected')).toBeInTheDocument();
  });

  it('shows severity badge when pattern is detected', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'high',
      evidence: ['Test evidence'],
      confidence: 0.9,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows medium severity correctly', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'medium',
      evidence: ['Test evidence'],
      confidence: 0.7,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('shows low severity correctly', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'low',
      evidence: ['Test evidence'],
      confidence: 0.5,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('displays evidence when detected', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'medium',
      evidence: ['Evidence item 1', 'Evidence item 2'],
      confidence: 0.8,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('Evidence:')).toBeInTheDocument();
    expect(screen.getByText('Evidence item 1')).toBeInTheDocument();
    expect(screen.getByText('Evidence item 2')).toBeInTheDocument();
  });

  it('does not show evidence when not detected', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: false,
      severity: 'none',
      evidence: [],
      confidence: 1.0,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.queryByText('Evidence:')).not.toBeInTheDocument();
  });

  it('shows confidence indicator when detected', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'medium',
      evidence: ['Test evidence'],
      confidence: 0.85,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('Detection confidence:')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('does not show confidence when not detected', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: false,
      severity: 'none',
      evidence: [],
      confidence: 1.0,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.queryByText('Detection confidence:')).not.toBeInTheDocument();
  });

  it('renders examples accordion', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: false,
      severity: 'none',
      evidence: [],
      confidence: 1.0,
    };

    render(<AntiPatternCard pattern={mockPattern} result={result} />);

    expect(screen.getByText('See examples of this pattern')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: false,
      severity: 'none',
      evidence: [],
      confidence: 1.0,
    };

    const { container } = render(
      <AntiPatternCard pattern={mockPattern} result={result} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies border style when detected', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'high',
      evidence: ['Test'],
      confidence: 0.9,
    };

    const { container } = render(<AntiPatternCard pattern={mockPattern} result={result} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-4');
    expect(card.className).toContain('border-l-red-500');
  });

  it('applies orange border for medium severity', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'medium',
      evidence: ['Test'],
      confidence: 0.7,
    };

    const { container } = render(<AntiPatternCard pattern={mockPattern} result={result} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-orange-500');
  });

  it('applies yellow border for low severity', () => {
    const result: DetectionResult = {
      patternId: 'test-pattern',
      detected: true,
      severity: 'low',
      evidence: ['Test'],
      confidence: 0.5,
    };

    const { container } = render(<AntiPatternCard pattern={mockPattern} result={result} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-yellow-500');
  });
});
