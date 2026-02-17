'use client';

/**
 * Invoice Request Modal Component
 *
 * Modal dialog for enterprise customers to request formal invoices.
 * Collects company details, billing address, and optional PO number.
 *
 * Story 17.7: Invoice Request Flow
 * Task 2: Create invoice request modal and form (AC: 2, 3, 6)
 * Covers: AC2, AC3 (form validation), AC5 (confirmation UI), AC6 (professional appearance)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Invoice form validation schema (AC3)
 */
const invoiceSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  billingEmail: z.string().email('Valid email is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  poNumber: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

/**
 * Modal status type
 */
type ModalStatus = 'form' | 'loading' | 'success' | 'error';

/**
 * Invoice Request Modal Props
 */
interface InvoiceRequestModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Pre-fill billing email with user's email */
  userEmail?: string;
}

/**
 * Invoice Request Modal
 *
 * Displays a form for enterprise customers to request a formal invoice.
 * Submits to /api/invoice/request and shows success/error states.
 */
export function InvoiceRequestModal({
  isOpen,
  onClose,
  userEmail,
}: InvoiceRequestModalProps) {
  const [status, setStatus] = useState<ModalStatus>('form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      billingEmail: userEmail || '',
      country: 'United States',
      companyName: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      poNumber: '',
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: InvoiceFormData) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/invoice/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: data.companyName,
          billingEmail: data.billingEmail,
          billingAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
          },
          poNumber: data.poNumber || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  /**
   * Handle modal close with state reset
   */
  const handleClose = () => {
    setStatus('form');
    setErrorMessage(null);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-amber-500" />
            <DialogTitle className="text-xl text-white">
              Request Enterprise Invoice
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            For corporate purchases, we&apos;ll send you a formal invoice that can be
            processed through your procurement system.
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <SuccessState onClose={handleClose} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-200">
                Company Name *
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                className={cn(
                  'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500',
                  errors.companyName && 'border-red-500'
                )}
                {...register('companyName')}
              />
              {errors.companyName && (
                <p className="text-red-400 text-sm">{errors.companyName.message}</p>
              )}
            </div>

            {/* Billing Email */}
            <div className="space-y-2">
              <Label htmlFor="billingEmail" className="text-slate-200">
                Billing Email *
              </Label>
              <Input
                id="billingEmail"
                type="email"
                placeholder="billing@company.com"
                className={cn(
                  'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500',
                  errors.billingEmail && 'border-red-500'
                )}
                {...register('billingEmail')}
              />
              {errors.billingEmail && (
                <p className="text-red-400 text-sm">{errors.billingEmail.message}</p>
              )}
            </div>

            {/* PO Number (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="poNumber" className="text-slate-200">
                PO Number <span className="text-slate-500">(Optional)</span>
              </Label>
              <Input
                id="poNumber"
                placeholder="PO-12345"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                {...register('poNumber')}
              />
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-200">
                Billing Address *
              </h4>

              <div className="space-y-2">
                <Input
                  id="street"
                  placeholder="Street Address"
                  className={cn(
                    'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500',
                    errors.street && 'border-red-500'
                  )}
                  {...register('street')}
                />
                {errors.street && (
                  <p className="text-red-400 text-sm">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="city"
                    placeholder="City"
                    className={cn(
                      'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500',
                      errors.city && 'border-red-500'
                    )}
                    {...register('city')}
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    id="state"
                    placeholder="State/Province"
                    className={cn(
                      'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500',
                      errors.state && 'border-red-500'
                    )}
                    {...register('state')}
                  />
                  {errors.state && (
                    <p className="text-red-400 text-sm">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="postalCode"
                    placeholder="Postal Code"
                    className={cn(
                      'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500',
                      errors.postalCode && 'border-red-500'
                    )}
                    {...register('postalCode')}
                  />
                  {errors.postalCode && (
                    <p className="text-red-400 text-sm">{errors.postalCode.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    id="country"
                    placeholder="Country"
                    className={cn(
                      'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500',
                      errors.country && 'border-red-500'
                    )}
                    {...register('country')}
                  />
                  {errors.country && (
                    <p className="text-red-400 text-sm">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="flex items-start gap-3 bg-red-900/30 border border-red-700 rounded-md p-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Success State Component (AC5)
 *
 * Displays confirmation message after successful submission.
 */
function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-8 w-8 text-green-400" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Invoice Request Received
      </h3>

      <p className="text-slate-400 mb-6">
        Thank you for your request. Our team will prepare and send your invoice
        within <strong className="text-white">1 business day</strong>.
      </p>

      <p className="text-sm text-slate-500 mb-8">
        You&apos;ll receive the invoice at the billing email address you provided.
        If you have any questions, please contact{' '}
        <a
          href="mailto:billing@lastparadigm.com"
          className="text-amber-500 hover:underline"
        >
          billing@lastparadigm.com
        </a>
      </p>

      <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-500 text-white">
        Close
      </Button>
    </div>
  );
}

export default InvoiceRequestModal;
