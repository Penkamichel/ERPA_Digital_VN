export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      communes: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          commune_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          commune_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          commune_id?: string
          created_at?: string
        }
      }
      fiscal_years: {
        Row: {
          id: string
          year: number
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          year?: number
          start_date?: string
          end_date?: string
          created_at?: string
        }
      }
      plan_activities: {
        Row: {
          id: string
          community_id: string
          fiscal_year_id: string
          activity_name: string
          period_start: string
          period_end: string
          forest_owner_support: number
          community_contribution: number
          other_funds: number
          total_budget: number
          implementation_method: 'community' | 'contractor' | 'co-implemented'
          status: 'draft' | 'submitted' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          community_id: string
          fiscal_year_id: string
          activity_name: string
          period_start: string
          period_end: string
          forest_owner_support?: number
          community_contribution?: number
          other_funds?: number
          total_budget?: number
          implementation_method: 'community' | 'contractor' | 'co-implemented'
          status?: 'draft' | 'submitted' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          fiscal_year_id?: string
          activity_name?: string
          period_start?: string
          period_end?: string
          forest_owner_support?: number
          community_contribution?: number
          other_funds?: number
          total_budget?: number
          implementation_method?: 'community' | 'contractor' | 'co-implemented'
          status?: 'draft' | 'submitted' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_items: {
        Row: {
          id: string
          plan_activity_id: string
          item_name: string
          unit: string
          quantity: number
          unit_cost: number
          amount: number
          remarks: string
          created_at: string
        }
        Insert: {
          id?: string
          plan_activity_id: string
          item_name: string
          unit: string
          quantity: number
          unit_cost: number
          amount?: number
          remarks?: string
          created_at?: string
        }
        Update: {
          id?: string
          plan_activity_id?: string
          item_name?: string
          unit?: string
          quantity?: number
          unit_cost?: number
          amount?: number
          remarks?: string
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          plan_activity_id: string
          budget_item_id: string | null
          file_url: string
          file_type: 'pdf' | 'jpg' | 'png'
          uploaded_by_role: 'cmb' | 'pf'
          uploaded_at: string
          verified: boolean
          verified_by: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          plan_activity_id: string
          budget_item_id?: string | null
          file_url: string
          file_type: 'pdf' | 'jpg' | 'png'
          uploaded_by_role: 'cmb' | 'pf'
          uploaded_at?: string
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          plan_activity_id?: string
          budget_item_id?: string | null
          file_url?: string
          file_type?: 'pdf' | 'jpg' | 'png'
          uploaded_by_role?: 'cmb' | 'pf'
          uploaded_at?: string
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
        }
      }
      meeting_records: {
        Row: {
          id: string
          community_id: string
          fiscal_year_id: string
          date: string
          chairperson: string
          participants_count: number
          agenda: string
          voting_method: 'hands' | 'secret'
          voting_results: Json
          minutes_file_url: string | null
          minutes_summary: string
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          fiscal_year_id: string
          date: string
          chairperson: string
          participants_count?: number
          agenda: string
          voting_method: 'hands' | 'secret'
          voting_results?: Json
          minutes_file_url?: string | null
          minutes_summary?: string
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          fiscal_year_id?: string
          date?: string
          chairperson?: string
          participants_count?: number
          agenda?: string
          voting_method?: 'hands' | 'secret'
          voting_results?: Json
          minutes_file_url?: string | null
          minutes_summary?: string
          created_at?: string
        }
      }
      disbursements: {
        Row: {
          id: string
          commune_id: string
          community_id: string
          fiscal_year_id: string
          plan_activity_id: string | null
          recipient_type: 'forest_owner' | 'cpc'
          recipient_name: string
          amount: number
          scheduled_date: string
          payment_date: string | null
          channel: 'bank' | 'postal' | 'cash'
          status: 'scheduled' | 'disbursed' | 'failed' | 'cancelled'
          payment_order_ref: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          commune_id: string
          community_id: string
          fiscal_year_id: string
          plan_activity_id?: string | null
          recipient_type: 'forest_owner' | 'cpc'
          recipient_name: string
          amount: number
          scheduled_date: string
          payment_date?: string | null
          channel: 'bank' | 'postal' | 'cash'
          status?: 'scheduled' | 'disbursed' | 'failed' | 'cancelled'
          payment_order_ref?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          commune_id?: string
          community_id?: string
          fiscal_year_id?: string
          plan_activity_id?: string | null
          recipient_type?: 'forest_owner' | 'cpc'
          recipient_name?: string
          amount?: number
          scheduled_date?: string
          payment_date?: string | null
          channel?: 'bank' | 'postal' | 'cash'
          status?: 'scheduled' | 'disbursed' | 'failed' | 'cancelled'
          payment_order_ref?: string
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_user_id: string
          action: string
          entity: string
          entity_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          actor_user_id: string
          action: string
          entity: string
          entity_id: string
          timestamp?: string
        }
        Update: {
          id?: string
          actor_user_id?: string
          action?: string
          entity?: string
          entity_id?: string
          timestamp?: string
        }
      }
    }
  }
}
