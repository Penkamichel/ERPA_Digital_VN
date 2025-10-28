/*
  # Add Expenditure Family Classification for Climate Finance

  1. Changes
    - Add `expenditure_family` enum for Level 1 Sankey classification
    - Add `program_category` enum for Level 2 (livelihood_development only)
    - Add `cost_type` enum for detail view only
    - Replace `spending_category` with new classification on `budget_items`
    - Update `plan_activities` to use `expenditure_family` instead of `primary_category`

  2. Expenditure Families (Level 1)
    - forest_protection_contracts: Direct payments for forest protection
    - forest_management_participation: Community engagement in forest management
    - livelihood_development: Income-generating and livelihood activities
    - fund_admin_other: Administrative and operational costs

  3. Program Categories (Level 2 - livelihood_development only)
    - agroforestry_extension: Extension services and demonstrations
    - seedlings_tools_processing: Seedlings, tools, processing equipment
    - construction_materials_small_works: Small infrastructure and materials
    - community_awareness: Outreach, communication, awareness campaigns
    - training_and_rules: Training programs and rule development

  4. Cost Types (detail view only, not in Sankey)
    - personnel_labor: Wages, salaries, labor costs
    - materials_supplies: Raw materials and supplies
    - equipment: Tools and equipment
    - services_contractors: External services
    - transport_logistics: Transport and fuel
    - communication: Phone, internet, communication
    - meeting_event_costs: Meeting and event expenses
    - admin_overhead: Administrative overhead
    - fees_permits: Licenses and permits
    - contingency: Emergency and contingency funds
*/

DO $$ BEGIN
  CREATE TYPE expenditure_family AS ENUM (
    'forest_protection_contracts',
    'forest_management_participation',
    'livelihood_development',
    'fund_admin_other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE program_category AS ENUM (
    'agroforestry_extension',
    'seedlings_tools_processing',
    'construction_materials_small_works',
    'community_awareness',
    'training_and_rules'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cost_type AS ENUM (
    'personnel_labor',
    'materials_supplies',
    'equipment',
    'services_contractors',
    'transport_logistics',
    'communication',
    'meeting_event_costs',
    'admin_overhead',
    'fees_permits',
    'contingency'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE budget_items
DROP COLUMN IF EXISTS spending_category;

ALTER TABLE budget_items
ADD COLUMN IF NOT EXISTS expenditure_family expenditure_family DEFAULT 'livelihood_development',
ADD COLUMN IF NOT EXISTS program_category program_category,
ADD COLUMN IF NOT EXISTS cost_type cost_type DEFAULT 'materials_supplies';

ALTER TABLE plan_activities
DROP COLUMN IF EXISTS primary_category;

ALTER TABLE plan_activities
ADD COLUMN IF NOT EXISTS expenditure_family expenditure_family DEFAULT 'livelihood_development';

CREATE INDEX IF NOT EXISTS idx_budget_items_expenditure_family
ON budget_items(expenditure_family);

CREATE INDEX IF NOT EXISTS idx_budget_items_program_category
ON budget_items(program_category);

CREATE INDEX IF NOT EXISTS idx_plan_activities_expenditure_family
ON plan_activities(expenditure_family);

COMMENT ON COLUMN budget_items.expenditure_family IS 'Level 1 classification: how Climate Finance benefits communities';
COMMENT ON COLUMN budget_items.program_category IS 'Level 2 classification: only for livelihood_development family';
COMMENT ON COLUMN budget_items.cost_type IS 'Detailed cost type for activity detail pages (not shown in Sankey)';
COMMENT ON COLUMN plan_activities.expenditure_family IS 'Default expenditure family for the activity';
