import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { ActionType } from '@/types';

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000, // 60 second timeout
    });
  }
  return openaiInstance;
}

const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    return getOpenAI()[prop as keyof OpenAI];
  }
});

// Lazy initialization to avoid build-time errors
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

// Token cost estimation (GPT-4 Turbo pricing)
const TOKEN_COSTS = {
  'gpt-4-turbo-preview': {
    input: 0.01 / 1000, // $0.01 per 1K tokens
    output: 0.03 / 1000, // $0.03 per 1K tokens
  },
  'gpt-4': {
    input: 0.03 / 1000,
    output: 0.06 / 1000,
  },
  'gpt-3.5-turbo': {
    input: 0.0005 / 1000,
    output: 0.0015 / 1000,
  },
};

interface AIClientOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
  schema?: z.ZodSchema;
  maxRetries?: number;
}

interface AICallMetadata {
  agency_id: string;
  user_id: string;
  action_type: ActionType;
}

export class AIClient {
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private maxRetries: number;

  constructor(options: AIClientOptions = {}) {
    this.model = options.model || 'gpt-4-turbo-preview';
    this.temperature = options.temperature ?? 0.8;
    this.maxTokens = options.maxTokens || 4000;
    this.maxRetries = options.maxRetries ?? 2;
  }

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    metadata: AICallMetadata,
    options: AIClientOptions = {}
  ): Promise<any> {
    const model = options.model || this.model;
    const temperature = options.temperature ?? this.temperature;
    const maxTokens = options.maxTokens || this.maxTokens;
    const responseFormat = options.responseFormat || 'json_object';
    const schema = options.schema;

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        const startTime = Date.now();

        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
        });

        const content = completion.choices[0].message.content;
        if (!content) {
          throw new Error('No content generated from AI');
        }

        // Parse JSON if expected
        const result = responseFormat === 'json_object' ? JSON.parse(content) : content;

        // Validate against schema if provided
        if (schema) {
          schema.parse(result);
        }

        // Calculate token usage and cost
        const tokensUsed = completion.usage?.total_tokens || 0;
        const inputTokens = completion.usage?.prompt_tokens || 0;
        const outputTokens = completion.usage?.completion_tokens || 0;

        const modelCosts = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS] || TOKEN_COSTS['gpt-4-turbo-preview'];
        const costEstimate = (inputTokens * modelCosts.input) + (outputTokens * modelCosts.output);

        // Log usage asynchronously (don't block response)
        this.logUsage({
          ...metadata,
          tokens_used: tokensUsed,
          cost_estimate: costEstimate,
          metadata: {
            model,
            duration_ms: Date.now() - startTime,
            attempt: attempt + 1,
          },
        }).catch(err => console.error('Failed to log usage:', err));

        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Don't retry on validation errors
        if (error instanceof z.ZodError) {
          throw new Error(`AI response validation failed: ${error.message}`);
        }

        // Don't retry on JSON parse errors
        if (error instanceof SyntaxError) {
          throw new Error(`AI returned invalid JSON: ${error.message}`);
        }

        // Retry on network/timeout errors
        if (attempt <= this.maxRetries) {
          console.warn(`AI call attempt ${attempt} failed, retrying...`, error);
          await this.delay(1000 * attempt); // Exponential backoff
          continue;
        }
      }
    }

    throw new Error(`AI call failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`);
  }

  private async logUsage(data: {
    agency_id: string;
    user_id: string;
    action_type: ActionType;
    tokens_used: number;
    cost_estimate: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    // TODO: Remove type assertion after generating real Supabase types
    await (getSupabaseAdmin().from('usage_logs') as any).insert({
      agency_id: data.agency_id,
      user_id: data.user_id,
      action_type: data.action_type,
      tokens_used: data.tokens_used,
      cost_estimate: data.cost_estimate,
      metadata: data.metadata,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for default configuration
export const aiClient = new AIClient();
