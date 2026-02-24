'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Building2, 
  Users, 
  Palette, 
  Sparkles, 
  FileBarChart,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { OnboardingStatus } from '@/types';
import Link from 'next/link';

interface OnboardingChecklistProps {
  onDismiss?: () => void;
}

export function OnboardingChecklist({ onDismiss }: OnboardingChecklistProps) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/onboarding');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!status || status.completed) {
    return null;
  }

  const steps = [
    {
      key: 'create_agency',
      title: 'Create Agency Profile',
      description: 'Set up your agency details and branding',
      icon: Building2,
      href: '/dashboard',
      completed: status.steps.create_agency,
    },
    {
      key: 'add_client',
      title: 'Add Your First Client',
      description: 'Create a client profile to get started',
      icon: Users,
      href: '/dashboard/clients',
      completed: status.steps.add_client,
    },
    {
      key: 'upload_brand_kit',
      title: 'Upload Brand Kit',
      description: 'Add client logo, colors, and brand guidelines',
      icon: Palette,
      href: '/dashboard/clients',
      completed: status.steps.upload_brand_kit,
    },
    {
      key: 'generate_content',
      title: 'Generate Content',
      description: 'Create your first AI-powered ad content',
      icon: Sparkles,
      href: '/dashboard/generate',
      completed: status.steps.generate_content,
    },
    {
      key: 'upload_csv_report',
      title: 'Upload CSV & Generate Report',
      description: 'Analyze performance data and create reports',
      icon: FileBarChart,
      href: '/dashboard/reports',
      completed: status.steps.upload_csv_report,
    },
  ];

  const completedCount = status.progress;
  const totalSteps = 5;
  const progressPercentage = (completedCount / totalSteps) * 100;

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Welcome to AgencyOS AI!</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete these steps to get started ({completedCount}/{totalSteps})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.key} href={step.href}>
                <div
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border transition-all
                    ${step.completed 
                      ? 'bg-muted/50 border-muted' 
                      : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                    }
                  `}
                >
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h4 className={`text-sm font-medium ${step.completed ? 'text-muted-foreground line-through' : ''}`}>
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}

          {completedCount === totalSteps && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-500">
                Congratulations! You've completed the onboarding.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
