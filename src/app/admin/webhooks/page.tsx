'use client';

/**
 * Admin Webhooks Dashboard Page
 *
 * Displays webhook events with filtering, retry functionality,
 * stats, and manual reconciliation controls.
 *
 * Story 21.4: Webhook Monitoring & Recovery
 * Task 1: Enhance existing webhook page (AC: 1, 4, 5)
 * Covers: AC1 (display events), AC4 (health metrics), AC5 (alert acknowledgement)
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  PlayCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wrench,
  Check,
} from 'lucide-react';

/**
 * Webhook event type from API
 */
interface WebhookEvent {
  id: string;
  source: string;
  eventType: string;
  eventId: string | null;
  status: string;
  attempts: number;
  errorMessage: string | null;
  createdAt: string;
  processedAt: string | null;
  acknowledgedAt?: string | null;
}

/**
 * Webhook stats
 */
interface WebhookStats {
  totalLast24Hours: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  criticalFailures: Array<{
    id: string;
    eventType: string;
    attempts: number;
    lastError: string | null;
    isAcknowledged: boolean;
  }>;
  unacknowledgedCriticalCount: number;
}

/**
 * Status filter options
 */
const STATUS_FILTERS = ['all', 'received', 'processing', 'processed', 'failed'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/**
 * Admin Webhooks Dashboard
 */
export default function WebhooksAdminPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [total, setTotal] = useState(0);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Manual reconciliation modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  const [manualUserEmail, setManualUserEmail] = useState('');
  const [manualVerification, setManualVerification] = useState<{
    session: { id: string; amount: number; customerEmail: string };
    user: { id: string; email: string };
  } | null>(null);
  const [manualProcessing, setManualProcessing] = useState(false);

  /**
   * Fetch webhook events from API
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/admin/webhooks${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching events:', error);
      setNotification({ type: 'error', message: 'Failed to load webhook events' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  /**
   * Fetch webhook stats
   */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/webhooks/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [fetchEvents, fetchStats]);

  /**
   * Handle manual retry of a failed event
   */
  const handleRetry = async (eventId: string) => {
    setRetryingId(eventId);
    setNotification(null);

    try {
      const response = await fetch(`/api/admin/webhooks/${eventId}/retry`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotification({ type: 'success', message: 'Event processed successfully' });
        fetchEvents();
        fetchStats();
      } else {
        setNotification({
          type: 'error',
          message: `Retry failed: ${result.error || result.message}`,
        });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to retry event' });
    } finally {
      setRetryingId(null);
    }
  };

  /**
   * Handle auto reconciliation run
   */
  const handleReconciliation = async () => {
    setReconciling(true);
    setNotification(null);

    try {
      const response = await fetch('/api/admin/reconcile?autoProcess=true', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        const message = `Reconciliation complete: ${result.matched} matched, ${result.missing} missing, ${result.processed} processed`;
        setNotification({
          type: result.errors?.length > 0 ? 'error' : 'success',
          message:
            result.errors?.length > 0 ? `${message} (${result.errors.length} errors)` : message,
        });
        fetchEvents();
        fetchStats();
      } else {
        setNotification({ type: 'error', message: 'Reconciliation failed' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Reconciliation failed' });
    } finally {
      setReconciling(false);
    }
  };

  /**
   * Handle acknowledge alert
   */
  const handleAcknowledge = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/webhooks/${eventId}/acknowledge`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchEvents();
        fetchStats();
      }
    } catch (error) {
      console.error('Error acknowledging:', error);
    }
  };

  /**
   * Handle manual reconciliation verification
   */
  const handleManualVerify = async () => {
    if (!manualSessionId || !manualUserEmail) return;

    setManualProcessing(true);
    try {
      const response = await fetch('/api/admin/reconcile/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeSessionId: manualSessionId,
          userEmail: manualUserEmail,
          confirmed: false,
        }),
      });

      const data = await response.json();

      if (response.ok && data.requiresConfirmation) {
        setManualVerification(data);
      } else {
        setNotification({ type: 'error', message: data.error || 'Verification failed' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Verification failed' });
    } finally {
      setManualProcessing(false);
    }
  };

  /**
   * Handle manual reconciliation confirmation
   */
  const handleManualConfirm = async () => {
    setManualProcessing(true);
    try {
      const response = await fetch('/api/admin/reconcile/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeSessionId: manualSessionId,
          userEmail: manualUserEmail,
          confirmed: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: 'Manual reconciliation completed' });
        setShowManualModal(false);
        setManualSessionId('');
        setManualUserEmail('');
        setManualVerification(null);
        fetchEvents();
        fetchStats();
      } else {
        setNotification({ type: 'error', message: data.error || 'Reconciliation failed' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Reconciliation failed' });
    } finally {
      setManualProcessing(false);
    }
  };

  /**
   * Get status badge variant and icon
   */
  const getStatusBadge = (status: string, attempts: number) => {
    const isCritical = status === 'failed' && attempts > 3;

    const config: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
    > = {
      processed: {
        variant: 'default',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      received: {
        variant: 'secondary',
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      processing: {
        variant: 'outline',
        icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
      },
      failed: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    };

    const { variant, icon } = config[status] || { variant: 'outline', icon: null };

    return (
      <div className="flex items-center gap-2">
        <Badge variant={variant} className="flex items-center w-fit">
          {icon}
          {status}
        </Badge>
        {isCritical && (
          <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Critical: >3 attempts" />
        )}
      </div>
    );
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  /**
   * Format currency
   */
  const formatCurrency = (cents: number | null) => {
    if (!cents) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div>
      <AdminHeader
        title="Webhooks"
        subtitle="Monitor webhook events and reconciliation"
        onRefresh={() => { fetchEvents(); fetchStats(); }}
        isRefreshing={loading || statsLoading}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowManualModal(true)}>
              <Wrench className="h-4 w-4 mr-2" />
              Manual Reconcile
            </Button>
            <Button onClick={handleReconciliation} disabled={reconciling}>
              <AlertTriangle className={`h-4 w-4 mr-2 ${reconciling ? 'animate-pulse' : ''}`} />
              {reconciling ? 'Running...' : 'Auto Reconcile'}
            </Button>
          </div>
        }
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
              <XCircle className="h-5 w-5" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Last 24 Hours
              </CardTitle>
              <RefreshCw className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? '...' : stats?.totalLast24Hours || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Success Rate
              </CardTitle>
              {(stats?.successRate || 0) >= 95 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? '...' : `${stats?.successRate || 0}%`}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.successCount || 0} successful
              </p>
            </CardContent>
          </Card>

          <Card className={stats && stats.failedCount > 0 ? 'border-red-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Failed (24h)
              </CardTitle>
              <XCircle
                className={`h-5 w-5 ${
                  stats && stats.failedCount > 0 ? 'text-red-500' : 'text-slate-400'
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? '...' : stats?.failedCount || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card className={stats && stats.unacknowledgedCriticalCount > 0 ? 'border-red-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Critical Alerts
              </CardTitle>
              <AlertTriangle
                className={`h-5 w-5 ${
                  stats && stats.unacknowledgedCriticalCount > 0
                    ? 'text-red-500'
                    : 'text-slate-400'
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? '...' : stats?.unacknowledgedCriticalCount || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {'>'}3 failed attempts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Failures Alert */}
        {stats && stats.criticalFailures.filter((f) => !f.isAcknowledged).length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-red-800 dark:text-red-400">
                Critical Failures Require Attention
              </h3>
            </div>
            <div className="space-y-2">
              {stats.criticalFailures
                .filter((f) => !f.isAcknowledged)
                .map((failure) => (
                  <div
                    key={failure.id}
                    className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded"
                  >
                    <div>
                      <span className="font-medium">{failure.eventType}</span>
                      <span className="text-sm text-slate-500 ml-2">
                        ({failure.attempts} attempts)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(failure.id)}
                      >
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcknowledge(failure.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status}
            </Button>
          ))}
          <span className="ml-4 text-sm text-slate-500 self-center">
            {total} total events
          </span>
        </div>

        {/* Events Table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800">
                <TableHead className="w-48">Event ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-20 text-center">Attempts</TableHead>
                <TableHead className="max-w-xs">Error</TableHead>
                <TableHead className="w-44">Created</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    <span className="block mt-2 text-slate-500">Loading events...</span>
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No webhook events found
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {event.eventId?.substring(0, 24) || event.id.substring(0, 24)}...
                    </TableCell>
                    <TableCell className="font-medium">{event.eventType}</TableCell>
                    <TableCell>{getStatusBadge(event.status, event.attempts)}</TableCell>
                    <TableCell className="text-center">{event.attempts}</TableCell>
                    <TableCell className="max-w-xs">
                      {event.errorMessage ? (
                        <span
                          className="text-sm text-red-600 dark:text-red-400 truncate block"
                          title={event.errorMessage}
                        >
                          {event.errorMessage.substring(0, 50)}
                          {event.errorMessage.length > 50 ? '...' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(event.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {event.status !== 'processed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(event.id)}
                            disabled={retryingId === event.id}
                          >
                            {retryingId === event.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Retry
                              </>
                            )}
                          </Button>
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

      {/* Manual Reconciliation Modal */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Reconciliation</DialogTitle>
            <DialogDescription>
              Manually process a Stripe session that was not captured by webhooks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Stripe Session ID</Label>
              <Input
                id="sessionId"
                value={manualSessionId}
                onChange={(e) => setManualSessionId(e.target.value)}
                placeholder="cs_live_..."
                disabled={!!manualVerification}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={manualUserEmail}
                onChange={(e) => setManualUserEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={!!manualVerification}
              />
            </div>

            {manualVerification && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                <h4 className="font-medium text-green-800 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Verification Successful
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(manualVerification.session.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Stripe Email</p>
                    <p className="font-medium">
                      {manualVerification.session.customerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">User ID</p>
                    <p className="font-medium font-mono text-xs">
                      {manualVerification.user.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">User Email</p>
                    <p className="font-medium">
                      {manualVerification.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowManualModal(false);
                setManualSessionId('');
                setManualUserEmail('');
                setManualVerification(null);
              }}
            >
              Cancel
            </Button>
            {!manualVerification ? (
              <Button
                onClick={handleManualVerify}
                disabled={!manualSessionId || !manualUserEmail || manualProcessing}
              >
                {manualProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            ) : (
              <Button onClick={handleManualConfirm} disabled={manualProcessing}>
                {manualProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm & Grant Access'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
