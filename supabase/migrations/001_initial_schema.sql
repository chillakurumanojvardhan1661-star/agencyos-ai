-- Enable UUID extension (pgcrypto is built-in to Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agencies table
CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD', -- USD, INR, GBP, EUR, AUD, AED
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand kits table
CREATE TABLE public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  tone TEXT, -- professional, casual, friendly, authoritative, playful
  offer TEXT, -- Main value proposition
  target_audience TEXT, -- Demographics and psychographics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

-- Content generations table
CREATE TABLE public.content_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- meta, google, linkedin
  objective TEXT NOT NULL, -- leads, sales, awareness
  tone TEXT NOT NULL,
  offer TEXT NOT NULL,
  ad_copies JSONB NOT NULL, -- Array of {primary_text, headline, cta}
  reel_scripts JSONB NOT NULL, -- Array of script objects
  content_calendar JSONB NOT NULL, -- 7-day calendar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CSV uploads and analysis table
CREATE TABLE public.ad_performance_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'meta',
  data JSONB NOT NULL, -- Parsed CSV data
  analysis JSONB, -- AI analysis results
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.ad_performance_uploads(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL, -- performance, content, monthly
  pdf_url TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL, -- starter, professional, enterprise
  status TEXT NOT NULL, -- active, canceled, past_due, trialing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agencies_owner ON public.agencies(owner_id);
CREATE INDEX idx_clients_agency ON public.clients(agency_id);
CREATE INDEX idx_brand_kits_client ON public.brand_kits(client_id);
CREATE INDEX idx_content_generations_client ON public.content_generations(client_id);
CREATE INDEX idx_content_generations_created ON public.content_generations(created_at DESC);
CREATE INDEX idx_ad_performance_client ON public.ad_performance_uploads(client_id);
CREATE INDEX idx_reports_client ON public.reports(client_id);
CREATE INDEX idx_subscriptions_agency ON public.subscriptions(agency_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_performance_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Agencies policies
CREATE POLICY "Agency owners can view their agencies" ON public.agencies FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Agency owners can update their agencies" ON public.agencies FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can create agencies" ON public.agencies FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Clients policies
CREATE POLICY "Agency members can view clients" ON public.clients FOR SELECT 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));
CREATE POLICY "Agency members can manage clients" ON public.clients FOR ALL 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Brand kits policies
CREATE POLICY "Agency members can view brand kits" ON public.brand_kits FOR SELECT 
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));
CREATE POLICY "Agency members can manage brand kits" ON public.brand_kits FOR ALL 
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));

-- Content generations policies
CREATE POLICY "Agency members can view content" ON public.content_generations FOR SELECT 
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));
CREATE POLICY "Agency members can create content" ON public.content_generations FOR INSERT 
  WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));

-- Ad performance policies
CREATE POLICY "Agency members can view uploads" ON public.ad_performance_uploads FOR SELECT 
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));
CREATE POLICY "Agency members can create uploads" ON public.ad_performance_uploads FOR INSERT 
  WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));

-- Reports policies
CREATE POLICY "Agency members can view reports" ON public.reports FOR SELECT 
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));
CREATE POLICY "Agency members can create reports" ON public.reports FOR INSERT 
  WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())));

-- Subscriptions policies
CREATE POLICY "Agency owners can view subscriptions" ON public.subscriptions FOR SELECT 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));
CREATE POLICY "Agency owners can manage subscriptions" ON public.subscriptions FOR ALL 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON public.brand_kits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
