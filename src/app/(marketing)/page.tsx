import { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { Steps } from '@/components/marketing/Steps';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { SecuritySection } from '@/components/marketing/SecuritySection';
import { PricingTeaser } from '@/components/marketing/PricingTeaser';
import { FAQ } from '@/components/marketing/FAQ';
import { CTASection } from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: 'AgencyOS AI - The AI Operating System for Performance Agencies',
  description: 'Generate client-ready reports, AI insights, and branded deliverables in minutes — not hours. Start your 7-day Pro trial today.',
  alternates: {
    canonical: 'https://agencyos.ai',
  },
  openGraph: {
    url: 'https://agencyos.ai',
    images: ['/og.png'],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <Steps />
      <FeatureGrid />
      <SecuritySection />
      <PricingTeaser />
      <FAQ />
      <CTASection />
    </>
  );
}
