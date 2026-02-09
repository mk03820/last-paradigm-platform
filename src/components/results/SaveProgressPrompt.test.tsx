import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveProgressPrompt } from './SaveProgressPrompt';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

import { useSession } from 'next-auth/react';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('SaveProgressPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('visibility', () => {
    it('should not render when user is authenticated', () => {
      vi.mocked(useSession).mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' }, expires: '' },
        status: 'authenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);

      const { container } = render(<SaveProgressPrompt />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should not render when session is loading', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);

      const { container } = render(<SaveProgressPrompt />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should not render when already dismissed', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue('true');

      const { container } = render(<SaveProgressPrompt />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render for anonymous users who have not dismissed', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);

      render(<SaveProgressPrompt />);
      expect(screen.getByText(/save your progress/i)).toBeInTheDocument();
    });
  });

  describe('content', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should display save progress button', () => {
      render(<SaveProgressPrompt />);
      expect(screen.getByRole('link', { name: /save progress/i })).toBeInTheDocument();
    });

    it('should have link to signin with dashboard callback', () => {
      render(<SaveProgressPrompt />);
      const link = screen.getByRole('link', { name: /save progress/i });
      expect(link).toHaveAttribute('href', '/auth/signin?callbackUrl=/dashboard');
    });

    it('should display continue without saving option', () => {
      render(<SaveProgressPrompt />);
      expect(screen.getByText(/continue without saving/i)).toBeInTheDocument();
    });

    it('should display dismiss button', () => {
      render(<SaveProgressPrompt />);
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });
  });

  describe('dismissal', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should dismiss when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<SaveProgressPrompt />);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'save-progress-dismissed',
        'true'
      );
    });

    it('should dismiss when continue without saving is clicked', async () => {
      const user = userEvent.setup();
      render(<SaveProgressPrompt />);

      await user.click(screen.getByText(/continue without saving/i));

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'save-progress-dismissed',
        'true'
      );
    });

    it('should hide after dismiss', async () => {
      const user = userEvent.setup();
      render(<SaveProgressPrompt />);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(screen.queryByText(/save your progress/i)).not.toBeInTheDocument();
    });
  });
});
