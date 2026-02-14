import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MethodologyAttribution } from '../MethodologyAttribution';

describe('MethodologyAttribution', () => {
  it('renders the attribution text', () => {
    render(<MethodologyAttribution />);

    expect(screen.getByText(/Based on/i)).toBeInTheDocument();
    expect(screen.getByText(/The Last Paradigm/i)).toBeInTheDocument();
    expect(screen.getByText(/methodology/i)).toBeInTheDocument();
  });

  it('emphasizes "The Last Paradigm" with font weight', () => {
    render(<MethodologyAttribution />);

    const bookTitle = screen.getByText('The Last Paradigm');
    expect(bookTitle.className).toContain('font-medium');
  });

  it('uses foreground color for book title emphasis', () => {
    render(<MethodologyAttribution />);

    const bookTitle = screen.getByText('The Last Paradigm');
    expect(bookTitle.className).toContain('text-foreground');
  });

  it('renders the book icon', () => {
    render(<MethodologyAttribution />);

    // Book icon should be present (aria-hidden)
    const bookIcon = document.querySelector('svg[aria-hidden="true"]');
    expect(bookIcon).toBeInTheDocument();
  });

  it('uses muted text color for subtle presentation', () => {
    render(<MethodologyAttribution />);

    const container = screen.getByText(/Based on/i).closest('div');
    expect(container?.className).toContain('text-muted-foreground');
  });

  it('applies custom className when provided', () => {
    render(<MethodologyAttribution className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('centers content with flexbox', () => {
    render(<MethodologyAttribution />);

    const container = screen.getByText(/Based on/i).closest('div');
    expect(container?.className).toContain('flex');
    expect(container?.className).toContain('justify-center');
  });

  it('has responsive text sizing', () => {
    render(<MethodologyAttribution />);

    const textElement = screen.getByText(/Based on/i).closest('p');
    expect(textElement?.className).toContain('text-xs');
    expect(textElement?.className).toContain('md:text-sm');
  });

  it('has proper spacing between icon and text', () => {
    render(<MethodologyAttribution />);

    const container = screen.getByText(/Based on/i).closest('div');
    expect(container?.className).toContain('gap-2');
  });
});
