# Data Model (Demo)

> This describes the **demo** schema that powers the dashboard, minutes, export, and accounts modules.  
> Field names are indicative; adapt to your stack.

---

## Entities (high-level)

- **Commune**
- **Community** (belongs to a Commune)
- **FiscalYear**
- **PlanActivity**
- **BudgetItem**
- **Receipt**
- **Disbursement**
- **MeetingRecord**
- **MeetingActivity** (join between meeting and activity, with votes)
- **UserAccount**
- **AccountAudit**

---

## Relationships (ASCII ER)

Commune 1─* Community
Community 1─* PlanActivity
FiscalYear 1─* PlanActivity
PlanActivity 1─* BudgetItem 1─* Receipt
Commune 1─* Disbursement
Community 1─* MeetingRecord 1─* MeetingActivity
PlanActivity 1─* MeetingActivity (via activity_id)

UserAccount 1─* AccountAudit

---

## Key tables and fields

### Commune
- `id` (pk)
- `name`

### Community
- `id` (pk)
- `name`
- `commune_id` (fk → Commune.id)

### FiscalYear
- `id` (pk) — e.g., `FY2023`
- `start_date`, `end_date`

### PlanActivity
- `id` (pk)
- `community_id` (fk)
- `fiscal_year_id` (fk)
- `title`
- **Income fields** (for demo aggregation):
  - `forest_owner_support` (number)
  - `community_contribution` (number)
  - `other_funds` (number)
- **Linkage**:
  - (Legacy) `primary_category` → replaced by **expenditure_family** on BudgetItem

### BudgetItem
- `id` (pk)
- `activity_id` (fk → PlanActivity.id)
- `item_name`
- `quantity` (number)
- `unit_cost` (number)
- `amount` (number) — **must equal** `quantity * unit_cost` (validation)
- **Classification (required for demo logic):**
  - `expenditure_family` (enum):
    - `forest_protection_contracts`  
    - `forest_management_participation`  
    - `livelihood_development`  
    - `fund_admin_other`
  - `program_category` (enum, **required if** `expenditure_family = livelihood_development`):
    - `agroforestry_extension`
    - `seedlings_tools_processing`
    - `construction_materials_small_works`
    - `community_awareness`
    - `training_and_rules`
  - `cost_type` (enum; **detail view only**, not used in Sankey):
    - `personnel_labor`, `materials_supplies`, `equipment`,
      `services_contractors`, `transport_logistics`,
      `communication`, `meeting_event_costs`,
      `admin_overhead`, `fees_permits`, `contingency`
- **Auto-classification rules (editable):**
  - Keywords → `expenditure_family` and `program_category`
    - e.g., *patrol, ranger* → `forest_protection_contracts`
    - *seedlings, nursery, sapling* → `livelihood_development` + `seedlings_tools_processing`
    - *cement, culvert, drainage, repair* → `livelihood_development` + `construction_materials_small_works`
    - *training, workshop, rules* → `livelihood_development` + `training_and_rules`
    - *poster, banner, awareness* → `livelihood_development` + `community_awareness`
    - *extension, demo, field day* → `livelihood_development` + `agroforestry_extension`
  - Always allow **manual override**.

### Receipt
- `id` (pk)
- `budget_item_id` (fk → BudgetItem.id)
- `amount` (number)
- `date`
- `verified` (boolean)
- (optional) `file_url`

> **Spent** is computed as `sum(Receipt.amount where verified = true)`.

### Disbursement
- `id` (pk)
- `commune_id` (fk)
- `fiscal_year_id` (fk)
- `amount` (number)
- `date`

### MeetingRecord
- `id` (pk)
- `community_id` (fk)
- `fiscal_year_id` (fk)
- `meeting_datetime`
- `participants_count` (number)
- `chairperson` (text)
- `agenda` (text)

### MeetingActivity
- `id` (pk)
- `meeting_id` (fk → MeetingRecord.id)
- `activity_id` (fk → PlanActivity.id)
- `budget_amount` (number)
- **Votes:**
  - `votes_for` (int)
  - `votes_against` (int)
  - `votes_abstain` (int)
  - `result` (enum: `APPROVED` | `REJECTED`)

