/*
  # Allow Anonymous Access to Fund Registrations and Workflow Status
  
  1. Changes
    - Add anonymous (anon) policies for fund_registrations table
    - Add anonymous (anon) policies for workflow_status table
    - Allow INSERT, UPDATE, DELETE for demo purposes
  
  2. Security Notes
    - This is for demo purposes where users login through local auth
    - In production, these should be restricted to authenticated users
*/

-- Drop existing policies for fund_registrations
DROP POLICY IF EXISTS "Allow public read access to fund_registrations" ON fund_registrations;
DROP POLICY IF EXISTS "Allow authenticated users to manage fund_registrations" ON fund_registrations;

-- Fund Registrations: Allow anonymous access
CREATE POLICY "Allow anonymous read access to fund_registrations"
  ON fund_registrations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to fund_registrations"
  ON fund_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to fund_registrations"
  ON fund_registrations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from fund_registrations"
  ON fund_registrations
  FOR DELETE
  TO anon
  USING (true);

-- Also allow for authenticated users
CREATE POLICY "Allow authenticated operations on fund_registrations"
  ON fund_registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop existing policies for workflow_status
DROP POLICY IF EXISTS "Allow public read access to workflow_status" ON workflow_status;
DROP POLICY IF EXISTS "Allow authenticated users to manage workflow_status" ON workflow_status;

-- Workflow Status: Allow anonymous access
CREATE POLICY "Allow anonymous read access to workflow_status"
  ON workflow_status
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to workflow_status"
  ON workflow_status
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to workflow_status"
  ON workflow_status
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from workflow_status"
  ON workflow_status
  FOR DELETE
  TO anon
  USING (true);

-- Also allow for authenticated users
CREATE POLICY "Allow authenticated operations on workflow_status"
  ON workflow_status
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
