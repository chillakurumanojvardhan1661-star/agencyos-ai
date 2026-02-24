'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Sparkles, FileBarChart, TrendingUp, Zap } from 'lucide-react';
import { Nudge } from '@/types';
import Link from 'next/link';

export function NudgeBanner() {
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNudge();
  }, []);

  const fetchNudge = async () => {
    try {
      const response = await fetch('/api/nudges');
      const data = await response.json();
      
      if (data && data.nudge_type) {
        setNudge(data);
      }
    } catch (error) {
      console.error('Failed to fetch nudge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!nudge) return;

    setDismissed(true);

    try {
      await fetch('/api/nudges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nudge_type: nudge.nudge_type }),
      });
    } catch (error) {
      console.error('Failed to dismiss nudge:', error);
    }
  };

  if (loading || !nudge || dismissed) {
    return null;
  }

  // Select icon based on nudge type
  const getIcon = () => {
    if (nudge.nudge_type.includes('report')) {
      return FileBarChart;
    } else if (nudge.nudge_type.includes('content')) {
      return Sparkles;
    } else if (nudge.nudge_type.includes('activity')) {
      return Zap;
    }
    return TrendingUp;
  };

  const Icon = getIcon();

  // Select color scheme based on priority
  const getColorScheme = () => {
    if (nudge.priority === 1) {
      return {
        bg: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-500',
        buttonVariant: 'default' as const,
      };
    } else if (nudge.priority === 2) {
      return {
        bg: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
        border: 'border-green-500/30',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-500',
        buttonVariant: 'default' as const,
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-orange-500/10 to-amber-500/10',
        border: 'border-orange-500/30',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-500',
        buttonVariant: 'default' as const,
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
            <Icon className={`h-6 w-6 ${colorScheme.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">
              {nudge.title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {nudge.message}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link href={nudge.cta_link}>
                <Button variant={colorScheme.buttonVariant} size="lg">
                  {nudge.cta_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                Maybe later
              </Button>
            </div>
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
