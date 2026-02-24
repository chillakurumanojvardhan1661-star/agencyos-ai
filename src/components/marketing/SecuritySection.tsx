import { Shield, Lock, Database, Eye } from 'lucide-react';

const securityFeatures = [
  {
    icon: Shield,
    title: 'Bank-level encryption',
    description: 'All data encrypted in transit and at rest with AES-256.',
  },
  {
    icon: Lock,
    title: 'SOC 2 compliant',
    description: 'Enterprise-grade security standards and regular audits.',
  },
  {
    icon: Database,
    title: 'You own your data',
    description: 'Export anytime. Delete anytime. No vendor lock-in.',
  },
  {
    icon: Eye,
    title: 'Privacy first',
    description: 'We never sell your data or train AI models on your content.',
  },
];

export function SecuritySection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Security & privacy you can trust
          </h2>
          <p className="text-xl text-gray-600">
            Your client data is sacred. We protect it like our own.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <feature.icon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
