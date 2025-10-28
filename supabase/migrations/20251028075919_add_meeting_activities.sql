/*
  # Add Meeting Activities Junction Table

  1. New Tables
    - `meeting_activities`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meeting_records)
      - `activity_id` (uuid, foreign key to plan_activities)
      - `vote_result` (text: 'approved' or 'rejected')
      - `votes_for` (integer)
      - `votes_against` (integer)
      - `votes_abstain` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `meeting_activities` table
    - Add policy for authenticated users to read meeting activities
*/

CREATE TABLE IF NOT EXISTS meeting_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meeting_records(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES plan_activities(id) ON DELETE CASCADE,
  vote_result text NOT NULL CHECK (vote_result IN ('approved', 'rejected')),
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  votes_abstain integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(meeting_id, activity_id)
);

ALTER TABLE meeting_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read meeting activities"
  ON meeting_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert meeting activities"
  ON meeting_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update meeting activities"
  ON meeting_activities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
