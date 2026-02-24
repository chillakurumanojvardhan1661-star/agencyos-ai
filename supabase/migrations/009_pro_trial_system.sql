-- Add trial columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN trial_ends_at TIMESTAMPTZ,
ADD COLUMN trial_started_at TIMESTAMPTZ,
ADD COLUMN is_trial BOOLEAN DEFAULT FALSE;

-- Update plan enum to include trial_pro
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_check 
CHECK (plan IN ('starter', 'professional', 'enterprise', 'trial_pro'));

-- Create index for trial expiration checks
CREATE INDEX idx_subscriptions_trial_ends ON public.subscriptions(trial_ends_at) WHERE is_trial = TRUE;

-- Function to initialize trial subscription on signup
CREATE OR REPLACE FUNCTION public.initialize_trial_subscription(
  p_agency_id UUID,
  p_stripe_customer_id TEXT
)
RETURNS UUID AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Create trial_pro subscription
  INSERT INTO public.subscriptions (
    agency_id,
    stripe_customer_id,
    plan,
    status,
    is_trial,
    trial_started_at,
    trial_ends_at,
    cancel_at_period_end
  ) VALUES (
    p_agency_id,
    p_stripe_customer_id,
    'trial_pro',
    'trialing',
    TRUE,
    NOW(),
    NOW() + INTERVAL '7 days',
    FALSE
  )
  RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and expire trials
CREATE OR REPLACE FUNCTION public.check_trial_expiration(p_agency_id UUID)
RETURNS TABLE (
  is_expired BOOLEAN,
  days_remaining INTEGER,
  trial_ends_at TIMESTAMPTZ,
  current_plan TEXT
) AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Get active subscription
  SELECT 
    s.plan,
    s.status,
    s.is_trial,
    s.trial_ends_at,
    s.id
  INTO subscription_record
  FROM public.subscriptions s
  WHERE s.agency_id = p_agency_id
    AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, return default
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, NULL::TIMESTAMPTZ, 'starter'::TEXT;
    RETURN;
  END IF;
  
  -- If not a trial, return current state
  IF NOT subscription_record.is_trial THEN
    RETURN QUERY SELECT 
      FALSE,
      0,
      NULL::TIMESTAMPTZ,
      subscription_record.plan::TEXT;
    RETURN;
  END IF;
  
  -- Check if trial expired
  IF NOW() > subscription_record.trial_ends_at THEN
    -- Auto-downgrade to starter
    UPDATE public.subscriptions
    SET 
      plan = 'starter',
      status = 'active',
      is_trial = FALSE,
      updated_at = NOW()
    WHERE id = subscription_record.id;
    
    -- Track trial expiration event
    PERFORM public.track_analytics_event(
      'trial_expired',
      p_agency_id,
      NULL,
      jsonb_build_object('auto_downgraded', true)
    );
    
    RETURN QUERY SELECT 
      TRUE,
      0,
      subscription_record.trial_ends_at,
      'starter'::TEXT;
  ELSE
    -- Trial still active
    RETURN QUERY SELECT 
      FALSE,
      EXTRACT(DAY FROM subscription_record.trial_ends_at - NOW())::INTEGER,
      subscription_record.trial_ends_at,
      subscription_record.plan::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trial status for dashboard
CREATE OR REPLACE FUNCTION public.get_trial_status()
RETURNS TABLE (
  is_trial BOOLEAN,
  days_remaining INTEGER,
  hours_remaining INTEGER,
  trial_ends_at TIMESTAMPTZ,
  is_expired BOOLEAN
) AS $$
DECLARE
  user_agency_id UUID;
  subscription_record RECORD;
  time_remaining INTERVAL;
BEGIN
  -- Get user's agency
  SELECT id INTO user_agency_id
  FROM public.agencies
  WHERE owner_id = auth.uid()
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0, NULL::TIMESTAMPTZ, FALSE;
    RETURN;
  END IF;
  
  -- Get subscription
  SELECT 
    s.is_trial,
    s.trial_ends_at,
    s.plan
  INTO subscription_record
  FROM public.subscriptions s
  WHERE s.agency_id = user_agency_id
    AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND OR NOT subscription_record.is_trial THEN
    RETURN QUERY SELECT FALSE, 0, 0, NULL::TIMESTAMPTZ, FALSE;
    RETURN;
  END IF;
  
  -- Calculate time remaining
  time_remaining := subscription_record.trial_ends_at - NOW();
  
  IF time_remaining < INTERVAL '0' THEN
    -- Expired
    RETURN QUERY SELECT 
      TRUE,
      0,
      0,
      subscription_record.trial_ends_at,
      TRUE;
  ELSE
    -- Active trial
    RETURN QUERY SELECT 
      TRUE,
      EXTRACT(DAY FROM time_remaining)::INTEGER,
      EXTRACT(HOUR FROM time_remaining)::INTEGER,
      subscription_record.trial_ends_at,
      FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert trial to paid subscription
CREATE OR REPLACE FUNCTION public.convert_trial_to_paid(
  p_agency_id UUID,
  p_plan TEXT,
  p_stripe_subscription_id TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    plan = p_plan,
    status = 'active',
    is_trial = FALSE,
    stripe_subscription_id = p_stripe_subscription_id,
    trial_ends_at = NULL,
    updated_at = NOW()
  WHERE agency_id = p_agency_id
    AND is_trial = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Scheduled job to expire trials (run daily)
-- Note: This would be set up as a cron job or scheduled function
CREATE OR REPLACE FUNCTION public.expire_trials_batch()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update all expired trials to starter
  WITH expired AS (
    UPDATE public.subscriptions
    SET 
      plan = 'starter',
      status = 'active',
      is_trial = FALSE,
      updated_at = NOW()
    WHERE is_trial = TRUE
      AND trial_ends_at < NOW()
      AND status = 'trialing'
    RETURNING id
  )
  SELECT COUNT(*) INTO expired_count FROM expired;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON COLUMN public.subscriptions.trial_ends_at IS '7-day trial expiration timestamp';
COMMENT ON COLUMN public.subscriptions.trial_started_at IS 'When trial was initiated';
COMMENT ON COLUMN public.subscriptions.is_trial IS 'Whether this is a trial subscription';
COMMENT ON FUNCTION public.initialize_trial_subscription IS 'Creates trial_pro subscription for new signups';
COMMENT ON FUNCTION public.check_trial_expiration IS 'Checks if trial expired and auto-downgrades';
COMMENT ON FUNCTION public.get_trial_status IS 'Returns trial status for current user';
