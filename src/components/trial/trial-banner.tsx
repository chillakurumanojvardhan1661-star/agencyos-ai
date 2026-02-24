'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, ArrowRight, X } from 'lucide-react';

interface TrialStatus {
  is_trial: boolean;
  days_remaining: number;
  hours_remaining: number;
  trial_ends_at: string;
  is_expired: boolean;
}

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/trial/status');
      const data = await response.json();
      
      if (data && data.is_trial && !data.is_expired) {
        setTrialStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/api/stripe/create-checkout?plan=professional';
  };

  if (loading || !trialStatus || dismissed || trialStatus.is_expired) {
    return null;
  }

  const { days_remaining, hours_remaining } = trialStatus;
  const isUrgent = days_remaining === 0;
  const isCritical = days_remaining <= 1;

  const getTimeDisplay = () => {
    if (days_remaining > 0) {
      return `${days_remaining} day${days_remaining > 1 ? 's' : ''}`;
    } else {
      return `${hours_remaining} hour${hours_remaining > 1 ? 's' : ''}`;
    }
  };

  const getColorScheme = () => {
    if (isUrgent) {
      return {
        bg: 'bg-gradient-to-r from-red-500/10 to-orange-500/10',
        border: 'border-red-500/30',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-500',
        textColor: 'text-red-500',
      };
    } else if (isCritical) {
      return {
        bg: 'bg-gradient-to-r from-orange-500/10 to-amber-500/10',
        border: 'border-orange-500/30',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-500',
        textColor: 'text-orange-500',
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-500',
      };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <Card className={`${colorScheme.bg} ${colorScheme.border} border-2 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-32 -mt-32" />
      
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`${colorScheme.iconBg} rounded-full p-3 flex-shrink-0`}>
            {isUrgent ? (
              <Clock className={`h-6 w-6 ${colorScheme.iconColor} animate-pulse`} />
            ) : (
              <Sparkles className={`h-6 w-6 ${colorScheme.iconColor}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">
                {isUrgent ? '⏰ Trial Ending Soon!' : '🎉 You\'re on a Pro Trial'}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorScheme.iconBg} ${colorScheme.textColor}`}>
                {getTimeDisplay()} left
              </span>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {isUrgent 
                ? 'Your Pro trial expires today! Upgrade now to keep premium features like no watermarks, advanced insights, and priority support.'
                : `You're enjoying full Professional features. Upgrade before your trial ends to keep unlimited access.`
              }
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>No Watermarks</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Premium Insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>200 Generations/mo</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Priority Support</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Button onClick={handleUpgrade} size="lg">
                Upgrade to Professional
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                Remind me later
              </Button>
            </div>
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
