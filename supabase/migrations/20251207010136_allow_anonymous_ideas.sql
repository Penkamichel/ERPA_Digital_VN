/*
  # Allow Anonymous Access to Ideas Table
  
  1. Changes
    - Add anonymous (anon) policies for ideas table
    - Allow INSERT, UPDATE for demo purposes
  
  2. Security Notes
    - This is for demo purposes where users login through local auth
    - In production, these should be restricted to authenticated users
*/

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Allow authenticated users to insert ideas" ON ideas;
DROP POLICY IF EXISTS "Allow authenticated users to update ideas" ON ideas;

-- Ideas: Allow anonymous insert
CREATE POLICY "Allow anonymous insert to ideas"
  ON ideas
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ideas: Allow anonymous update
CREATE POLICY "Allow anonymous update to ideas"
  ON ideas
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Ideas: Allow anonymous delete
CREATE POLICY "Allow anonymous delete from ideas"
  ON ideas
  FOR DELETE
  TO anon
  USING (true);

-- Also allow for authenticated users
CREATE POLICY "Allow authenticated operations on ideas"
  ON ideas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
