-- Add analytics timestamps to user_settings
ALTER TABLE public.user_settings
ADD COLUMN first_login_at TIMESTAMPTZ,
ADD COLUMN first_content_generated_at TIMESTAMPTZ,
ADD COLUMN first_report_generated_at TIMESTAMPTZ,
ADD COLUMN activated_at TIMESTAMPTZ;

-- Create indexes for analytics queries
CREATE INDEX idx_user_settings_first_login ON public.user_settings(first_login_at);
CREATE INDEX idx_user_settings_activated ON public.user_settings(activated_at);

-- Function to set first login timestamp
CREATE OR REPLACE FUNCTION public.set_first_login()
RETURNS void AS $$
BEGIN
  -- Only set if not already set
  UPDATE public.user_settings
  SET first_login_at = NOW()
  WHERE user_id = auth.uid()
    AND first_login_at IS NULL;
  
  -- If no settings exist, create them
  IF NOT FOUND THEN
    INSERT INTO public.user_settings (user_id, first_login_at)
    VALUES (auth.uid(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET first_login_at = COALESCE(user_settings.first_login_at, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set first content generated timestamp
CREATE OR REPLACE FUNCTION public.set_first_content_generated()
RETURNS void AS $$
BEGIN
  UPDATE public.user_settings
  SET first_content_generated_at = NOW()
  WHERE user_id = auth.uid()
    AND first_content_generated_at IS NULL;
  
  -- If no settings exist, create them
  IF NOT FOUND THEN
    INSERT INTO public.user_settings (user_id, first_content_generated_at)
    VALUES (auth.uid(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET first_content_generated_at = COALESCE(user_settings.first_content_generated_at, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set first report generated timestamp
CREATE OR REPLACE FUNCTION public.set_first_report_generated()
RETURNS void AS $$
BEGIN
  UPDATE public.user_settings
  SET first_report_generated_at = NOW()
  WHERE user_id = auth.uid()
    AND first_report_generated_at IS NULL;
  
  -- If no settings exist, create them
  IF NOT FOUND THEN
    INSERT INTO public.user_settings (user_id, first_report_generated_at)
    VALUES (auth.uid(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET first_report_generated_at = COALESCE(user_settings.first_report_generated_at, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set activated timestamp (when PDF report is downloaded)
CREATE OR REPLACE FUNCTION public.set_activated()
RETURNS void AS $$
BEGIN
  UPDATE public.user_settings
  SET activated_at = NOW()
  WHERE user_id = auth.uid()
    AND activated_at IS NULL;
  
  -- If no settings exist, create them
  IF NOT FOUND THEN
    INSERT INTO public.user_settings (user_id, activated_at)
    VALUES (auth.uid(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET activated_at = COALESCE(user_settings.activated_at, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics metrics (for admin dashboard in future)
CREATE OR REPLACE FUNCTION public.get_onboarding_analytics()
RETURNS TABLE (
  total_users BIGINT,
  users_logged_in BIGINT,
  users_generated_content BIGINT,
  users_generated_report BIGINT,
  users_activated BIGINT,
  avg_time_to_first_content INTERVAL,
  avg_time_to_first_report INTERVAL,
  avg_time_to_activation INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_users,
    COUNT(first_login_at)::BIGINT as users_logged_in,
    COUNT(first_content_generated_at)::BIGINT as users_generated_content,
    COUNT(first_report_generated_at)::BIGINT as users_generated_report,
    COUNT(activated_at)::BIGINT as users_activated,
    AVG(first_content_generated_at - first_login_at) as avg_time_to_first_content,
    AVG(first_report_generated_at - first_login_at) as avg_time_to_first_report,
    AVG(activated_at - first_login_at) as avg_time_to_activation
  FROM public.user_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on columns for documentation
COMMENT ON COLUMN public.user_settings.first_login_at IS 'Timestamp of user''s first login/session';
COMMENT ON COLUMN public.user_settings.first_content_generated_at IS 'Timestamp when user first generated content';
COMMENT ON COLUMN public.user_settings.first_report_generated_at IS 'Timestamp when user first generated a report';
COMMENT ON COLUMN public.user_settings.activated_at IS 'Timestamp when user downloaded their first PDF report (full activation)';
