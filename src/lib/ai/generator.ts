import { AIClient } from './client';
import { 
  generateContentPrompt, 
  generatePerformanceAnalysisPrompt, 
  ContentGenerationInput,
  PerformanceAnalysisInput 
} from './prompts';
import { z } from 'zod';

// Validation schemas
const contentGenerationSchema = z.object({
  ad_copies: z.array(z.object({
    primary_text: z.string(),
    headline: z.string(),
    cta: z.string(),
  })).length(3),
  reel_scripts: z.array(z.object({
    hook: z.string(),
    body: z.string(),
    cta: z.string(),
    duration: z.string(),
  })).length(3),
  content_calendar: z.array(z.object({
    day: z.number(),
    date: z.string(),
    platform: z.string(),
    content_type: z.string(),
    caption: z.string(),
    hashtags: z.array(z.string()),
  })).length(7),
});

const performanceAnalysisSchema = z.object({
  what_worked: z.array(z.string()),
  what_underperformed: z.array(z.string()),
  optimization_suggestions: z.array(z.string()),
  benchmarks: z.object({
    avg_ctr: z.number(),
    avg_cpc: z.number(),
    avg_roas: z.number(),
  }),
  industry_comparison: z.object({
    ctr_vs_industry: z.string(),
    cpc_vs_industry: z.string(),
    roas_vs_industry: z.string(),
  }).optional(),
});

export async function generateContent(
  input: ContentGenerationInput,
  metadata: { agency_id: string; user_id: string }
) {
  const aiClient = new AIClient({ temperature: 0.8 });
  
  const systemPrompt = 'You are an expert digital marketing AI that generates high-converting ad content. Always respond with valid JSON only.';
  const userPrompt = generateContentPrompt(input);

  const result = await aiClient.generateCompletion(
    systemPrompt,
    userPrompt,
    {
      ...metadata,
      action_type: 'content_generation',
    },
    {
      schema: contentGenerationSchema,
      responseFormat: 'json_object',
    }
  );

  return result;
}

export async function analyzePerformance(
  input: PerformanceAnalysisInput,
  metadata: { agency_id: string; user_id: string }
) {
  const aiClient = new AIClient({ temperature: 0.7 });
  
  const systemPrompt = 'You are a performance marketing analyst AI. Always respond with valid JSON only.';
  const userPrompt = generatePerformanceAnalysisPrompt(input);

  const result = await aiClient.generateCompletion(
    systemPrompt,
    userPrompt,
    {
      ...metadata,
      action_type: 'performance_analysis',
    },
    {
      schema: performanceAnalysisSchema,
      responseFormat: 'json_object',
    }
  );

  return result;
}
