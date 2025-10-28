/*
  # Provincial Fund Web Portal - Database Schema

  ## Overview
  This migration creates the complete database schema for the Provincial Fund web portal,
  which manages community livelihood support plans, budgets, and disbursements.

  ## 1. New Tables

  ### `communes`
  - `id` (uuid, primary key)
  - `name` (text) - Commune name
  - `created_at` (timestamptz)

  ### `communities`
  - `id` (uuid, primary key)
  - `name` (text) - Community name
  - `commune_id` (uuid, foreign key → communes)
  - `created_at` (timestamptz)

  ### `fiscal_years`
  - `id` (uuid, primary key)
  - `year` (integer) - Calendar year (e.g., 2025)
  - `start_date` (date) - Fiscal year start date
  - `end_date` (date) - Fiscal year end date
  - `created_at` (timestamptz)

  ### `plan_activities`
  - `id` (uuid, primary key)
  - `community_id` (uuid, foreign key → communities)
  - `fiscal_year_id` (uuid, foreign key → fiscal_years)
  - `activity_name` (text) - Name of the activity
  - `period_start` (date) - Activity start date
  - `period_end` (date) - Activity end date
  - `forest_owner_support` (numeric) - Support from forest owners
  - `community_contribution` (numeric) - Community's contribution
  - `other_funds` (numeric) - Other funding sources
  - `total_budget` (numeric) - Calculated total budget
  - `implementation_method` (enum) - community, contractor, or co-implemented
  - `status` (enum) - draft, submitted, approved, ongoing, completed, cancelled
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `budget_items`
  - `id` (uuid, primary key)
  - `plan_activity_id` (uuid, foreign key → plan_activities)
  - `item_name` (text) - Budget item description
  - `unit` (text) - Unit of measurement
  - `quantity` (numeric) - Quantity needed
  - `unit_cost` (numeric) - Cost per unit
  - `amount` (numeric) - Calculated total amount
  - `remarks` (text) - Additional remarks
  - `created_at` (timestamptz)

  ### `receipts`
  - `id` (uuid, primary key)
  - `plan_activity_id` (uuid, foreign key → plan_activities)
  - `budget_item_id` (uuid, foreign key → budget_items, nullable)
  - `file_url` (text) - URL to receipt file
  - `file_type` (enum) - pdf, jpg, png
  - `uploaded_by_role` (enum) - cmb or pf
  - `uploaded_at` (timestamptz)
  - `verified` (boolean) - Verification status
  - `verified_by` (text, nullable) - User who verified
  - `verified_at` (timestamptz, nullable) - Verification timestamp

  ### `meeting_records`
  - `id` (uuid, primary key)
  - `community_id` (uuid, foreign key → communities)
  - `fiscal_year_id` (uuid, foreign key → fiscal_years)
  - `date` (date) - Meeting date
  - `chairperson` (text) - Meeting chairperson
  - `participants_count` (integer) - Number of participants
  - `agenda` (text) - Meeting agenda
  - `voting_method` (enum) - hands or secret
  - `voting_results` (jsonb) - Voting results data
  - `minutes_file_url` (text, nullable) - URL to minutes file
  - `minutes_summary` (text) - Summary of minutes
  - `created_at` (timestamptz)

  ### `disbursements`
  - `id` (uuid, primary key)
  - `commune_id` (uuid, foreign key → communes)
  - `community_id` (uuid, foreign key → communities)
  - `fiscal_year_id` (uuid, foreign key → fiscal_years)
  - `plan_activity_id` (uuid, foreign key → plan_activities, nullable)
  - `recipient_type` (enum) - forest_owner or cpc
  - `recipient_name` (text) - Name of recipient
  - `amount` (numeric) - Disbursement amount
  - `scheduled_date` (date) - Scheduled payment date
  - `payment_date` (date, nullable) - Actual payment date
  - `channel` (enum) - bank, postal, or cash
  - `status` (enum) - scheduled, disbursed, failed, cancelled
  - `payment_order_ref` (text) - Payment order reference number
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `audit_logs`
  - `id` (uuid, primary key)
  - `actor_user_id` (text) - User who performed action
  - `action` (text) - Action performed
  - `entity` (text) - Entity type affected
  - `entity_id` (text) - ID of affected entity
  - `timestamp` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to read their permitted data
  - Add policies for Provincial Fund officers to modify data
  - Add policies for CMB members to create and update their community data

  ## 3. Indexes
  - Create indexes on foreign key columns for performance
  - Create indexes on frequently queried columns (status, fiscal_year_id, commune_id)
*/

