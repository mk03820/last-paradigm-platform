'use client';

/**
 * Admin Conversion Metrics Dashboard Page
 *
 * Display conversion funnel metrics and trends.
 *
 * Story 21.5: Conversion Funnel Dashboard
 * Task 4-6: Create conversion metrics page (AC: 1-5)
 * Covers: AC1-5 (metrics, rates, filters, trends, refresh)
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Eye,
  ShoppingCart,
  CheckCircle,
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Loader2,
  ArrowRight,
} from 'lucide-react';

/**
 * Conversion metrics from API
 */
interface ConversionMetrics {
  period: string;
  periodStart: string;
  periodEnd: string;
  lastUpdated: string;
  counts: {
    accountsCreated: number;
    previewsViewed: number;
    checkoutsStarted: number;
    purchasesCompleted: number;
    invoiceRequests: number;
    toolkitsDownloaded: number;
  };
  revenue: {
    total: number;
    average: number;
  };
  conversionRates: {
    accountToPreview: number;
    previewToCheckout: number;
    checkoutToComplete: number;
    overallAccountToPurchase: number;
    target: number;
    isAboveTarget: boolean;
  };
}

/**
 * Trend data point
 */
interface TrendDataPoint {
  date: string;
  purchases: number;
  revenue: number;
}

/**
 * Time period options
 */
const TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [period, setPeriod] = useState('30days');
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  /**
   * Fetch metrics
   */
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/metrics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  /**
   * Fetch trends
   */
  const fetchTrends = useCallback(async () => {
    setTrendsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/metrics/trends?period=${period}&granularity=${granularity}`
      );
      if (response.ok) {
        const data = await response.json();
        setTrends(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setTrendsLoading(false);
    }
  }, [period, granularity]);

  useEffect(() => {
    fetchMetrics();
    fetchTrends();
  }, [fetchMetrics, fetchTrends]);

  /**
   * Format currency
   */
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Format last updated
   */
  const formatLastUpdated = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleRefresh = () => {
    fetchMetrics();
    fetchTrends();
  };

  return (
    <div>
      <AdminHeader
        title="Conversion Metrics"
        subtitle={
          metrics
            ? `Last updated: ${formatLastUpdated(metrics.lastUpdated)}`
            : 'Loading...'
        }
        onRefresh={handleRefresh}
        isRefreshing={loading || trendsLoading}
      />

      <div className="p-8">
        {/* Time Period Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TIME_PERIODS.map((tp) => (
            <Button
              key={tp.value}
              variant={period === tp.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(tp.value)}
            >
              {tp.label}
            </Button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {/* Accounts Created */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Accounts
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : metrics?.counts.accountsCreated || 0}
              </div>
            </CardContent>
          </Card>

          {/* Previews Viewed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Previews
              </CardTitle>
              <Eye className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : metrics?.counts.previewsViewed || 0}
              </div>
            </CardContent>
          </Card>

          {/* Checkouts Started */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Checkouts
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : metrics?.counts.checkoutsStarted || 0}
              </div>
            </CardContent>
          </Card>

          {/* Purchases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Purchases
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : metrics?.counts.purchasesCompleted || 0}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Invoices
              </CardTitle>
              <FileText className="h-5 w-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : metrics?.counts.invoiceRequests || 0}
              </div>
            </CardContent>
          </Card>

          {/* Toolkits Downloaded */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Downloads
              </CardTitle>
              <Download className="h-5 w-5 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : metrics?.counts.toolkitsDownloaded || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Conversion Rate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    {loading ? '...' : formatCurrency(metrics?.revenue.total || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Average Order</p>
                  <p className="text-3xl font-bold">
                    {loading ? '...' : formatCurrency(metrics?.revenue.average || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Conversion Rate Card */}
          <Card
            className={
              metrics && !metrics.conversionRates.isAboveTarget
                ? 'border-amber-200'
                : ''
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-500" />
                Overall Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold">
                      {loading
                        ? '...'
                        : `${metrics?.conversionRates.overallAccountToPurchase || 0}%`}
                    </span>
                    {metrics && (
                      <>
                        {metrics.conversionRates.isAboveTarget ? (
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-amber-500" />
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Target: {metrics?.conversionRates.target || 10}%+
                  </p>
                </div>
                {metrics && !metrics.conversionRates.isAboveTarget && (
                  <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    Below target. Review funnel for optimization opportunities.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Account -> Preview */}
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-sm text-slate-500">Accounts</p>
                  <p className="text-xl font-bold">
                    {metrics?.counts.accountsCreated || 0}
                  </p>
                </div>
                <div className="flex items-center gap-1 px-3">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-blue-600">
                    {metrics?.conversionRates.accountToPreview || 0}%
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">Previews</p>
                  <p className="text-xl font-bold">
                    {metrics?.counts.previewsViewed || 0}
                  </p>
                </div>
              </div>

              {/* Preview -> Checkout */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-purple-600">
                    {metrics?.conversionRates.previewToCheckout || 0}%
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">Checkouts</p>
                  <p className="text-xl font-bold">
                    {metrics?.counts.checkoutsStarted || 0}
                  </p>
                </div>
              </div>

              {/* Checkout -> Purchase */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-green-600">
                    {metrics?.conversionRates.checkoutToComplete || 0}%
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">Purchases</p>
                  <p className="text-xl font-bold">
                    {metrics?.counts.purchasesCompleted || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Purchase Trends</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={granularity === 'daily' ? 'default' : 'outline'}
                  onClick={() => setGranularity('daily')}
                >
                  Daily
                </Button>
                <Button
                  size="sm"
                  variant={granularity === 'weekly' ? 'default' : 'outline'}
                  onClick={() => setGranularity('weekly')}
                >
                  Weekly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : trends.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-500">
                No trend data available for this period
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      className="text-xs"
                    />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => formatCurrency(v)}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'revenue' && typeof value === 'number') {
                          return [formatCurrency(value), 'Revenue'];
                        }
                        return [String(value), 'Purchases'];
                      }}
                      labelFormatter={(label) => formatDate(String(label))}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="purchases"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Purchases"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
