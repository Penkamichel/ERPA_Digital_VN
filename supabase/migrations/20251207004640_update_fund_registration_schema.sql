/*
  # Update Fund Registration Schema
  
  1. Changes to fund_registrations table
    - Add fund_source field (select options)
    - Add fund_purpose field (select options)
    - Add is_erpa_fund (boolean, calculated)
    - Add amount_received_vnd (number)
    - Add payment_date (date)
    - Add payment_reference_number (text)
    - Add payer_name (text)
    - Add related_activity_id (relation to plan_activities)
    - Add supporting_documents (text/url)
    - Add donation_type (select options)
    - Add carry_over_reference_year (number)
    - Update notes field
    - Add recorded_by (text)
    - Add recorded_date (date)
    
    - Remove old fields that are no longer needed:
      - community_name, address, number_households
      - representative fields
      - forest_protection fields
      - livelihood fields
      - commitment_agree_regulations
      - signature_community_rep
      - submission_date
      - registered_by
      - approval_date
      - approval_document_url
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop old columns from fund_registrations
DO $$
BEGIN
  -- Drop columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'community_name') THEN
    ALTER TABLE fund_registrations DROP COLUMN community_name;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'address') THEN
    ALTER TABLE fund_registrations DROP COLUMN address;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'number_households') THEN
    ALTER TABLE fund_registrations DROP COLUMN number_households;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_fullname') THEN
    ALTER TABLE fund_registrations DROP COLUMN representative_fullname;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_dob') THEN
    ALTER TABLE fund_registrations DROP COLUMN representative_dob;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_position') THEN
    ALTER TABLE fund_registrations DROP COLUMN representative_position;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_id_number') THEN
    ALTER TABLE fund_registrations DROP COLUMN representative_id_number;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_id_issue_date') THEN
    ALTER TABLE fund_registrations DROP COLUMN representative_id_issue_date;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_id_issued_by') THEN
    ALTER TABLE fund_registrations DROP COLUMN representative_id_issued_by;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'forest_protection_location') THEN
    ALTER TABLE fund_registrations DROP COLUMN forest_protection_location;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'forest_protection_area_ha') THEN
    ALTER TABLE fund_registrations DROP COLUMN forest_protection_area_ha;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'livelihood_supported_activities') THEN
    ALTER TABLE fund_registrations DROP COLUMN livelihood_supported_activities;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'livelihood_location') THEN
    ALTER TABLE fund_registrations DROP COLUMN livelihood_location;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'livelihood_support_mode') THEN
    ALTER TABLE fund_registrations DROP COLUMN livelihood_support_mode;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'commitment_agree_regulations') THEN
    ALTER TABLE fund_registrations DROP COLUMN commitment_agree_regulations;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'signature_community_rep') THEN
    ALTER TABLE fund_registrations DROP COLUMN signature_community_rep;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'submission_date') THEN
    ALTER TABLE fund_registrations DROP COLUMN submission_date;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'registered_by') THEN
    ALTER TABLE fund_registrations DROP COLUMN registered_by;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'approval_date') THEN
    ALTER TABLE fund_registrations DROP COLUMN approval_date;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'approval_document_url') THEN
    ALTER TABLE fund_registrations DROP COLUMN approval_document_url;
  END IF;
END $$;

-- Rename approved_amount to amount_received_vnd if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'approved_amount') THEN
    ALTER TABLE fund_registrations RENAME COLUMN approved_amount TO amount_received_vnd;
  END IF;
END $$;

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'fund_source') THEN
    ALTER TABLE fund_registrations ADD COLUMN fund_source text NOT NULL DEFAULT 'Forest Owner (ERPA)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'fund_purpose') THEN
    ALTER TABLE fund_registrations ADD COLUMN fund_purpose text NOT NULL DEFAULT 'Forest protection contract';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'is_erpa_fund') THEN
    ALTER TABLE fund_registrations ADD COLUMN is_erpa_fund boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'amount_received_vnd') THEN
    ALTER TABLE fund_registrations ADD COLUMN amount_received_vnd numeric NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'payment_date') THEN
    ALTER TABLE fund_registrations ADD COLUMN payment_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'payment_reference_number') THEN
    ALTER TABLE fund_registrations ADD COLUMN payment_reference_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'payer_name') THEN
    ALTER TABLE fund_registrations ADD COLUMN payer_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'related_activity_id') THEN
    ALTER TABLE fund_registrations ADD COLUMN related_activity_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'supporting_documents') THEN
    ALTER TABLE fund_registrations ADD COLUMN supporting_documents text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'donation_type') THEN
    ALTER TABLE fund_registrations ADD COLUMN donation_type text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'carry_over_reference_year') THEN
    ALTER TABLE fund_registrations ADD COLUMN carry_over_reference_year integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'recorded_by') THEN
    ALTER TABLE fund_registrations ADD COLUMN recorded_by text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'recorded_date') THEN
    ALTER TABLE fund_registrations ADD COLUMN recorded_date date;
  END IF;
END $$;

-- Add foreign key constraint for related_activity_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fund_registrations_related_activity_id_fkey'
  ) THEN
    ALTER TABLE fund_registrations
      ADD CONSTRAINT fund_registrations_related_activity_id_fkey
      FOREIGN KEY (related_activity_id)
      REFERENCES plan_activities(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Remove default constraints after initial setup
ALTER TABLE fund_registrations ALTER COLUMN fund_source DROP DEFAULT;
ALTER TABLE fund_registrations ALTER COLUMN fund_purpose DROP DEFAULT;
