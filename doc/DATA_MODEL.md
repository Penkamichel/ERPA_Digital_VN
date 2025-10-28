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
