import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailCaptureForm } from './EmailCaptureForm';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('EmailCaptureForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { message: 'Email registered successfully' } }),
    });
  });

  describe('value proposition messaging (AC: 1)', () => {
    it('should display the correct header', () => {
      render(<EmailCaptureForm />);

      expect(
        screen.getByText('Get notified when the full diagnostic launches')
      ).toBeInTheDocument();
    });

    it('should display the correct body text', () => {
      render(<EmailCaptureForm />);

      expect(
        screen.getByText(/You've completed Step 1 of 7/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/complete Alignment Tax Diagnostic/i)
      ).toBeInTheDocument();
    });
  });

  describe('email input (AC: 2)', () => {
    it('should render email input field', () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should have accessible label for screen readers', () => {
      render(<EmailCaptureForm />);

      const input = screen.getByLabelText('Email address');
      expect(input).toBeInTheDocument();
    });
  });

  describe('skip option (AC: 3)', () => {
    it('should render Skip button', () => {
      render(<EmailCaptureForm />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      expect(skipButton).toBeInTheDocument();
    });

    it('should dismiss form when Skip is clicked', async () => {
      render(<EmailCaptureForm />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await userEvent.click(skipButton);

      // Form should no longer be visible
      expect(screen.queryByText('Get notified when the full diagnostic launches')).not.toBeInTheDocument();
    });

    it('should not require email to proceed', () => {
      render(<EmailCaptureForm />);

      // Skip button should be enabled without entering email
      const skipButton = screen.getByRole('button', { name: /skip/i });
      expect(skipButton).not.toBeDisabled();
    });
  });

  describe('inline validation (AC: 6)', () => {
    it('should show error for invalid email format on blur', async () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'invalid-email');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should set aria-invalid when email is invalid', async () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'invalid');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should link error to input via aria-describedby', async () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'invalid');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-describedby', 'email-error');
      });
    });
  });

  describe('form submission', () => {
    it('should submit valid email', async () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            source: 'meeting-audit-results',
          }),
        });
      });
    });

    it('should show loading state while submitting', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          json: () => Promise.resolve({ success: true, data: { message: 'Success' } }),
        }), 100))
      );

      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    it('should disable inputs while submitting', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          json: () => Promise.resolve({ success: true, data: { message: 'Success' } }),
        }), 100))
      );

      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      expect(input).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('success state (AC: 7)', () => {
    it('should show success message after submission', async () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      });
    });

    it('should replace form with success message', async () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        // Form should be replaced
        expect(screen.queryByPlaceholderText('Enter your email address')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /notify me/i })).not.toBeInTheDocument();
        // Success message should be visible
        expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      });
    });

    it('should have proper accessibility for success message', async () => {
      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const successMessage = screen.getByRole('status');
        expect(successMessage).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('error handling', () => {
    it('should show server error message', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({
          success: false,
          error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email' },
        }),
      });

      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      });
    });

    it('should show connection error message', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to connect. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ success: true, data: { message: 'Success' } }),
        });

      render(<EmailCaptureForm />);

      const input = screen.getByPlaceholderText('Enter your email address');
      await userEvent.type(input, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /notify me/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to connect. Please try again later.')).toBeInTheDocument();
      });

      // Retry
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      });
    });
  });
});
