import { Platform, Objective, Tone, ClientContext, IndustryBenchmark, AdPerformanceData } from '@/types';

export interface ContentGenerationInput {
  platform: Platform;
  objective: Objective;
  tone: Tone;
  offer: string;
  target_audience?: string;
  brand_colors?: string;
  client_context?: ClientContext;
}

export interface PerformanceAnalysisInput {
  data: AdPerformanceData[];
  industry_benchmark?: IndustryBenchmark;
}

export const generateContentPrompt = (input: ContentGenerationInput): string => {
  const { platform, objective, tone, offer, target_audience, brand_colors, client_context } = input;

  let contextSection = '';
  if (client_context) {
    contextSection = `
CLIENT CONTEXT (Use this to inform your content):
${client_context.winning_hooks.length > 0 ? `- Winning Hooks: ${client_context.winning_hooks.join(', ')}` : ''}
${client_context.failed_angles.length > 0 ? `- Avoid These Angles: ${client_context.failed_angles.join(', ')}` : ''}
${client_context.audience_pain_points.length > 0 ? `- Audience Pain Points: ${client_context.audience_pain_points.join(', ')}` : ''}
${client_context.best_performing_platforms.length > 0 ? `- Best Platforms: ${client_context.best_performing_platforms.join(', ')}` : ''}
${client_context.seasonal_notes ? `- Seasonal Notes: ${client_context.seasonal_notes}` : ''}
`;
  }

  return `You are an expert digital marketing copywriter specializing in ${platform} advertising.

CONTEXT:
- Platform: ${platform.toUpperCase()}
- Campaign Objective: ${objective}
- Brand Tone: ${tone}
- Offer: ${offer}
${target_audience ? `- Target Audience: ${target_audience}` : ''}
${brand_colors ? `- Brand Colors: ${brand_colors}` : ''}
${contextSection}

TASK:
Generate high-converting ad content optimized for ${objective} on ${platform}.

OUTPUT FORMAT (JSON):
{
  "ad_copies": [
    {
      "primary_text": "Main ad copy (125 chars max)",
      "headline": "Attention-grabbing headline (40 chars max)",
      "cta": "Clear call-to-action"
    }
    // Generate 3 variations
  ],
  "reel_scripts": [
    {
      "hook": "First 3 seconds hook",
      "body": "Main content (15-30 seconds)",
      "cta": "Strong call-to-action",
      "duration": "30s"
    }
    // Generate 3 variations
  ],
  "content_calendar": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "platform": "${platform}",
      "content_type": "carousel/reel/story",
      "caption": "Engaging caption with emojis",
      "hashtags": ["relevant", "hashtags"]
    }
    // Generate 7 days
  ]
}

REQUIREMENTS:
- Ad copies must be benefit-driven, not feature-focused
- Use power words and emotional triggers
- Include social proof elements where relevant
- CTAs must be action-oriented and urgent
- Reel scripts must have strong pattern interrupts
- Content calendar should vary content types
- Match the ${tone} tone consistently
- Optimize for ${objective} conversion goal

Generate the JSON output now:`;
};

export const generatePerformanceAnalysisPrompt = (input: PerformanceAnalysisInput): string => {
  const { data, industry_benchmark } = input;

  let benchmarkSection = `
BENCHMARKS:
- CTR: <1% (weak), 1-2% (average), >2% (strong)
- CPC: Industry median varies by niche
- ROAS: <2 (needs improvement), 2-4 (good), >4 (excellent)
- CPM: Lower is better for reach campaigns`;

  if (industry_benchmark) {
    benchmarkSection = `
INDUSTRY BENCHMARKS (${industry_benchmark.industry_name.toUpperCase()}):
- Average CTR: ${(industry_benchmark.avg_ctr * 100).toFixed(2)}%
- Average CPC: $${industry_benchmark.avg_cpc.toFixed(2)}
- Average ROAS: ${industry_benchmark.avg_roas.toFixed(2)}x
- Average CPM: $${industry_benchmark.avg_cpm.toFixed(2)}

Compare the campaign performance against these industry standards and provide relative insights.`;
  }

  return `You are a performance marketing analyst specializing in paid advertising optimization.

CAMPAIGN DATA:
${JSON.stringify(data, null, 2)}

TASK:
Analyze this ad performance data and provide actionable insights.
${benchmarkSection}

OUTPUT FORMAT (JSON):
{
  "what_worked": [
    "Specific campaigns/ads that performed well with metrics",
    "Patterns in successful creative/targeting"
  ],
  "what_underperformed": [
    "Campaigns below benchmark with specific issues",
    "Wasted spend areas"
  ],
  "optimization_suggestions": [
    "Actionable recommendation 1 with expected impact",
    "Actionable recommendation 2 with expected impact",
    "Budget reallocation strategy"
  ],
  "benchmarks": {
    "avg_ctr": 0.0,
    "avg_cpc": 0.0,
    "avg_roas": 0.0
  },
  "industry_comparison": {
    "ctr_vs_industry": "X% above/below industry average",
    "cpc_vs_industry": "X% above/below industry average",
    "roas_vs_industry": "X% above/below industry average"
  }
}

REQUIREMENTS:
- Be specific with numbers and percentages
- Prioritize high-impact optimizations
- Consider budget efficiency
- Identify creative fatigue patterns
- Suggest A/B test opportunities
- Focus on ROAS improvement

Generate the JSON analysis now:`;
};
