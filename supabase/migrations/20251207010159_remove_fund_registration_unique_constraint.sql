/*
  # Remove Unique Constraint from Fund Registrations
  
  1. Changes
    - Remove UNIQUE(community_id, fiscal_year_id) constraint
    - Allow multiple fund registrations per community per fiscal year
    - This is needed because communities can receive funds from multiple sources
  
  2. Rationale
    - Communities may receive:
      - Forest Owner (ERPA) funds
      - Provincial Fund (ERPA) funds
      - CPC (ERPA-related) funds
      - Community Donations
      - Private Donor / NGO funds
      - Previous Year Carry-over
    - Each of these may be registered separately as they arrive
*/

-- Drop the unique constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fund_registrations_community_id_fiscal_year_id_key'
  ) THEN
    ALTER TABLE fund_registrations
      DROP CONSTRAINT fund_registrations_community_id_fiscal_year_id_key;
  END IF;
END $$;
