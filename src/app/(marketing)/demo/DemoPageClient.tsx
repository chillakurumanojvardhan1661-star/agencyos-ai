'use client';

import Link from 'next/link';
import { Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildTrialUrl } from '@/lib/site';
import { trackCTAClick } from '@/lib/marketing-analytics';

const demoPoints = [
  {
    title: 'Upload & Analyze',
    description: 'See how we parse CSV data from Meta, Google, or LinkedIn and instantly generate insights.',
    timestamp: '0:30',
  },
  {
    title: 'AI Content Generation',
    description: 'Watch the AI create ad copy, reel scripts, and content calendars tailored to your client.',
    timestamp: '2:15',
  },
  {
    title: 'Branded Reports',
    description: 'Generate professional PDF reports with charts, benchmarks, and action plans in under 2 minutes.',
    timestamp: '4:45',
  },
  {
    title: 'Learning Loop',
    description: 'See how the AI learns from your feedback to improve future recommendations.',
    timestamp: '6:30',
  },
  {
    title: 'Share & Grow',
    description: 'Create public report links to impress prospects and track referrals automatically.',
    timestamp: '8:00',
  },
];

export function DemoPageClient() {
  const handleTrialClick = () => {
    trackCTAClick('demo_page');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            See AgencyOS AI in action
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Watch how we help agencies save 10+ hours per week on reporting and content creation
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Video Placeholder */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 mb-12">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-white/20 transition-colors cursor-pointer">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
                <p className="text-white text-lg font-medium">Watch Full Demo (10:23)</p>
                <p className="text-white/60 text-sm mt-2">See the complete workflow from data to deliverable</p>
              </div>
            </div>
          </div>

          {/* Demo Breakdown */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What you'll see</h2>
            {demoPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-6">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{point.title}</h3>
                    <span className="text-sm text-gray-500 font-mono">{point.timestamp}</span>
                  </div>
                  <p className="text-gray-600">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Everything you need in one platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'AI content generation',
              'Performance analysis',
              'Branded PDF reports',
              'Industry benchmarks',
              'Client context memory',
              'Template library',
              'Public report sharing',
              'Referral tracking',
              'Usage analytics',
              'Multi-currency support',
              'White-label options',
              'Priority support',
            ].map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to try it yourself?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Start your 7-day Pro trial and experience the full platform. No credit card required.
          </p>
          <Link href={buildTrialUrl('demo_page')} onClick={handleTrialClick}>
            <Button size="lg" className="text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            Questions?{' '}
            <a href="mailto:hello@agencyos.ai" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our team
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
