-- Usage tracking table
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('content_generation', 'performance_analysis', 'report_generation')),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_estimate DECIMAL(10, 4) NOT NULL DEFAULT 0,
  metadata JSONB, -- Store additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industry benchmarks table
CREATE TABLE public.industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_name TEXT UNIQUE NOT NULL,
  avg_ctr DECIMAL(5, 4) NOT NULL,
  avg_cpc DECIMAL(10, 2) NOT NULL,
  avg_roas DECIMAL(10, 2) NOT NULL,
  avg_cpm DECIMAL(10, 2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client AI context memory table
CREATE TABLE public.client_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  winning_hooks TEXT[] DEFAULT '{}',
  failed_angles TEXT[] DEFAULT '{}',
  seasonal_notes TEXT,
  audience_pain_points TEXT[] DEFAULT '{}',
  best_performing_platforms TEXT[] DEFAULT '{}',
  optimal_posting_times TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

-- Add industry field to clients if not exists
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS industry TEXT;

-- Indexes for performance
CREATE INDEX idx_usage_logs_agency ON public.usage_logs(agency_id, created_at DESC);
CREATE INDEX idx_usage_logs_user ON public.usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_action ON public.usage_logs(action_type, created_at DESC);
CREATE INDEX idx_client_contexts_client ON public.client_contexts(client_id);
CREATE INDEX idx_industry_benchmarks_name ON public.industry_benchmarks(industry_name);

-- RLS Policies for usage_logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view usage logs" ON public.usage_logs FOR SELECT 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

CREATE POLICY "System can insert usage logs" ON public.usage_logs FOR INSERT 
  WITH CHECK (true); -- Service role only

-- RLS Policies for industry_benchmarks
ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view benchmarks" ON public.industry_benchmarks FOR SELECT 
  USING (true);

-- RLS Policies for client_contexts
ALTER TABLE public.client_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view contexts" ON public.client_contexts FOR SELECT 
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));

CREATE POLICY "Agency members can manage contexts" ON public.client_contexts FOR ALL 
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));

-- Trigger for client_contexts updated_at
CREATE TRIGGER update_client_contexts_updated_at 
  BEFORE UPDATE ON public.client_contexts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed industry benchmarks
INSERT INTO public.industry_benchmarks (industry_name, avg_ctr, avg_cpc, avg_roas, avg_cpm) VALUES
  ('fitness', 0.0185, 1.25, 3.50, 8.50),
  ('ecommerce', 0.0165, 0.95, 4.20, 7.80),
  ('real_estate', 0.0145, 2.10, 2.80, 12.50),
  ('coaching', 0.0220, 1.80, 3.20, 10.20),
  ('local_business', 0.0195, 1.40, 2.90, 9.30),
  ('saas', 0.0155, 3.50, 3.80, 15.00),
  ('healthcare', 0.0175, 2.80, 2.50, 11.50),
  ('education', 0.0205, 1.60, 3.10, 8.90)
ON CONFLICT (industry_name) DO NOTHING;

-- Function to get monthly usage for an agency
CREATE OR REPLACE FUNCTION get_monthly_usage(p_agency_id UUID, p_action_type TEXT DEFAULT NULL)
RETURNS TABLE (
  total_tokens BIGINT,
  total_cost DECIMAL,
  action_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(tokens_used), 0)::BIGINT as total_tokens,
    COALESCE(SUM(cost_estimate), 0)::DECIMAL as total_cost,
    COUNT(*)::BIGINT as action_count
  FROM public.usage_logs
  WHERE 
    agency_id = p_agency_id
    AND created_at >= date_trunc('month', NOW())
    AND (p_action_type IS NULL OR action_type = p_action_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
