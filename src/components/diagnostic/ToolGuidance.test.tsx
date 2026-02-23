/**
 * Tests for ToolGuidance component
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 9.1: Unit tests for ToolGuidance component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolGuidance } from './ToolGuidance';

// Mock the hooks and constants
vi.mock('./useGuidancePreference', () => ({
  useGuidancePreference: vi.fn(),
}));

vi.mock('./diagnostic-constants', () => ({
  getToolById: vi.fn(),
}));

vi.mock('./guidance-content', () => ({
  getToolGuidance: vi.fn(),
}));

import { useGuidancePreference } from './useGuidancePreference';
import { getToolById } from './diagnostic-constants';
import { getToolGuidance } from './guidance-content';

const mockUseGuidancePreference = vi.mocked(useGuidancePreference);
const mockGetToolById = vi.mocked(getToolById);
const mockGetToolGuidance = vi.mocked(getToolGuidance);

describe('ToolGuidance', () => {
  const mockDismiss = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGuidancePreference.mockReturnValue({
      isDismissed: false,
      isLoading: false,
      dismiss: mockDismiss,
      reset: mockReset,
    });

    mockGetToolById.mockReturnValue({
      id: 'alignment',
      number: 1,
      name: 'Organizational Alignment Assessment',
      shortName: 'Alignment',
      description: 'Score your organization across 5 alignment dimensions',
      icon: Object.assign(() => null, { $$typeof: Symbol.for('react.forward_ref') }) as never,
      route: '/tool/alignment',
      storeKey: 'tool1',
      anonymousAccess: false,
      estimatedMinutes: 10,
    });

    mockGetToolGuidance.mockReturnValue({
      whatItMeasures: 'How aligned your organization is.',
      whyItMatters: 'Misalignment causes problems.',
      dataNeeded: ['Knowledge of strategy', 'Understanding of execution'],
    });
  });

  it('renders guidance content when not dismissed', () => {
    render(<ToolGuidance toolId="alignment" />);

    expect(screen.getByText(/What this measures/i)).toBeInTheDocument();
    expect(screen.getByText(/Why it matters/i)).toBeInTheDocument();
    expect(screen.getByText(/What you'll need/i)).toBeInTheDocument();
  });

  it('shows time estimate', () => {
    render(<ToolGuidance toolId="alignment" />);

    expect(screen.getByText(/10 minutes/)).toBeInTheDocument();
  });

  it('displays what it measures content', () => {
    render(<ToolGuidance toolId="alignment" />);

    expect(screen.getByText('How aligned your organization is.')).toBeInTheDocument();
  });

  it('displays why it matters content', () => {
    render(<ToolGuidance toolId="alignment" />);

    expect(screen.getByText('Misalignment causes problems.')).toBeInTheDocument();
  });

  it('displays data needed items', () => {
    render(<ToolGuidance toolId="alignment" />);

    expect(screen.getByText('Knowledge of strategy')).toBeInTheDocument();
    expect(screen.getByText('Understanding of execution')).toBeInTheDocument();
  });

  it('does not render when dismissed', () => {
    mockUseGuidancePreference.mockReturnValue({
      isDismissed: true,
      isLoading: false,
      dismiss: mockDismiss,
      reset: mockReset,
    });

    const { container } = render(<ToolGuidance toolId="alignment" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders when dismissed but forceShow is true', () => {
    mockUseGuidancePreference.mockReturnValue({
      isDismissed: true,
      isLoading: false,
      dismiss: mockDismiss,
      reset: mockReset,
    });

    render(<ToolGuidance toolId="alignment" forceShow />);

    expect(screen.getByText(/What this measures/i)).toBeInTheDocument();
  });

  it('does not render while loading', () => {
    mockUseGuidancePreference.mockReturnValue({
      isDismissed: false,
      isLoading: true,
      dismiss: mockDismiss,
      reset: mockReset,
    });

    const { container } = render(<ToolGuidance toolId="alignment" />);

    expect(container.firstChild).toBeNull();
  });

  it('calls dismiss when X button is clicked', () => {
    render(<ToolGuidance toolId="alignment" />);

    const dismissButton = screen.getByRole('button', { name: /dismiss guidance/i });
    fireEvent.click(dismissButton);

    expect(mockDismiss).toHaveBeenCalled();
  });

  it('calls dismiss when "Don\'t show this again" is clicked', () => {
    render(<ToolGuidance toolId="alignment" />);

    const dontShowButton = screen.getByText(/Don't show this again/i);
    fireEvent.click(dontShowButton);

    expect(mockDismiss).toHaveBeenCalled();
  });

  it('does not render when tool is not found', () => {
    mockGetToolById.mockReturnValue(undefined);

    const { container } = render(<ToolGuidance toolId="invalid" />);

    expect(container.firstChild).toBeNull();
  });

  it('does not render when guidance is not found', () => {
    mockGetToolGuidance.mockReturnValue(undefined);

    const { container } = render(<ToolGuidance toolId="alignment" />);

    expect(container.firstChild).toBeNull();
  });

  it('has correct aria-label', () => {
    render(<ToolGuidance toolId="alignment" />);

    expect(
      screen.getByRole('complementary', {
        name: /Guidance for Organizational Alignment Assessment/i,
      })
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ToolGuidance toolId="alignment" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
