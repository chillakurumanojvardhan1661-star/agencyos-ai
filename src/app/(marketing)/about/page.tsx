import { Metadata } from 'next';
import { Target, Users, Zap, Heart } from 'lucide-react';
import { CTASection } from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: 'About - Our mission to empower performance agencies',
  description: 'Learn about AgencyOS AI and why we built the AI operating system for performance agencies.',
};

const principles = [
  {
    icon: Target,
    title: 'Agency-first',
    description: 'Built by agency operators, for agency operators. We understand your workflow because we lived it.',
  },
  {
    icon: Zap,
    title: 'Speed matters',
    description: 'Every feature is designed to save you hours, not minutes. Time is your most valuable asset.',
  },
  {
    icon: Users,
    title: 'Client success',
    description: 'When your clients win, you win. Our AI is trained to deliver results that impress.',
  },
  {
    icon: Heart,
    title: 'Human-centered AI',
    description: 'AI should enhance your expertise, not replace it. We build tools that make you better.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            We're building the future of agency operations
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            AgencyOS AI was born from a simple frustration: running a performance agency shouldn't require an army of tools, endless manual work, and late nights copying data into spreadsheets.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Our mission</h2>
          <div className="prose prose-lg text-gray-600">
            <p className="text-xl leading-relaxed mb-6">
              We believe performance agencies are the backbone of modern marketing. You drive real results for real businesses. But the tools you use are stuck in the past.
            </p>
            <p className="text-xl leading-relaxed mb-6">
              That's why we built AgencyOS AI — an operating system that brings together content creation, performance analysis, and client reporting into one intelligent platform.
            </p>
            <p className="text-xl leading-relaxed">
              Our mission is simple: give agencies superpowers. Help you deliver 10x faster, impress clients with insights they've never seen, and scale without burning out your team.
            </p>
          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Why we built this</h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              The founding team ran a performance agency for 5 years. We managed $2M+ in ad spend across 50+ clients. We know the pain points intimately:
            </p>
            <ul className="space-y-4 ml-6">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">•</span>
                <span>Spending 10+ hours per month on manual reporting</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">•</span>
                <span>Juggling 7 different tools that don't talk to each other</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">•</span>
                <span>Clients asking "what should we do next?" and not having data-backed answers</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">•</span>
                <span>Hitting a growth ceiling because we couldn't scale without hiring</span>
              </li>
            </ul>
            <p>
              We tried every tool on the market. Nothing solved the core problem: agencies need an integrated system that handles the entire workflow, not just pieces of it.
            </p>
            <p>
              So we built it ourselves. And now we're sharing it with you.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
            Our principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {principles.map((principle, index) => (
              <div key={index} className="p-8 rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <principle.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {principle.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Built by operators, for operators
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            We're a small team of agency veterans, engineers, and AI researchers. We're obsessed with making agencies more efficient, more profitable, and more impactful.
          </p>
          <p className="text-gray-600">
            Want to join us?{' '}
            <a href="mailto:careers@agencyos.ai" className="text-blue-600 hover:text-blue-700 font-medium">
              We're hiring
            </a>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
