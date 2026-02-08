import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('renders the step indicator', () => {
    render(<Home />);

    expect(screen.getByText(/Step 1 of 7/)).toBeInTheDocument();
    // Find the step indicator specifically via role
    const stepIndicator = screen.getByRole('status', { name: 'Progress indicator' });
    expect(stepIndicator).toBeInTheDocument();
  });

  it('renders the hero section', () => {
    render(<Home />);

    expect(screen.getByText(/Your CEO handed you a book/)).toBeInTheDocument();
    expect(screen.getByText(/Start Diagnostic/)).toBeInTheDocument();
  });

  it('renders the journey context', () => {
    render(<Home />);

    expect(screen.getByText(/The Last Paradigm/)).toBeInTheDocument();
    expect(screen.getByText(/first step/i)).toBeInTheDocument();
  });

  it('renders the session disclaimer', () => {
    render(<Home />);

    expect(
      screen.getByText(/Your data is stored in this browser session only/i)
    ).toBeInTheDocument();
  });

  it('has the main element with proper styling', () => {
    render(<Home />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('bg-background');
  });

  it('renders step indicator before hero section in visual order', () => {
    render(<Home />);

    // Get both elements
    const stepIndicator = screen.getByRole('status', { name: 'Progress indicator' });
    // Hero section uses aria-labelledby pointing to "hero-heading" id
    const heroHeading = screen.getByRole('heading', { level: 1 });

    // Check that step indicator appears before hero heading in the DOM
    expect(
      stepIndicator.compareDocumentPosition(heroHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('renders session disclaimer after journey context in visual order', () => {
    render(<Home />);

    // Journey context and session disclaimer
    const journeyContext = screen.getByRole('region', {
      name: 'Diagnostic journey context',
    });
    // Session disclaimer has role="status" but no explicit accessible name
    const allStatusElements = screen.getAllByRole('status');
    const sessionDisclaimer = allStatusElements.find(
      el => el.textContent?.includes('browser session')
    );

    expect(sessionDisclaimer).toBeTruthy();
    // Session disclaimer should appear after journey context
    expect(
      journeyContext.compareDocumentPosition(sessionDisclaimer!) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
