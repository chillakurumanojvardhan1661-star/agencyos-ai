-- User settings table for onboarding and preferences
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_steps JSONB DEFAULT '{
    "create_agency": false,
    "add_client": false,
    "upload_brand_kit": false,
    "generate_content": false,
    "upload_csv_report": false
  }'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_settings_user ON public.user_settings(user_id);
CREATE INDEX idx_user_settings_onboarding ON public.user_settings(onboarding_completed);

-- RLS Policies
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT 
  USING (user_id = auth.uid());

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can update their own settings
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE 
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON public.user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user settings on first login
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user settings
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_settings();

-- Function to update onboarding step
CREATE OR REPLACE FUNCTION public.update_onboarding_step(
  step_name TEXT,
  completed BOOLEAN DEFAULT TRUE
)
RETURNS void AS $$
DECLARE
  current_steps JSONB;
  all_completed BOOLEAN;
BEGIN
  -- Get current user's settings
  SELECT onboarding_steps INTO current_steps
  FROM public.user_settings
  WHERE user_id = auth.uid();

  -- If no settings exist, create them
  IF current_steps IS NULL THEN
    INSERT INTO public.user_settings (user_id)
    VALUES (auth.uid())
    ON CONFLICT (user_id) DO NOTHING;
    
    current_steps := '{
      "create_agency": false,
      "add_client": false,
      "upload_brand_kit": false,
      "generate_content": false,
      "upload_csv_report": false
    }'::jsonb;
  END IF;

  -- Update the specific step
  current_steps := jsonb_set(current_steps, ARRAY[step_name], to_jsonb(completed));

  -- Check if all steps are completed
  all_completed := (
    (current_steps->>'create_agency')::boolean AND
    (current_steps->>'add_client')::boolean AND
    (current_steps->>'upload_brand_kit')::boolean AND
    (current_steps->>'generate_content')::boolean AND
    (current_steps->>'upload_csv_report')::boolean
  );

  -- Update user settings
  UPDATE public.user_settings
  SET 
    onboarding_steps = current_steps,
    onboarding_completed = all_completed,
    updated_at = NOW()
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get onboarding status
CREATE OR REPLACE FUNCTION public.get_onboarding_status()
RETURNS TABLE (
  completed BOOLEAN,
  steps JSONB,
  progress INTEGER
) AS $$
DECLARE
  settings_record RECORD;
  completed_count INTEGER;
BEGIN
  -- Get user settings
  SELECT 
    onboarding_completed,
    onboarding_steps
  INTO settings_record
  FROM public.user_settings
  WHERE user_id = auth.uid();

  -- If no settings, create default
  IF NOT FOUND THEN
    INSERT INTO public.user_settings (user_id)
    VALUES (auth.uid())
    ON CONFLICT (user_id) DO NOTHING
    RETURNING onboarding_completed, onboarding_steps INTO settings_record;
  END IF;

  -- Count completed steps
  completed_count := 0;
  IF (settings_record.onboarding_steps->>'create_agency')::boolean THEN
    completed_count := completed_count + 1;
  END IF;
  IF (settings_record.onboarding_steps->>'add_client')::boolean THEN
    completed_count := completed_count + 1;
  END IF;
  IF (settings_record.onboarding_steps->>'upload_brand_kit')::boolean THEN
    completed_count := completed_count + 1;
  END IF;
  IF (settings_record.onboarding_steps->>'generate_content')::boolean THEN
    completed_count := completed_count + 1;
  END IF;
  IF (settings_record.onboarding_steps->>'upload_csv_report')::boolean THEN
    completed_count := completed_count + 1;
  END IF;

  -- Return status
  RETURN QUERY SELECT 
    settings_record.onboarding_completed,
    settings_record.onboarding_steps,
    completed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
