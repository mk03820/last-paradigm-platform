'use client';

/**
 * Admin Refund Processing Page
 *
 * List and process refund-eligible purchases.
 *
 * Story 21.3: Refund Processing Interface
 * Task 4-5: Create refund management page (AC: 1, 5)
 * Covers: AC1 (list eligible purchases), AC5 (refund rate monitoring)
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  DollarSign,
} from 'lucide-react';

/**
 * Refund-eligible purchase
 */
interface RefundEligiblePurchase {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  amount: number;
  purchaseDate: string | null;
  daysRemaining: number;
}

/**
 * Refund stats
 */
interface RefundStats {
  totalPurchases: number;
  refundedPurchases: number;
  refundRate: number;
  totalRefundAmount: number;
  targetRate: number;
  isWithinTarget: boolean;
}

export default function AdminRefundsPage() {
  const [purchases, setPurchases] = useState<RefundEligiblePurchase[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Modal state
  const [selectedPurchase, setSelectedPurchase] = useState<RefundEligiblePurchase | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  /**
   * Fetch refund-eligible purchases
   */
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/refunds');
      const data = await response.json();

      if (response.ok) {
        setPurchases(data.purchases || []);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch refund stats
   */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/refunds/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
    fetchStats();
  }, [fetchPurchases, fetchStats]);

  /**
   * Process refund
   */
  const handleProcessRefund = async () => {
    if (!selectedPurchase) return;

    setIsSubmitting(true);
    setNotification(null);

    try {
      const response = await fetch(
        `/api/admin/refunds/${selectedPurchase.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason, confirmed: true }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Refund processed successfully',
        });
        setSelectedPurchase(null);
        setReason('');
        fetchPurchases();
        fetchStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process refund',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
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

  /**
   * Refresh all data
   */
  const handleRefresh = () => {
    fetchPurchases();
    fetchStats();
  };

  return (
    <div>
      <AdminHeader
        title="Refunds"
        subtitle="Process 30-day guarantee refunds"
        onRefresh={handleRefresh}
        isRefreshing={loading || statsLoading}
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
              <AlertTriangle className="h-5 w-5" />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Refund Rate */}
          <Card className={stats && !stats.isWithinTarget ? 'border-red-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Refund Rate
              </CardTitle>
              {stats?.isWithinTarget ? (
                <TrendingDown className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? '...' : `${stats?.refundRate || 0}%`}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-500">
                  Target: &lt;{stats?.targetRate || 5}%
                </p>
                {stats && !stats.isWithinTarget && (
                  <span className="text-xs text-red-500 font-medium">
                    Above target
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total Refunds */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Refunds
              </CardTitle>
              <RefreshCcw className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? '...' : stats?.refundedPurchases || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                of {stats?.totalPurchases || 0} purchases
              </p>
            </CardContent>
          </Card>

          {/* Refund Amount */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Refund Amount
              </CardTitle>
              <DollarSign className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading
                  ? '...'
                  : formatCurrency(stats?.totalRefundAmount || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Warning if above target */}
        {stats && !stats.isWithinTarget && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-400">
                Refund rate exceeds target
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Current rate ({stats.refundRate}%) is above the {stats.targetRate}%
                target. Review product quality and customer feedback.
              </p>
            </div>
          </div>
        )}

        {/* Eligible Purchases Table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold">Refund-Eligible Purchases</h2>
            <p className="text-sm text-slate-500">
              Purchases within the 30-day guarantee period
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800">
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    <span className="block mt-2 text-slate-500">
                      Loading purchases...
                    </span>
                  </TableCell>
                </TableRow>
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No refund-eligible purchases found
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="font-medium">
                        {purchase.userName || 'Unknown'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {purchase.userEmail}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(purchase.amount)}
                    </TableCell>
                    <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          purchase.daysRemaining <= 7
                            ? 'text-red-600'
                            : purchase.daysRemaining <= 14
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {purchase.daysRemaining} days
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedPurchase(purchase)}
                      >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Process Refund
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      <Dialog
        open={!!selectedPurchase}
        onOpenChange={() => setSelectedPurchase(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              This will refund the purchase and revoke access to the toolkit.
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <p className="font-medium">
                      {selectedPurchase.userName || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedPurchase.userEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Amount</p>
                    <p className="font-medium text-xl">
                      {formatCurrency(selectedPurchase.amount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Customer request, product issue, etc."
                />
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-400 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                This action cannot be undone. The customer will lose access to all
                toolkit documents.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPurchase(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleProcessRefund}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Refund'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
