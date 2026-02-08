import { z } from 'zod';

/**
 * Zod schema for validating salary band distribution.
 *
 * Validates that:
 * - All band counts are non-negative integers
 * - Used in conjunction with total validation in the component
 *
 * Covers: FR8, FR9 - Salary band allocation validation
 */
export const salaryDistributionSchema = z.object({
  executive: z
    .number()
    .int('Executive count must be a whole number')
    .nonnegative('Executive count cannot be negative'),
  senior: z
    .number()
    .int('Senior count must be a whole number')
    .nonnegative('Senior count cannot be negative'),
  midLevel: z
    .number()
    .int('Mid-level count must be a whole number')
    .nonnegative('Mid-level count cannot be negative'),
  entry: z
    .number()
    .int('Entry count must be a whole number')
    .nonnegative('Entry count cannot be negative'),
});

export type SalaryDistributionSchemaType = z.infer<typeof salaryDistributionSchema>;

/**
 * Validates that the total salary band distribution equals the expected total.
 *
 * @param distribution - The salary band distribution to validate
 * @param expectedTotal - The expected total number of attendees
 * @returns An object with isValid and error message if invalid
 */
export function validateDistributionTotal(
  distribution: SalaryDistributionSchemaType,
  expectedTotal: number
): { isValid: boolean; error?: string } {
  const total =
    distribution.executive +
    distribution.senior +
    distribution.midLevel +
    distribution.entry;

  if (total !== expectedTotal) {
    return {
      isValid: false,
      error: `Total allocations must equal ${expectedTotal} attendees`,
    };
  }

  return { isValid: true };
}
