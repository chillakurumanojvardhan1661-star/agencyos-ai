'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRICING_PLANS, buildTrialUrl } from '@/lib/site';
import { CTASection } from '@/components/marketing/CTASection';
import { trackCTAClick } from '@/lib/marketing-analytics';

export function PricingPageClient() {
  const handlePlanClick = (content: string) => {
    trackCTAClick(content);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
            7-Day Pro Trial • No Credit Card Required
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a 7-day Pro trial. No credit card required. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      plan.highlighted ? 'text-white/80' : 'text-gray-600'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span
                      className={`text-5xl font-bold ${
                        plan.highlighted ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`ml-2 ${
                        plan.highlighted ? 'text-white/80' : 'text-gray-600'
                      }`}
                    >
                      /month
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link 
                  href={buildTrialUrl(plan.ctaContent)} 
                  className="block mb-8"
                  onClick={() => handlePlanClick(plan.ctaContent)}
                >
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {/* Features List */}
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check
                        className={`h-5 w-5 mr-3 flex-shrink-0 ${
                          plan.highlighted ? 'text-white' : 'text-green-600'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.highlighted ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Feature Comparison Note */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              All plans include: AI content generation, performance analysis, branded reports, and secure cloud storage
            </p>
            <p className="text-sm text-gray-500">
              Need custom features or enterprise support?{' '}
              <a href="mailto:sales@agencyos.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Pricing FAQs
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens after my 7-day Pro trial?
              </h3>
              <p className="text-gray-600">
                After 7 days, you'll automatically move to the free Starter plan. You can upgrade to Professional or Agency anytime to unlock premium features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! Upgrade or downgrade anytime. Changes take effect immediately, and we'll prorate any charges.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                Yes. If you're not satisfied within the first 30 days, we'll refund your payment in full. No questions asked.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) via Stripe. Enterprise customers can pay via invoice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