### UserAccount
- `id` (pk)
- `full_name`
- `email`
- `phone_e164`
- `ethnic_group` (enum: `A` | `B` | `C` | `D`)
- `role` (enum: `Provincial Fund` | `Forest Owner` | `CPC` | `CMB` | `Community Member`)
- `status` (enum: `Applied` | `Approved` | `Rejected` | `Deleted`)
- `created_at`, `updated_at`

### AccountAudit
- `id` (pk)
- `account_id` (fk → UserAccount.id)
- `changed_by` (email or user id)
- `change_type` (enum: `CREATE` | `APPROVE` | `REJECT` | `DELETE` | `UPDATE`)
- `change_summary` (json/text of field deltas)
- `reason` (text, optional)
- `changed_at` (timestamp)

---

## Core calculations

### Income (per filter scope)

1) Global filters (always applied)
WHERE fiscal_year_id = :selectedFiscalYearId
  AND (:selectedCommuneId IS NULL OR commune_id = :selectedCommuneId)
  AND (:selectedCommunityId IS NULL OR community_id = :selectedCommunityId)

2) Income, Expenditure, Balance (KPIs)

Income

SELECT
  COALESCE(SUM(pa.forest_owner_support), 0)
+ COALESCE(SUM(pa.community_contribution), 0)
+ COALESCE(SUM(pa.other_funds), 0) AS income_vnd
FROM plan_activities pa
-- apply Global filters on pa.fiscal_year_id, pa.commune_id, pa.community_id
;


Expenditure (Spent)

“Spent” = sum of verified receipts (or reconciled disbursements if you use that rule).

SELECT COALESCE(SUM(r.amount_vnd), 0) AS spent_vnd
FROM receipts r
JOIN budget_items bi ON bi.id = r.budget_item_id
JOIN plan_activities pa ON pa.id = bi.plan_activity_id
WHERE r.status = 'verified'
-- apply Global filters using pa.*
;


Disbursed

SELECT COALESCE(SUM(d.amount_vnd), 0) AS disbursed_vnd
FROM disbursements d
-- join to pa if you store links per activity; otherwise join via community/commune/fiscal year
-- apply Global filters
;


Balance

balance_vnd = income_vnd - spent_vnd

3) Income by source (for left column)
SELECT
  COALESCE(SUM(pa.forest_owner_support), 0) AS forest_owner_support_vnd,
  COALESCE(SUM(pa.community_contribution), 0) AS community_contribution_vnd,
  COALESCE(SUM(pa.other_funds), 0)          AS other_funds_vnd
FROM plan_activities pa
-- apply Global filters
;


Percentages:

pct = source_vnd / NULLIF(total_income_vnd, 0)

4) Expenditure families (Level 1)

budget_items.expenditure_family ∈
forest_protection_contracts | forest_management_participation | livelihood_development | fund_admin_other

SELECT
  bi.expenditure_family,
  COALESCE(SUM(r.amount_vnd), 0) AS spent_vnd
FROM budget_items bi
JOIN plan_activities pa ON pa.id = bi.plan_activity_id
LEFT JOIN receipts r ON r.budget_item_id = bi.id AND r.status = 'verified'
-- apply Global filters using pa.*
GROUP BY bi.expenditure_family
;


Percentages:

pct = family_spent_vnd / NULLIF(total_spent_vnd, 0)

5) Livelihood programs (Level 2 under livelihood_development)

budget_items.program_category ∈
agroforestry_extension | seedlings_tools_processing | construction_materials_small_works | community_awareness | training_and_rules

SELECT
  bi.program_category,
  COALESCE(SUM(r.amount_vnd), 0) AS spent_vnd
FROM budget_items bi
JOIN plan_activities pa ON pa.id = bi.plan_activity_id
LEFT JOIN receipts r ON r.budget_item_id = bi.id AND r.status = 'verified'
WHERE bi.expenditure_family = 'livelihood_development'
-- apply Global filters using pa.*
GROUP BY bi.program_category
;

6) Evidence completeness (dashboard badge)
evidence_completeness_pct =
  verified_receipt_count_for_scope / NULLIF(budget_item_count_for_scope, 0)

SELECT
  COUNT(*) FILTER (WHERE r.status = 'verified')::float
  / NULLIF(COUNT(*), 0) AS evidence_completeness_pct
FROM budget_items bi
JOIN plan_activities pa ON pa.id = bi.plan_activity_id
LEFT JOIN receipts r ON r.budget_item_id = bi.id
-- apply Global filters using pa.*
;

