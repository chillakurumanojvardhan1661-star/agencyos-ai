'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildTrialUrl } from '@/lib/site';
import { trackCTAClick } from '@/lib/marketing-analytics';

export function CTASection() {
  const handleTrialClick = () => {
    trackCTAClick('cta_section');
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Ready to transform your agency?
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          Join 500+ agencies using AI to deliver better results, faster.
        </p>
        <Link href={buildTrialUrl('cta_section')} onClick={handleTrialClick}>
          <Button size="lg" className="text-lg px-8 py-6">
            Start Your 7-Day Pro Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="mt-4 text-sm text-gray-500">
          No credit card required • Cancel anytime • Full Pro features
        </p>
      </div>
    </section>
  );
}
