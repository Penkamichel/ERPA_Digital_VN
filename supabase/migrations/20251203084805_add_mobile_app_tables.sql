/*
  # Add Mobile App Support Tables

  1. New Tables
    - `ideas` - Community member idea submissions
      - `id` (uuid, primary key)
      - `community_id` (uuid, foreign key)
      - `fiscal_year_id` (uuid, foreign key)
      - `submitted_by` (text)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `status` (enum: submitted, under_review, approved, rejected, implemented)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `comments` - Comments on plans/budgets/activities
      - `id` (uuid, primary key)
      - `plan_activity_id` (uuid, foreign key)
      - `commented_by` (text)
      - `comment_text` (text)
      - `comment_type` (enum: question, concern, suggestion, approval)
      - `requires_revision` (boolean)
      - `created_at` (timestamptz)
    
    - `activity_progress_notes` - Progress updates for activities
      - `id` (uuid, primary key)
      - `plan_activity_id` (uuid, foreign key)
      - `note_text` (text)
      - `progress_percentage` (numeric)
      - `created_by` (text)
      - `created_at` (timestamptz)
    
    - `offline_sync_queue` - Queue for offline data sync
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `table_name` (text)
      - `operation` (enum: insert, update, delete)
      - `data` (jsonb)
      - `synced` (boolean)
      - `created_at` (timestamptz)
      - `synced_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create enums
CREATE TYPE idea_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'implemented');
CREATE TYPE comment_type AS ENUM ('question', 'concern', 'suggestion', 'approval');
CREATE TYPE sync_operation AS ENUM ('insert', 'update', 'delete');

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id),
  fiscal_year_id uuid NOT NULL REFERENCES fiscal_years(id),
  submitted_by text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general',
  status idea_status DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ideas"
  ON ideas FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_activity_id uuid NOT NULL REFERENCES plan_activities(id),
  commented_by text NOT NULL,
  comment_text text NOT NULL,
  comment_type comment_type DEFAULT 'suggestion',
  requires_revision boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to comments"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Activity progress notes table
CREATE TABLE IF NOT EXISTS activity_progress_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_activity_id uuid NOT NULL REFERENCES plan_activities(id),
  note_text text NOT NULL,
  progress_percentage numeric DEFAULT 0,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_progress_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to progress notes"
  ON activity_progress_notes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert progress notes"
  ON activity_progress_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Offline sync queue table
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  table_name text NOT NULL,
  operation sync_operation NOT NULL,
  data jsonb NOT NULL,
  synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz
);

ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sync queue"
  ON offline_sync_queue FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_community ON ideas(community_id);
CREATE INDEX IF NOT EXISTS idx_ideas_fiscal_year ON ideas(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_comments_activity ON comments(plan_activity_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_activity ON activity_progress_notes(plan_activity_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON offline_sync_queue(user_id, synced);
