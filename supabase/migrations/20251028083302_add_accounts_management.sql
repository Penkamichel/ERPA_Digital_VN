/*
  # Add Accounts Management System

  1. New Tables
    - `user_accounts`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `full_name` (text, not null)
      - `phone_number` (text)
      - `ethnic_group` (text) - A, B, C, or D
      - `account_category` (enum) - Provincial Fund, Forest Owner, CPC, CMB, Community Member
      - `status` (enum) - Applied, Rejected, Approved, Deleted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `account_audit_history`
      - `id` (uuid, primary key)
      - `account_id` (uuid, references user_accounts)
      - `action` (text) - e.g., 'created', 'approved', 'status_changed', 'updated'
      - `field_changed` (text) - which field was modified
      - `old_value` (text) - previous value
      - `new_value` (text) - new value
      - `changed_by` (text) - user who made the change
      - `changed_at` (timestamptz)
      - `notes` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create account_category enum
CREATE TYPE account_category AS ENUM (
  'provincial_fund',
  'forest_owner',
  'cpc',
  'cmb',
  'community_member'
);

-- Create account_status enum
CREATE TYPE account_status AS ENUM (
  'applied',
  'rejected',
  'approved',
  'deleted'
);

-- Create user_accounts table
CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  ethnic_group text CHECK (ethnic_group IN ('A', 'B', 'C', 'D')),
  account_category account_category NOT NULL,
  status account_status DEFAULT 'applied' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account_audit_history table
CREATE TABLE IF NOT EXISTS account_audit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  action text NOT NULL,
  field_changed text,
  old_value text,
  new_value text,
  changed_by text NOT NULL,
  changed_at timestamptz DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_audit_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_accounts
CREATE POLICY "Authenticated users can view all accounts"
  ON user_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create accounts"
  ON user_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
  ON user_accounts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete accounts"
  ON user_accounts FOR DELETE
  TO authenticated
  USING (true);

-- Policies for account_audit_history
CREATE POLICY "Authenticated users can view audit history"
  ON account_audit_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert audit history"
  ON account_audit_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_accounts_status ON user_accounts(status);
CREATE INDEX IF NOT EXISTS idx_user_accounts_category ON user_accounts(account_category);
CREATE INDEX IF NOT EXISTS idx_account_audit_history_account_id ON account_audit_history(account_id);
CREATE INDEX IF NOT EXISTS idx_account_audit_history_changed_at ON account_audit_history(changed_at DESC);
