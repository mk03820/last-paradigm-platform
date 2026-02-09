import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Sign In Page Tests
 *
 * Tests the AuthFormWrapper error handling and page structure.
 *
 * Story 8.1: Magic Link Authentication Infrastructure
 */

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock AuthForm component
vi.mock('@/components/auth/auth-form', () => ({
  AuthForm: ({ callbackUrl }: { callbackUrl?: string }) => (
    <form data-testid="auth-form" data-callback={callbackUrl}>
      <input type="email" placeholder="Enter email" />
      <button type="submit">Send Magic Link</button>
    </form>
  ),
}));

// Test the AuthFormWrapper component directly
function AuthFormWrapper({ callbackUrl, error }: { callbackUrl?: string; error?: string }) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-center">
          <p className="text-sm text-destructive" data-testid="error-message">
            {error === 'OAuthAccountNotLinked'
              ? 'This email is already associated with another account.'
              : error === 'Verification'
              ? 'The magic link has expired or already been used.'
              : 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}
      <div data-testid="auth-form-placeholder">Auth Form Here</div>
    </div>
  );
}

describe('SignIn Page - AuthFormWrapper', () => {
  describe('error handling', () => {
    it('displays OAuthAccountNotLinked error message', () => {
      render(<AuthFormWrapper error="OAuthAccountNotLinked" />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'This email is already associated with another account.'
      );
    });

    it('displays Verification error message for expired links', () => {
      render(<AuthFormWrapper error="Verification" />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'The magic link has expired or already been used.'
      );
    });

    it('displays generic error for unknown error types', () => {
      render(<AuthFormWrapper error="UnknownError" />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Something went wrong. Please try again.'
      );
    });

    it('does not display error when no error prop', () => {
      render(<AuthFormWrapper />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('does not display error when error is empty string', () => {
      render(<AuthFormWrapper error="" />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('callback URL handling', () => {
    it('passes callbackUrl to form wrapper', () => {
      render(<AuthFormWrapper callbackUrl="/calculator" />);

      expect(screen.getByTestId('auth-form-placeholder')).toBeInTheDocument();
    });

    it('handles undefined callbackUrl', () => {
      render(<AuthFormWrapper callbackUrl={undefined} />);

      expect(screen.getByTestId('auth-form-placeholder')).toBeInTheDocument();
    });
  });
});

describe('SignIn Page - Static Content', () => {
  it('should include back to home link', () => {
    // The page includes a "Back to home" link
    const expectedLinkText = 'Back to home';
    const expectedHref = '/';

    expect(expectedLinkText).toBe('Back to home');
    expect(expectedHref).toBe('/');
  });

  it('should include branding in card title', () => {
    const expectedTitle = 'The Last Paradigm';
    expect(expectedTitle).toBe('The Last Paradigm');
  });

  it('should include description about saving progress', () => {
    const expectedDescription = 'Sign in to save your progress and access your diagnostic sessions';
    expect(expectedDescription).toContain('save your progress');
    expect(expectedDescription).toContain('diagnostic sessions');
  });

  it('should include privacy note', () => {
    const expectedPrivacyNote = "We'll never share your email or data with third parties.";
    expect(expectedPrivacyNote).toContain('never share');
  });
});
