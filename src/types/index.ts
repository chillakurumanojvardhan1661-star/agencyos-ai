export type Currency = 'USD' | 'INR' | 'GBP' | 'EUR' | 'AUD' | 'AED';
export type Platform = 'meta' | 'google' | 'linkedin';
export type Objective = 'leads' | 'sales' | 'awareness';
export type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful' | 'urgent';
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise' | 'trial_pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type ActionType = 'content_generation' | 'performance_analysis' | 'report_generation';
export type Industry = 'fitness' | 'ecommerce' | 'real_estate' | 'coaching' | 'local_business' | 'saas' | 'healthcare' | 'education' | 'general';
export type TemplateCategory = 'ad_copy' | 'reel_script' | 'social_post' | 'email' | 'landing_page';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingSteps {
  create_agency: boolean;
  add_client: boolean;
  upload_brand_kit: boolean;
  generate_content: boolean;
  upload_csv_report: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_steps: OnboardingSteps;
  preferences: Record<string, any>;
  first_login_at?: string;
  first_content_generated_at?: string;
  first_report_generated_at?: string;
  activated_at?: string;
  nudges_dismissed: Record<string, boolean>;
  last_nudge_shown_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Nudge {
  nudge_type: string;
  title: string;
  message: string;
  cta_text: string;
  cta_link: string;
  priority: number;
}

export interface OnboardingStatus {
  completed: boolean;
  steps: OnboardingSteps;
  progress: number;
}

export interface Agency {
  id: string;
  owner_id: string;
  name: string;
  currency: Currency;
  timezone: string;
  logo_url?: string;
  primary_color?: string;
  white_label_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportPreferences {
  id: string;
  agency_id: string;
  include_agency_branding: boolean;
  paper_size: 'A4' | 'US_LETTER';
  theme: 'dark' | 'light';
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  category: TemplateCategory;
  industry?: Industry;
  template_json: TemplateData;
  is_public: boolean;
  created_by_agency_id: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateData {
  platform?: Platform;
  objective?: Objective;
  tone?: Tone;
  offer?: string;
  target_audience?: string;
  headline_pattern?: string;
  cta_pattern?: string;
  hook_pattern?: string;
  body_pattern?: string;
  [key: string]: any;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  industry?: Industry;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandKit {
  id: string;
  client_id: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tone?: Tone;
  offer?: string;
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientContext {
  id: string;
  client_id: string;
  winning_hooks: string[];
  failed_angles: string[];
  seasonal_notes?: string;
  audience_pain_points: string[];
  best_performing_platforms: string[];
  optimal_posting_times?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  agency_id: string;
  user_id: string;
  action_type: ActionType;
  tokens_used: number;
  cost_estimate: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface IndustryBenchmark {
  id: string;
  industry_name: Industry;
  avg_ctr: number;
  avg_cpc: number;
  avg_roas: number;
  avg_cpm: number;
  updated_at: string;
}

export interface AdCopy {
  primary_text: string;
  headline: string;
  cta: string;
}

export interface ReelScript {
  hook: string;
  body: string;
  cta: string;
  duration: string;
}

export interface ContentDay {
  day: number;
  date: string;
  platform: string;
  content_type: string;
  caption: string;
  hashtags: string[];
}

export interface ContentGeneration {
  id: string;
  client_id: string;
  user_id: string;
  platform: Platform;
  objective: Objective;
  tone: Tone;
  offer: string;
  ad_copies: AdCopy[];
  reel_scripts: ReelScript[];
  content_calendar: ContentDay[];
  created_at: string;
}

export interface AdPerformanceData {
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions?: number;
  roas?: number;
}

export interface PerformanceAnalysis {
  what_worked: string[];
  what_underperformed: string[];
  optimization_suggestions: string[];
  benchmarks: {
    avg_ctr: number;
    avg_cpc: number;
    avg_roas: number;
  };
  industry_comparison?: {
    ctr_vs_industry: string;
    cpc_vs_industry: string;
    roas_vs_industry: string;
  };
}

export interface AdPerformanceUpload {
  id: string;
  client_id: string;
  user_id: string;
  file_url: string;
  platform: Platform;
  data: AdPerformanceData[];
  analysis?: PerformanceAnalysis;
  created_at: string;
}

export interface Report {
  id: string;
  client_id: string;
  user_id: string;
  upload_id?: string;
  report_type: string;
  pdf_url?: string;
  data: any;
  created_at: string;
}

export interface Subscription {
  id: string;
  agency_id: string;
  stripe_customer_id: string;
  stripe_subscription_id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  trial_ends_at?: string;
  trial_started_at?: string;
  is_trial: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  name: string;
  monthly_generations: number;
  monthly_analyses: number;
  monthly_reports: number;
  max_clients: number;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  starter: {
    name: 'Starter',
    monthly_generations: 50,
    monthly_analyses: 20,
    monthly_reports: 10,
    max_clients: 5,
  },
  trial_pro: {
    name: 'Pro Trial',
    monthly_generations: 200,
    monthly_analyses: 100,
    monthly_reports: 50,
    max_clients: 20,
  },
  professional: {
    name: 'Professional',
    monthly_generations: 200,
    monthly_analyses: 100,
    monthly_reports: 50,
    max_clients: 20,
  },
  enterprise: {
    name: 'Enterprise',
    monthly_generations: -1, // unlimited
    monthly_analyses: -1,
    monthly_reports: -1,
    max_clients: -1,
  },
};
