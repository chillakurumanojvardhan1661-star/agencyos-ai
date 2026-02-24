import { Metadata } from 'next';
import { PricingPageClient } from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing - Simple, transparent pricing for agencies',
  description: 'Start with a 7-day Pro trial. No credit card required. Choose the plan that fits your agency.',
  alternates: {
    canonical: 'https://agencyos.ai/pricing',
  },
  openGraph: {
    url: 'https://agencyos.ai/pricing',
    images: ['/og.png'],
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
