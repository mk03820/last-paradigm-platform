/**
 * PurchaseConfirmation Component
 *
 * Displays purchase confirmation details including amount, date, and email.
 * Uses Executive Clarity theme with clear visual hierarchy.
 *
 * Story 17.6: Purchase Success Page
 * Task 3: Create purchase confirmation details component (AC: 3)
 * Covers: AC3 (receipt details - amount, date, email confirmation)
 */

import { Receipt, Mail, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format-currency';

/**
 * Props for PurchaseConfirmation component
 */
interface PurchaseConfirmationProps {
  /** Purchase amount in cents */
  amount: number;
  /** Currency code (e.g., 'usd') */
  currency: string;
  /** Date and time of purchase */
  purchasedAt: Date;
  /** Email address where receipt was sent */
  email: string;
  /** Optional transaction/order ID for reference */
  orderId?: string;
}

/**
 * PurchaseConfirmation - Receipt details section
 *
 * Features:
 * - Displays formatted purchase amount
 * - Shows formatted purchase date/time
 * - Indicates where receipt email was sent
 * - Optional order ID display
 * - Executive Clarity theme (slate-800 card, slate-700 borders)
 *
 * @example
 * ```tsx
 * <PurchaseConfirmation
 *   amount={250000}
 *   currency="usd"
 *   purchasedAt={new Date()}
 *   email="user@example.com"
 * />
 * ```
 */
export function PurchaseConfirmation({
  amount,
  currency,
  purchasedAt,
  email,
  orderId,
}: PurchaseConfirmationProps) {
  // Format amount from cents to dollars
  const formattedAmount = formatCurrency(amount / 100);

  // Format date with full details
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(purchasedAt));

  return (
    <section
      className="py-10 sm:py-12 bg-slate-800/50"
      aria-labelledby="confirmation-heading"
    >
      <div className="container mx-auto px-4 max-w-2xl">
        <h2
          id="confirmation-heading"
          className="text-lg font-medium text-slate-400 mb-6 text-center"
        >
          Purchase Confirmation
        </h2>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5 sm:p-6 space-y-4">
          {/* Amount Paid */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt
                className="h-5 w-5 text-slate-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-slate-300">Amount Paid</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">
              {formattedAmount}
            </span>
          </div>

          <div className="border-t border-slate-700" aria-hidden="true" />

          {/* Purchase Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <Calendar
                className="h-5 w-5 text-slate-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-slate-300">Purchase Date</span>
            </div>
            <span className="text-slate-200 text-sm sm:text-base sm:text-right">
              {formattedDate}
            </span>
          </div>

          <div className="border-t border-slate-700" aria-hidden="true" />

          {/* Receipt Email */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <Mail
                className="h-5 w-5 text-slate-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-slate-300">Receipt Sent To</span>
            </div>
            <span className="text-slate-200 text-sm sm:text-base break-all sm:break-normal">
              {email}
            </span>
          </div>

          {/* Optional Order ID */}
          {orderId && (
            <>
              <div className="border-t border-slate-700" aria-hidden="true" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <span className="text-slate-400 text-sm">Order Reference</span>
                <span className="text-slate-500 text-xs sm:text-sm font-mono">
                  {orderId}
                </span>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          A detailed receipt has been sent to your email address.
        </p>
      </div>
    </section>
  );
}

export default PurchaseConfirmation;
