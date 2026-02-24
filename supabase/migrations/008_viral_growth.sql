-- Add public sharing columns to reports table
ALTER TABLE public.reports
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN public_views INTEGER DEFAULT 0,
ADD COLUMN last_viewed_at TIMESTAMPTZ;

-- Create index for share tokens
CREATE INDEX idx_reports_share_token ON public.reports(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_reports_public ON public.reports(is_public) WHERE is_public = TRUE;

-- Referral tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('public_report', 'direct_link', 'other')),
  source_id UUID, -- report_id if from public report
  conversion_status TEXT DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'signed_up', 'activated', 'paid')),
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'eligible', 'paid')),
  reward_amount DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Indexes for referral tracking
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_agency_id);
CREATE INDEX idx_referrals_referred_user ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(conversion_status);
CREATE INDEX idx_referrals_source ON public.referrals(source_type, source_id);

-- RLS Policies for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Agency owners can view their referrals
CREATE POLICY "Agency owners can view own referrals" ON public.referrals FOR SELECT 
  USING (referrer_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Function to generate secure share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random token (32 characters)
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := substring(token, 1, 32);
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.reports WHERE share_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable public sharing for a report
CREATE OR REPLACE FUNCTION public.enable_report_sharing(report_id UUID)
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  report_owner UUID;
BEGIN
  -- Verify ownership
  SELECT user_id INTO report_owner
  FROM public.reports
  WHERE id = report_id;
  
  IF report_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Generate token if doesn't exist
  SELECT share_token INTO token
  FROM public.reports
  WHERE id = report_id;
  
  IF token IS NULL THEN
    token := generate_share_token();
  END IF;
  
  -- Update report
  UPDATE public.reports
  SET 
    share_token = token,
    is_public = TRUE,
    updated_at = NOW()
  WHERE id = report_id;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disable public sharing
CREATE OR REPLACE FUNCTION public.disable_report_sharing(report_id UUID)
RETURNS void AS $$
DECLARE
  report_owner UUID;
BEGIN
  -- Verify ownership
  SELECT user_id INTO report_owner
  FROM public.reports
  WHERE id = report_id;
  
  IF report_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Update report
  UPDATE public.reports
  SET 
    is_public = FALSE,
    updated_at = NOW()
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment public view count
CREATE OR REPLACE FUNCTION public.increment_report_views(token TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.reports
  SET 
    public_views = public_views + 1,
    last_viewed_at = NOW()
  WHERE share_token = token AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track referral from public report
CREATE OR REPLACE FUNCTION public.track_referral(
  report_token TEXT,
  user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  report_record RECORD;
  referral_id UUID;
BEGIN
  -- Get report and agency info
  SELECT 
    r.id as report_id,
    r.client_id,
    c.agency_id
  INTO report_record
  FROM public.reports r
  JOIN public.clients c ON c.id = r.client_id
  WHERE r.share_token = report_token AND r.is_public = TRUE;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (
    referrer_agency_id,
    referred_user_id,
    source_type,
    source_id,
    conversion_status,
    metadata
  ) VALUES (
    report_record.agency_id,
    user_id,
    'public_report',
    report_record.report_id,
    CASE WHEN user_id IS NOT NULL THEN 'signed_up' ELSE 'pending' END,
    jsonb_build_object('report_token', report_token)
  )
  RETURNING id INTO referral_id;
  
  -- Track analytics event if user signed up
  IF user_id IS NOT NULL THEN
    PERFORM public.track_analytics_event(
      'referral_signup',
      NULL,
      user_id,
      jsonb_build_object(
        'referrer_agency_id', report_record.agency_id,
        'referral_token', report_token
      )
    );
  END IF;
  
  RETURN referral_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update referral status
CREATE OR REPLACE FUNCTION public.update_referral_status(
  user_id UUID,
  new_status TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.referrals
  SET 
    conversion_status = new_status,
    converted_at = CASE WHEN new_status = 'signed_up' THEN NOW() ELSE converted_at END,
    activated_at = CASE WHEN new_status = 'activated' THEN NOW() ELSE activated_at END,
    paid_at = CASE WHEN new_status = 'paid' THEN NOW() ELSE paid_at END
  WHERE referred_user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get referral stats for agency
CREATE OR REPLACE FUNCTION public.get_referral_stats(agency_id UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  signed_up BIGINT,
  activated BIGINT,
  paid BIGINT,
  pending_rewards DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_referrals,
    COUNT(*) FILTER (WHERE conversion_status IN ('signed_up', 'activated', 'paid'))::BIGINT as signed_up,
    COUNT(*) FILTER (WHERE conversion_status IN ('activated', 'paid'))::BIGINT as activated,
    COUNT(*) FILTER (WHERE conversion_status = 'paid')::BIGINT as paid,
    COALESCE(SUM(reward_amount) FILTER (WHERE reward_status = 'eligible'), 0) as pending_rewards
  FROM public.referrals
  WHERE referrer_agency_id = agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON COLUMN public.reports.share_token IS 'Secure token for public sharing';
COMMENT ON COLUMN public.reports.is_public IS 'Whether report is publicly accessible';
COMMENT ON COLUMN public.reports.public_views IS 'Number of times public report was viewed';
COMMENT ON TABLE public.referrals IS 'Tracks referrals from public reports and other sources';
