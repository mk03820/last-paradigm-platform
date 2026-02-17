'use client';

/**
 * Admin Dashboard Home Page
 *
 * Overview page with summary stats and quick actions.
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 6: Create admin dashboard home page (AC: 4)
 * Covers: AC4 (dashboard overview)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  RefreshCcw,
  Webhook,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
} from 'lucide-react';

interface DashboardStats {
  pendingInvoices: number;
  refundEligible: number;
  failedWebhooks: number;
  totalRevenue: number;
  totalPurchases: number;
  conversionRate: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch stats from various endpoints
      const [invoicesRes, webhooksRes, metricsRes] = await Promise.all([
        fetch('/api/admin/invoices?status=pending&limit=1'),
        fetch('/api/admin/webhooks/stats'),
        fetch('/api/admin/metrics?period=30days'),
      ]);

      const invoices = await invoicesRes.json().catch(() => ({ total: 0 }));
      const webhooks = await webhooksRes.json().catch(() => ({ failedCount: 0 }));
      const metrics = await metricsRes.json().catch(() => ({
        counts: { purchasesCompleted: 0 },
        revenue: { total: 0 },
        conversionRates: { overallAccountToPurchase: 0 },
      }));

      setStats({
        pendingInvoices: invoices.total || 0,
        refundEligible: 0, // Will be populated once refunds endpoint is ready
        failedWebhooks: webhooks.failedCount || 0,
        totalRevenue: metrics.revenue?.total || 0,
        totalPurchases: metrics.counts?.purchasesCompleted || 0,
        conversionRate: metrics.conversionRates?.overallAccountToPurchase || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set default values on error
      setStats({
        pendingInvoices: 0,
        refundEligible: 0,
        failedWebhooks: 0,
        totalRevenue: 0,
        totalPurchases: 0,
        conversionRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Overview of platform operations"
        onRefresh={fetchStats}
        isRefreshing={loading}
      />

      <div className="p-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Invoices */}
          <Link href="/admin/invoices">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Pending Invoices
                </CardTitle>
                <FileText className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stats?.pendingInvoices || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Failed Webhooks */}
          <Link href="/admin/webhooks">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Failed Webhooks
                </CardTitle>
                <Webhook
                  className={`h-5 w-5 ${
                    stats?.failedWebhooks && stats.failedWebhooks > 0
                      ? 'text-red-500'
                      : 'text-green-500'
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stats?.failedWebhooks || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Revenue (30d)
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.totalPurchases || 0} purchases
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Link href="/admin/metrics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Conversion Rate
                </CardTitle>
                <TrendingUp
                  className={`h-5 w-5 ${
                    (stats?.conversionRate || 0) >= 10
                      ? 'text-green-500'
                      : 'text-amber-500'
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading
                    ? '...'
                    : `${(stats?.conversionRate || 0).toFixed(1)}%`}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Target: 10%+
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/invoices?status=pending">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium">Process Invoice Requests</h3>
                  <p className="text-sm text-slate-500">
                    Review and send invoices to enterprise customers
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/refunds">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <RefreshCcw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Process Refunds</h3>
                  <p className="text-sm text-slate-500">
                    Handle 30-day guarantee refund requests
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/webhooks">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium">Review Failed Webhooks</h3>
                  <p className="text-sm text-slate-500">
                    Retry or manually reconcile failed events
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
