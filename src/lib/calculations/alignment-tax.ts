/**
 * Alignment Tax Range Calculation
 *
 * Calculates the estimated total alignment tax based on meeting waste.
 * Meeting waste is estimated to represent 25-30% of total alignment tax.
 *
 * Formula:
 * - Min estimate: meetingWaste / 0.30 (if meeting waste is 30% of total)
 * - Max estimate: meetingWaste / 0.25 (if meeting waste is 25% of total)
 *
 * Covers: FR12 (alignment tax estimation)
 */

/** Percentage range for meeting waste as portion of total alignment tax */
const MEETING_WASTE_MIN_PERCENTAGE = 0.25; // Lower bound: 25%
const MEETING_WASTE_MAX_PERCENTAGE = 0.30; // Upper bound: 30%

/**
 * Result of alignment tax range calculation.
 */
export interface AlignmentTaxRange {
  /** Minimum estimated alignment tax (meetingWaste / 0.30) */
  estimatedMin: number;
  /** Maximum estimated alignment tax (meetingWaste / 0.25) */
  estimatedMax: number;
}

/**
 * Calculate the estimated total alignment tax range based on meeting waste.
 *
 * @param meetingWaste - The calculated meeting waste amount
 * @returns AlignmentTaxRange with min and max estimates
 */
export function calculateAlignmentTaxRange(meetingWaste: number): AlignmentTaxRange {
  // Handle edge case of zero or negative meeting waste
  if (meetingWaste <= 0) {
    return {
      estimatedMin: 0,
      estimatedMax: 0,
    };
  }

  return {
    // If meeting waste is 30% of total, total = waste / 0.30 (lower estimate)
    estimatedMin: meetingWaste / MEETING_WASTE_MAX_PERCENTAGE,
    // If meeting waste is 25% of total, total = waste / 0.25 (higher estimate)
    estimatedMax: meetingWaste / MEETING_WASTE_MIN_PERCENTAGE,
  };
}
