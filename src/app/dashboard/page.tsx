'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Sparkles, FileText, TrendingUp } from 'lucide-react';
import { OnboardingChecklist } from '@/components/onboarding/checklist';
import { NudgeBanner } from '@/components/nudges/nudge-banner';
import { TrialBanner } from '@/components/trial/trial-banner';

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    // Track first login
    const trackFirstLogin = async () => {
      try {
        await fetch('/api/onboarding/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'first_login' }),
        });
      } catch (error) {
        console.error('Failed to track first login:', error);
      }
    };

    trackFirstLogin();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to AgencyOS AI</p>
      </div>

      {/* Trial Banner */}
      <TrialBanner />

      {/* Onboarding Checklist */}
      {showOnboarding && (
        <OnboardingChecklist onDismiss={() => setShowOnboarding(false)} />
      )}

      {/* Nudge Banner */}
      <NudgeBanner />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Add your first client to start generating AI-powered content and insights.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
