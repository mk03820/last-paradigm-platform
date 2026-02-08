import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JourneyContext } from './JourneyContext';

describe('JourneyContext', () => {
  it('renders the journey context section', () => {
    render(<JourneyContext />);

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('explains this is the first step toward full alignment tax diagnosis', () => {
    render(<JourneyContext />);

    expect(screen.getByText(/first step/i)).toBeInTheDocument();
    expect(screen.getByText(/alignment tax/i)).toBeInTheDocument();
  });

  it('mentions "The Last Paradigm" book connection', () => {
    render(<JourneyContext />);

    expect(screen.getByText(/The Last Paradigm/)).toBeInTheDocument();
  });

  it('has accessible labeling', () => {
    render(<JourneyContext />);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Diagnostic journey context');
  });

  it('uses muted, non-intrusive styling', () => {
    render(<JourneyContext />);

    const region = screen.getByRole('region');
    expect(region).toHaveClass('text-muted-foreground');
  });
});
