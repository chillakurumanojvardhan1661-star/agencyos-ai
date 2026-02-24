import { STEPS } from '@/lib/site';

export function Steps() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600">
            From data to deliverables in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (hidden on mobile, shown on desktop) */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
              )}

              <div className="relative bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                {/* Step Number */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>

                {/* Step Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
