/*
  # Add Form Fields for Mobile App Data Entry
  
  1. Changes to fund_registrations table
    - Add community details (name, address, number_households)
    - Add representative information (fullname, dob, position, id details)
    - Add forest protection details (location, area_ha)
    - Add livelihood support details (activities, location, support_mode)
    - Add commitment and signature fields
    
  2. Changes to ideas table
    - Add problem_statement, expected_location, expected_beneficiaries
    - Add estimated_budget_total, estimated_community_contribution
    - Add alignment_with_decree (JSONB)
    - Add attachment_files, submission_date
    
  3. Changes to meeting_records table
    - Add meeting times (start_time, end_time)
    - Add presentation_summary, discussion_points, approved_contents
    - Add signature fields (secretary, community_rep)
    
  4. Changes to plan_activities table
    - Add co-approval signature fields
    - Add activity_category field
    
  5. Changes to receipts table
    - Add expense tracking fields (expense_category, vendor_name, invoice_number, amount_vnd)
    - Add activity log fields (description_of_work, date_of_activity, location)
    - Add validation fields (validation_team_comments, submitted_by)
    - Add participants_list_file
    
  6. Security
    - Maintain existing RLS policies
*/

-- 1. Add fields to fund_registrations
DO $$
BEGIN
  -- Community details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'community_name') THEN
    ALTER TABLE fund_registrations ADD COLUMN community_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'address') THEN
    ALTER TABLE fund_registrations ADD COLUMN address text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'number_households') THEN
    ALTER TABLE fund_registrations ADD COLUMN number_households integer;
  END IF;
  
  -- Representative information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_fullname') THEN
    ALTER TABLE fund_registrations ADD COLUMN representative_fullname text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_dob') THEN
    ALTER TABLE fund_registrations ADD COLUMN representative_dob date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_position') THEN
    ALTER TABLE fund_registrations ADD COLUMN representative_position text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_id_number') THEN
    ALTER TABLE fund_registrations ADD COLUMN representative_id_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_id_issue_date') THEN
    ALTER TABLE fund_registrations ADD COLUMN representative_id_issue_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'representative_id_issued_by') THEN
    ALTER TABLE fund_registrations ADD COLUMN representative_id_issued_by text;
  END IF;
  
  -- Forest protection details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'forest_protection_location') THEN
    ALTER TABLE fund_registrations ADD COLUMN forest_protection_location text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'forest_protection_area_ha') THEN
    ALTER TABLE fund_registrations ADD COLUMN forest_protection_area_ha numeric;
  END IF;
  
  -- Livelihood support details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'livelihood_supported_activities') THEN
    ALTER TABLE fund_registrations ADD COLUMN livelihood_supported_activities text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'livelihood_location') THEN
    ALTER TABLE fund_registrations ADD COLUMN livelihood_location text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'livelihood_support_mode') THEN
    ALTER TABLE fund_registrations ADD COLUMN livelihood_support_mode text;
  END IF;
  
  -- Commitment and signatures
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'commitment_agree_regulations') THEN
    ALTER TABLE fund_registrations ADD COLUMN commitment_agree_regulations boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'signature_community_rep') THEN
    ALTER TABLE fund_registrations ADD COLUMN signature_community_rep text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fund_registrations' AND column_name = 'submission_date') THEN
    ALTER TABLE fund_registrations ADD COLUMN submission_date date;
  END IF;
END $$;

-- 2. Add fields to ideas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'problem_statement') THEN
    ALTER TABLE ideas ADD COLUMN problem_statement text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'expected_location') THEN
    ALTER TABLE ideas ADD COLUMN expected_location text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'expected_beneficiaries') THEN
    ALTER TABLE ideas ADD COLUMN expected_beneficiaries text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'estimated_budget_total') THEN
    ALTER TABLE ideas ADD COLUMN estimated_budget_total numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'estimated_community_contribution') THEN
    ALTER TABLE ideas ADD COLUMN estimated_community_contribution text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'alignment_with_decree') THEN
    ALTER TABLE ideas ADD COLUMN alignment_with_decree jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'attachment_files') THEN
    ALTER TABLE ideas ADD COLUMN attachment_files text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'submission_date') THEN
    ALTER TABLE ideas ADD COLUMN submission_date date;
  END IF;
END $$;

-- 3. Add fields to meeting_records
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_records' AND column_name = 'meeting_start_time') THEN
    ALTER TABLE meeting_records ADD COLUMN meeting_start_time time;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_records' AND column_name = 'meeting_end_time') THEN
    ALTER TABLE meeting_records ADD COLUMN meeting_end_time time;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_records' AND column_name = 'presentation_summary') THEN
    ALTER TABLE meeting_records ADD COLUMN presentation_summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_records' AND column_name = 'discussion_points') THEN
    ALTER TABLE meeting_records ADD COLUMN discussion_points text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_records' AND column_name = 'approved_contents') THEN
    ALTER TABLE meeting_records ADD COLUMN approved_contents text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_records' AND column_name = 'secretary_signature') THEN
    ALTER TABLE meeting_records ADD COLUMN secretary_signature text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_records' AND column_name = 'community_rep_signature') THEN
    ALTER TABLE meeting_records ADD COLUMN community_rep_signature text;
  END IF;
END $$;

-- 4. Add fields to plan_activities
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_activities' AND column_name = 'activity_category') THEN
    ALTER TABLE plan_activities ADD COLUMN activity_category text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_activities' AND column_name = 'coapproval_community_rep') THEN
    ALTER TABLE plan_activities ADD COLUMN coapproval_community_rep text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_activities' AND column_name = 'coapproval_cpc') THEN
    ALTER TABLE plan_activities ADD COLUMN coapproval_cpc text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_activities' AND column_name = 'coapproval_forest_owner') THEN
    ALTER TABLE plan_activities ADD COLUMN coapproval_forest_owner text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_activities' AND column_name = 'approval_date') THEN
    ALTER TABLE plan_activities ADD COLUMN approval_date date;
  END IF;
END $$;

-- 5. Add fields to receipts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'expense_category') THEN
    ALTER TABLE receipts ADD COLUMN expense_category text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'vendor_name') THEN
    ALTER TABLE receipts ADD COLUMN vendor_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'invoice_number') THEN
    ALTER TABLE receipts ADD COLUMN invoice_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'amount_vnd') THEN
    ALTER TABLE receipts ADD COLUMN amount_vnd numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'description_of_work') THEN
    ALTER TABLE receipts ADD COLUMN description_of_work text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'date_of_activity') THEN
    ALTER TABLE receipts ADD COLUMN date_of_activity date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'location') THEN
    ALTER TABLE receipts ADD COLUMN location text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'participants_list_file') THEN
    ALTER TABLE receipts ADD COLUMN participants_list_file text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'validation_team_comments') THEN
    ALTER TABLE receipts ADD COLUMN validation_team_comments text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'submitted_by') THEN
    ALTER TABLE receipts ADD COLUMN submitted_by text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'submission_date') THEN
    ALTER TABLE receipts ADD COLUMN submission_date date;
  END IF;
END $$;
