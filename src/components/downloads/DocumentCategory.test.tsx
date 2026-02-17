/**
 * DocumentCategory Component Tests
 *
 * Tests for the document category grouping component.
 *
 * Story 18.5: Download Portal Page
 * Task 2.1: Tests for DocumentCategory component
 * Covers: AC3 (organized file categories)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DocumentCategory } from './DocumentCategory';

// Mock fetch for DocumentCard
global.fetch = vi.fn();

describe('DocumentCategory', () => {
  const mockDocuments = [
    {
      id: 'doc-1',
      documentName: 'Strategic Alignment Brief',
      documentType: 'word' as const,
      status: 'completed' as const,
      fileSizeBytes: 102400,
      errorMessage: null,
    },
    {
      id: 'doc-2',
      documentName: 'Stakeholder Communication Pack',
      documentType: 'word' as const,
      status: 'completed' as const,
      fileSizeBytes: 204800,
      errorMessage: null,
    },
  ];

  describe('Category Header', () => {
    it('should display strategic documents label', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      expect(screen.getByText('Strategic Documents')).toBeInTheDocument();
    });

    it('should display working tools label', () => {
      render(<DocumentCategory category="tools" documents={mockDocuments} />);

      expect(screen.getByText('Working Tools')).toBeInTheDocument();
    });

    it('should display presentations label', () => {
      render(
        <DocumentCategory category="presentations" documents={mockDocuments} />
      );

      expect(screen.getByText('Presentations')).toBeInTheDocument();
    });

    it('should display strategic documents description', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      expect(
        screen.getByText(
          'Enterprise-ready Word documents customized with your diagnostic findings'
        )
      ).toBeInTheDocument();
    });

    it('should display working tools description', () => {
      render(<DocumentCategory category="tools" documents={mockDocuments} />);

      expect(
        screen.getByText(
          'Interactive Excel spreadsheets with working formulas and your data pre-populated'
        )
      ).toBeInTheDocument();
    });

    it('should display presentations description', () => {
      render(
        <DocumentCategory category="presentations" documents={mockDocuments} />
      );

      expect(
        screen.getByText(
          'Board-presentation ready materials for executive stakeholders'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Category Icons', () => {
    it('should display file icon for strategic category', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      // Check for SVG icon in header section
      const headerSection = document.querySelector('.bg-blue-50');
      const icon = headerSection?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display spreadsheet icon for tools category', () => {
      render(<DocumentCategory category="tools" documents={mockDocuments} />);

      const headerSection = document.querySelector('.bg-green-50');
      const icon = headerSection?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display presentation icon for presentations category', () => {
      render(
        <DocumentCategory category="presentations" documents={mockDocuments} />
      );

      const headerSection = document.querySelector('.bg-orange-50');
      const icon = headerSection?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Category Styling', () => {
    it('should apply blue styling for strategic category', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const header = screen.getByText('Strategic Documents').closest('.p-4');
      expect(header).toHaveClass('bg-blue-50');
      expect(header).toHaveClass('border-blue-200');
    });

    it('should apply green styling for tools category', () => {
      render(<DocumentCategory category="tools" documents={mockDocuments} />);

      const header = screen.getByText('Working Tools').closest('.p-4');
      expect(header).toHaveClass('bg-green-50');
      expect(header).toHaveClass('border-green-200');
    });

    it('should apply orange styling for presentations category', () => {
      render(
        <DocumentCategory category="presentations" documents={mockDocuments} />
      );

      const header = screen.getByText('Presentations').closest('.p-4');
      expect(header).toHaveClass('bg-orange-50');
      expect(header).toHaveClass('border-orange-200');
    });

    it('should apply blue icon color for strategic category', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const headerSection = document.querySelector('.bg-blue-50');
      const icon = headerSection?.querySelector('svg.text-blue-600');
      expect(icon).toBeInTheDocument();
    });

    it('should apply green icon color for tools category', () => {
      render(<DocumentCategory category="tools" documents={mockDocuments} />);

      const headerSection = document.querySelector('.bg-green-50');
      const icon = headerSection?.querySelector('svg.text-green-600');
      expect(icon).toBeInTheDocument();
    });

    it('should apply orange icon color for presentations category', () => {
      render(
        <DocumentCategory category="presentations" documents={mockDocuments} />
      );

      const headerSection = document.querySelector('.bg-orange-50');
      const icon = headerSection?.querySelector('svg.text-orange-600');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Document List', () => {
    it('should render all documents in the category', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      expect(screen.getByText('Strategic Alignment Brief')).toBeInTheDocument();
      expect(
        screen.getByText('Stakeholder Communication Pack')
      ).toBeInTheDocument();
    });

    it('should render document cards', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      // Each document should have a card with DOCX badge
      const docxBadges = screen.getAllByText('DOCX');
      expect(docxBadges).toHaveLength(2);
    });
  });

  describe('Empty State', () => {
    it('should return null when no documents', () => {
      const { container } = render(
        <DocumentCategory category="strategic" documents={[]} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Retry Functionality', () => {
    it('should pass onRetry to document cards', () => {
      const mockOnRetry = vi.fn();
      const failedDocuments = [
        {
          ...mockDocuments[0],
          status: 'failed' as const,
          errorMessage: 'Generation failed',
        },
      ];

      render(
        <DocumentCategory
          category="strategic"
          documents={failedDocuments}
          onRetry={mockOnRetry}
        />
      );

      // Retry button should be visible for failed document
      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have region role', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to category heading', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'category-strategic');

      const heading = screen.getByText('Strategic Documents');
      expect(heading).toHaveAttribute('id', 'category-strategic');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Strategic Documents');
    });

    it('should hide icon from screen readers', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const headerSection = document.querySelector('.bg-blue-50');
      const icon = headerSection?.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Layout', () => {
    it('should have proper spacing for category section', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const section = screen.getByRole('region');
      expect(section).toHaveClass('mb-8');
    });

    it('should have rounded top corners on header', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const header = screen.getByText('Strategic Documents').closest('.p-4');
      expect(header).toHaveClass('rounded-t-lg');
    });

    it('should have proper spacing for document list', () => {
      render(
        <DocumentCategory category="strategic" documents={mockDocuments} />
      );

      const documentList = document.querySelector('.space-y-3.pt-4');
      expect(documentList).toBeInTheDocument();
    });
  });
});
