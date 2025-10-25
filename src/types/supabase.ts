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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_delete_tokens: {
        Row: {
          token: string
          user_id: string
        }
        Insert: {
          token?: string
          user_id: string
        }
        Update: {
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_delete_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_delete_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          added_by: string
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string | null
          deputy_id: string
          deputy_status: Database["public"]["Enums"]["deputy_status"]
          id: string
          rejection_reason: string | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          added_by: string
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          content: string
          created_at?: string | null
          deputy_id: string
          deputy_status: Database["public"]["Enums"]["deputy_status"]
          id?: string
          rejection_reason?: string | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          added_by?: string
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string | null
          deputy_id?: string
          deputy_status?: Database["public"]["Enums"]["deputy_status"]
          id?: string
          rejection_reason?: string | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "achievements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: boolean
          settings: Json
          updated_at: string
        }
        Insert: {
          id?: boolean
          settings?: Json
          updated_at?: string
        }
        Update: {
          id?: boolean
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          billing_email: string
          default_currency: string | null
          gateway_customer_id: string
          gateway_name: string
          metadata: Json | null
          workspace_id: string
        }
        Insert: {
          billing_email: string
          default_currency?: string | null
          gateway_customer_id: string
          gateway_name: string
          metadata?: Json | null
          workspace_id: string
        }
        Update: {
          billing_email?: string
          default_currency?: string | null
          gateway_customer_id?: string
          gateway_name?: string
          metadata?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount: number
          currency: string
          due_date: string | null
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id: string | null
          gateway_product_id: string | null
          hosted_invoice_url: string | null
          paid_date: string | null
          status: string
        }
        Insert: {
          amount: number
          currency: string
          due_date?: string | null
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id?: string | null
          gateway_product_id?: string | null
          hosted_invoice_url?: string | null
          paid_date?: string | null
          status: string
        }
        Update: {
          amount?: number
          currency?: string
          due_date?: string | null
          gateway_customer_id?: string
          gateway_invoice_id?: string
          gateway_name?: string
          gateway_price_id?: string | null
          gateway_product_id?: string | null
          hosted_invoice_url?: string | null
          paid_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
          {
            foreignKeyName: "billing_invoices_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
          {
            foreignKeyName: "billing_invoices_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_one_time_payments: {
        Row: {
          amount: number
          charge_date: string
          currency: string
          gateway_charge_id: string
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          status: string
        }
        Insert: {
          amount: number
          charge_date: string
          currency: string
          gateway_charge_id: string
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          status: string
        }
        Update: {
          amount?: number
          charge_date?: string
          currency?: string
          gateway_charge_id?: string
          gateway_customer_id?: string
          gateway_invoice_id?: string
          gateway_name?: string
          gateway_price_id?: string
          gateway_product_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_one_time_payments_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
          {
            foreignKeyName: "billing_one_time_payments_gateway_invoice_id_fkey"
            columns: ["gateway_invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["gateway_invoice_id"]
          },
          {
            foreignKeyName: "billing_one_time_payments_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
          {
            foreignKeyName: "billing_one_time_payments_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_payment_methods: {
        Row: {
          gateway_customer_id: string
          id: string
          is_default: boolean
          payment_method_details: Json
          payment_method_id: string
          payment_method_type: string
        }
        Insert: {
          gateway_customer_id: string
          id?: string
          is_default?: boolean
          payment_method_details: Json
          payment_method_id: string
          payment_method_type: string
        }
        Update: {
          gateway_customer_id?: string
          id?: string
          is_default?: boolean
          payment_method_details?: Json
          payment_method_id?: string
          payment_method_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payment_methods_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
        ]
      }
      billing_prices: {
        Row: {
          active: boolean
          amount: number
          currency: string
          free_trial_days: number | null
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          recurring_interval: string
          recurring_interval_count: number
          tier: string | null
        }
        Insert: {
          active?: boolean
          amount: number
          currency: string
          free_trial_days?: number | null
          gateway_name: string
          gateway_price_id?: string
          gateway_product_id: string
          recurring_interval: string
          recurring_interval_count?: number
          tier?: string | null
        }
        Update: {
          active?: boolean
          amount?: number
          currency?: string
          free_trial_days?: number | null
          gateway_name?: string
          gateway_price_id?: string
          gateway_product_id?: string
          recurring_interval?: string
          recurring_interval_count?: number
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_prices_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_products: {
        Row: {
          active: boolean
          description: string | null
          features: Json | null
          gateway_name: string
          gateway_product_id: string
          is_visible_in_ui: boolean
          name: string
        }
        Insert: {
          active?: boolean
          description?: string | null
          features?: Json | null
          gateway_name: string
          gateway_product_id: string
          is_visible_in_ui?: boolean
          name: string
        }
        Update: {
          active?: boolean
          description?: string | null
          features?: Json | null
          gateway_name?: string
          gateway_product_id?: string
          is_visible_in_ui?: boolean
          name?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          currency: string
          current_period_end: string
          current_period_start: string
          gateway_customer_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          gateway_subscription_id: string
          id: string
          is_trial: boolean
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
        }
        Insert: {
          cancel_at_period_end: boolean
          currency: string
          current_period_end: string
          current_period_start: string
          gateway_customer_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          gateway_subscription_id: string
          id?: string
          is_trial: boolean
          quantity?: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          currency?: string
          current_period_end?: string
          current_period_start?: string
          gateway_customer_id?: string
          gateway_name?: string
          gateway_price_id?: string
          gateway_product_id?: string
          gateway_subscription_id?: string
          id?: string
          is_trial?: boolean
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
          {
            foreignKeyName: "billing_subscriptions_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
          {
            foreignKeyName: "billing_subscriptions_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_usage_logs: {
        Row: {
          feature: string
          gateway_customer_id: string
          id: string
          timestamp: string
          usage_amount: number
        }
        Insert: {
          feature: string
          gateway_customer_id: string
          id?: string
          timestamp?: string
          usage_amount: number
        }
        Update: {
          feature?: string
          gateway_customer_id?: string
          id?: string
          timestamp?: string
          usage_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_usage_logs_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
        ]
      }
      billing_volume_tiers: {
        Row: {
          gateway_price_id: string
          id: string
          max_quantity: number | null
          min_quantity: number
          unit_price: number
        }
        Insert: {
          gateway_price_id: string
          id?: string
          max_quantity?: number | null
          min_quantity: number
          unit_price: number
        }
        Update: {
          gateway_price_id?: string
          id?: string
          max_quantity?: number | null
          min_quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_volume_tiers_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
        ]
      }
      breaking_news: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          payload?: Json | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["complaint_action_type"]
          complaint_id: string
          content: string | null
          created_at: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          action_type?: Database["public"]["Enums"]["complaint_action_type"]
          complaint_id: string
          content?: string | null
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["complaint_action_type"]
          complaint_id?: string
          content?: string | null
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_actions_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_comments: {
        Row: {
          attachments: Json | null
          complaint_id: string
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          is_internal: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          complaint_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          complaint_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      complaint_history: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_value: string | null
          notes: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          address: string | null
          admin_approved_public: boolean | null
          archived_at: string | null
          assigned_at: string | null
          assigned_deputy_id: string | null
          category: Database["public"]["Enums"]["complaint_category"]
          citizen_email: string | null
          citizen_id: string
          citizen_phone: string | null
          created_at: string
          description: string
          district: string | null
          governorate: string | null
          id: string
          is_archived: boolean | null
          is_public: boolean
          location_lat: number | null
          location_lng: number | null
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_approved_public?: boolean | null
          archived_at?: string | null
          assigned_at?: string | null
          assigned_deputy_id?: string | null
          category: Database["public"]["Enums"]["complaint_category"]
          citizen_email?: string | null
          citizen_id: string
          citizen_phone?: string | null
          created_at?: string
          description: string
          district?: string | null
          governorate?: string | null
          id?: string
          is_archived?: boolean | null
          is_public?: boolean
          location_lat?: number | null
          location_lng?: number | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_approved_public?: boolean | null
          archived_at?: string | null
          assigned_at?: string | null
          assigned_deputy_id?: string | null
          category?: Database["public"]["Enums"]["complaint_category"]
          citizen_email?: string | null
          citizen_id?: string
          citizen_phone?: string | null
          created_at?: string
          description?: string
          district?: string | null
          governorate?: string | null
          id?: string
          is_archived?: boolean | null
          is_public?: boolean
          location_lat?: number | null
          location_lng?: number | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "complaints_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          message_type: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          message_type?: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          message_type?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      councils: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      deputy_achievements: {
        Row: {
          created_at: string | null
          deputy_id: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deputy_id: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deputy_id?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deputy_achievements_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deputy_achievements_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
        ]
      }
      deputy_electoral_programs: {
        Row: {
          created_at: string | null
          deputy_id: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deputy_id: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deputy_id?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deputy_electoral_programs_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deputy_electoral_programs_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
        ]
      }
      deputy_events: {
        Row: {
          created_at: string | null
          deputy_id: string
          description: string | null
          display_order: number | null
          event_date: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deputy_id: string
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deputy_id?: string
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deputy_events_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deputy_events_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
        ]
      }
      deputy_profiles: {
        Row: {
          achievements: string | null
          banner_image: string | null
          bio: string | null
          candidate_type: string | null
          council_id: string | null
          council_type: Database["public"]["Enums"]["council_type"]
          created_at: string | null
          deputy_status: Database["public"]["Enums"]["deputy_status"]
          electoral_district_id: string | null
          electoral_number: string | null
          electoral_program: string | null
          electoral_symbol: string | null
          events: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          governorate: string
          id: string
          initial_rating_average: number | null
          initial_rating_avg: number | null
          initial_rating_count: number | null
          is_current_member: boolean | null
          office_address: string | null
          office_hours: string | null
          office_phone: string | null
          party_id: string | null
          points: number
          rating_average: number | null
          rating_count: number | null
          slug: string | null
          social_media_facebook: string | null
          social_media_instagram: string | null
          social_media_twitter: string | null
          social_media_youtube: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          achievements?: string | null
          banner_image?: string | null
          bio?: string | null
          candidate_type?: string | null
          council_id?: string | null
          council_type?: Database["public"]["Enums"]["council_type"]
          created_at?: string | null
          deputy_status: Database["public"]["Enums"]["deputy_status"]
          electoral_district_id?: string | null
          electoral_number?: string | null
          electoral_program?: string | null
          electoral_symbol?: string | null
          events?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          governorate?: string
          id?: string
          initial_rating_average?: number | null
          initial_rating_avg?: number | null
          initial_rating_count?: number | null
          is_current_member?: boolean | null
          office_address?: string | null
          office_hours?: string | null
          office_phone?: string | null
          party_id?: string | null
          points?: number
          rating_average?: number | null
          rating_count?: number | null
          slug?: string | null
          social_media_facebook?: string | null
          social_media_instagram?: string | null
          social_media_twitter?: string | null
          social_media_youtube?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          achievements?: string | null
          banner_image?: string | null
          bio?: string | null
          candidate_type?: string | null
          council_id?: string | null
          council_type?: Database["public"]["Enums"]["council_type"]
          created_at?: string | null
          deputy_status?: Database["public"]["Enums"]["deputy_status"]
          electoral_district_id?: string | null
          electoral_number?: string | null
          electoral_program?: string | null
          electoral_symbol?: string | null
          events?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          governorate?: string
          id?: string
          initial_rating_average?: number | null
          initial_rating_avg?: number | null
          initial_rating_count?: number | null
          is_current_member?: boolean | null
          office_address?: string | null
          office_hours?: string | null
          office_phone?: string | null
          party_id?: string | null
          points?: number
          rating_average?: number | null
          rating_count?: number | null
          slug?: string | null
          social_media_facebook?: string | null
          social_media_instagram?: string | null
          social_media_twitter?: string | null
          social_media_youtube?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deputy_profiles_electoral_district_id_fkey"
            columns: ["electoral_district_id"]
            isOneToOne: false
            referencedRelation: "electoral_districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deputy_profiles_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_deputy_council"
            columns: ["council_id"]
            isOneToOne: false
            referencedRelation: "councils"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_deputy_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_deputy_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      deputy_ratings: {
        Row: {
          created_at: string | null
          deputy_id: string
          id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deputy_id: string
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deputy_id?: string
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deputy_ratings_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deputy_ratings_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "deputy_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deputy_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      deputy_scores: {
        Row: {
          average_resolution_hours: number | null
          complaints_accepted: number
          complaints_assigned: number
          complaints_in_progress: number
          complaints_on_hold: number
          complaints_rejected: number
          complaints_resolved: number
          created_at: string
          deputy_id: string
          id: string
          last_activity_at: string | null
          rank: number | null
          total_points: number
          updated_at: string
        }
        Insert: {
          average_resolution_hours?: number | null
          complaints_accepted?: number
          complaints_assigned?: number
          complaints_in_progress?: number
          complaints_on_hold?: number
          complaints_rejected?: number
          complaints_resolved?: number
          created_at?: string
          deputy_id: string
          id?: string
          last_activity_at?: string | null
          rank?: number | null
          total_points?: number
          updated_at?: string
        }
        Update: {
          average_resolution_hours?: number | null
          complaints_accepted?: number
          complaints_assigned?: number
          complaints_in_progress?: number
          complaints_on_hold?: number
          complaints_rejected?: number
          complaints_resolved?: number
          created_at?: string
          deputy_id?: string
          id?: string
          last_activity_at?: string | null
          rank?: number | null
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          complaint_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          workspace_id: string
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          workspace_id: string
        }
        Update: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      electoral_districts: {
        Row: {
          created_at: string | null
          district_type: string
          governorate_id: string
          id: string
          name: string
          name_en: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district_type: string
          governorate_id: string
          id?: string
          name: string
          name_en?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district_type?: string
          governorate_id?: string
          id?: string
          name?: string
          name_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "electoral_districts_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      electoral_programs: {
        Row: {
          added_by: string
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string | null
          deputy_id: string
          id: string
          rejection_reason: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          added_by: string
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          content: string
          created_at?: string | null
          deputy_id: string
          id?: string
          rejection_reason?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          added_by?: string
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string | null
          deputy_id?: string
          id?: string
          rejection_reason?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "electoral_programs_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "electoral_programs_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "electoral_programs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          added_by: string
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          deputy_id: string
          description: string
          event_date: string
          id: string
          image_url: string
          location: string | null
          rejection_reason: string | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          added_by: string
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          deputy_id: string
          description: string
          event_date: string
          id?: string
          image_url: string
          location?: string | null
          rejection_reason?: string | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          added_by?: string
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          deputy_id?: string
          description?: string
          event_date?: string
          id?: string
          image_url?: string
          location?: string | null
          rejection_reason?: string | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      governorates: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name_ar: string
          name_en: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name_ar: string
          name_en?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string | null
        }
        Relationships: []
      }
      manager_permissions: {
        Row: {
          can_manage_content: boolean | null
          can_manage_deputies: boolean | null
          can_manage_settings: boolean | null
          can_manage_users: boolean | null
          can_view_reports: boolean | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_manage_content?: boolean | null
          can_manage_deputies?: boolean | null
          can_manage_settings?: boolean | null
          can_manage_users?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_manage_content?: boolean | null
          can_manage_deputies?: boolean | null
          can_manage_settings?: boolean | null
          can_manage_users?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_author_profiles: {
        Row: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          facebook_handle: string | null
          id: string
          instagram_handle: string | null
          linkedin_handle: string | null
          slug: string
          twitter_handle: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url: string
          bio: string
          created_at?: string
          display_name: string
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          linkedin_handle?: string | null
          slug: string
          twitter_handle?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string
          bio?: string
          created_at?: string
          display_name?: string
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          linkedin_handle?: string | null
          slug?: string
          twitter_handle?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      marketing_blog_author_posts: {
        Row: {
          author_id: string
          post_id: string
        }
        Insert: {
          author_id: string
          post_id: string
        }
        Update: {
          author_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_blog_author_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "marketing_author_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_blog_author_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "marketing_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_blog_post_tags_relationship: {
        Row: {
          blog_post_id: string
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_blog_post_tags_relationship_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "marketing_blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_blog_post_tags_relationship_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "marketing_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_blog_posts: {
        Row: {
          content: string
          cover_image: string | null
          created_at: string
          id: string
          is_featured: boolean
          json_content: Json
          seo_data: Json | null
          slug: string
          status: Database["public"]["Enums"]["marketing_blog_post_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          json_content?: Json
          seo_data?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["marketing_blog_post_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          json_content?: Json
          seo_data?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["marketing_blog_post_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_changelog: {
        Row: {
          cover_image: string | null
          created_at: string | null
          id: string
          json_content: Json
          status: Database["public"]["Enums"]["marketing_changelog_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          id?: string
          json_content?: Json
          status?: Database["public"]["Enums"]["marketing_changelog_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          id?: string
          json_content?: Json
          status?: Database["public"]["Enums"]["marketing_changelog_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_changelog_author_relationship: {
        Row: {
          author_id: string
          changelog_id: string
        }
        Insert: {
          author_id: string
          changelog_id: string
        }
        Update: {
          author_id?: string
          changelog_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_changelog_author_relationship_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "marketing_author_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_changelog_author_relationship_changelog_id_fkey"
            columns: ["changelog_id"]
            isOneToOne: false
            referencedRelation: "marketing_changelog"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_board_subscriptions: {
        Row: {
          board_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_board_subscriptions_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_board_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_board_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_boards: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          settings: Json
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          settings?: Json
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          settings?: Json
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          moderator_hold_category:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "complaints_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "messages_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_thread_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_thread_reactions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "complaints_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_reactions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_reactions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "messages_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_thread_subscriptions: {
        Row: {
          created_at: string
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_thread_subscriptions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "complaints_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_subscriptions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_subscriptions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "messages_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_threads: {
        Row: {
          accepted_at: string | null
          added_to_roadmap: boolean
          assigned_at: string | null
          assigned_by: string | null
          assigned_by_admin_id: string | null
          assigned_deputy_id: string | null
          attachments: Json | null
          board_id: string | null
          content: string
          created_at: string
          hold_count: number | null
          hold_until: string | null
          id: string
          is_publicly_visible: boolean
          message_type: string | null
          moderator_hold_category:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion: boolean
          points_awarded: number | null
          preferred_deputy_id: string | null
          priority: Database["public"]["Enums"]["marketing_feedback_thread_priority"]
          reassignment_count: number | null
          reassignment_reason: string | null
          rejection_reason: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["marketing_feedback_thread_status"]
          title: string
          type: Database["public"]["Enums"]["marketing_feedback_thread_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          added_to_roadmap?: boolean
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_by_admin_id?: string | null
          assigned_deputy_id?: string | null
          attachments?: Json | null
          board_id?: string | null
          content: string
          created_at?: string
          hold_count?: number | null
          hold_until?: string | null
          id?: string
          is_publicly_visible?: boolean
          message_type?: string | null
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion?: boolean
          points_awarded?: number | null
          preferred_deputy_id?: string | null
          priority?: Database["public"]["Enums"]["marketing_feedback_thread_priority"]
          reassignment_count?: number | null
          reassignment_reason?: string | null
          rejection_reason?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["marketing_feedback_thread_status"]
          title: string
          type?: Database["public"]["Enums"]["marketing_feedback_thread_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          added_to_roadmap?: boolean
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_by_admin_id?: string | null
          assigned_deputy_id?: string | null
          attachments?: Json | null
          board_id?: string | null
          content?: string
          created_at?: string
          hold_count?: number | null
          hold_until?: string | null
          id?: string
          is_publicly_visible?: boolean
          message_type?: string | null
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion?: boolean
          points_awarded?: number | null
          preferred_deputy_id?: string | null
          priority?: Database["public"]["Enums"]["marketing_feedback_thread_priority"]
          reassignment_count?: number | null
          reassignment_reason?: string | null
          rejection_reason?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["marketing_feedback_thread_status"]
          title?: string
          type?: Database["public"]["Enums"]["marketing_feedback_thread_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_threads_assigned_by_admin_id_fkey"
            columns: ["assigned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_by_admin_id_fkey"
            columns: ["assigned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_preferred_deputy_id_fkey"
            columns: ["preferred_deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_preferred_deputy_id_fkey"
            columns: ["preferred_deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_tags: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      news_ticker: {
        Row: {
          added_by: string
          content: string
          created_at: string | null
          display_order: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          added_by: string
          content: string
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          added_by?: string
          content?: string
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_ticker_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          abbreviation: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name_ar: string
          name_en: string | null
          website_url: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_ar: string
          name_en?: string | null
          website_url?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_ar?: string
          name_en?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          created_at: string | null
          id: string
          in_reply_to: string | null
          project_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          in_reply_to?: string | null
          project_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          in_reply_to?: string | null
          project_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_in_reply_to_fkey"
            columns: ["in_reply_to"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          project_status: Database["public"]["Enums"]["project_status"]
          slug: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_status?: Database["public"]["Enums"]["project_status"]
          slug?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_status?: Database["public"]["Enums"]["project_status"]
          slug?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          citizen_id: string
          comment: string | null
          created_at: string | null
          deputy_id: string
          id: string
          rating: number
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          citizen_id: string
          comment?: string | null
          created_at?: string | null
          deputy_id: string
          id?: string
          rating: number
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          citizen_id?: string
          comment?: string | null
          created_at?: string | null
          deputy_id?: string
          id?: string
          rating?: number
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_deputy_id_fkey"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "ratings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          is_revoked: boolean
          key_id: string
          masked_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          is_revoked?: boolean
          key_id: string
          masked_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          is_revoked?: boolean
          key_id?: string
          masked_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_application_settings: {
        Row: {
          email_readonly: string
          id: string
        }
        Insert: {
          email_readonly: string
          id: string
        }
        Update: {
          email_readonly?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_application_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_application_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          is_seen: boolean
          payload: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_seen?: boolean
          payload?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_seen?: boolean
          payload?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          district: string | null
          electoral_district: string | null
          email: string | null
          english_name: string | null
          full_name: string | null
          gender: string | null
          governorate_id: string | null
          id: string
          job_title: string | null
          party_id: string | null
          phone: string | null
          role: string
          village: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          electoral_district?: string | null
          email?: string | null
          english_name?: string | null
          full_name?: string | null
          gender?: string | null
          governorate_id?: string | null
          id: string
          job_title?: string | null
          party_id?: string | null
          phone?: string | null
          role?: string
          village?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          electoral_district?: string | null
          email?: string | null
          english_name?: string | null
          full_name?: string | null
          gender?: string | null
          governorate_id?: string | null
          id?: string
          job_title?: string | null
          party_id?: string | null
          phone?: string | null
          role?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          default_workspace: string | null
          id: string
        }
        Insert: {
          default_workspace?: string | null
          id: string
        }
        Update: {
          default_workspace?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_default_workspace_fkey"
            columns: ["default_workspace"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_admin_settings: {
        Row: {
          workspace_id: string
          workspace_settings: Json
        }
        Insert: {
          workspace_id: string
          workspace_settings?: Json
        }
        Update: {
          workspace_id?: string
          workspace_settings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workspace_admin_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_application_settings: {
        Row: {
          membership_type: Database["public"]["Enums"]["workspace_membership_type"]
          workspace_id: string
        }
        Insert: {
          membership_type?: Database["public"]["Enums"]["workspace_membership_type"]
          workspace_id: string
        }
        Update: {
          membership_type?: Database["public"]["Enums"]["workspace_membership_type"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_application_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_credits: {
        Row: {
          credits: number
          id: string
          last_reset_date: string | null
          workspace_id: string
        }
        Insert: {
          credits?: number
          id?: string
          last_reset_date?: string | null
          workspace_id: string
        }
        Update: {
          credits?: number
          id?: string
          last_reset_date?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_credits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_credits_logs: {
        Row: {
          change_type: string
          changed_at: string
          id: string
          new_credits: number | null
          old_credits: number | null
          workspace_credits_id: string
          workspace_id: string
        }
        Insert: {
          change_type: string
          changed_at?: string
          id?: string
          new_credits?: number | null
          old_credits?: number | null
          workspace_credits_id: string
          workspace_id: string
        }
        Update: {
          change_type?: string
          changed_at?: string
          id?: string
          new_credits?: number | null
          old_credits?: number | null
          workspace_credits_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_credits_logs_workspace_credits_id_fkey"
            columns: ["workspace_credits_id"]
            isOneToOne: false
            referencedRelation: "workspace_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_credits_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          created_at: string
          id: string
          invitee_user_email: string
          invitee_user_id: string | null
          invitee_user_role: Database["public"]["Enums"]["workspace_member_role_type"]
          inviter_user_id: string
          status: Database["public"]["Enums"]["workspace_invitation_link_status"]
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_user_email: string
          invitee_user_id?: string | null
          invitee_user_role?: Database["public"]["Enums"]["workspace_member_role_type"]
          inviter_user_id: string
          status?: Database["public"]["Enums"]["workspace_invitation_link_status"]
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_user_email?: string
          invitee_user_id?: string | null
          invitee_user_role?: Database["public"]["Enums"]["workspace_member_role_type"]
          inviter_user_id?: string
          status?: Database["public"]["Enums"]["workspace_invitation_link_status"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          added_at: string
          id: string
          permissions: Json
          workspace_id: string
          workspace_member_id: string
          workspace_member_role: Database["public"]["Enums"]["workspace_member_role_type"]
        }
        Insert: {
          added_at?: string
          id?: string
          permissions?: Json
          workspace_id: string
          workspace_member_id: string
          workspace_member_role: Database["public"]["Enums"]["workspace_member_role_type"]
        }
        Update: {
          added_at?: string
          id?: string
          permissions?: Json
          workspace_id?: string
          workspace_member_id?: string
          workspace_member_role?: Database["public"]["Enums"]["workspace_member_role_type"]
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_member_id_fkey"
            columns: ["workspace_member_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_member_id_fkey"
            columns: ["workspace_member_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          workspace_id: string
          workspace_settings: Json
        }
        Insert: {
          workspace_id: string
          workspace_settings?: Json
        }
        Update: {
          workspace_id?: string
          workspace_settings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workspace_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      complaints_with_users: {
        Row: {
          accepted_at: string | null
          added_to_roadmap: boolean | null
          admin_name: string | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_by_admin_id: string | null
          assigned_deputy_id: string | null
          attachments: Json | null
          board_id: string | null
          content: string | null
          created_at: string | null
          deputy_name: string | null
          hold_count: number | null
          hold_until: string | null
          id: string | null
          is_publicly_visible: boolean | null
          message_type: string | null
          moderator_hold_category:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion: boolean | null
          points_awarded: number | null
          preferred_deputy_id: string | null
          priority:
            | Database["public"]["Enums"]["marketing_feedback_thread_priority"]
            | null
          reassignment_count: number | null
          reassignment_reason: string | null
          rejection_reason: string | null
          resolved_at: string | null
          sender_email: string | null
          sender_name: string | null
          status:
            | Database["public"]["Enums"]["marketing_feedback_thread_status"]
            | null
          title: string | null
          type:
            | Database["public"]["Enums"]["marketing_feedback_thread_type"]
            | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_threads_assigned_by_admin_id_fkey"
            columns: ["assigned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_by_admin_id_fkey"
            columns: ["assigned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_preferred_deputy_id_fkey"
            columns: ["preferred_deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_preferred_deputy_id_fkey"
            columns: ["preferred_deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_with_users: {
        Row: {
          accepted_at: string | null
          added_to_roadmap: boolean | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_by_admin_id: string | null
          assigned_deputy_id: string | null
          attachments: Json | null
          board_id: string | null
          content: string | null
          created_at: string | null
          deputy_name: string | null
          hold_count: number | null
          hold_until: string | null
          id: string | null
          is_publicly_visible: boolean | null
          message_type: string | null
          moderator_hold_category:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion: boolean | null
          points_awarded: number | null
          preferred_deputy_id: string | null
          priority:
            | Database["public"]["Enums"]["marketing_feedback_thread_priority"]
            | null
          reassignment_count: number | null
          reassignment_reason: string | null
          rejection_reason: string | null
          resolved_at: string | null
          sender_email: string | null
          sender_name: string | null
          status:
            | Database["public"]["Enums"]["marketing_feedback_thread_status"]
            | null
          title: string | null
          type:
            | Database["public"]["Enums"]["marketing_feedback_thread_type"]
            | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_threads_assigned_by_admin_id_fkey"
            columns: ["assigned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_by_admin_id_fkey"
            columns: ["assigned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_assigned_deputy_id_fkey"
            columns: ["assigned_deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_preferred_deputy_id_fkey"
            columns: ["preferred_deputy_id"]
            isOneToOne: false
            referencedRelation: "deputy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_preferred_deputy_id_fkey"
            columns: ["preferred_deputy_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["deputy_profile_id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_with_roles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deputy_profile_id: string | null
          deputy_status: Database["public"]["Enums"]["deputy_status"] | null
          electoral_number: string | null
          electoral_symbol: string | null
          full_name: string | null
          id: string | null
          is_admin: boolean | null
          is_citizen: boolean | null
          is_deputy: boolean | null
          is_manager: boolean | null
          roles: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: string
      }
      app_admin_get_projects_created_per_month: {
        Args: never
        Returns: {
          month: string
          number_of_projects: number
        }[]
      }
      app_admin_get_recent_30_day_signin_count: { Args: never; Returns: number }
      app_admin_get_total_organization_count: { Args: never; Returns: number }
      app_admin_get_total_project_count: { Args: never; Returns: number }
      app_admin_get_total_user_count: { Args: never; Returns: number }
      app_admin_get_user_id_by_email: {
        Args: { emailarg: string }
        Returns: string
      }
      app_admin_get_users_created_per_month: {
        Args: never
        Returns: {
          month: string
          number_of_users: number
        }[]
      }
      app_admin_get_workspaces_created_per_month: {
        Args: never
        Returns: {
          month: string
          number_of_workspaces: number
        }[]
      }
      calculate_deputy_ranks: { Args: never; Returns: undefined }
      calculate_deputy_rating: {
        Args: { deputy_id_param: string }
        Returns: {
          avg_rating: number
          rating_count: number
        }[]
      }
      can_hold_complaint: { Args: { p_complaint_id: string }; Returns: boolean }
      check_if_authenticated_user_owns_email: {
        Args: { email: string }
        Returns: boolean
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      decrement_credits: {
        Args: { amount: number; org_id: string }
        Returns: undefined
      }
      get_all_check_constraints: {
        Args: never
        Returns: {
          check_clause: string
          constraint_name: string
          table_name: string
        }[]
      }
      get_all_columns: {
        Args: never
        Returns: {
          character_maximum_length: number
          column_default: string
          column_name: string
          data_type: string
          is_nullable: string
          numeric_precision: number
          numeric_scale: number
          ordinal_position: number
          table_name: string
          udt_name: string
        }[]
      }
      get_all_foreign_keys: {
        Args: never
        Returns: {
          constraint_name: string
          delete_rule: string
          from_column: string
          from_table: string
          to_column: string
          to_table: string
          update_rule: string
        }[]
      }
      get_all_indexes: {
        Args: never
        Returns: {
          indexdef: string
          indexname: string
          schemaname: string
          tablename: string
        }[]
      }
      get_all_primary_keys: {
        Args: never
        Returns: {
          column_name: string
          constraint_name: string
          table_name: string
        }[]
      }
      get_all_rls_policies: {
        Args: never
        Returns: {
          cmd: string
          permissive: string
          policyname: string
          qual: string
          roles: string[]
          schemaname: string
          tablename: string
          with_check: string
        }[]
      }
      get_all_tables: {
        Args: never
        Returns: {
          table_name: string
          table_type: string
        }[]
      }
      get_all_unique_constraints: {
        Args: never
        Returns: {
          column_name: string
          constraint_name: string
          table_name: string
        }[]
      }
      get_all_views: {
        Args: never
        Returns: {
          table_name: string
          view_definition: string
        }[]
      }
      get_citizen_complaint_stats: {
        Args: { p_citizen_id: string }
        Returns: {
          complaints_pending: number
          complaints_rejected: number
          complaints_resolved: number
          total_complaints: number
          total_messages: number
        }[]
      }
      get_complaints_stats: {
        Args: never
        Returns: {
          assigned_complaints: number
          average_resolution_days: number
          new_complaints: number
          rejected_complaints: number
          resolved_complaints: number
          total_complaints: number
          under_review_complaints: number
        }[]
      }
      get_customer_workspace_id: {
        Args: { customer_id_arg: string }
        Returns: string
      }
      get_deputy_complaint_stats: {
        Args: { p_deputy_id: string }
        Returns: {
          avg_resolution_time: unknown
          total_assigned: number
          total_on_hold: number
          total_points: number
          total_rejected: number
          total_resolved: number
        }[]
      }
      get_deputy_complaints_stats: {
        Args: { deputy_user_id: string }
        Returns: {
          accepted_complaints: number
          pending_complaints: number
          rejected_complaints: number
          resolved_complaints: number
          total_complaints: number
        }[]
      }
      get_deputy_rating_stats: {
        Args: { deputy_user_id: string }
        Returns: {
          average_rating: number
          final_average: number
          final_count: number
          total_ratings: number
        }[]
      }
      get_electoral_districts_by_governorate: {
        Args: { p_district_type?: string; p_governorate_id: string }
        Returns: {
          district_type: string
          id: string
          name: string
          name_en: string
        }[]
      }
      get_project_workspace_uuid: {
        Args: { project_id: string }
        Returns: string
      }
      get_top_deputies: {
        Args: { limit_count?: number }
        Returns: {
          complaints_resolved: number
          deputy_id: string
          deputy_name: string
          rank: number
          total_points: number
        }[]
      }
      get_unread_messages_count: { Args: { user_id: string }; Returns: number }
      get_workspace_team_member_admins: {
        Args: { workspace_id: string }
        Returns: {
          member_id: string
        }[]
      }
      get_workspace_team_member_ids: {
        Args: { workspace_id: string }
        Returns: {
          member_id: string
        }[]
      }
      has_workspace_permission: {
        Args: { permission: string; user_id: string; workspace_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_application_admin: { Args: { user_id?: string }; Returns: boolean }
      is_workspace_admin: {
        Args: { user_id: string; workspace_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { user_id: string; workspace_id: string }
        Returns: boolean
      }
      make_user_app_admin: { Args: { user_id_arg: string }; Returns: undefined }
      recalculate_deputy_rating: {
        Args: { p_deputy_id: string }
        Returns: undefined
      }
      remove_app_admin_privilege_for_user: {
        Args: { user_id_arg: string }
        Returns: undefined
      }
      update_workspace_member_permissions: {
        Args: { member_id: string; new_permissions: Json; workspace_id: string }
        Returns: undefined
      }
      user_has_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "deputy" | "citizen"
      approval_status: "pending" | "approved" | "rejected"
      complaint_action_type:
        | "comment"
        | "status_change"
        | "priority_change"
        | "assignment"
        | "internal_note"
      complaint_category:
        | "infrastructure"
        | "education"
        | "health"
        | "security"
        | "environment"
        | "transportation"
        | "water_sanitation"
        | "electricity"
        | "housing"
        | "employment"
        | "social_services"
        | "corruption"
        | "other"
      complaint_priority: "low" | "medium" | "high" | "urgent"
      complaint_status:
        | "new"
        | "under_review"
        | "in_progress"
        | "resolved"
        | "closed"
        | "rejected"
      council_type: "parliament" | "senate" | "local"
      deputy_status: "current" | "candidate"
      gender_type: "male" | "female"
      marketing_blog_post_status: "draft" | "published"
      marketing_changelog_status: "draft" | "published"
      marketing_feedback_moderator_hold_category:
        | "spam"
        | "off_topic"
        | "inappropriate"
        | "other"
      marketing_feedback_reaction_type:
        | "like"
        | "heart"
        | "celebrate"
        | "upvote"
      marketing_feedback_thread_priority: "low" | "medium" | "high"
      marketing_feedback_thread_status:
        | "open"
        | "under_review"
        | "planned"
        | "closed"
        | "in_progress"
        | "completed"
        | "moderator_hold"
        | "assigned"
        | "accepted"
        | "rejected_by_deputy"
        | "reassigned"
      marketing_feedback_thread_type: "bug" | "feature_request" | "general"
      organization_joining_status:
        | "invited"
        | "joinied"
        | "declined_invitation"
        | "joined"
      organization_member_role: "owner" | "admin" | "member" | "readonly"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      project_status: "draft" | "pending_approval" | "approved" | "completed"
      project_team_member_role: "admin" | "member" | "readonly"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      workspace_invitation_link_status:
        | "active"
        | "finished_accepted"
        | "finished_declined"
        | "inactive"
      workspace_member_role_type:
        | "owner"
        | "admin"
        | "member"
        | "readonly"
        | "manager"
        | "deputy"
        | "citizen"
      workspace_membership_type: "solo" | "team"
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
  public: {
    Enums: {
      app_role: ["admin", "manager", "deputy", "citizen"],
      approval_status: ["pending", "approved", "rejected"],
      complaint_action_type: [
        "comment",
        "status_change",
        "priority_change",
        "assignment",
        "internal_note",
      ],
      complaint_category: [
        "infrastructure",
        "education",
        "health",
        "security",
        "environment",
        "transportation",
        "water_sanitation",
        "electricity",
        "housing",
        "employment",
        "social_services",
        "corruption",
        "other",
      ],
      complaint_priority: ["low", "medium", "high", "urgent"],
      complaint_status: [
        "new",
        "under_review",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
      ],
      council_type: ["parliament", "senate", "local"],
      deputy_status: ["current", "candidate"],
      gender_type: ["male", "female"],
      marketing_blog_post_status: ["draft", "published"],
      marketing_changelog_status: ["draft", "published"],
      marketing_feedback_moderator_hold_category: [
        "spam",
        "off_topic",
        "inappropriate",
        "other",
      ],
      marketing_feedback_reaction_type: [
        "like",
        "heart",
        "celebrate",
        "upvote",
      ],
      marketing_feedback_thread_priority: ["low", "medium", "high"],
      marketing_feedback_thread_status: [
        "open",
        "under_review",
        "planned",
        "closed",
        "in_progress",
        "completed",
        "moderator_hold",
        "assigned",
        "accepted",
        "rejected_by_deputy",
        "reassigned",
      ],
      marketing_feedback_thread_type: ["bug", "feature_request", "general"],
      organization_joining_status: [
        "invited",
        "joinied",
        "declined_invitation",
        "joined",
      ],
      organization_member_role: ["owner", "admin", "member", "readonly"],
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      project_status: ["draft", "pending_approval", "approved", "completed"],
      project_team_member_role: ["admin", "member", "readonly"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
      workspace_invitation_link_status: [
        "active",
        "finished_accepted",
        "finished_declined",
        "inactive",
      ],
      workspace_member_role_type: [
        "owner",
        "admin",
        "member",
        "readonly",
        "manager",
        "deputy",
        "citizen",
      ],
      workspace_membership_type: ["solo", "team"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.53.6 (currently installed v2.22.4)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
