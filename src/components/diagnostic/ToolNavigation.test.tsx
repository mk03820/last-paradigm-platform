/**
 * Tests for ToolNavigation component
 *
 * Story 8.6: Progress Stepper Navigation
 * Task 9.3: Unit tests for ToolNavigation component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolNavigation } from './ToolNavigation';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ToolNavigation', () => {
  it('renders navigation with correct aria-label', () => {
    render(<ToolNavigation currentToolNumber={3} />);

    expect(screen.getByRole('navigation', { name: 'Tool navigation' })).toBeInTheDocument();
  });

  it('shows previous and next tool buttons for middle tools', () => {
    render(<ToolNavigation currentToolNumber={3} />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('shows correct previous tool name', () => {
    render(<ToolNavigation currentToolNumber={3} />);

    // Tool 2 is "Meetings"
    expect(screen.getByText('Meetings')).toBeInTheDocument();
  });

  it('shows correct next tool name', () => {
    render(<ToolNavigation currentToolNumber={3} />);

    // Tool 4 is "Stakeholders"
    expect(screen.getByText('Stakeholders')).toBeInTheDocument();
  });

  it('links to correct previous tool route', () => {
    render(<ToolNavigation currentToolNumber={3} />);

    // Previous should link to Tool 2 (/tool/meeting-audit)
    const prevLink = screen.getByRole('link', { name: /Previous.*Meetings/i });
    expect(prevLink).toHaveAttribute('href', '/tool/meeting-audit');
  });

  it('links to correct next tool route', () => {
    render(<ToolNavigation currentToolNumber={3} />);

    // Next should link to Tool 4 (/tool/stakeholder-map)
    const nextLink = screen.getByRole('link', { name: /Next.*Stakeholders/i });
    expect(nextLink).toHaveAttribute('href', '/tool/stakeholder-map');
  });

  it('does not show previous button for Tool 1', () => {
    render(<ToolNavigation currentToolNumber={1} />);

    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('shows next button for Tool 1', () => {
    render(<ToolNavigation currentToolNumber={1} />);

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Meetings')).toBeInTheDocument();
  });

  it('shows "View Total Cost" for Tool 7', () => {
    render(<ToolNavigation currentToolNumber={7} />);

    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('View Total Cost')).toBeInTheDocument();
  });

  it('shows previous button for Tool 7', () => {
    render(<ToolNavigation currentToolNumber={7} />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
  });

  it('includes View All Tools link', () => {
    render(<ToolNavigation currentToolNumber={3} />);

    const hubLink = screen.getByRole('link', { name: 'View All Tools' });
    expect(hubLink).toHaveAttribute('href', '/diagnostic');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ToolNavigation currentToolNumber={3} className="custom-class" />
    );

    expect(container.querySelector('nav')).toHaveClass('custom-class');
  });

  it('hides tool names when showToolNames is false', () => {
    render(<ToolNavigation currentToolNumber={3} showToolNames={false} />);

    expect(screen.queryByText('Meetings')).not.toBeInTheDocument();
    expect(screen.queryByText('Stakeholders')).not.toBeInTheDocument();
  });

  describe('all tool transitions', () => {
    const toolTransitions = [
      { current: 1, prevName: null, nextName: 'Meetings' },
      { current: 2, prevName: 'Alignment', nextName: 'Decisions' },
      { current: 3, prevName: 'Meetings', nextName: 'Stakeholders' },
      { current: 4, prevName: 'Decisions', nextName: 'Data Flow' },
      { current: 5, prevName: 'Stakeholders', nextName: 'Communication' },
      { current: 6, prevName: 'Data Flow', nextName: 'Total Cost' },
      { current: 7, prevName: 'Communication', nextName: null },
    ];

    toolTransitions.forEach(({ current, prevName, nextName }) => {
      it(`shows correct navigation for Tool ${current}`, () => {
        render(<ToolNavigation currentToolNumber={current} />);

        if (prevName) {
          expect(screen.getByText(prevName)).toBeInTheDocument();
        } else {
          expect(screen.queryByText('Previous')).not.toBeInTheDocument();
        }

        if (nextName) {
          expect(screen.getByText(nextName)).toBeInTheDocument();
        }
      });
    });
  });
});
