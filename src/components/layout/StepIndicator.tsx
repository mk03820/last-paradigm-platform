/**
 * Step Progress Indicator Component
 *
 * Displays the current step in the 7-step diagnostic journey.
 * Connects to the book's alignment tax diagnosis framework.
 *
 * Per UX requirements:
 * - Uses muted styling (non-intrusive)
 * - Small text size (14px)
 * - Accessible with appropriate ARIA attributes
 *
 * Covers: FR2, FR3 (step framing for diagnostic journey)
 */

interface StepIndicatorProps {
  /** The current step number (default: 1) */
  currentStep?: number;
  /** The total number of steps (default: 7) */
  totalSteps?: number;
  /** The label for the current step (default: "Meeting Audit Calculator") */
  stepLabel?: string;
}

export function StepIndicator({
  currentStep = 1,
  totalSteps = 7,
  stepLabel = 'Meeting Audit Calculator',
}: StepIndicatorProps) {
  return (
    <div
      role="status"
      aria-label="Progress indicator"
      className="text-center text-[14px] text-muted-foreground"
    >
      <span className="font-medium">
        Step {currentStep} of {totalSteps}:
      </span>{' '}
      {stepLabel}
    </div>
  );
}
