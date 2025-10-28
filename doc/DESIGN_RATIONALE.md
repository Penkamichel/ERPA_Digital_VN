# Design Rationale

This document explains **why** each screen and feature exists, and **how** it supports Provincial Fund (PF) operations.

---

## Problems we’re solving

1) **PF needs a 10-second truth check**
- Where is money coming from?
- Where is it going?
- What remains or is pending?
- Which communes need attention?

**Design choice**: A top **KPI** row (Income / Expenditure / Balance), a **Fund Flow Overview** that maps Income → Expenditure (with a second level for Livelihood programs), and a **Commune Spending Summary** bar.
- Outcome: A PF officer can spot **under-spending**, **missing evidence**, or **imbalances** instantly.

2) **Follow-up needs to be obvious**
- PF teams lose time hunting for problems across many screens.

**Design choice**: One **Spending Summary** bar per commune:
- 🟩 Spent / 🟪 Disbursed−Spent / ⬜ Budget−Disbursed
- Outcome: The bar itself tells you **what to fix** (e.g., “paid but not used” or “not yet paid”).

3) **Decisions must be explainable**
- Stakeholders ask “who approved what, and how?”

**Design choice**: **Meetings & Minutes** detail shows:
- Activities voted on, budgets, **For/Against/Abstain** counts, and **Approved/Rejected**.
- Outcome: Clear **traceability** from decision to implementation.

4) **People and permissions change**
- Partners rotate; CMB/Community reps change; you still need control and history.

**Design choice**: **Accounts** page with status filters and **audit logs**.
- Outcome: Clean governance; easy to show compliance and history.

---

## UX Principles

- **Clarity over cleverness**: plain language labels.
- **Hierarchy and proportion**: box height **proportional to amount**; small categories auto-shrink text; hover reveals exact numbers.
- **Global filters** (FY, Commune, Community): one set of selectors updates all screens.
- **Consistent color** mapping:
  - Income = green hues
  - Expenditure families = distinct hues (Livelihood and its sub-programs share a base color)
  - Pending/Remaining = gray
- **Accessible defaults**: large numerals for KPIs; tooltips for precise values.

---

## Why the “two-level” flow for Expenditure

PF must show **macro** (families) and **micro** (program types) without flooding the screen:

- **Level 1 (Families):**  
  `forest_protection_contracts`, `forest_management_participation`, `livelihood_development`, `fund_admin_other`
- **Level 2 (Programs – only for Livelihood):**  
  `agroforestry_extension`, `seedlings_tools_processing`,  
  `construction_materials_small_works`, `community_awareness`, `training_and_rules`

Rationale:
- Families are *policy-relevant* sinks (good for high-level accountability).
- Livelihood needs program-level visibility to discuss **mix and balance** (e.g., construction vs. training).

---

## Why Minutes + Votes matter for PF

- Funds must be **community-driven** and **defensible**.  
- The **Meetings & Minutes** page makes “who decided what” visible:
  - activity name, budget, For/Against/Abstain counts, result
- This supports grievance handling, audits, and trust.

---

## Accounts & Audit: governance by design

- Roles differ (Provincial Fund / Forest Owner / CPC / CMB / Community Member).  
- The **Accounts** module shows state (Applied / Approved / Rejected / Deleted) and **keeps a change log**.
- This design invites production-grade controls later (RLS, WORM logs, e-signing).

---

## Non-goals for this demo

- Final security architecture, granular permissions, and full compliance.
- Production integration with financial systems.
- Legal records management.


