/**
 * Currency Formatting Utility
 *
 * Formats numbers as USD currency with proper locale formatting.
 * Used for displaying meeting waste amounts in the results page.
 *
 * Covers: AC3 - Currency formatting with appropriate precision
 */

/**
 * Formats a number as USD currency with commas and no decimal places.
 *
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234,567")
 *
 * @example
 * formatCurrency(1234567) // "$1,234,567"
 * formatCurrency(100.99)  // "$101" (rounds to whole dollars)
 */
export function formatCurrency(amount: number): string {
  // Round to whole dollars (no decimal places as per spec)
  const roundedAmount = Math.round(amount);

  // Use Intl.NumberFormat for proper USD locale formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedAmount);
}
