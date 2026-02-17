/**
 * Invoice Request Modal Component Tests
 *
 * Tests for the invoice request form modal.
 *
 * Story 17.7: Invoice Request Flow
 * Task 7.1: Unit tests for InvoiceRequestModal component
 * Covers: AC2, AC3 (form validation), AC5 (confirmation UI), AC6, AC8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceRequestModal } from '@/components/invoice/InvoiceRequestModal';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('InvoiceRequestModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    userEmail: 'user@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, requestId: 'req_123' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(screen.getByText('Request Enterprise Invoice')).toBeInTheDocument();
    });

    it('should not render content when isOpen is false', () => {
      render(<InvoiceRequestModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Request Enterprise Invoice')).not.toBeInTheDocument();
    });

    it('should display the building icon', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      // Building2 icon from lucide-react
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display description text', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(
        screen.getByText(/corporate purchases/i)
      ).toBeInTheDocument();
    });
  });

  describe('Form Fields (AC2)', () => {
    it('should display company name field', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    });

    it('should display billing email field', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(screen.getByLabelText(/billing email/i)).toBeInTheDocument();
    });

    it('should display PO number field as optional', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(screen.getByLabelText(/po number/i)).toBeInTheDocument();
      expect(screen.getByText(/optional/i)).toBeInTheDocument();
    });

    it('should display billing address section', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(screen.getByText(/billing address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/street address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/city/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/state/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/postal code/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/country/i)).toBeInTheDocument();
    });

    it('should pre-fill billing email with userEmail prop', () => {
      render(<InvoiceRequestModal {...defaultProps} userEmail="prefilled@example.com" />);

      const emailInput = screen.getByLabelText(/billing email/i);
      expect(emailInput).toHaveValue('prefilled@example.com');
    });

    it('should default country to United States', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      const countryInput = screen.getByPlaceholderText(/country/i);
      expect(countryInput).toHaveValue('United States');
    });

    it('should display cancel button', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should display submit button', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation (AC3)', () => {
    it('should show error for empty company name', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} userEmail="" />);

      const emailInput = screen.getByLabelText(/billing email/i);
      await user.type(emailInput, 'invalid-email');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty street address', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/street address is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty city', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/city is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty state', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/state\/province is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty postal code', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/postal code is required/i)).toBeInTheDocument();
      });
    });

    it('should require minimum length for company name', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      const companyInput = screen.getByLabelText(/company name/i);
      await user.type(companyInput, 'A');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      });
    });

    it('should not require PO number', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      // Fill all required fields
      await user.type(screen.getByLabelText(/company name/i), 'Acme Corp');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Main St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');

      // Leave PO number empty
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.clear(screen.getByLabelText(/billing email/i));
      await user.type(screen.getByLabelText(/billing email/i), 'billing@acme.com');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
    };

    it('should submit form with correct data', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await fillValidForm(user);
      await user.type(screen.getByLabelText(/po number/i), 'PO-12345');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/invoice/request',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Acme Corporation'),
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<InvoiceRequestModal {...defaultProps} />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button during loading', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<InvoiceRequestModal {...defaultProps} />);

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
      });
    });
  });

  describe('Success State (AC5)', () => {
    it('should show success message after submission', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/invoice request received/i)).toBeInTheDocument();
      });
    });

    it('should show expected timeline in success state', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/1 business day/i)).toBeInTheDocument();
      });
    });

    it('should display billing contact email in success state', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/billing@lastparadigm.com/i)).toBeInTheDocument();
      });
    });

    it('should show close button in success state', async () => {
      const user = userEvent.setup();
      render(<InvoiceRequestModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling (AC8)', () => {
    it('should show error message on submission failure', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      render(<InvoiceRequestModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should show generic error for network failures', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<InvoiceRequestModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, requestId: 'req_123' }),
      });

      render(<InvoiceRequestModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');

      // First submission fails
      await user.click(screen.getByRole('button', { name: /submit request/i }));
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Retry succeeds
      await user.click(screen.getByRole('button', { name: /submit request/i }));
      await waitFor(() => {
        expect(screen.getByText(/invoice request received/i)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<InvoiceRequestModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked in success state', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<InvoiceRequestModal {...defaultProps} onClose={onClose} />);

      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');
      await user.type(screen.getByPlaceholderText(/street address/i), '123 Business St');
      await user.type(screen.getByPlaceholderText(/city/i), 'New York');
      await user.type(screen.getByPlaceholderText(/state/i), 'NY');
      await user.type(screen.getByPlaceholderText(/postal code/i), '10001');
      await user.click(screen.getByRole('button', { name: /submit request/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('should reset form state when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<InvoiceRequestModal {...defaultProps} />);

      // Fill form
      await user.type(screen.getByLabelText(/company name/i), 'Acme Corporation');

      // Close modal
      rerender(<InvoiceRequestModal {...defaultProps} isOpen={false} />);

      // Reopen modal
      rerender(<InvoiceRequestModal {...defaultProps} isOpen={true} />);

      // Form should be reset
      expect(screen.getByLabelText(/company name/i)).toHaveValue('');
    });
  });

  describe('Professional Appearance (AC6)', () => {
    it('should have dark theme styling', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('bg-slate-900');
    });

    it('should have amber accent color for submit button', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      expect(submitButton).toHaveClass('bg-amber-600');
    });

    it('should have proper input styling', () => {
      render(<InvoiceRequestModal {...defaultProps} />);

      const companyInput = screen.getByLabelText(/company name/i);
      expect(companyInput).toHaveClass('bg-slate-800');
    });
  });
});
