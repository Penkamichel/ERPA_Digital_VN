/*
  # Fix Fund Registration Workflow Order
  
  1. Changes
    - Remove related_activity_id from fund_registrations table
      (Fund is registered before activities are planned)
    - Remove supporting_documents requirement
      (These fields were only needed when linking to activities)
  
  2. Notes
    - Fund registration now happens BEFORE activity planning
    - Total available funds will be displayed in Idea Registration (Plan Budget) form
    - Activities are planned based on available funds, not the other way around
*/

-- Drop the foreign key constraint first
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fund_registrations_related_activity_id_fkey'
  ) THEN
    ALTER TABLE fund_registrations
      DROP CONSTRAINT fund_registrations_related_activity_id_fkey;
  END IF;
END $$;

-- Drop the related_activity_id column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fund_registrations' AND column_name = 'related_activity_id'
  ) THEN
    ALTER TABLE fund_registrations DROP COLUMN related_activity_id;
  END IF;
END $$;

-- Drop the supporting_documents column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fund_registrations' AND column_name = 'supporting_documents'
  ) THEN
    ALTER TABLE fund_registrations DROP COLUMN supporting_documents;
  END IF;
END $$;
