/**
 * RegisterForm Component Tests
 *
 * Tests for registration form validation, loading states, and error handling.
 *
 * Covers: Story 15.2 Task 4.8, FR38 (Account creation), FR56 (Premium UX)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock auth store
vi.mock('@/lib/store/auth-store', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      setAuth: vi.fn(),
    };
    return selector(state);
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Form rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render sign in link', () => {
      render(<RegisterForm />);

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have proper input types', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
    });
  });

  describe('Inline validation', () => {
    it('should show error for invalid email on blur', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // blur

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for short password on blur', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error for password without number on blur', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'PasswordOnly');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/at least one number/i)).toBeInTheDocument();
      });
    });

    it('should show error for mismatched passwords on blur', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Different123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Password strength indicator', () => {
    it('should show password strength when typing', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'Password123!');

      await waitFor(() => {
        expect(screen.getByText(/password strength/i)).toBeInTheDocument();
      });
    });

    it('should not show strength indicator when password is empty', () => {
      render(<RegisterForm />);

      expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  json: () => Promise.resolve({ success: true, data: { user: {}, accessToken: 'token' } }),
                }),
              100
            )
          )
      );

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      });
    });

    it('should call onSuccess callback on successful registration', async () => {
      const onSuccess = vi.fn();
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              user: { id: '123', email: 'test@example.com', name: 'Test', purchaseStatus: 'none' },
              accessToken: 'mock-token',
            },
          }),
      });

      render(<RegisterForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should display success message after registration', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              user: { id: '123', email: 'test@example.com', name: null, purchaseStatus: 'none' },
              accessToken: 'token',
            },
          }),
      });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/account created/i)).toBeInTheDocument();
      });
    });

    it('should display error message on registration failure', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Email already exists' },
          }),
      });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible name field', () => {
      render(<RegisterForm />);
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute('id');
    });

    it('should have accessible email field', () => {
      render(<RegisterForm />);
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
    });

    it('should have accessible password field', () => {
      render(<RegisterForm />);
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should set aria-invalid on invalid fields', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      // Tab through all interactive elements
      await user.tab(); // name
      expect(screen.getByLabelText(/name/i)).toHaveFocus();

      await user.tab(); // email
      expect(screen.getByLabelText(/email/i)).toHaveFocus();

      await user.tab(); // password
      expect(screen.getByLabelText(/^password$/i)).toHaveFocus();
    });
  });

  describe('Sign in link', () => {
    it('should include callbackUrl in sign in link when provided', () => {
      render(<RegisterForm callbackUrl="/dashboard" />);

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toHaveAttribute(
        'href',
        expect.stringContaining('callbackUrl')
      );
    });
  });
});
