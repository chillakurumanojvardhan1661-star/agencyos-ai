// Site-wide constants for AgencyOS AI

export const SITE_CONFIG = {
  name: 'AgencyOS AI',
  description: 'The AI Operating System for Performance Agencies',
  url: 'https://agencyos.ai',
  ogImage: 'https://agencyos.ai/og-image.png',
} as const;

export const APP_URL = 'https://app.agencyos.ai';
export const TRIAL_URL = '/auth/signup';
export const DEMO_URL = '/demo';

/**
 * Build trial URL with UTM parameters for attribution
 * @param content - The specific CTA location (e.g., 'home_hero', 'pricing_card')
 * @param campaign - Optional campaign name (defaults to 'trial')
 */
export function buildTrialUrl(content: string, campaign: string = 'trial'): string {
  const params = new URLSearchParams({
    utm_source: 'marketing',
    utm_medium: 'cta',
    utm_campaign: campaign,
    utm_content: content,
  });
  
  return `${TRIAL_URL}?${params.toString()}`;
}

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/agencyosai',
  linkedin: 'https://linkedin.com/company/agencyosai',
  github: 'https://github.com/agencyosai',
} as const;

export const NAV_LINKS = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Demo', href: '/demo' },
  { name: 'About', href: '/about' },
] as const;

export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for freelancers and small agencies',
    features: [
      '5 clients',
      '50 AI generations/month',
      '20 performance analyses/month',
      '10 reports/month',
      'Basic templates',
      'Email support',
    ],
    cta: 'Start Free Trial',
    ctaContent: 'pricing_starter',
    highlighted: false,
    badge: undefined,
  },
  {
    name: 'Professional',
    price: 99,
    description: 'For growing agencies managing multiple clients',
    features: [
      '20 clients',
      '200 AI generations/month',
      '100 performance analyses/month',
      '50 reports/month',
      'Premium templates',
      'No watermarks',
      'Premium insights',
      'Priority support',
      '7-day Pro trial included',
    ],
    cta: 'Start 7-Day Pro Trial',
    ctaContent: 'pricing_professional',
    highlighted: true,
    badge: 'Recommended',
  },
  {
    name: 'Agency',
    price: 299,
    description: 'For established agencies at scale',
    features: [
      'Unlimited clients',
      'Unlimited AI generations',
      'Unlimited analyses',
      'Unlimited reports',
      'Custom templates',
      'White-label branding',
      'Custom integrations',
      'Dedicated support',
      'Custom onboarding',
    ],
    cta: 'Contact Sales',
    ctaContent: 'pricing_agency',
    highlighted: false,
    badge: undefined,
  },
] as const;

export const FEATURES = [
  {
    name: 'Content Engine',
    description: 'Generate ad copy, reel scripts, and content calendars with AI that learns from your wins.',
    icon: 'sparkles',
  },
  {
    name: 'Performance Intelligence',
    description: 'Upload CSV data and get instant AI analysis with industry benchmarks and optimization suggestions.',
    icon: 'trending-up',
  },
  {
    name: 'Client Reporting',
    description: 'Create branded, professional PDF reports with charts, insights, and action plans in minutes.',
    icon: 'file-text',
  },
  {
    name: 'Viral Share Loop',
    description: 'Share public reports with prospects. Track referrals and grow organically.',
    icon: 'share-2',
  },
] as const;

export const STEPS = [
  {
    number: 1,
    title: 'Connect Your Data',
    description: 'Upload client brand kits and performance CSVs from Meta, Google, or LinkedIn.',
  },
  {
    number: 2,
    title: 'AI Does The Work',
    description: 'Our AI analyzes performance, generates insights, and creates content tailored to your client.',
  },
  {
    number: 3,
    title: 'Deliver & Impress',
    description: 'Send branded reports, share wins, and watch your agency grow through referrals.',
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: 'How does the 7-day Pro trial work?',
    answer: 'Start with full Professional features for 7 days. No credit card required. After the trial, you can upgrade to keep Pro features or continue with our free Starter plan.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. No questions asked. Your data remains accessible even on the free plan.',
  },
  {
    question: 'What platforms do you support?',
    answer: 'We support Meta Ads (Facebook/Instagram), Google Ads, and LinkedIn Ads. Upload CSV exports and our AI handles the rest.',
  },
  {
    question: 'Is my client data secure?',
    answer: 'Absolutely. We use bank-level encryption, secure cloud storage, and never share your data. You own your data, always.',
  },
  {
    question: 'Do you offer white-label options?',
    answer: 'Yes! Our Agency plan includes white-label branding, custom domains, and the ability to remove all AgencyOS branding.',
  },
  {
    question: 'Can I try before I buy?',
    answer: 'Yes! Start with our 7-day Pro trial to experience all Professional features. No credit card required to start.',
  },
] as const;
