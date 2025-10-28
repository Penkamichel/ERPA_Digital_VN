import type { Database } from '../lib/database.types';

export type Commune = Database['public']['Tables']['communes']['Row'];
export type Community = Database['public']['Tables']['communities']['Row'];
export type FiscalYear = Database['public']['Tables']['fiscal_years']['Row'];
export type PlanActivity = Database['public']['Tables']['plan_activities']['Row'];
export type BudgetItem = Database['public']['Tables']['budget_items']['Row'];
export type Receipt = Database['public']['Tables']['receipts']['Row'];
export type MeetingRecord = Database['public']['Tables']['meeting_records']['Row'];
export type Disbursement = Database['public']['Tables']['disbursements']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export type UserRole = 'pf' | 'cmb' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  commune_id?: string;
}

export interface ActivityWithDetails extends PlanActivity {
  community?: Community;
  fiscal_year?: FiscalYear;
  budget_items?: BudgetItem[];
  receipts?: Receipt[];
}

export interface CommunityWithCommune extends Community {
  commune?: Commune;
}

export interface DisbursementWithDetails extends Disbursement {
  commune?: Commune;
  community?: Community;
  fiscal_year?: FiscalYear;
  plan_activity?: PlanActivity;
}
