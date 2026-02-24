-- Add nudge tracking columns to user_settings
ALTER TABLE public.user_settings
ADD COLUMN nudges_dismissed JSONB DEFAULT '{}'::jsonb,
ADD COLUMN last_nudge_shown_at TIMESTAMPTZ;

-- Function to check if user should see nudges
CREATE OR REPLACE FUNCTION public.get_active_nudges()
RETURNS TABLE (
  nudge_type TEXT,
  title TEXT,
  message TEXT,
  cta_text TEXT,
  cta_link TEXT,
  priority INTEGER
) AS $$
DECLARE
  settings_record RECORD;
  hours_since_login INTEGER;
  hours_since_content INTEGER;
  hours_since_report INTEGER;
BEGIN
  -- Get user settings
  SELECT 
    first_login_at,
    first_content_generated_at,
    first_report_generated_at,
    nudges_dismissed
  INTO settings_record
  FROM public.user_settings
  WHERE user_id = auth.uid();

  -- If no settings, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate hours since events
  IF settings_record.first_login_at IS NOT NULL THEN
    hours_since_login := EXTRACT(EPOCH FROM (NOW() - settings_record.first_login_at)) / 3600;
  END IF;

  IF settings_record.first_content_generated_at IS NOT NULL THEN
    hours_since_content := EXTRACT(EPOCH FROM (NOW() - settings_record.first_content_generated_at)) / 3600;
  END IF;

  IF settings_record.first_report_generated_at IS NOT NULL THEN
    hours_since_report := EXTRACT(EPOCH FROM (NOW() - settings_record.first_report_generated_at)) / 3600;
  END IF;

  -- Nudge 1: No report after 24 hours (highest priority)
  IF hours_since_login >= 24 
     AND settings_record.first_report_generated_at IS NULL
     AND NOT COALESCE((settings_record.nudges_dismissed->>'no_report_24h')::boolean, false)
  THEN
    RETURN QUERY SELECT
      'no_report_24h'::TEXT,
      '📊 Ready to impress your clients?'::TEXT,
      'Generate your first client-ready performance report in under 2 minutes.'::TEXT,
      'Create Report Now'::TEXT,
      '/dashboard/reports'::TEXT,
      1::INTEGER;
  END IF;

  -- Nudge 2: No content after 48 hours
  IF hours_since_login >= 48 
     AND settings_record.first_content_generated_at IS NULL
     AND NOT COALESCE((settings_record.nudges_dismissed->>'no_content_48h')::boolean, false)
  THEN
    RETURN QUERY SELECT
      'no_content_48h'::TEXT,
      '✨ Your AI copywriter is waiting'::TEXT,
      'Create your first AI ad in 60 seconds. No creative block, just results.'::TEXT,
      'Generate Content'::TEXT,
      '/dashboard/generate'::TEXT,
      2::INTEGER;
  END IF;

  -- Nudge 3: Content generated but no report after 72 hours
  IF hours_since_content >= 72
     AND settings_record.first_content_generated_at IS NOT NULL
     AND settings_record.first_report_generated_at IS NULL
     AND NOT COALESCE((settings_record.nudges_dismissed->>'content_no_report_72h')::boolean, false)
  THEN
    RETURN QUERY SELECT
      'content_no_report_72h'::TEXT,
      '📈 Take it to the next level'::TEXT,
      'You''ve created content. Now analyze performance and show clients the ROI.'::TEXT,
      'Generate Report'::TEXT,
      '/dashboard/reports'::TEXT,
      3::INTEGER;
  END IF;

  -- Nudge 4: No activity after 7 days
  IF hours_since_login >= 168
     AND settings_record.first_content_generated_at IS NULL
     AND settings_record.first_report_generated_at IS NULL
     AND NOT COALESCE((settings_record.nudges_dismissed->>'no_activity_7d')::boolean, false)
  THEN
    RETURN QUERY SELECT
      'no_activity_7d'::TEXT,
      '👋 We miss you!'::TEXT,
      'Your agency dashboard is ready. Start with a quick AI content generation.'::TEXT,
      'Get Started'::TEXT,
      '/dashboard/generate'::TEXT,
      4::INTEGER;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to dismiss a nudge
CREATE OR REPLACE FUNCTION public.dismiss_nudge(nudge_type TEXT)
RETURNS void AS $$
DECLARE
  current_dismissed JSONB;
BEGIN
  -- Get current dismissed nudges
  SELECT nudges_dismissed INTO current_dismissed
  FROM public.user_settings
  WHERE user_id = auth.uid();

  -- If no settings exist, create them
  IF current_dismissed IS NULL THEN
    INSERT INTO public.user_settings (user_id, nudges_dismissed)
    VALUES (auth.uid(), jsonb_build_object(nudge_type, true))
    ON CONFLICT (user_id) 
    DO UPDATE SET nudges_dismissed = jsonb_build_object(nudge_type, true);
  ELSE
    -- Update dismissed nudges
    UPDATE public.user_settings
    SET 
      nudges_dismissed = current_dismissed || jsonb_build_object(nudge_type, true),
      last_nudge_shown_at = NOW()
    WHERE user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset all nudges (for testing or user request)
CREATE OR REPLACE FUNCTION public.reset_nudges()
RETURNS void AS $$
BEGIN
  UPDATE public.user_settings
  SET nudges_dismissed = '{}'::jsonb
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for nudge queries
CREATE INDEX idx_user_settings_nudges ON public.user_settings(last_nudge_shown_at);

-- Comment on columns
COMMENT ON COLUMN public.user_settings.nudges_dismissed IS 'JSONB object tracking which nudges user has dismissed';
COMMENT ON COLUMN public.user_settings.last_nudge_shown_at IS 'Timestamp of last nudge shown to user';
