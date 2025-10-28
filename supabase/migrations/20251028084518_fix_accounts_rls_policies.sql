/*
  # Fix Accounts RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies that allow public access for authenticated users
    - Simplify policy logic
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all accounts" ON user_accounts;
DROP POLICY IF EXISTS "Authenticated users can create accounts" ON user_accounts;
DROP POLICY IF EXISTS "Authenticated users can update accounts" ON user_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete accounts" ON user_accounts;

DROP POLICY IF EXISTS "Authenticated users can view audit history" ON account_audit_history;
DROP POLICY IF EXISTS "Authenticated users can insert audit history" ON account_audit_history;

-- Create simpler policies for user_accounts
CREATE POLICY "Allow all operations for authenticated users on user_accounts"
  ON user_accounts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simpler policies for account_audit_history
CREATE POLICY "Allow all operations for authenticated users on account_audit_history"
  ON account_audit_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
