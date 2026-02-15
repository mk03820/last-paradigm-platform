/**
 * LoginForm Component Tests
 *
 * Tests for the email/password login form component.
 *
 * Covers: Story 15.3 Task 8.10, FR41 (User login), FR56 (Premium UX)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('LoginForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.setItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render email and password fields', () => {
      render(<LoginForm />);

      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });

    it('should render submit button with "Sign In" text', () => {
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<LoginForm />);

      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('should render create account link', () => {
      render(<LoginForm />);

      expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument();
    });

    it('should render password visibility toggle button', () => {
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email format on blur', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty email on blur', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty password on blur', async () => {
      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      fireEvent.focus(passwordInput);
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should not show errors before field is touched', () => {
      render(<LoginForm />);

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when clicking the toggle button', async () => {
      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide - button label changes
      const hideButton = screen.getByRole('button', { name: /hide password/i });
      await user.click(hideButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Submission', () => {
    it('should show loading state during submission', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(() => {
            /* Never resolves */
          })
      );

      render(<LoginForm />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button during submission', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(() => {
            /* Never resolves */
          })
      );

      render(<LoginForm />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Button is now showing "Signing in..." and should be disabled
        const disabledButton = screen.getByRole('button', { name: /signing in/i });
        expect(disabledButton).toBeDisabled();
      });
    });

    it('should call onSuccess with access token on successful login', async () => {
      const onSuccess = vi.fn();
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              accessToken: 'test-token',
              user: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
              },
            },
          }),
      });

      render(<LoginForm onSuccess={onSuccess} />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({
          accessToken: 'test-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          },
        });
      });
    });

    it('should NOT store access token in sessionStorage (XSS vulnerability)', async () => {
      // Security: Access tokens should be passed to parent via onSuccess callback
      // for storage in Zustand (memory-based), NOT in sessionStorage (XSS vulnerable)
      const onSuccess = vi.fn();

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              accessToken: 'test-access-token',
              user: { id: '1', email: 'test@example.com', name: null },
            },
          }),
      });

      render(<LoginForm onSuccess={onSuccess} />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        // Verify onSuccess is called with token data (for Zustand storage)
        expect(onSuccess).toHaveBeenCalledWith({
          accessToken: 'test-access-token',
          user: { id: '1', email: 'test@example.com', name: null },
        });
        // Verify sessionStorage is NOT used (security fix)
        expect(mockSessionStorage.setItem).not.toHaveBeenCalledWith(
          'accessToken',
          expect.any(String)
        );
      });
    });

    it('should display error message on failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              message: 'Invalid email or password.',
            },
          }),
      });

      render(<LoginForm />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrong-password');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should display network error message on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<LoginForm />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should clear error message on new submission', async () => {
      // First submission fails
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Invalid credentials' },
          }),
      });

      render(<LoginForm />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrong-password');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Second submission - mock never resolves
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(() => {
            /* Never resolves */
          })
      );

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback URL Handling', () => {
    it('should include callbackUrl in forgot password link', () => {
      render(<LoginForm callbackUrl="/dashboard" />);

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute(
        'href',
        '/auth/forgot-password?callbackUrl=%2Fdashboard'
      );
    });

    it('should include callbackUrl in register link', () => {
      render(<LoginForm callbackUrl="/dashboard" />);

      const registerLink = screen.getByRole('link', { name: /create one/i });
      expect(registerLink).toHaveAttribute(
        'href',
        '/auth/register?callbackUrl=%2Fdashboard'
      );
    });

    it('should use default links without callbackUrl when not provided', () => {
      render(<LoginForm />);

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');

      const registerLink = screen.getByRole('link', { name: /create one/i });
      expect(registerLink).toHaveAttribute('href', '/auth/register');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-invalid attribute on invalid fields', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      await user.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have proper autocomplete attributes', () => {
      render(<LoginForm />);

      expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute(
        'autocomplete',
        'email'
      );
      expect(screen.getByPlaceholderText(/enter your password/i)).toHaveAttribute(
        'autocomplete',
        'current-password'
      );
    });
  });
});
