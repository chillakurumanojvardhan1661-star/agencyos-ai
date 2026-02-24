-- Add agency branding fields
ALTER TABLE public.agencies 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT FALSE;

-- Add report preferences
CREATE TABLE IF NOT EXISTS public.report_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  include_agency_branding BOOLEAN DEFAULT FALSE,
  paper_size TEXT DEFAULT 'A4' CHECK (paper_size IN ('A4', 'US_LETTER')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id)
);

-- RLS Policies for report_preferences
ALTER TABLE public.report_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view report preferences" ON public.report_preferences FOR SELECT 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

CREATE POLICY "Agency members can manage report preferences" ON public.report_preferences FOR ALL 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Trigger for report_preferences updated_at
CREATE TRIGGER update_report_preferences_updated_at 
  BEFORE UPDATE ON public.report_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_report_preferences_agency ON public.report_preferences(agency_id);
