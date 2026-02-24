'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { PLAN_LIMITS, SubscriptionPlan } from '@/types';

interface UsageData {
  content_generation: { count: number; tokens: number; cost: number };
  performance_analysis: { count: number; tokens: number; cost: number };
  report_generation: { count: number; tokens: number; cost: number };
}

interface SubscriptionData {
  plan: SubscriptionPlan;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Fetch subscription and usage data
      // In production, these would be real API calls
      const mockSubscription: SubscriptionData = {
        plan: 'professional',
        status: 'active',
        current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
      };

      const mockUsage: UsageData = {
        content_generation: { count: 45, tokens: 56250, cost: 1.69 },
        performance_analysis: { count: 12, tokens: 15000, cost: 0.45 },
        report_generation: { count: 3, tokens: 4500, cost: 0.14 },
      };

      setSubscription(mockSubscription);
      setUsage(mockUsage);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading billing information...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Billing</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-6">
                Choose a plan to start using AgencyOS AI
              </p>
              <Link href="/pricing">
                <Button size="lg">View Pricing Plans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planLimits = PLAN_LIMITS[subscription.plan];
  const isUnlimited = planLimits.monthly_generations === -1;

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <Link href="/pricing">
          <Button variant="outline">
            Change Plan
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold capitalize">{subscription.plan}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}
                >
                  {subscription.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Renews on{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {subscription.cancel_at_period_end && (
                <p className="text-sm text-yellow-500 mt-2">
                  Your subscription will be canceled at the end of the billing period.
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                ${planLimits.name === 'Starter' ? 49 : planLimits.name === 'Professional' ? 149 : 399}
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Link href="/api/stripe/customer-portal">
              <Button variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Generations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Content Generations</span>
              <span className="text-sm text-muted-foreground">
                {usage?.content_generation.count || 0}
                {!isUnlimited && ` / ${planLimits.monthly_generations}`}
                {isUnlimited && ' (Unlimited)'}
              </span>
            </div>
            {!isUnlimited && (
              <Progress
                value={getUsagePercentage(
                  usage?.content_generation.count || 0,
                  planLimits.monthly_generations
                )}
                className="h-2"
                indicatorClassName={getUsageColor(
                  getUsagePercentage(
                    usage?.content_generation.count || 0,
                    planLimits.monthly_generations
                  )
                )}
              />
            )}
          </div>

          {/* Performance Analyses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Performance Analyses</span>
              <span className="text-sm text-muted-foreground">
                {usage?.performance_analysis.count || 0}
                {!isUnlimited && ` / ${planLimits.monthly_analyses}`}
                {isUnlimited && ' (Unlimited)'}
              </span>
            </div>
            {!isUnlimited && (
              <Progress
                value={getUsagePercentage(
                  usage?.performance_analysis.count || 0,
                  planLimits.monthly_analyses
                )}
                className="h-2"
                indicatorClassName={getUsageColor(
                  getUsagePercentage(
                    usage?.performance_analysis.count || 0,
                    planLimits.monthly_analyses
                  )
                )}
              />
            )}
          </div>

          {/* Reports */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Reports Generated</span>
              <span className="text-sm text-muted-foreground">
                {usage?.report_generation.count || 0}
                {!isUnlimited && ` / ${planLimits.monthly_reports}`}
                {isUnlimited && ' (Unlimited)'}
              </span>
            </div>
            {!isUnlimited && (
              <Progress
                value={getUsagePercentage(
                  usage?.report_generation.count || 0,
                  planLimits.monthly_reports
                )}
                className="h-2"
                indicatorClassName={getUsageColor(
                  getUsagePercentage(
                    usage?.report_generation.count || 0,
                    planLimits.monthly_reports
                  )
                )}
              />
            )}
          </div>

          {/* Cost Summary */}
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total API Cost This Month</span>
              <span className="font-semibold">
                $
                {(
                  (usage?.content_generation.cost || 0) +
                  (usage?.performance_analysis.cost || 0) +
                  (usage?.report_generation.cost || 0)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total Tokens Used</span>
              <span className="font-semibold">
                {(
                  (usage?.content_generation.tokens || 0) +
                  (usage?.performance_analysis.tokens || 0) +
                  (usage?.report_generation.tokens || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {!isUnlimited && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold mb-1">Need more capacity?</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to {subscription.plan === 'starter' ? 'Professional' : 'Enterprise'} for{' '}
                  {subscription.plan === 'starter' ? '4x' : 'unlimited'} usage limits.
                </p>
              </div>
              <Link href="/pricing">
                <Button>Upgrade Now</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
