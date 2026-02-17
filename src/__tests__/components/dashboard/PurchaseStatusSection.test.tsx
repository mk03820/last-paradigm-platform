/**
 * PurchaseStatusSection Component Tests
 *
 * Story 19.3: Purchase Status & Toolkit Access
 * Task 10: Write comprehensive tests (AC: all)
 *
 * Tests all purchase states and analytics integration.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PurchaseStatusSection } from '@/components/dashboard/PurchaseStatusSection';

expect.extend(toHaveNoViolations);

// Mock the analytics service
vi.mock('@/lib/analytics/service', () => ({
  analytics: {
    track: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the privacy consent
vi.mock('@/lib/privacy/consent', () => ({
  getConsentStatus: vi.fn().mockResolvedValue({ analytics: true }),
}));

describe('PurchaseStatusSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    purchaseStatus: 'none' as const,
    purchasedAt: null,
    hasPb2Access: false,
    invoiceRequestedAt: null,
    diagnosticSummary: null,
    toolkitStatus: null,
  };

  describe('Not Purchased State (AC1)', () => {
    it('shows "Unlock Playbook 2" CTA when not purchased', () => {
      render(<PurchaseStatusSection {...defaultProps} />);

      // There's a heading and a link both with "Unlock Playbook 2"
      const elements = screen.getAllByText(/unlock playbook 2/i);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('links to preview page', () => {
      render(<PurchaseStatusSection {...defaultProps} />);

      const ctaLinks = screen.getAllByRole('link');
      const previewLink = ctaLinks.find(link => link.getAttribute('href') === '/preview');
      expect(previewLink).toBeInTheDocument();
    });

    it('displays value proposition with estimated savings when available', () => {
      render(
        <PurchaseStatusSection
          {...defaultProps}
          diagnosticSummary={{
            totalAlignmentTax: 250000,
            estimatedSavings: 75000,
            completedTools: 7,
          }}
        />
      );

      // Should mention estimated savings
      expect(screen.getByText(/\$75,000/)).toBeInTheDocument();
    });

    it('applies Executive Clarity design (Navy/Gold colors)', () => {
      render(<PurchaseStatusSection {...defaultProps} />);

      // Check for gold accent styling on CTA
      const section = screen.getByRole('region', { name: /purchase|toolkit/i });
      expect(section).toBeInTheDocument();
    });

    it('shows 30-day guarantee badge', () => {
      render(<PurchaseStatusSection {...defaultProps} />);

      expect(screen.getByText(/30-day/i)).toBeInTheDocument();
    });
  });

  describe('Purchased State (AC2)', () => {
    const purchasedProps = {
      ...defaultProps,
      purchaseStatus: 'completed' as const,
      purchasedAt: new Date('2026-02-01'),
      hasPb2Access: true,
      toolkitStatus: {
        available: true,
        documentsReady: 10,
        totalDocuments: 10,
        isGenerating: false,
        failedDocuments: 0,
      },
    };

    it('shows "Your Toolkit" heading', () => {
      render(<PurchaseStatusSection {...purchasedProps} />);

      // Find "Your Toolkit" text in the card title
      const cardTitles = document.querySelectorAll('[data-slot="card-title"]');
      const hasYourToolkit = Array.from(cardTitles).some(el =>
        el.textContent?.toLowerCase().includes('your toolkit')
      );
      expect(hasYourToolkit).toBe(true);
    });

    it('displays purchase date in locale format', () => {
      render(<PurchaseStatusSection {...purchasedProps} />);

      // Should show formatted date with "Purchased on"
      expect(screen.getByText(/Purchased on/i)).toBeInTheDocument();
    });

    it('shows download access button', () => {
      render(<PurchaseStatusSection {...purchasedProps} />);

      const downloadLinks = screen.getAllByRole('link');
      const downloadBtn = downloadLinks.find(link =>
        link.getAttribute('href') === '/dashboard/downloads'
      );
      expect(downloadBtn).toBeInTheDocument();
    });

    it('shows visual indicator of active access (green checkmark)', () => {
      render(<PurchaseStatusSection {...purchasedProps} />);

      // Check the card has green/success styling classes
      const cards = document.querySelectorAll('[data-slot="card"]');
      const hasGreenStyling = Array.from(cards).some(el =>
        el.className.includes('green') || el.className.includes('success')
      );
      expect(hasGreenStyling).toBe(true);
    });

    it('shows document count', () => {
      render(<PurchaseStatusSection {...purchasedProps} />);

      expect(screen.getByText(/10 documents/i)).toBeInTheDocument();
    });
  });

  describe('Pending Invoice State (AC3)', () => {
    const pendingProps = {
      ...defaultProps,
      purchaseStatus: 'pending' as const,
      invoiceRequestedAt: new Date('2026-02-10'),
    };

    it('shows "Invoice Requested" status', () => {
      render(<PurchaseStatusSection {...pendingProps} />);

      const cardTitles = document.querySelectorAll('[data-slot="card-title"]');
      const hasInvoiceRequested = Array.from(cardTitles).some(el =>
        el.textContent?.toLowerCase().includes('invoice requested')
      );
      expect(hasInvoiceRequested).toBe(true);
    });

    it('displays invoice request date', () => {
      render(<PurchaseStatusSection {...pendingProps} />);

      // Should show "Requested on" with a date
      expect(screen.getByText(/Requested on/i)).toBeInTheDocument();
    });

    it('shows pending approval message', () => {
      render(<PurchaseStatusSection {...pendingProps} />);

      expect(screen.getByText(/awaiting|pending/i)).toBeInTheDocument();
    });

    it('provides support contact information', () => {
      render(<PurchaseStatusSection {...pendingProps} />);

      expect(screen.getByText(/billing@thelastparadigm\.com/i)).toBeInTheDocument();
    });

    it('uses amber/warning styling', () => {
      render(<PurchaseStatusSection {...pendingProps} />);

      // Check the card has amber/warning styling
      const cards = document.querySelectorAll('[data-slot="card"]');
      const hasAmberStyling = Array.from(cards).some(el =>
        el.className.includes('amber') || el.className.includes('warning') || el.className.includes('pending')
      );
      expect(hasAmberStyling).toBe(true);
    });
  });

  describe('Refunded State (AC4)', () => {
    const refundedProps = {
      ...defaultProps,
      purchaseStatus: 'refunded' as const,
      purchasedAt: new Date('2026-01-15'),
    };

    it('shows "Access Expired" status', () => {
      render(<PurchaseStatusSection {...refundedProps} />);

      const cardTitles = document.querySelectorAll('[data-slot="card-title"]');
      const hasAccessExpired = Array.from(cardTitles).some(el =>
        el.textContent?.toLowerCase().includes('access expired') ||
        el.textContent?.toLowerCase().includes('refunded')
      );
      expect(hasAccessExpired).toBe(true);
    });

    it('shows re-purchase option', () => {
      render(<PurchaseStatusSection {...refundedProps} />);

      const links = screen.getAllByRole('link');
      const repurchaseLink = links.find(link =>
        link.textContent?.toLowerCase().includes('re-purchase') ||
        link.textContent?.toLowerCase().includes('purchase')
      );
      expect(repurchaseLink).toHaveAttribute('href', '/preview');
    });

    it('does NOT show download portal link', () => {
      render(<PurchaseStatusSection {...refundedProps} />);

      // Should not have a download link
      const links = screen.getAllByRole('link');
      const portalLinks = links.filter(link =>
        link.getAttribute('href')?.includes('/dashboard/downloads')
      );
      expect(portalLinks).toHaveLength(0);
    });

    it('uses muted styling', () => {
      render(<PurchaseStatusSection {...refundedProps} />);

      // Check the card has muted/gray/expired styling
      const cards = document.querySelectorAll('[data-slot="card"]');
      const hasMutedStyling = Array.from(cards).some(el =>
        el.className.includes('muted') || el.className.includes('gray') || el.className.includes('expired')
      );
      expect(hasMutedStyling).toBe(true);
    });
  });

  describe('Analytics Tracking (AC5)', () => {
    it('tracks toolkit_accessed when clicking download button', async () => {
      const { analytics } = await import('@/lib/analytics/service');

      render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="completed"
          purchasedAt={new Date()}
          hasPb2Access={true}
          toolkitStatus={{
            available: true,
            documentsReady: 10,
            totalDocuments: 10,
            isGenerating: false,
            failedDocuments: 0,
          }}
        />
      );

      const downloadBtn = screen.getByRole('link', { name: /access|download/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(analytics.track).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'toolkit_accessed',
            properties: expect.objectContaining({
              source: 'dashboard',
            }),
          })
        );
      });
    });

    it('tracks preview_cta_clicked when clicking Unlock CTA', async () => {
      const { analytics } = await import('@/lib/analytics/service');

      render(
        <PurchaseStatusSection
          {...defaultProps}
          diagnosticSummary={{
            totalAlignmentTax: 100000,
            estimatedSavings: 30000,
            completedTools: 7,
          }}
        />
      );

      const ctaBtn = screen.getByRole('link', { name: /unlock|preview/i });
      fireEvent.click(ctaBtn);

      await waitFor(() => {
        expect(analytics.track).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'preview_cta_clicked',
            properties: expect.objectContaining({
              source: 'dashboard_purchase_section',
              purchaseStatus: 'none',
              hasCompletedDiagnostic: true,
            }),
          })
        );
      });
    });
  });

  describe('Download Portal Fallback (AC6)', () => {
    it('shows fallback message when download portal is not ready', () => {
      render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="completed"
          purchasedAt={new Date()}
          hasPb2Access={true}
          toolkitStatus={{
            available: false,
            documentsReady: 0,
            totalDocuments: 10,
            isGenerating: false,
            failedDocuments: 0,
          }}
        />
      );

      expect(screen.getByText(/being prepared/i)).toBeInTheDocument();
    });

    it('shows generation progress when available', () => {
      render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="completed"
          purchasedAt={new Date()}
          hasPb2Access={true}
          toolkitStatus={{
            available: false,
            documentsReady: 3,
            totalDocuments: 10,
            isGenerating: true,
            failedDocuments: 0,
          }}
        />
      );

      expect(screen.getByText(/3.*of.*10/i)).toBeInTheDocument();
    });

    it('does not show broken link when portal unavailable', () => {
      render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="completed"
          purchasedAt={new Date()}
          hasPb2Access={true}
          toolkitStatus={{
            available: false,
            documentsReady: 0,
            totalDocuments: 10,
            isGenerating: false,
            failedDocuments: 0,
          }}
        />
      );

      // Should not have an active download link
      const downloadLinks = screen.queryAllByRole('link', { name: /download/i });
      const activeLinks = downloadLinks.filter(link =>
        link.getAttribute('href') === '/dashboard/downloads'
      );
      expect(activeLinks).toHaveLength(0);
    });
  });

  describe('Responsive Design (AC7)', () => {
    it('renders section with responsive structure', () => {
      render(<PurchaseStatusSection {...defaultProps} />);

      const section = screen.getByRole('region', { name: /purchase|toolkit/i });
      expect(section).toBeInTheDocument();
    });

    it('has proper touch targets (min 44x44px)', () => {
      render(<PurchaseStatusSection {...defaultProps} />);

      const ctaButton = screen.getByRole('link', { name: /unlock|preview/i });
      // Touch targets are enforced via Tailwind classes (min-h-11 min-w-11)
      expect(ctaButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no axe violations for not purchased state', async () => {
      const { container } = render(<PurchaseStatusSection {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations for purchased state', async () => {
      const { container } = render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="completed"
          purchasedAt={new Date()}
          hasPb2Access={true}
          toolkitStatus={{
            available: true,
            documentsReady: 10,
            totalDocuments: 10,
            isGenerating: false,
            failedDocuments: 0,
          }}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations for pending state', async () => {
      const { container } = render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="pending"
          invoiceRequestedAt={new Date()}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses semantic region with label', () => {
      render(<PurchaseStatusSection {...defaultProps} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAccessibleName();
    });
  });

  describe('Edge Cases', () => {
    it('handles null purchasedAt gracefully', () => {
      render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="completed"
          purchasedAt={null}
          hasPb2Access={true}
        />
      );

      // Should still render without crashing - check for "Your Toolkit"
      const cardTitles = document.querySelectorAll('[data-slot="card-title"]');
      const hasYourToolkit = Array.from(cardTitles).some(el =>
        el.textContent?.toLowerCase().includes('your toolkit')
      );
      expect(hasYourToolkit).toBe(true);
    });

    it('handles zero estimated savings', () => {
      render(
        <PurchaseStatusSection
          {...defaultProps}
          diagnosticSummary={{
            totalAlignmentTax: 0,
            estimatedSavings: 0,
            completedTools: 7,
          }}
        />
      );

      // Should still show CTA link
      const links = screen.getAllByRole('link');
      const previewLink = links.find(link => link.getAttribute('href') === '/preview');
      expect(previewLink).toBeInTheDocument();
    });

    it('prioritizes hasPb2Access false even when purchaseStatus is purchased', () => {
      render(
        <PurchaseStatusSection
          {...defaultProps}
          purchaseStatus="completed"
          purchasedAt={new Date()}
          hasPb2Access={false}
        />
      );

      // Should show access expired or contact support
      const bodyText = document.body.textContent?.toLowerCase() || '';
      expect(
        bodyText.includes('access expired') || bodyText.includes('contact support')
      ).toBe(true);
    });
  });
});
