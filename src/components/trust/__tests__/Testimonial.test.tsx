import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Testimonial } from '../Testimonial';
import type { Testimonial as TestimonialType } from '@/lib/data/testimonials';

const mockTestimonial: TestimonialType = {
  id: 'test-1',
  quote: 'This is a great product that helped our business.',
  author: {
    name: 'John Smith',
    title: 'CEO',
    company: 'Acme Inc.',
  },
  featured: true,
};

const mockTestimonialNoCompany: TestimonialType = {
  id: 'test-2',
  quote: 'A wonderful experience overall.',
  author: {
    name: 'Jane Doe',
    title: 'CTO',
  },
};

const mockTestimonialWithAvatar: TestimonialType = {
  id: 'test-3',
  quote: 'Highly recommend this solution.',
  author: {
    name: 'Bob Wilson',
    title: 'Director',
    company: 'Tech Corp',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
};

describe('Testimonial', () => {
  it('renders the quote text', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    expect(screen.getByText(/This is a great product/i)).toBeInTheDocument();
  });

  it('renders the author name', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('renders the author title', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    expect(screen.getByText(/CEO/)).toBeInTheDocument();
  });

  it('renders the company name when provided', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    expect(screen.getByText(/Acme Inc\./)).toBeInTheDocument();
  });

  it('does not render company when not provided', () => {
    render(<Testimonial testimonial={mockTestimonialNoCompany} />);

    // Should have title but no comma for company
    const titleElement = screen.getByText('CTO');
    expect(titleElement).toBeInTheDocument();
    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  it('renders initials avatar when no avatar URL', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    // Should show initials "JS" for John Smith
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('renders image when avatar URL is provided', () => {
    render(<Testimonial testimonial={mockTestimonialWithAvatar} />);

    const avatar = document.querySelector('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('uses semantic blockquote element', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    const blockquote = document.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
  });

  it('uses semantic figcaption for attribution', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    const figcaption = document.querySelector('figcaption');
    expect(figcaption).toBeInTheDocument();
  });

  it('uses cite element for author name', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    const cite = document.querySelector('cite');
    expect(cite).toBeInTheDocument();
    expect(cite).toHaveTextContent('John Smith');
  });

  it('wraps content in figure element', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    const figure = document.querySelector('figure');
    expect(figure).toBeInTheDocument();
  });

  it('applies gold accent border per Executive Clarity theme', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    const figure = document.querySelector('figure');
    expect(figure?.className).toContain('border-l-amber-600');
  });

  it('renders decorative quote icon', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    // Quote icon should be present (aria-hidden)
    const quoteIcon = document.querySelector('svg[aria-hidden="true"]');
    expect(quoteIcon).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<Testimonial testimonial={mockTestimonial} className="custom-class" />);

    const figure = document.querySelector('figure.custom-class');
    expect(figure).toBeInTheDocument();
  });

  it('uses italic styling for quote text', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    const quoteText = screen.getByText(/This is a great product/i);
    expect(quoteText.className).toContain('italic');
  });

  it('has responsive text sizing', () => {
    render(<Testimonial testimonial={mockTestimonial} />);

    const quoteText = screen.getByText(/This is a great product/i);
    expect(quoteText.className).toContain('text-base');
    expect(quoteText.className).toContain('md:text-lg');
  });
});
