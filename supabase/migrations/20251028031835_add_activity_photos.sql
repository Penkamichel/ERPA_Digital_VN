/*
  # Add Activity Photos Table

  1. New Table
    - `activity_photos`
      - `id` (uuid, primary key)
      - `plan_activity_id` (uuid, foreign key to plan_activities)
      - `file_url` (text, URL to photo)
      - `caption` (text, photo description)
      - `uploaded_at` (timestamp)
      - `uploaded_by_role` (user_role enum)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `activity_photos` table
    - Add policy for public read access (demo purposes)
*/

CREATE TABLE IF NOT EXISTS activity_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_activity_id uuid REFERENCES plan_activities(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  caption text,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by_role user_role DEFAULT 'cmb',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to activity_photos"
  ON activity_photos FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_activity_photos_plan_activity 
  ON activity_photos(plan_activity_id);
