/**
 * MagicLinkForm Component Tests
 *
 * Tests for the magic link request form UI component.
 *
 * Covers: Story 15.4 Task 4.9
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MagicLinkForm } from './MagicLinkForm';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MagicLinkForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { message: 'If an account exists, a sign-in link has been sent.' },
        }),
    });
  });

  it('renders email input', () => {
    render(<MagicLinkForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@company\.com/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<MagicLinkForm />);

    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('renders help text', () => {
    render(<MagicLinkForm />);

    expect(screen.getByText(/secure link to sign in/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email on blur', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'not-an-email');
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
    });
  });

  it('shows validation error for empty email on blur', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.click(emailInput);
    await user.tab(); // Trigger blur without typing

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
    });
  });

  it('clears validation error when valid email entered', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);

    // First trigger error
    await user.type(emailInput, 'invalid');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Clear and enter valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('submits form with valid email', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/magic-link',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });
  });

  it('shows loading state during submission', async () => {
    // Slow down the response
    mockFetch.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  success: true,
                  data: { message: 'Link sent' },
                }),
            }),
          100
        )
      )
    );

    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    expect(screen.getByText(/sending link/i)).toBeInTheDocument();
  });

  it('shows success state after submission', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'success@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/success@example.com/i)).toBeInTheDocument();
    });
  });

  it('shows expiry warning in success state', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
    });
  });

  it('shows request new link button in success state', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /request new link/i })).toBeInTheDocument();
    });
  });

  it('resets form when request new link clicked', async () => {
    render(<MagicLinkForm />);

    // Submit first request
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    // Click request new link
    await user.click(screen.getByRole('button', { name: /request new link/i }));

    // Should be back to form state
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('shows error for rate limiting', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: 'RATE_LIMITED', message: 'Too many requests' },
        }),
    });

    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('shows error for network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback on successful submission', async () => {
    const onSuccess = vi.fn();
    render(<MagicLinkForm onSuccess={onSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('disables button during submission', async () => {
    mockFetch.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            }),
          100
        )
      )
    );

    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send magic link/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('has correct form accessibility', () => {
    render(<MagicLinkForm />);

    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Sign in with magic link');
  });

  it('marks email input as invalid when errored', async () => {
    render(<MagicLinkForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid');
    await user.tab();

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('supports keyboard navigation', async () => {
    render(<MagicLinkForm />);

    // Tab to email input
    await user.tab();
    expect(screen.getByLabelText(/email address/i)).toHaveFocus();

    // Tab to submit button
    await user.tab();
    expect(screen.getByRole('button', { name: /send magic link/i })).toHaveFocus();
  });

  it('accepts custom className', () => {
    render(<MagicLinkForm className="custom-class" />);

    const form = screen.getByRole('form');
    expect(form).toHaveClass('custom-class');
  });
});
