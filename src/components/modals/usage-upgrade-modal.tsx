'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Check, TrendingUp, Zap } from 'lucide-react';
import { SubscriptionPlan } from '@/types';

interface UsageUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  recommendedPlan: SubscriptionPlan;
  usagePercentage: number;
  currentUsage: number;
  limit: number;
  actionType: string;
}

export function UsageUpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  recommendedPlan,
  usagePercentage,
  currentUsage,
  limit,
  actionType,
}: UsageUpgradeModalProps) {
  const handleUpgrade = () => {
    window.location.href = `/api/stripe/create-checkout?plan=${recommendedPlan}`;
  };

  const planDetails: Record<SubscriptionPlan, { name: string; price: string; features: string[] }> = {
    starter: {
      name: 'Starter',
      price: '$49/mo',
      features: [
        '50 content generations',
        '20 performance analyses',
        '10 reports per month',
        'Basic support',
      ],
    },
    trial_pro: {
      name: 'Pro Trial',
      price: 'Free for 7 days',
      features: [
        '200 content generations',
        '100 performance analyses',
        '50 reports per month',
        'No watermarks',
        'Premium insights',
      ],
    },
    professional: {
      name: 'Professional',
      price: '$149/mo',
      features: [
        '200 content generations',
        '100 performance analyses',
        '50 reports per month',
        'No watermarks',
        'Premium insights',
        'Priority support',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: '$499/mo',
      features: [
        'Unlimited content generations',
        'Unlimited analyses',
        'Unlimited reports',
        'White-label branding',
        'Custom integrations',
        'Dedicated support',
      ],
    },
  };

  const current = planDetails[currentPlan];
  const recommended = planDetails[recommendedPlan];

  const getProgressColor = () => {
    if (usagePercentage >= 95) return 'bg-red-500';
    if (usagePercentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getActionLabel = () => {
    switch (actionType) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500/20 rounded-full p-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <DialogTitle className="text-2xl">You're Running Low on {getActionLabel()}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Usage</span>
              <span className="font-semibold">
                {currentUsage} / {limit} {getActionLabel()}
              </span>
            </div>
            <div className="relative">
              <Progress value={usagePercentage} className="h-3" />
              <div
                className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You've used {usagePercentage.toFixed(0)}% of your monthly limit. Upgrade now to keep your momentum going!
            </p>
          </div>

          {/* Plan Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Plan */}
            <div className="border border-border rounded-lg p-6 bg-muted/30">
              <div className="text-sm text-muted-foreground mb-2">Current Plan</div>
              <h3 className="text-xl font-bold mb-1">{current.name}</h3>
              <div className="text-2xl font-bold text-muted-foreground mb-4">{current.price}</div>
              <ul className="space-y-2">
                {current.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Plan */}
            <div className="border-2 border-primary rounded-lg p-6 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Recommended
              </div>
              <div className="text-sm text-primary mb-2">Upgrade to</div>
              <h3 className="text-xl font-bold mb-1">{recommended.name}</h3>
              <div className="text-2xl font-bold text-primary mb-4">{recommended.price}</div>
              <ul className="space-y-2">
                {recommended.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Why upgrade now?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Never hit limits again with higher quotas</li>
                  <li>• Unlock premium features like advanced insights</li>
                  <li>• Remove "Powered by AgencyOS AI" watermarks</li>
                  <li>• Get priority support when you need it</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleUpgrade} size="lg" className="flex-1">
              Upgrade to {recommended.name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={onClose} variant="outline" size="lg">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
