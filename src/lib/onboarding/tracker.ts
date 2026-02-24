import { createClient } from '@/lib/supabase/server';

export async function markOnboardingStep(step: string): Promise<void> {
  try {
    const supabase = createClient();
    
    // TODO: Remove type assertion after generating real Supabase types
    await (supabase as any).rpc('update_onboarding_step', {
      step_name: step,
      completed: true,
    });
  } catch (error) {
    // Silently fail - onboarding tracking shouldn't break core functionality
    console.error('Failed to mark onboarding step:', error);
  }
}

export async function setFirstLogin(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('set_first_login');
  } catch (error) {
    console.error('Failed to set first login:', error);
  }
}

export async function setFirstContentGenerated(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('set_first_content_generated');
  } catch (error) {
    console.error('Failed to set first content generated:', error);
  }
}

export async function setFirstReportGenerated(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('set_first_report_generated');
  } catch (error) {
    console.error('Failed to set first report generated:', error);
  }
}

export async function setActivated(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('set_activated');
  } catch (error) {
    console.error('Failed to set activated:', error);
  }
}

export const ONBOARDING_STEPS = {
  CREATE_AGENCY: 'create_agency',
  ADD_CLIENT: 'add_client',
  UPLOAD_BRAND_KIT: 'upload_brand_kit',
  GENERATE_CONTENT: 'generate_content',
  UPLOAD_CSV_REPORT: 'upload_csv_report',
} as const;
