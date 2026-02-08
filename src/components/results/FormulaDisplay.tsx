'use client';

/**
 * FormulaDisplay Component
 *
 * Displays the formula used to calculate meeting waste in a readable format.
 * Uses a muted background for visual separation.
 *
 * Covers: FR18 - Show the formula applied to produce the result
 * AC: 2 - Users see the formula when expanding transparency section
 */

export function FormulaDisplay() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Calculation Formula</h3>
      <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
        <p className="text-foreground mb-2">Meeting Waste =</p>
        <p className="text-muted-foreground pl-4">
          meetings × attendees × (duration ÷ 60) × hourly rate × 52 weeks
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        This calculation determines the annual cost of recurring meetings based on
        attendee time and compensation.
      </p>
    </div>
  );
}
