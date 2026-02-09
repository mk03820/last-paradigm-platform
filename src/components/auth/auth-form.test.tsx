import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from './auth-form';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

import { signIn } from 'next-auth/react';

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render email input field', () => {
      render(<AuthForm />);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<AuthForm />);
      expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
    });

    it('should render placeholder text', () => {
      render(<AuthForm />);
      expect(screen.getByPlaceholderText(/you@company.com/i)).toBeInTheDocument();
    });

    it('should render helper text about passwordless', () => {
      render(<AuthForm />);
      expect(screen.getByText(/no password needed/i)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show error for empty email on submit', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should not call signIn for invalid email format', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'invalid-email');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      // Browser validation prevents submission of invalid emails
      // So signIn should not have been called
      await waitFor(() => {
        expect(signIn).not.toHaveBeenCalled();
      });
    });

    it('should not show error for valid email', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '' });
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'valid@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('submission', () => {
    it('should call signIn with correct parameters on valid submit', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '' });
      render(<AuthForm callbackUrl="/dashboard" />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('resend', {
          email: 'test@example.com',
          redirect: false,
          callbackUrl: '/dashboard',
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      // Make signIn hang to test loading state
      vi.mocked(signIn).mockImplementation(() => new Promise(() => {}));
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/sending magic link/i)).toBeInTheDocument();
      });
    });

    it('should disable input and button during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockImplementation(() => new Promise(() => {}));
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(input).toBeDisabled();
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });
  });

  describe('success state', () => {
    it('should show success message after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '' });
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('should show the submitted email in success message', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '' });
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('should mention 15-minute expiry in success message', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '' });
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
      });
    });

    it('should allow trying different email after success', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockResolvedValue({ error: null, ok: true, status: 200, url: '' });
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/different email/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/different email/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('should show error message when signIn fails', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockResolvedValue({ error: 'Error', ok: false, status: 500, url: '' });
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
      });
    });

    it('should show error message on network failure', async () => {
      const user = userEvent.setup();
      vi.mocked(signIn).mockRejectedValue(new Error('Network error'));
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-invalid on error', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const input = screen.getByLabelText(/email address/i);
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby linking to error message', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/email address/i);
        expect(input).toHaveAttribute('aria-describedby', 'email-error');
      });
    });
  });
});
