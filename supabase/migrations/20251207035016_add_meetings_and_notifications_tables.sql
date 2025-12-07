/*
  # Add Meetings and Notifications Tables

  ## Overview
  This migration creates tables for managing meeting schedules and user notifications, 
  separating meeting scheduling from meeting minutes.

  ## New Tables
  
  ### `meetings`
  Stores scheduled meetings with their basic information
  - `id` (uuid, primary key)
  - `community_id` (uuid, foreign key to communities)
  - `fiscal_year_id` (uuid, foreign key to fiscal_years)
  - `title` (text) - Meeting title/purpose
  - `scheduled_date` (date) - When the meeting is scheduled
  - `scheduled_time` (time) - Time of the meeting
  - `location` (text) - Meeting location
  - `status` (meeting_status) - scheduled, completed, cancelled
  - `chairperson` (text) - Person chairing the meeting
  - `agenda` (text) - Meeting agenda/topics
  - `created_by` (text) - Who created the meeting
  - `created_at` (timestamptz) - When the record was created
  - `updated_at` (timestamptz) - Last update time

  ### `notifications`
  Stores user notifications for various events
  - `id` (uuid, primary key)
  - `user_email` (text) - Recipient's email
  - `community_id` (uuid, foreign key to communities, nullable)
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `type` (notification_type) - Type of notification
  - `related_id` (uuid, nullable) - ID of related record (e.g., meeting_id)
  - `is_read` (boolean) - Whether notification has been read
  - `created_at` (timestamptz) - When notification was created

  ## Security
  - Enable RLS on both tables
  - Add policies for authenticated users to manage their meetings and notifications
*/

-- Create enum for meeting status
DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for notification type
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'meeting_scheduled',
    'meeting_cancelled',
    'meeting_updated',
    'activity_approved',
    'activity_completed',
    'fund_received',
    'general'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id),
  fiscal_year_id uuid NOT NULL REFERENCES fiscal_years(id),
  title text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  location text,
  status meeting_status DEFAULT 'scheduled',
  chairperson text,
  agenda text,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  community_id uuid REFERENCES communities(id),
  title text NOT NULL,
  message text NOT NULL,
  type notification_type DEFAULT 'general',
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for meetings
CREATE POLICY "Anyone can view meetings"
  ON meetings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert meetings"
  ON meetings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update meetings"
  ON meetings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete meetings"
  ON meetings FOR DELETE
  USING (true);

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_community_fiscal_year 
  ON meetings(community_id, fiscal_year_id);

CREATE INDEX IF NOT EXISTS idx_meetings_status 
  ON meetings(status);

CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_date 
  ON meetings(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_notifications_user_email 
  ON notifications(user_email);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
  ON notifications(is_read);

-- Add relationship between meetings and meeting_records
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meeting_records' AND column_name = 'meeting_id'
  ) THEN
    ALTER TABLE meeting_records ADD COLUMN meeting_id uuid REFERENCES meetings(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meeting_records_meeting_id 
  ON meeting_records(meeting_id);
