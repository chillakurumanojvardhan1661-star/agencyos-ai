-- Analytics Dashboard Migration
-- Tracks conversion events and provides admin-only analytics

-- Create analytics_events table for tracking key conversion events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'trial_started',
    'trial_activated',
    'trial_converted',
    'trial_expired',
    'referral_signup',
    'referral_converted'
  )),
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_agency ON public.analytics_events(agency_id);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_type_created ON public.analytics_events(event_type, created_at);

-- Create admin_roles table for role-based access control
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for admin lookups
CREATE INDEX idx_admin_roles_user ON public.admin_roles(user_id);

-- RLS Policies for analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read analytics events
CREATE POLICY "Admins can read all analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE admin_roles.user_id = auth.uid()
        AND admin_roles.role = 'admin'
    )
  );

-- System can insert analytics events (via service role)
CREATE POLICY "Service role can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Admins can read all admin roles
CREATE POLICY "Admins can read admin roles"
  ON public.admin_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid()
        AND ar.role = 'admin'
    )
  );

-- Only admins can manage admin roles
CREATE POLICY "Admins can manage admin roles"
  ON public.admin_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid()
        AND ar.role = 'admin'
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track analytics event
CREATE OR REPLACE FUNCTION public.track_analytics_event(
  p_event_type TEXT,
  p_agency_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    event_type,
    agency_id,
    user_id,
    metadata
  ) VALUES (
    p_event_type,
    p_agency_id,
    COALESCE(p_user_id, auth.uid()),
    p_metadata
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversion analytics (admin only)
CREATE OR REPLACE FUNCTION public.get_conversion_analytics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  metric TEXT,
  value NUMERIC,
  percentage NUMERIC
) AS $$
DECLARE
  total_trials INTEGER;
  activated_trials INTEGER;
  converted_trials INTEGER;
  expired_trials INTEGER;
  total_referrals INTEGER;
  converted_referrals INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Count trial events
  SELECT COUNT(DISTINCT agency_id) INTO total_trials
  FROM public.analytics_events
  WHERE event_type = 'trial_started'
    AND created_at BETWEEN p_start_date AND p_end_date;

  SELECT COUNT(DISTINCT agency_id) INTO activated_trials
  FROM public.analytics_events
  WHERE event_type = 'trial_activated'
    AND created_at BETWEEN p_start_date AND p_end_date;

  SELECT COUNT(DISTINCT agency_id) INTO converted_trials
  FROM public.analytics_events
  WHERE event_type = 'trial_converted'
    AND created_at BETWEEN p_start_date AND p_end_date;

  SELECT COUNT(DISTINCT agency_id) INTO expired_trials
  FROM public.analytics_events
  WHERE event_type = 'trial_expired'
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Count referral events
  SELECT COUNT(DISTINCT user_id) INTO total_referrals
  FROM public.analytics_events
  WHERE event_type = 'referral_signup'
    AND created_at BETWEEN p_start_date AND p_end_date;

  SELECT COUNT(DISTINCT user_id) INTO converted_referrals
  FROM public.analytics_events
  WHERE event_type = 'referral_converted'
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Return metrics
  RETURN QUERY
  SELECT 'total_trials'::TEXT, total_trials::NUMERIC, 100.0::NUMERIC
  UNION ALL
  SELECT 'activated_trials'::TEXT, activated_trials::NUMERIC, 
    CASE WHEN total_trials > 0 THEN ROUND(100.0 * activated_trials / total_trials, 2) ELSE 0 END
  UNION ALL
  SELECT 'converted_trials'::TEXT, converted_trials::NUMERIC,
    CASE WHEN total_trials > 0 THEN ROUND(100.0 * converted_trials / total_trials, 2) ELSE 0 END
  UNION ALL
  SELECT 'expired_trials'::TEXT, expired_trials::NUMERIC,
    CASE WHEN total_trials > 0 THEN ROUND(100.0 * expired_trials / total_trials, 2) ELSE 0 END
  UNION ALL
  SELECT 'total_referrals'::TEXT, total_referrals::NUMERIC, 100.0::NUMERIC
  UNION ALL
  SELECT 'converted_referrals'::TEXT, converted_referrals::NUMERIC,
    CASE WHEN total_referrals > 0 THEN ROUND(100.0 * converted_referrals / total_referrals, 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get time-to-activation metrics (admin only)
CREATE OR REPLACE FUNCTION public.get_activation_metrics()
RETURNS TABLE (
  avg_hours_to_activation NUMERIC,
  median_hours_to_activation NUMERIC,
  total_activated INTEGER
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  WITH activation_times AS (
    SELECT 
      started.agency_id,
      EXTRACT(EPOCH FROM (activated.created_at - started.created_at)) / 3600 as hours_to_activation
    FROM public.analytics_events started
    INNER JOIN public.analytics_events activated 
      ON started.agency_id = activated.agency_id
      AND activated.event_type = 'trial_activated'
    WHERE started.event_type = 'trial_started'
  )
  SELECT 
    ROUND(AVG(hours_to_activation), 2) as avg_hours,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hours_to_activation), 2) as median_hours,
    COUNT(*)::INTEGER as total
  FROM activation_times;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get MRR (Monthly Recurring Revenue) - admin only
