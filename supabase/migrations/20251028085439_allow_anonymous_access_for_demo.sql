/*
  # Allow Anonymous Access for Demo Application

  1. Changes
    - Drop existing authenticated-only policies
    - Create new policies that allow anonymous (public) access for all tables
    - This is needed because the application uses local authentication, not Supabase auth

  2. Security Notes
    - In production, these policies should be restricted to authenticated users only
    - This is for demo purposes where users login through a local auth system
*/

-- Drop existing policies for all tables
DROP POLICY IF EXISTS "Allow all operations for authenticated users on user_accounts" ON user_accounts;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on account_audit_history" ON account_audit_history;

-- User Accounts: Allow anonymous access
CREATE POLICY "Allow anonymous read access to user_accounts"
  ON user_accounts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to user_accounts"
  ON user_accounts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to user_accounts"
  ON user_accounts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from user_accounts"
  ON user_accounts
  FOR DELETE
  TO anon
  USING (true);

-- Account Audit History: Allow anonymous access
CREATE POLICY "Allow anonymous read access to account_audit_history"
  ON account_audit_history
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to account_audit_history"
  ON account_audit_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow for authenticated users (belt and suspenders)
CREATE POLICY "Allow authenticated read access to user_accounts"
  ON user_accounts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated operations on user_accounts"
  ON user_accounts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated operations on account_audit_history"
  ON account_audit_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
