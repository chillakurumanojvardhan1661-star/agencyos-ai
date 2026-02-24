'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Clock,
  Share2,
  AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
  overview: {
    trial_conversion_rate: number;
    activation_rate: number;
    referral_conversion_rate: number;
    viral_coefficient: number;
  };
  trials: {
    total: number;
    activated: number;
    converted: number;
    expired: number;
    activation_rate: number;
    conversion_rate: number;
  };
  activation: {
    avg_hours: number;
    median_hours: number;
    total_activated: number;
  };
  revenue: {
    current_mrr: number;
    professional_count: number;
    enterprise_count: number;
    trial_count: number;
    total_paying: number;
  };
  referrals: {
    total_users: number;
    total_referrals: number;
    viral_coefficient: number;
    conversion_rate: number;
  };
  daily_trend: Array<{
    date: string;
    trials_started: number;
    trials_activated: number;
    trials_converted: number;
    referrals: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/analytics?days=${days}`);
      
      if (response.status === 403) {
        setError('Access denied. Admin role required.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-semibold">Access Denied</h3>
            </div>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Conversion metrics for the last {days} days
          </p>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((period) => (
            <button
              key={period}
              onClick={() => setDays(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === period
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {period}d
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(data.overview.trial_conversion_rate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.trials.converted} of {data.trials.total} trials converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(data.overview.activation_rate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.trials.activated} trials activated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.revenue.current_mrr)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.revenue.total_paying} paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Coefficient</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.viral_coefficient.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.referrals.total_referrals} referrals from {data.referrals.total_users} users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trial Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trial Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trials Started</span>
              <span className="text-2xl font-bold">{data.trials.total}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trials Activated</span>
              <span className="text-2xl font-bold">{data.trials.activated}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${data.trials.activation_rate}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trials Converted</span>
              <span className="text-2xl font-bold">{data.trials.converted}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${data.trials.conversion_rate}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trials Expired</span>
              <span className="text-2xl font-bold text-muted-foreground">{data.trials.expired}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activation Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Average Time to Activation</span>
              </div>
              <div className="text-3xl font-bold">
                {data.activation.avg_hours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Median: {data.activation.median_hours.toFixed(1)}h
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Activated</span>
              </div>
              <div className="text-3xl font-bold">
                {data.activation.total_activated}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Users who generated first report
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Referrals */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Professional Plan</span>
              <span className="font-semibold">{data.revenue.professional_count} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enterprise Plan</span>
              <span className="font-semibold">{data.revenue.enterprise_count} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Trials</span>
              <span className="font-semibold text-muted-foreground">{data.revenue.trial_count} trials</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total MRR</span>
                <span className="text-2xl font-bold">{formatCurrency(data.revenue.current_mrr)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Users</span>
              <span className="font-semibold">{data.referrals.total_users}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Referral Signups</span>
              <span className="font-semibold">{data.referrals.total_referrals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Viral Coefficient</span>
              <span className="font-semibold">{data.referrals.viral_coefficient.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Referral Conversion</span>
                <span className="text-2xl font-bold">{formatPercentage(data.referrals.conversion_rate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <span>Date</span>
              <span>Trials Started</span>
              <span>Activated</span>
              <span>Converted</span>
              <span>Referrals</span>
            </div>
            {data.daily_trend.slice(0, 10).map((day) => (
              <div key={day.date} className="grid grid-cols-5 gap-4 text-sm py-2 border-b">
                <span className="font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span>{day.trials_started}</span>
                <span>{day.trials_activated}</span>
                <span>{day.trials_converted}</span>
                <span>{day.referrals}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
