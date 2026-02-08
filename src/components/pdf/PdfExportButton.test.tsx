/**
 * PDF Export Button Component Tests
 *
 * Tests for PdfExportButton component functionality.
 *
 * Covers: Task 7 - Unit tests
 * - Test export button shows loading state
 * - Test download triggers correctly
 * - Test error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CalculationResult } from '@/types/calculator.types';

// Define mockToBlob at module level but outside of vi.mock
const mockToBlob = vi.fn();

// Mock @react-pdf/renderer - mocks are hoisted, so use factory function that captures the hoisted mockToBlob
vi.mock('@react-pdf/renderer', async () => {
  return {
    Document: ({ children }: { children: React.ReactNode }) => children,
    Page: ({ children }: { children: React.ReactNode }) => children,
    View: ({ children }: { children: React.ReactNode }) => children,
    Text: ({ children }: { children: React.ReactNode }) => children,
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
    pdf: () => ({
      toBlob: mockToBlob,
    }),
  };
});

// Import after mocking
import { PdfExportButton } from './PdfExportButton';

const mockResults: CalculationResult = {
  meetingWaste: 150000,
  estimatedAlignmentTaxMin: 500000,
  estimatedAlignmentTaxMax: 600000,
  inputs: {
    meetingCount: 20,
    averageAttendees: 6,
    averageDuration: 60,
    salaryDistribution: {
      executive: 10,
      senior: 30,
      midLevel: 40,
      entry: 20,
    },
  },
  calculatedAt: '2026-02-07T12:00:00.000Z',
};

describe('PdfExportButton', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock URL methods
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock successful blob generation by default
    mockToBlob.mockResolvedValue(new Blob(['mock pdf content'], { type: 'application/pdf' }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default button text', () => {
    render(<PdfExportButton results={mockResults} />);

    expect(screen.getByRole('button')).toHaveTextContent('Export PDF');
  });

  it('renders with custom button text', () => {
    render(<PdfExportButton results={mockResults} buttonText="Download Report" />);

    expect(screen.getByRole('button')).toHaveTextContent('Download Report');
  });

  it('shows loading state during PDF generation', async () => {
    const user = userEvent.setup();

    // Create a promise that we can control
    let resolveBlob: (value: Blob) => void;
    const blobPromise = new Promise<Blob>((resolve) => {
      resolveBlob = resolve;
    });
    mockToBlob.mockReturnValue(blobPromise);

    render(<PdfExportButton results={mockResults} />);

    const button = screen.getByRole('button');

    // Click the button
    await user.click(button);

    // Should show loading state
    expect(button).toHaveTextContent('Generating PDF...');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Resolve the promise
    resolveBlob!(new Blob(['mock pdf content'], { type: 'application/pdf' }));

    // Wait for loading state to clear
    await waitFor(() => {
      expect(button).toHaveTextContent('Export PDF');
      expect(button).not.toBeDisabled();
    });
  });

  it('creates download link with correct filename', async () => {
    const user = userEvent.setup();

    // Track created links
    const createdLinks: Array<{ href: string; download: string; clicked: boolean }> = [];
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreateElement(tag);
      if (tag === 'a') {
        const linkData = { href: '', download: '', clicked: false };
        createdLinks.push(linkData);
        Object.defineProperty(element, 'href', {
          set: (v) => { linkData.href = v; },
          get: () => linkData.href,
        });
        Object.defineProperty(element, 'download', {
          set: (v) => { linkData.download = v; },
          get: () => linkData.download,
        });
        const originalClick = element.click.bind(element);
        element.click = () => { linkData.clicked = true; originalClick(); };
      }
      return element;
    });

    render(<PdfExportButton results={mockResults} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      const downloadLink = createdLinks.find(l => l.download);
      expect(downloadLink).toBeDefined();
      expect(downloadLink?.download).toMatch(/^meeting-waste-analysis-\d{4}-\d{2}-\d{2}\.pdf$/);
      expect(downloadLink?.href).toBe('blob:mock-url');
      expect(downloadLink?.clicked).toBe(true);
    });
  });

  it('shows error message when generation fails', async () => {
    const user = userEvent.setup();

    // Mock a failure
    mockToBlob.mockRejectedValue(new Error('Generation failed'));

    render(<PdfExportButton results={mockResults} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to generate PDF. Please try again.');
    });

    // Button should be enabled again
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('clears error on next attempt', async () => {
    const user = userEvent.setup();

    // First attempt fails
    mockToBlob.mockRejectedValueOnce(new Error('Generation failed'));

    render(<PdfExportButton results={mockResults} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Second attempt succeeds
    mockToBlob.mockResolvedValue(new Blob(['mock pdf content'], { type: 'application/pdf' }));

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('revokes object URL after download', async () => {
    const user = userEvent.setup();

    render(<PdfExportButton results={mockResults} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  it('accepts className prop for styling', () => {
    render(<PdfExportButton results={mockResults} className="custom-class" />);

    // The className is on the wrapper div, not the button
    const wrapper = screen.getByRole('button').parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
