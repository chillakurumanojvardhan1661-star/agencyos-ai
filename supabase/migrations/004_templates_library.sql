-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('ad_copy', 'reel_script', 'social_post', 'email', 'landing_page')),
  industry TEXT CHECK (industry IN ('fitness', 'ecommerce', 'real_estate', 'coaching', 'local_business', 'saas', 'healthcare', 'education', 'general')),
  template_json JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by_agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_industry ON public.templates(industry);
CREATE INDEX idx_templates_public ON public.templates(is_public);
CREATE INDEX idx_templates_agency ON public.templates(created_by_agency_id);
CREATE INDEX idx_templates_usage ON public.templates(usage_count DESC);

-- RLS Policies
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view public templates
CREATE POLICY "Anyone can view public templates" ON public.templates FOR SELECT 
  USING (is_public = true);

-- Agency members can view their own templates
CREATE POLICY "Agency members can view own templates" ON public.templates FOR SELECT 
  USING (created_by_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Agency members can create templates
CREATE POLICY "Agency members can create templates" ON public.templates FOR INSERT 
  WITH CHECK (created_by_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Agency members can update their own templates
CREATE POLICY "Agency members can update own templates" ON public.templates FOR UPDATE 
  USING (created_by_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Agency members can delete their own templates
CREATE POLICY "Agency members can delete own templates" ON public.templates FOR DELETE 
  USING (created_by_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON public.templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some public templates
INSERT INTO public.templates (
  title, 
  description, 
  category, 
  industry, 
  template_json, 
  is_public, 
  created_by_agency_id
) VALUES
(
  'Limited Time Offer - Fitness',
  'High-converting limited time offer template for fitness industry',
  'ad_copy',
  'fitness',
  '{
    "platform": "meta",
    "objective": "sales",
    "tone": "urgent",
    "offer": "50% off first month - Limited time only!",
    "target_audience": "Fitness enthusiasts aged 25-45",
    "headline_pattern": "Limited Time: [Discount] Off [Product]",
    "cta_pattern": "Claim Your Discount Now"
  }'::jsonb,
  true,
  NULL
),
(
  'Social Proof - Ecommerce',
  'Leverage social proof for ecommerce conversions',
  'ad_copy',
  'ecommerce',
  '{
    "platform": "meta",
    "objective": "sales",
    "tone": "friendly",
    "offer": "Join 10,000+ happy customers",
    "target_audience": "Online shoppers aged 25-55",
    "headline_pattern": "Join [Number]+ Happy Customers",
    "cta_pattern": "Shop Now"
  }'::jsonb,
  true,
  NULL
),
(
  'Problem-Solution - SaaS',
  'Problem-solution framework for SaaS products',
  'ad_copy',
  'saas',
  '{
    "platform": "linkedin",
    "objective": "leads",
    "tone": "professional",
    "offer": "Free 14-day trial - No credit card required",
    "target_audience": "Business owners and managers",
    "headline_pattern": "Struggling with [Problem]? We Have the Solution",
    "cta_pattern": "Start Free Trial"
  }'::jsonb,
  true,
  NULL
),
(
  'Viral Hook - Reel Script',
  'Attention-grabbing reel script template',
  'reel_script',
  'general',
  '{
    "platform": "meta",
    "objective": "awareness",
    "tone": "playful",
    "hook_pattern": "POV: You just discovered [Solution]",
    "body_pattern": "Here''s what changed: [3 key benefits]",
    "cta_pattern": "Follow for more tips"
  }'::jsonb,
  true,
  NULL
);