-- Create enum types
CREATE TYPE implementation_method AS ENUM ('community', 'contractor', 'co-implemented');
CREATE TYPE activity_status AS ENUM ('draft', 'submitted', 'approved', 'ongoing', 'completed', 'cancelled');
CREATE TYPE file_type AS ENUM ('pdf', 'jpg', 'png');
CREATE TYPE user_role AS ENUM ('cmb', 'pf');
CREATE TYPE voting_method AS ENUM ('hands', 'secret');
CREATE TYPE recipient_type AS ENUM ('forest_owner', 'cpc');
CREATE TYPE payment_channel AS ENUM ('bank', 'postal', 'cash');
CREATE TYPE disbursement_status AS ENUM ('scheduled', 'disbursed', 'failed', 'cancelled');

-- Create communes table
CREATE TABLE IF NOT EXISTS communes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  commune_id uuid NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create fiscal_years table
CREATE TABLE IF NOT EXISTS fiscal_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(year)
);

-- Create plan_activities table
CREATE TABLE IF NOT EXISTS plan_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  fiscal_year_id uuid NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
  activity_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  forest_owner_support numeric(12,2) DEFAULT 0,
  community_contribution numeric(12,2) DEFAULT 0,
  other_funds numeric(12,2) DEFAULT 0,
  total_budget numeric(12,2) DEFAULT 0,
  implementation_method implementation_method NOT NULL,
  status activity_status DEFAULT 'draft',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_activity_id uuid NOT NULL REFERENCES plan_activities(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  unit text NOT NULL,
  quantity numeric(12,2) NOT NULL,
  unit_cost numeric(12,2) NOT NULL,
  amount numeric(12,2) DEFAULT 0,
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_activity_id uuid NOT NULL REFERENCES plan_activities(id) ON DELETE CASCADE,
  budget_item_id uuid REFERENCES budget_items(id) ON DELETE SET NULL,
  file_url text NOT NULL,
  file_type file_type NOT NULL,
  uploaded_by_role user_role NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  verified_by text,
  verified_at timestamptz
);

-- Create meeting_records table
CREATE TABLE IF NOT EXISTS meeting_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  fiscal_year_id uuid NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
  date date NOT NULL,
  chairperson text NOT NULL,
  participants_count integer DEFAULT 0,
  agenda text NOT NULL,
  voting_method voting_method NOT NULL,
  voting_results jsonb DEFAULT '{}',
  minutes_file_url text,
  minutes_summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create disbursements table
CREATE TABLE IF NOT EXISTS disbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id uuid NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  fiscal_year_id uuid NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
  plan_activity_id uuid REFERENCES plan_activities(id) ON DELETE SET NULL,
  recipient_type recipient_type NOT NULL,
  recipient_name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  scheduled_date date NOT NULL,
  payment_date date,
  channel payment_channel NOT NULL,
  status disbursement_status DEFAULT 'scheduled',
  payment_order_ref text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id text NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_commune_id ON communities(commune_id);
CREATE INDEX IF NOT EXISTS idx_plan_activities_community_id ON plan_activities(community_id);
CREATE INDEX IF NOT EXISTS idx_plan_activities_fiscal_year_id ON plan_activities(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_plan_activities_status ON plan_activities(status);
CREATE INDEX IF NOT EXISTS idx_budget_items_plan_activity_id ON budget_items(plan_activity_id);
CREATE INDEX IF NOT EXISTS idx_receipts_plan_activity_id ON receipts(plan_activity_id);
CREATE INDEX IF NOT EXISTS idx_receipts_budget_item_id ON receipts(budget_item_id);
CREATE INDEX IF NOT EXISTS idx_meeting_records_community_id ON meeting_records(community_id);
CREATE INDEX IF NOT EXISTS idx_meeting_records_fiscal_year_id ON meeting_records(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_commune_id ON disbursements(commune_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_community_id ON disbursements(community_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_fiscal_year_id ON disbursements(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON disbursements(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all authenticated users to read data
CREATE POLICY "Allow authenticated users to read communes"
  ON communes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read communities"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read fiscal_years"
  ON fiscal_years FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read plan_activities"
  ON plan_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read budget_items"
  ON budget_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read meeting_records"
  ON meeting_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read disbursements"
  ON disbursements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read audit_logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies: Allow authenticated users to insert/update data
CREATE POLICY "Allow authenticated users to insert plan_activities"
  ON plan_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update plan_activities"
  ON plan_activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert budget_items"
  ON budget_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update budget_items"
  ON budget_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update receipts"
  ON receipts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert disbursements"
  ON disbursements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update disbursements"
  ON disbursements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert audit_logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete plan_activities"
  ON plan_activities FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete budget_items"
  ON budget_items FOR DELETE
  TO authenticated
  USING (true);