7) Commune Spending Summary (single stacked bar)

For each Commune:

total_budget_vnd = sum of planned income (or approved budget) in its communities

total_disbursed_vnd = sum of disbursements to that commune

total_spent_vnd = sum of verified receipts within that commune

Derived segments:

spent_segment_vnd           = total_spent_vnd
disbursed_not_spent_vnd     = GREATEST(total_disbursed_vnd - total_spent_vnd, 0)
budget_not_disbursed_vnd    = GREATEST(total_budget_vnd - total_disbursed_vnd, 0)


SQL sketch:

WITH budget AS (
  SELECT pa.commune_id, COALESCE(SUM(
      pa.forest_owner_support + pa.community_contribution + pa.other_funds
  ),0) AS total_budget_vnd
  FROM plan_activities pa
  -- filter by fiscal year if the summary is FY-scoped
  GROUP BY pa.commune_id
),
disb AS (
  SELECT d.commune_id, COALESCE(SUM(d.amount_vnd),0) AS total_disbursed_vnd
  FROM disbursements d
  -- filter by fiscal year if stored
  GROUP BY d.commune_id
),
spent AS (
  SELECT pa.commune_id, COALESCE(SUM(r.amount_vnd),0) AS total_spent_vnd
  FROM receipts r
  JOIN budget_items bi ON bi.id = r.budget_item_id
  JOIN plan_activities pa ON pa.id = bi.plan_activity_id
  WHERE r.status = 'verified'
  -- filter by fiscal year if the summary is FY-scoped
  GROUP BY pa.commune_id
)
SELECT
  c.id AS commune_id,
  c.name AS commune_name,
  COALESCE(b.total_budget_vnd,0)   AS total_budget_vnd,
  COALESCE(d.total_disbursed_vnd,0) AS total_disbursed_vnd,
  COALESCE(s.total_spent_vnd,0)     AS total_spent_vnd
FROM communes c
LEFT JOIN budget b ON b.commune_id = c.id
LEFT JOIN disb d   ON d.commune_id = c.id
LEFT JOIN spent s  ON s.commune_id = c.id
-- optional WHERE to honor global filters for FY
;


Display rule (legend):

Green = Spent (actually used)

Purple = Disbursed − Spent (paid but not yet used)

Gray = Budget − Disbursed (remaining budget not paid)

8) “Unallocated/Pending” (shown as separate card, not a category)
unallocated_pending_vnd = GREATEST(total_budget_vnd - total_spent_vnd, 0)


Display only if unallocated_pending_vnd > 0.
Do not include it in expenditure categories.

9) Tiny-box label rule (FY2025 small percentages)

Rendering logic (UI, not SQL):

if box_height < 40px:
  show "Category + %"
  show amount (VND) on hover tooltip only
elif box_height < 100px:
  show "Category + % + amount" with reduced font
else:
  show full label with larger font

10) Validation rules (server-side)

budget_items.amount_vnd = quantity * unit_cost_vnd

budget_items.expenditure_family is required

If expenditure_family = 'livelihood_development', then program_category is required

Optional plan consistency (when enabled):

SUM(budget_items.amount_vnd) FOR each livelihood activity
  == plan_activities.forest_owner_support


Evidence status must be one of: pending | verified | rejected

Data integrity for FY comparisons:

For each FY:
  income_vnd >= disbursed_vnd >= spent_vnd
(the demo seeds enforce ratios: FY2023=100%, FY2024≈85%, FY2025≈30%)

11) Click-through filtering (table & Action Center)

Family click → filter items to expenditure_family = :family

Program click (within livelihood_development) → filter items to program_category = :program

Filters cascade with Global filters (FY / Commune / Community)

Use the same filtered scope for the Action Center pre-filters:

Low Disbursement

Low Spending

Missing Evidence

Pending Approval

12) Percentage formatting
format_pct = (value_vnd / NULLIF(total_vnd, 0)) * 100
display as: "12.3%" (1 decimal for 1–9%, 0 decimals for ≥10%)

13) Currency formatting

Display as 1.87B VND, 702.5M VND, 125k VND with standard thousand separators.

Rule of thumb:

≥ 1,000,000,000 → X.YB VND

≥ 1,000,000 → X.YM VND

else → X,XXX VND

