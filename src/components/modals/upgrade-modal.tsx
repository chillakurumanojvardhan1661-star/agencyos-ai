'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { SubscriptionPlan, PLAN_LIMITS, ActionType } from '@/types';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  recommendedPlan: SubscriptionPlan;
  actionType: ActionType;
  currentUsage: number;
  limit: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  recommendedPlan,
  actionType,
  currentUsage,
  limit,
}: UpgradeModalProps) {
  const recommendedPlanDetails = PLAN_LIMITS[recommendedPlan];
  const currentPlanDetails = PLAN_LIMITS[currentPlan];

  const getActionLabel = (action: ActionType) => {
    switch (action) {
      case 'content_generation':
        return 'content generations';
      case 'performance_analysis':
        return 'performance analyses';
      case 'report_generation':
        return 'reports';
      default:
        return 'actions';
    }
  };

  const getNewLimit = () => {
    switch (actionType) {
      case 'content_generation':
        return recommendedPlanDetails.monthly_generations;
      case 'performance_analysis':
        return recommendedPlanDetails.monthly_analyses;
      case 'report_generation':
        return recommendedPlanDetails.monthly_reports;
      default:
        return -1;
    }
  };

  const newLimit = getNewLimit();
  const isUnlimited = newLimit === -1;

  const benefits = [
    {
      label: 'Clients',
      current: currentPlanDetails.max_clients,
      new: recommendedPlanDetails.max_clients,
    },
    {
      label: 'Content Generations',
      current: currentPlanDetails.monthly_generations,
      new: recommendedPlanDetails.monthly_generations,
    },
    {
      label: 'Performance Analyses',
      current: currentPlanDetails.monthly_analyses,
      new: recommendedPlanDetails.monthly_analyses,
    },
    {
      label: 'Reports',
      current: currentPlanDetails.monthly_reports,
      new: recommendedPlanDetails.monthly_reports,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
            <DialogTitle className="text-xl">Usage Limit Reached</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-1">
              You've reached your monthly limit for {getActionLabel(actionType)}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{currentUsage}</span>
              <span className="text-muted-foreground">/ {limit}</span>
            </div>
          </div>

          {/* Recommended Plan */}
          <div>
            <h3 className="font-semibold mb-3">
              Upgrade to {recommendedPlanDetails.name}
            </h3>
            <div className="space-y-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{benefit.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {benefit.current === -1 ? '∞' : benefit.current}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">
                      {benefit.new === -1 ? '∞' : benefit.new}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-medium">What you'll get:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  {isUnlimited ? 'Unlimited' : `${newLimit}`} {getActionLabel(actionType)} per
                  month
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  {recommendedPlan === 'professional'
                    ? 'Priority support'
                    : 'Dedicated support team'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  {recommendedPlan === 'professional'
                    ? 'Advanced analytics'
                    : 'Custom integrations & white-label'}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Link
              href={`/api/stripe/create-checkout?plan=${recommendedPlan}`}
              className="block"
            >
              <Button size="lg" className="w-full">
                Upgrade to {recommendedPlanDetails.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Maybe Later
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-center text-muted-foreground">
            Changes take effect immediately. You'll be charged a prorated amount.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
