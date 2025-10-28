/*
  # Add Spending Categories for Budget Items

  1. Changes
    - Add `spending_category` enum type with predefined categories
    - Add `spending_category` field to `budget_items` table
    - Add `primary_category` field to `plan_activities` table for default categorization
    - Add indexes for better query performance

  2. Categories
    - forest_patrol: Forest monitoring and patrolling activities
    - extension_training: Training and capacity building
    - public_works: Infrastructure, construction, repairs
    - equipment_materials: Tools, equipment, materials
    - transport_logistics: Fuel, vehicle maintenance, transport
    - services_contractors: External services and contractors
    - community_outreach: Meetings, communications, awareness
    - operations_admin: Office supplies, utilities, administration
    - monitoring_evaluation: Monitoring, reporting, evaluation
    - fees_permits: Licenses, permits, legal fees
    - contingency: Emergency funds, unexpected costs
    - unallocated: Not yet categorized
*/

DO $$ BEGIN
  CREATE TYPE spending_category AS ENUM (
    'forest_patrol',
    'extension_training',
    'public_works',
    'equipment_materials',
    'transport_logistics',
    'services_contractors',
    'community_outreach',
    'operations_admin',
    'monitoring_evaluation',
    'fees_permits',
    'contingency',
    'unallocated'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE budget_items
ADD COLUMN IF NOT EXISTS spending_category spending_category DEFAULT 'unallocated';

ALTER TABLE plan_activities
ADD COLUMN IF NOT EXISTS primary_category spending_category DEFAULT 'unallocated';

CREATE INDEX IF NOT EXISTS idx_budget_items_spending_category
ON budget_items(spending_category);

CREATE INDEX IF NOT EXISTS idx_plan_activities_primary_category
ON plan_activities(primary_category);

COMMENT ON COLUMN budget_items.spending_category IS 'Categorization of spending for financial tracking and reporting';
COMMENT ON COLUMN plan_activities.primary_category IS 'Default spending category for activities, used when budget items are not individually categorized';