CREATE OR REPLACE FUNCTION public.get_mrr_metrics()
RETURNS TABLE (
  current_mrr NUMERIC,
  professional_count INTEGER,
  enterprise_count INTEGER,
  trial_count INTEGER
) AS $$
DECLARE
  pro_price NUMERIC := 99.00; -- Default, should match Stripe
  ent_price NUMERIC := 299.00; -- Default, should match Stripe
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    (COUNT(*) FILTER (WHERE plan = 'professional') * pro_price +
     COUNT(*) FILTER (WHERE plan = 'enterprise') * ent_price)::NUMERIC as mrr,
    COUNT(*) FILTER (WHERE plan = 'professional')::INTEGER as pro_count,
    COUNT(*) FILTER (WHERE plan = 'enterprise')::INTEGER as ent_count,
    COUNT(*) FILTER (WHERE plan = 'trial_pro' AND is_trial = true)::INTEGER as trial_count
  FROM public.subscriptions
  WHERE status IN ('active', 'trialing');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get viral coefficient (admin only)
CREATE OR REPLACE FUNCTION public.get_viral_coefficient(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_users INTEGER,
  total_referrals INTEGER,
  viral_coefficient NUMERIC
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  WITH user_counts AS (
    SELECT COUNT(DISTINCT user_id) as users
    FROM public.agencies
    WHERE created_at BETWEEN p_start_date AND p_end_date
  ),
  referral_counts AS (
    SELECT COUNT(DISTINCT user_id) as referrals
    FROM public.analytics_events
    WHERE event_type = 'referral_signup'
      AND created_at BETWEEN p_start_date AND p_end_date
  )
  SELECT 
    uc.users::INTEGER,
    rc.referrals::INTEGER,
    CASE WHEN uc.users > 0 
      THEN ROUND(rc.referrals::NUMERIC / uc.users, 3)
      ELSE 0 
    END as coefficient
  FROM user_counts uc, referral_counts rc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily analytics trend (admin only)
CREATE OR REPLACE FUNCTION public.get_daily_analytics(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  trials_started INTEGER,
  trials_activated INTEGER,
  trials_converted INTEGER,
  referrals INTEGER
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    DATE(created_at) as event_date,
    COUNT(*) FILTER (WHERE event_type = 'trial_started')::INTEGER,
    COUNT(*) FILTER (WHERE event_type = 'trial_activated')::INTEGER,
    COUNT(*) FILTER (WHERE event_type = 'trial_converted')::INTEGER,
    COUNT(*) FILTER (WHERE event_type = 'referral_signup')::INTEGER
  FROM public.analytics_events
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY event_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.analytics_events IS 'Tracks conversion and growth events for analytics';
COMMENT ON TABLE public.admin_roles IS 'Role-based access control for admin features';
COMMENT ON FUNCTION public.track_analytics_event IS 'Track a conversion or growth event';
COMMENT ON FUNCTION public.get_conversion_analytics IS 'Get conversion metrics (admin only)';
COMMENT ON FUNCTION public.get_activation_metrics IS 'Get time-to-activation metrics (admin only)';
COMMENT ON FUNCTION public.get_mrr_metrics IS 'Get Monthly Recurring Revenue (admin only)';
COMMENT ON FUNCTION public.get_viral_coefficient IS 'Get viral growth coefficient (admin only)';
COMMENT ON FUNCTION public.get_daily_analytics IS 'Get daily analytics trend (admin only)';

