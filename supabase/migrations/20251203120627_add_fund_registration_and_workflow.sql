/*
  # Add Fund Registration and Workflow Tracking

  1. New Tables
    - `fund_registrations` - Approved fund registration for each FY
      - `id` (uuid, primary key)
      - `community_id` (uuid, foreign key)
      - `fiscal_year_id` (uuid, foreign key)
      - `approved_amount` (numeric)
      - `approval_date` (date)
      - `approval_document_url` (text)
      - `registered_by` (text)
      - `status` (enum: draft, registered, verified)
      - `created_at` (timestamptz)
    
    - `workflow_status` - Track CMB workflow progress
      - `id` (uuid, primary key)
      - `community_id` (uuid, foreign key)
      - `fiscal_year_id` (uuid, foreign key)
      - `fund_registration_completed` (boolean)
      - `meeting_scheduled_completed` (boolean)
      - `minutes_uploaded_completed` (boolean)
      - `plan_created_completed` (boolean)
      - `activities_ongoing` (boolean)
      - `final_report_submitted` (boolean)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (demo mode)
*/

-- Create enums
CREATE TYPE fund_registration_status AS ENUM ('draft', 'registered', 'verified');

-- Fund registrations table
CREATE TABLE IF NOT EXISTS fund_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id),
  fiscal_year_id uuid NOT NULL REFERENCES fiscal_years(id),
  approved_amount numeric NOT NULL DEFAULT 0,
  approval_date date,
  approval_document_url text,
  registered_by text NOT NULL,
  status fund_registration_status DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(community_id, fiscal_year_id)
);

ALTER TABLE fund_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to fund_registrations"
  ON fund_registrations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage fund_registrations"
  ON fund_registrations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Workflow status tracking table
CREATE TABLE IF NOT EXISTS workflow_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id),
  fiscal_year_id uuid NOT NULL REFERENCES fiscal_years(id),
  fund_registration_completed boolean DEFAULT false,
  meeting_scheduled_completed boolean DEFAULT false,
  minutes_uploaded_completed boolean DEFAULT false,
  plan_created_completed boolean DEFAULT false,
  activities_ongoing boolean DEFAULT false,
  final_report_submitted boolean DEFAULT false,
  current_step text DEFAULT 'fund_registration',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(community_id, fiscal_year_id)
);

ALTER TABLE workflow_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to workflow_status"
  ON workflow_status FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage workflow_status"
  ON workflow_status FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert demo data for Ban Pho Village
WITH ban_pho AS (
  SELECT id FROM communities WHERE name = 'Ban Pho Village' LIMIT 1
),
fy_2023 AS (
  SELECT id FROM fiscal_years WHERE year = 2023 LIMIT 1
),
fy_2024 AS (
  SELECT id FROM fiscal_years WHERE year = 2024 LIMIT 1
),
fy_2025 AS (
  SELECT id FROM fiscal_years WHERE year = 2025 LIMIT 1
)
-- Fund registrations
INSERT INTO fund_registrations (community_id, fiscal_year_id, approved_amount, approval_date, registered_by, status)
VALUES
  ((SELECT id FROM ban_pho), (SELECT id FROM fy_2023), 33000000, '2023-01-15', 'Siriporn', 'verified'),
  ((SELECT id FROM ban_pho), (SELECT id FROM fy_2024), 37000000, '2024-01-20', 'Siriporn', 'verified'),
  ((SELECT id FROM ban_pho), (SELECT id FROM fy_2025), 50000000, '2025-01-10', 'Siriporn', 'registered')
ON CONFLICT (community_id, fiscal_year_id) DO NOTHING;

-- Workflow status
WITH ban_pho AS (
  SELECT id FROM communities WHERE name = 'Ban Pho Village' LIMIT 1
),
fy_2023 AS (
  SELECT id FROM fiscal_years WHERE year = 2023 LIMIT 1
),
fy_2024 AS (
  SELECT id FROM fiscal_years WHERE year = 2024 LIMIT 1
),
fy_2025 AS (
  SELECT id FROM fiscal_years WHERE year = 2025 LIMIT 1
)
INSERT INTO workflow_status (
  community_id, 
  fiscal_year_id, 
  fund_registration_completed,
  meeting_scheduled_completed,
  minutes_uploaded_completed,
  plan_created_completed,
  activities_ongoing,
  final_report_submitted,
  current_step
)
VALUES
  -- FY2023: All completed
  ((SELECT id FROM ban_pho), (SELECT id FROM fy_2023), true, true, true, true, false, true, 'completed'),
  -- FY2024: All completed
  ((SELECT id FROM ban_pho), (SELECT id FROM fy_2024), true, true, true, true, false, true, 'completed'),
  -- FY2025: In progress - currently at activities stage
  ((SELECT id FROM ban_pho), (SELECT id FROM fy_2025), true, true, true, true, true, false, 'activities_ongoing')
ON CONFLICT (community_id, fiscal_year_id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fund_registrations_community ON fund_registrations(community_id);
CREATE INDEX IF NOT EXISTS idx_fund_registrations_fy ON fund_registrations(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status_community ON workflow_status(community_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status_fy ON workflow_status(fiscal_year_id);
