import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottleneckInsights } from './BottleneckInsights';
import type { PatternDetection } from './bottleneck-patterns';

/**
 * BottleneckInsights Tests
 *
 * Story 10.4: Bottleneck Pattern Identification
 * Covers: AC 3, 4 (Intervention recommendations, Tool 7 integration)
 */

const createDetection = (
  patternId: PatternDetection['patternId'],
  severity: PatternDetection['severity'] = 'medium',
  detected: boolean = true
): PatternDetection => ({
  patternId,
  detected,
  severity,
  affectedArchetypes: ['strategic'],
  confidence: 'auto',
  confirmedQuestions: [],
});

describe('BottleneckInsights', () => {
  describe('empty state', () => {
    it('shows no patterns message when no detections', () => {
      render(<BottleneckInsights initialDetections={[]} />);
      expect(screen.getByText('No Bottleneck Patterns Detected')).toBeInTheDocument();
    });

    it('shows healthy message when no detections', () => {
      render(<BottleneckInsights initialDetections={[]} />);
      expect(
        screen.getByText(/Your decision velocity appears healthy/)
      ).toBeInTheDocument();
    });
  });

  describe('with detections', () => {
    const detections = [
      createDetection('approval_layers', 'high'),
      createDetection('meeting_dependencies', 'medium'),
    ];

    it('renders section title', () => {
      render(<BottleneckInsights initialDetections={detections} />);
      expect(screen.getByText('Bottleneck Analysis')).toBeInTheDocument();
    });

    it('shows detection count', () => {
      render(<BottleneckInsights initialDetections={detections} />);
      expect(screen.getByText(/2 patterns detected/)).toBeInTheDocument();
    });

    it('shows singular when one pattern', () => {
      render(<BottleneckInsights initialDetections={[detections[0]]} />);
      expect(screen.getByText(/1 pattern detected/)).toBeInTheDocument();
    });

    it('renders top interventions section', () => {
      render(<BottleneckInsights initialDetections={detections} />);
      expect(screen.getByText('Top 3 Recommended Actions')).toBeInTheDocument();
    });

    it('shows interventions sorted by severity', () => {
      const mixedDetections = [
        createDetection('meeting_dependencies', 'low'),
        createDetection('approval_layers', 'critical'),
      ];
      render(<BottleneckInsights initialDetections={mixedDetections} />);

      // Critical (approval_layers) should come first
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent(/Decision Authority Matrix/);
    });

    it('renders pattern cards in summary view by default', () => {
      render(<BottleneckInsights initialDetections={detections} />);
      // Pattern labels appear in multiple places (top interventions + cards)
      expect(screen.getAllByText('Approval Layers').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Meeting Dependencies').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Tool 7 integration note', () => {
      render(<BottleneckInsights initialDetections={detections} />);
      expect(
        screen.getByText(/These insights will be included in your Total Cost/)
      ).toBeInTheDocument();
    });
  });

  describe('view modes', () => {
    const detections = [createDetection('approval_layers')];

    it('has Summary and Verify buttons', () => {
      render(<BottleneckInsights initialDetections={detections} />);
      expect(screen.getByRole('button', { name: 'Summary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
    });

    it('switches to diagnostic view on Verify click', async () => {
      const user = userEvent.setup();
      render(<BottleneckInsights initialDetections={detections} />);

      // Click the view mode Verify button (in the header toggle)
      const buttons = screen.getAllByRole('button', { name: 'Verify' });
      await user.click(buttons[0]); // First Verify button is the view mode toggle

      // Diagnostic view shows auto-detected badge (different from summary view's confirmed badge pattern)
      expect(screen.getAllByText('Auto-detected').length).toBeGreaterThanOrEqual(1);
    });

    it('switches back to summary view', async () => {
      const user = userEvent.setup();
      render(<BottleneckInsights initialDetections={detections} />);

      await user.click(screen.getByRole('button', { name: 'Verify' }));
      await user.click(screen.getByRole('button', { name: 'Summary' }));

      expect(
        screen.queryByText(/Does this apply to your organization/)
      ).not.toBeInTheDocument();
    });
  });

  describe('diagnostic interactions', () => {
    it('calls onDetectionsChange when detection updated', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const detections = [createDetection('approval_layers')];

      render(
        <BottleneckInsights
          initialDetections={detections}
          onDetectionsChange={onChange}
        />
      );

      // Switch to diagnostic view
      const viewModeButtons = screen.getAllByRole('button');
      const verifyViewButton = viewModeButtons.find(
        (b) => b.textContent === 'Verify' && !b.hasAttribute('aria-expanded')
      );
      await user.click(verifyViewButton!);

      // Now find and click the diagnostic's expand button (has aria-expanded)
      const expandButton = screen.getByRole('button', { expanded: false });
      await user.click(expandButton);

      // Check a question
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('with rejected detections', () => {
    it('shows message when all patterns dismissed', async () => {
      const user = userEvent.setup();
      const detections = [
        {
          ...createDetection('approval_layers'),
          detected: false,
          confidence: 'rejected' as const,
        },
      ];

      render(<BottleneckInsights initialDetections={detections} />);

      expect(
        screen.getByText('All detected patterns have been dismissed.')
      ).toBeInTheDocument();
    });

    it('excludes rejected patterns from count', () => {
      const detections = [
        createDetection('approval_layers', 'high', true),
        {
          ...createDetection('meeting_dependencies'),
          detected: false,
          confidence: 'rejected' as const,
        },
      ];

      render(<BottleneckInsights initialDetections={detections} />);

      expect(screen.getByText(/1 pattern detected/)).toBeInTheDocument();
    });
  });

  describe('intervention display', () => {
    it('shows Playbook 2 note for interventions with links', () => {
      const detections = [createDetection('approval_layers', 'high')];
      render(<BottleneckInsights initialDetections={detections} />);

      expect(
        screen.getByText(/Playbook 2 \(Coming Soon\)/)
      ).toBeInTheDocument();
    });

    it('shows numbered list of interventions', () => {
      const detections = [
        createDetection('approval_layers', 'high'),
        createDetection('meeting_dependencies', 'medium'),
      ];
      render(<BottleneckInsights initialDetections={detections} />);

      // Should see numbered badges 1, 2
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
