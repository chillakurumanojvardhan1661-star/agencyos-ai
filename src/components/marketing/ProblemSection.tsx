import { Clock, DollarSign, Users, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Hours wasted on manual reporting',
    description: 'Copying data, creating charts, writing insights — every single month.',
  },
  {
    icon: DollarSign,
    title: 'Expensive tools that don\'t talk',
    description: 'Paying for 5+ subscriptions that don\'t integrate or share data.',
  },
  {
    icon: Users,
    title: 'Clients demanding more',
    description: 'They want faster turnarounds, deeper insights, and better results.',
  },
  {
    icon: TrendingDown,
    title: 'Growth plateaus',
    description: 'Can\'t scale without hiring more people or burning out your team.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Running an agency shouldn't feel this hard
          </h2>
          <p className="text-xl text-gray-600">
            You're stuck in the weeds when you should be growing
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-200"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <problem.icon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
