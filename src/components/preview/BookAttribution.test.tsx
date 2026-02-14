/**
 * BookAttribution Component Tests
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 7.3: Unit tests for BookAttribution component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookAttribution } from './BookAttribution';

describe('BookAttribution', () => {
  it('renders the attribution text', () => {
    render(<BookAttribution />);

    expect(screen.getByText(/Based on methodology from/i)).toBeInTheDocument();
    expect(screen.getByText(/The Last Paradigm/i)).toBeInTheDocument();
  });

  it('renders with book icon by default', () => {
    render(<BookAttribution />);

    // Icon should be present (hidden from screen readers)
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<BookAttribution showIcon={false} />);

    const icon = document.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<BookAttribution className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<BookAttribution />);

    const region = screen.getByRole('complementary');
    expect(region).toHaveAttribute('aria-label', 'Methodology attribution');
  });

  describe('size variants', () => {
    it('renders small size', () => {
      const { container } = render(<BookAttribution size="sm" />);

      expect(container.firstChild).toHaveClass('text-xs');
    });

    it('renders medium size (default)', () => {
      const { container } = render(<BookAttribution />);

      expect(container.firstChild).toHaveClass('text-sm');
    });

    it('renders large size', () => {
      const { container } = render(<BookAttribution size="lg" />);

      expect(container.firstChild).toHaveClass('text-base');
    });
  });

  describe('variant styles', () => {
    it('renders default variant', () => {
      const { container } = render(<BookAttribution variant="default" />);

      expect(container.firstChild).toHaveClass('text-slate-400');
    });

    it('renders subtle variant', () => {
      const { container } = render(<BookAttribution variant="subtle" />);

      expect(container.firstChild).toHaveClass('text-slate-500');
    });

    it('renders prominent variant', () => {
      const { container } = render(<BookAttribution variant="prominent" />);

      expect(container.firstChild).toHaveClass('text-amber-600');
      expect(container.firstChild).toHaveClass('font-medium');
    });
  });

  it('centers content with flexbox', () => {
    const { container } = render(<BookAttribution />);

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('justify-center');
  });

  it('renders book title in italic and semibold', () => {
    render(<BookAttribution />);

    const bookTitle = screen.getByText('The Last Paradigm');
    expect(bookTitle).toHaveClass('font-semibold');
    expect(bookTitle).toHaveClass('italic');
  });
});
