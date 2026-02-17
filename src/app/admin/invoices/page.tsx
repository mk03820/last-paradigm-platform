'use client';

/**
 * Admin Invoice Request Management Page
 *
 * List and manage enterprise invoice requests.
 *
 * Story 21.2: Invoice Request Management
 * Task 5-6: Create invoice management page (AC: 1, 5)
 * Covers: AC1 (list requests), AC5 (sorting, filtering, search)
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

/**
 * Invoice request type from API
 */
interface InvoiceRequest {
  id: string;
  userId: string;
  companyName: string;
  billingAddress: string;
  poNumber: string | null;
  contactEmail: string | null;
  status: string;
  invoiceNumber: string | null;
  cancellationReason: string | null;
  createdAt: string | null;
  processedAt: string | null;
  userEmail: string | null;
  userName: string | null;
}

/**
 * Status filter options
 */
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'invoice_sent', label: 'Invoice Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRequest | null>(null);
  const [modalType, setModalType] = useState<'invoice_sent' | 'paid' | 'cancelled' | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [sendNotification, setSendNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  /**
   * Fetch invoices from API
   */
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/invoices?${params}`);
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
        setTotal(data.total || 0);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setNotification({ type: 'error', message: 'Failed to load invoices' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  /**
   * Handle status update
   */
  const handleStatusUpdate = async () => {
    if (!selectedInvoice || !modalType) return;

    setIsSubmitting(true);
    setNotification(null);

    try {
      const body: Record<string, unknown> = { status: modalType };

      if (modalType === 'invoice_sent') {
        body.invoiceNumber = invoiceNumber;
      } else if (modalType === 'cancelled') {
        body.cancellationReason = cancellationReason;
        body.sendNotification = sendNotification;
      }

      const response = await fetch(
        `/api/admin/invoices/${selectedInvoice.id}/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: data.message });
        closeModal();
        fetchInvoices();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update status',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Open modal for status update
   */
  const openModal = (invoice: InvoiceRequest, type: typeof modalType) => {
    setSelectedInvoice(invoice);
    setModalType(type);
    setInvoiceNumber('');
    setCancellationReason('');
    setSendNotification(false);
  };

  /**
   * Close modal
   */
  const closeModal = () => {
    setSelectedInvoice(null);
    setModalType(null);
    setInvoiceNumber('');
    setCancellationReason('');
    setSendNotification(false);
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
    > = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      invoice_sent: { variant: 'outline', icon: <FileText className="h-3 w-3 mr-1" /> },
      paid: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const { variant, icon } = config[status] || { variant: 'outline', icon: null };

    return (
      <Badge variant={variant} className="flex items-center w-fit">
        {icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      <AdminHeader
        title="Invoice Requests"
        subtitle={`${total} total requests`}
        onRefresh={fetchInvoices}
        isRefreshing={loading}
      />

      <div className="p-8">
        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-current opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Status Filter */}
          <div className="flex gap-2">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search company or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800">
                <TableHead>Company</TableHead>
                <TableHead>User</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    <span className="block mt-2 text-slate-500">Loading invoices...</span>
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No invoice requests found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.companyName}</div>
                      <div className="text-sm text-slate-500">
                        {invoice.contactEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{invoice.userName || 'Unknown'}</div>
                      <div className="text-sm text-slate-500">
                        {invoice.userEmail}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.poNumber || '-'}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{invoice.invoiceNumber || '-'}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {invoice.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openModal(invoice, 'invoice_sent')}
                            >
                              Send Invoice
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => openModal(invoice, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {invoice.status === 'invoice_sent' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openModal(invoice, 'paid')}
                            >
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => openModal(invoice, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Status Update Modal */}
      <Dialog open={!!modalType} onOpenChange={() => closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === 'invoice_sent' && 'Send Invoice'}
              {modalType === 'paid' && 'Mark as Paid'}
              {modalType === 'cancelled' && 'Cancel Request'}
            </DialogTitle>
            <DialogDescription>
              {modalType === 'invoice_sent' &&
                'Enter the invoice number to send to the customer.'}
              {modalType === 'paid' &&
                'Confirm payment received. This will grant access to the customer.'}
              {modalType === 'cancelled' &&
                'Enter a reason for cancelling this request.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {modalType === 'invoice_sent' && (
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g., INV-2024-001"
                />
              </div>
            )}

            {modalType === 'paid' && selectedInvoice && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-medium">{selectedInvoice.companyName}</p>
                <p className="text-sm text-slate-500">
                  Invoice #{selectedInvoice.invoiceNumber}
                </p>
                <p className="text-sm text-slate-500">
                  Amount: $2,500.00
                </p>
              </div>
            )}

            {modalType === 'cancelled' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reason">Cancellation Reason</Label>
                  <Input
                    id="reason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Reason for cancellation..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="sendNotification">
                    Send cancellation notification to customer
                  </Label>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                isSubmitting ||
                (modalType === 'invoice_sent' && !invoiceNumber) ||
                (modalType === 'cancelled' && !cancellationReason)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
