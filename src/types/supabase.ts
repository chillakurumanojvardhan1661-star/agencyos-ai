export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ad_performance_uploads: {
        Row: {
          analysis: Json | null
          client_id: string
          created_at: string | null
          data: Json
          file_url: string
          id: string
          platform: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          client_id: string
          created_at?: string | null
          data: Json
          file_url: string
          id?: string
          platform?: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          client_id?: string
          created_at?: string | null
          data?: Json
          file_url?: string
          id?: string
          platform?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_performance_uploads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_performance_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string | null
          granted_by: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agencies: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          primary_color: string | null
          timezone: string | null
          updated_at: string | null
          white_label_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          primary_color?: string | null
          timezone?: string | null
          updated_at?: string | null
          white_label_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          timezone?: string | null
          updated_at?: string | null
          white_label_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          agency_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          logo_url: string | null
          offer: string | null
          primary_color: string | null
          secondary_color: string | null
          target_audience: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          offer?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          target_audience?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          offer?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          target_audience?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contexts: {
        Row: {
          audience_pain_points: string[] | null
          best_performing_platforms: string[] | null
          client_id: string
          created_at: string | null
          failed_angles: string[] | null
          id: string
          optimal_posting_times: string | null
          seasonal_notes: string | null
          updated_at: string | null
          winning_hooks: string[] | null
        }
        Insert: {
          audience_pain_points?: string[] | null
          best_performing_platforms?: string[] | null
          client_id: string
          created_at?: string | null
          failed_angles?: string[] | null
          id?: string
          optimal_posting_times?: string | null
          seasonal_notes?: string | null
          updated_at?: string | null
          winning_hooks?: string[] | null
        }
        Update: {
          audience_pain_points?: string[] | null
          best_performing_platforms?: string[] | null
          client_id?: string
          created_at?: string | null
          failed_angles?: string[] | null
          id?: string
          optimal_posting_times?: string | null
          seasonal_notes?: string | null
          updated_at?: string | null
          winning_hooks?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contexts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          agency_id: string
          created_at: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      content_generations: {
        Row: {
          ad_copies: Json
          client_id: string
          content_calendar: Json
          created_at: string | null
          id: string
          objective: string
          offer: string
          platform: string
          reel_scripts: Json
          tone: string
          user_id: string
        }
        Insert: {
          ad_copies: Json
          client_id: string
          content_calendar: Json
          created_at?: string | null
          id?: string
          objective: string
          offer: string
          platform: string
          reel_scripts: Json
          tone: string
          user_id: string
        }
        Update: {
          ad_copies?: Json
          client_id?: string
          content_calendar?: Json
          created_at?: string | null
          id?: string
          objective?: string
          offer?: string
          platform?: string
          reel_scripts?: Json
          tone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_generations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_benchmarks: {
        Row: {
          avg_cpc: number
          avg_cpm: number
          avg_ctr: number
          avg_roas: number
          id: string
          industry_name: string
          updated_at: string | null
        }
        Insert: {
          avg_cpc: number
          avg_cpm: number
          avg_ctr: number
          avg_roas: number
          id?: string
          industry_name: string
          updated_at?: string | null
        }
        Update: {
          avg_cpc?: number
          avg_cpm?: number
          avg_ctr?: number
          avg_roas?: number
          id?: string
          industry_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          activated_at: string | null
          conversion_status: string | null
          converted_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          referred_agency_id: string | null
          referred_user_id: string | null
          referrer_agency_id: string
          reward_amount: number | null
          reward_status: string | null
          source_id: string | null
          source_type: string
        }
        Insert: {
          activated_at?: string | null
          conversion_status?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          referred_agency_id?: string | null
          referred_user_id?: string | null
          referrer_agency_id: string
          reward_amount?: number | null
          reward_status?: string | null
          source_id?: string | null
          source_type: string
        }
        Update: {
          activated_at?: string | null
          conversion_status?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          referred_agency_id?: string | null
          referred_user_id?: string | null
          referrer_agency_id?: string
          reward_amount?: number | null
          reward_status?: string | null
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_agency_id_fkey"
            columns: ["referred_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_agency_id_fkey"
            columns: ["referrer_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      report_preferences: {
        Row: {
          agency_id: string
          created_at: string | null
          id: string
          include_agency_branding: boolean | null
          paper_size: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          id?: string
          include_agency_branding?: boolean | null
          paper_size?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          id?: string
          include_agency_branding?: boolean | null
          paper_size?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_preferences_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          client_id: string
          created_at: string | null
          data: Json
          id: string
          is_public: boolean | null
          last_viewed_at: string | null
          pdf_url: string | null
          public_views: number | null
          report_type: string
          share_token: string | null
          upload_id: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          data: Json
          id?: string
          is_public?: boolean | null
          last_viewed_at?: string | null
          pdf_url?: string | null
          public_views?: number | null
          report_type: string
          share_token?: string | null
          upload_id?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          data?: Json
          id?: string
          is_public?: boolean | null
          last_viewed_at?: string | null
          pdf_url?: string | null
          public_views?: number | null
          report_type?: string
          share_token?: string | null
          upload_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "ad_performance_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          agency_id: string
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          is_trial: boolean | null
          plan: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_trial?: boolean | null
          plan: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_trial?: boolean | null
          plan?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string
          created_at: string | null
          created_by_agency_id: string | null
          description: string | null
          id: string
          industry: string | null
          is_public: boolean | null
          template_json: Json
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by_agency_id?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          template_json: Json
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by_agency_id?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          template_json?: Json
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_agency_id_fkey"
            columns: ["created_by_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          action_type: string
          agency_id: string
          cost_estimate: number
          created_at: string | null
          id: string
          metadata: Json | null
          tokens_used: number
          user_id: string
        }
        Insert: {
          action_type: string
          agency_id: string
          cost_estimate?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          tokens_used?: number
          user_id: string
        }
        Update: {
          action_type?: string
          agency_id?: string
          cost_estimate?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          tokens_used?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          activated_at: string | null
          created_at: string | null
          first_content_generated_at: string | null
          first_login_at: string | null
          first_report_generated_at: string | null
          id: string
          last_nudge_shown_at: string | null
          nudges_dismissed: Json | null
          onboarding_completed: boolean | null
          onboarding_steps: Json | null
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          first_content_generated_at?: string | null
          first_login_at?: string | null
          first_report_generated_at?: string | null
          id?: string
          last_nudge_shown_at?: string | null
          nudges_dismissed?: Json | null
          onboarding_completed?: boolean | null
          onboarding_steps?: Json | null
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          first_content_generated_at?: string | null
          first_login_at?: string | null
          first_report_generated_at?: string | null
          id?: string
          last_nudge_shown_at?: string | null
          nudges_dismissed?: Json | null
          onboarding_completed?: boolean | null
          onboarding_steps?: Json | null
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_trial_expiration: {
        Args: { p_agency_id: string }
        Returns: {
          current_plan: string
          days_remaining: number
          is_expired: boolean
          trial_ends_at: string
        }[]
      }
      convert_trial_to_paid: {
        Args: {
          p_agency_id: string
          p_plan: string
          p_stripe_subscription_id: string
        }
        Returns: undefined
      }
      disable_report_sharing: {
        Args: { report_id: string }
        Returns: undefined
      }
      dismiss_nudge: { Args: { nudge_type: string }; Returns: undefined }
      enable_report_sharing: { Args: { report_id: string }; Returns: string }
      expire_trials_batch: { Args: never; Returns: number }
      generate_share_token: { Args: never; Returns: string }
      get_activation_metrics: {
        Args: never
        Returns: {
          avg_hours_to_activation: number
          median_hours_to_activation: number
          total_activated: number
        }[]
      }
      get_active_nudges: {
        Args: never
        Returns: {
          cta_link: string
          cta_text: string
          message: string
          nudge_type: string
          priority: number
          title: string
        }[]
      }
      get_conversion_analytics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          metric: string
          percentage: number
          value: number
        }[]
      }
      get_daily_analytics: {
        Args: { p_days?: number }
        Returns: {
          date: string
          referrals: number
          trials_activated: number
          trials_converted: number
          trials_started: number
        }[]
      }
      get_monthly_usage: {
        Args: { p_action_type?: string; p_agency_id: string }
        Returns: {
          action_count: number
          total_cost: number
          total_tokens: number
        }[]
      }
      get_mrr_metrics: {
        Args: never
        Returns: {
          current_mrr: number
          enterprise_count: number
          professional_count: number
          trial_count: number
        }[]
      }
      get_onboarding_analytics: {
        Args: never
        Returns: {
          avg_time_to_activation: unknown
          avg_time_to_first_content: unknown
          avg_time_to_first_report: unknown
          total_users: number
          users_activated: number
          users_generated_content: number
          users_generated_report: number
          users_logged_in: number
        }[]
      }
      get_onboarding_status: {
        Args: never
        Returns: {
          completed: boolean
          progress: number
          steps: Json
        }[]
      }
      get_referral_stats: {
        Args: { agency_id: string }
        Returns: {
          activated: number
          paid: number
          pending_rewards: number
          signed_up: number
          total_referrals: number
        }[]
      }
      get_trial_status: {
        Args: never
        Returns: {
          days_remaining: number
          hours_remaining: number
          is_expired: boolean
          is_trial: boolean
          trial_ends_at: string
        }[]
      }
      get_viral_coefficient: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          total_referrals: number
          total_users: number
          viral_coefficient: number
        }[]
      }
      increment_report_views: { Args: { token: string }; Returns: undefined }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      initialize_trial_subscription: {
        Args: { p_agency_id: string; p_stripe_customer_id: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      reset_nudges: { Args: never; Returns: undefined }
      set_activated: { Args: never; Returns: undefined }
      set_first_content_generated: { Args: never; Returns: undefined }
      set_first_login: { Args: never; Returns: undefined }
      set_first_report_generated: { Args: never; Returns: undefined }
      track_analytics_event: {
        Args: {
          p_agency_id?: string
          p_event_type: string
          p_metadata?: Json
          p_user_id?: string
        }
        Returns: string
      }
      track_referral: {
        Args: { report_token: string; user_id?: string }
        Returns: string
      }
      update_onboarding_step: {
        Args: { completed?: boolean; step_name: string }
        Returns: undefined
      }
      update_referral_status: {
        Args: { new_status: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// ============================================================================
// PRODUCTION SAFETY FLAGS
// ============================================================================
// These flags are used by the build system to ensure type safety in production.
// DO NOT REMOVE OR MODIFY THESE FLAGS.

/**
 * Flag indicating whether real Supabase types have been generated.
 * - true: Real types generated from database schema
 * - false: Placeholder types (blocks production builds)
 */
export const __SUPABASE_TYPES_GENERATED__ = true;

/**
 * Development mode unblock flag.
 * Allows builds with placeholder types in development only.
 * FORCED to false in production environments.
 */
export const __DEV_MODE_UNBLOCK__ = 
  process.env.NODE_ENV !== 'production' && 
  process.env.VERCEL_ENV !== 'production';
