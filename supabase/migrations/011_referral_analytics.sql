-- Update referral functions to track analytics events

-- Drop and recreate update_referral_status with analytics tracking
DROP FUNCTION IF EXISTS public.update_referral_status(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.update_referral_status(
  user_id UUID,
  new_status TEXT
)
RETURNS void AS $$
DECLARE
  referral_record RECORD;
  user_agency_id UUID;
BEGIN
  -- Get referral info
  SELECT 
    id,
    referrer_agency_id,
    conversion_status
  INTO referral_record
  FROM public.referrals
  WHERE referred_user_id = user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Update referral status
  UPDATE public.referrals
  SET 
    conversion_status = new_status,
    converted_at = CASE WHEN new_status = 'signed_up' THEN NOW() ELSE converted_at END,
    activated_at = CASE WHEN new_status = 'activated' THEN NOW() ELSE activated_at END,
    paid_at = CASE WHEN new_status = 'paid' THEN NOW() ELSE paid_at END
  WHERE referred_user_id = user_id;
  
  -- Track analytics event if converted to paid
  IF new_status = 'paid' AND referral_record.conversion_status != 'paid' THEN
    -- Get user's agency
    SELECT id INTO user_agency_id
    FROM public.agencies
    WHERE owner_id = user_id
    LIMIT 1;
    
    IF user_agency_id IS NOT NULL THEN
      PERFORM public.track_analytics_event(
        'referral_converted',
        user_agency_id,
        user_id,
        jsonb_build_object('referrer_agency_id', referral_record.referrer_agency_id)
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_referral_status IS 'Update referral status and track analytics events';
