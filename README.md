# Provincial Fund Web Portal — **Demo**

> **Status:** Demo prototype  
> **Audience:** Provincial Fund (PF) teams, government partners, and development partners  
> **Goal:** Show *how* simple UX and data design can make PF work faster, clearer, and more accountable.

This is a **demo website**. It does not use real data.  
It helps you **see** how PF daily work can be supported by an easy dashboard, clean tables, and clear records.

---

## What you can do in this demo

This demo shows how a Provincial Fund (PF) officer can easily see progress, find problems, and act —  
all from one simple dashboard. Each page is designed for a specific **real-world PF task**.


### 1) Dashboard — *See the big picture in 10 seconds*

**Use case examples:**
- “How much budget have we received, paid, and spent this year?”
- “Which program areas (livelihood, forest protection, admin) are largest?”
- “Which communes are spending slowly?”

**How it helps:**
- The top row shows key indicators (KPIs):
  - **Total Income**, **Total Expenditure**, **Balance**, and **Evidence Completeness**.
- The **Fund Flow Overview** displays:
  - Left: **Income sources** — Forest Owner Support, Community Contribution, Other Funds.  
  - Right: **Expenditure families** — Livelihood Development, Forest Protection Contracts, Fund Admin & Others.  
  - Livelihood Development expands into five sub-programs:
    - Agroforestry Extension  
    - Seedlings & Tools  
    - Construction & Small Works  
    - Training & Rules  
    - Awareness
- Box height is proportional to budget.  
  Small boxes show category name and %; hover reveals the exact amount in VND.
- A **Commune Spending Summary bar** shows:
  - 🟩 **Spent** (used)  
  - 🟪 **Disbursed − Spent** (paid but not yet used)  
  - ⬜ **Budget − Disbursed** (remaining budget not paid)

→ *PF officers can instantly understand where the money is and which communes need review.*

---

### 2) Implementation Review — *Check progress for each community*

**Use case examples:**
- “Has this community completed its plan?”  
- “Did they upload their receipts and minutes?”  
- “How much was spent vs. disbursed?”

**How it helps:**
- Each community line lists:  
  **Total Budget / Disbursed / Spent / Status / Meeting Minutes**
- Clicking the line opens **details** showing:
  - Each activity’s budget and spending rate  
  - List of receipts (with links)  
  - Uploaded minutes and photos  
- The top summary counts **Approved**, **Ongoing**, and **Completed** projects.

→ *Allows PF to review each community’s performance without opening multiple documents.*

---

### 3) Action Center — *Focus on what needs attention*

**Use case examples:**
- “Which communities have not uploaded receipts?”  
- “Where is disbursement or spending too low?”  
- “Which plans are still waiting for approval?”

**How it helps:**
- The Action Center automatically detects and lists:
  - ⚠️ **Low disbursement rate**  
  - ⚠️ **Low spending rate**  
  - ⚠️ **Missing meeting records or receipts**  
  - ⚠️ **Pending approvals**
- Each item is color-coded:
  - 🟢 OK 🟠 Warning 🔴 Needs follow-up
- Clicking any row opens the community’s detailed page with direct links to the missing or delayed items.

→ *PF officers can prioritize follow-up actions and save time by focusing only on problem areas.*

---

### 4) Meetings & Minutes — *Track community decision-making*

**Use case examples:**
- “Which activities were approved during the last community meeting?”
- “How many people participated and how was the vote result?”

**How it helps:**
- Filter meetings by **Fiscal Year** and **Commune**.
- For each meeting, view:  
  **Date / Time / Participant count / Details link**
- In the **Details view**, see:
  - Each proposed activity, its budget, and votes (For / Against / Abstain)
  - Final decision: **Approved** or **Rejected**
- Linked with Implementation Review so PF can trace each approved activity.

→ *Ensures transparency and traceability of community decisions.*

---

### 5) Export — *Generate simple reports*

**Use case examples:**
- “We need a report for the FY2024 disbursements in District A.”
- “Can I share the spending summary with other departments?”

**How it helps:**
- Exports data using the same filters (FY / Commune / Community).
- Supports **PDF** and **Excel** formats.
- Report structure matches what PF offices typically submit to higher-level agencies.

→ *Allows PF staff to prepare reports directly without extra formatting work.*

---

### 6) Accounts — *Manage users and keep an audit trail*

**Use case examples:**
- “Who manages the data for this commune?”
- “When was this user approved or removed?”
- “Can we check who made a change?”

**How it helps:**
- Lists all **user accounts (≈300 demo users)** across five roles:
  - Provincial Fund, Forest Owner, CPC, CMB, Community Member
- Shows **status** (Approved / Applied / Rejected / Deleted) and **ethnic group (A–D)**.
- Each account has a **history log** showing who made what change and when.

→ *Ensures accountability and clear governance for all actors involved in the PF process.*


---

## What this demo is **not**
- Not a production system  
- Not connected to real transactions  
- Not a finalized security/permission design

---

## Why we built it (in short)
Provincial Fund teams need **speed** (find issues quickly), **clarity** (see money flow), and **accountability** (trace decisions and evidence).  
This demo uses simple screens and plain language to **show the idea** before building a full system.

For a deeper explanation, see:
- [`/docs/DESIGN_RATIONALE.md`](docs/DESIGN_RATIONALE.md)
- [`/docs/DATA_MODEL.md`](docs/DATA_MODEL.md)

---

## Tech (Demo)
- Frontend: React + Tailwind, Recharts (for visuals)
- Data: demo tables (PlanActivity, BudgetItem, Receipt, Disbursement, MeetingRecord, etc.)
- Behavior: small categories auto-shrink labels; hover shows exact VND and %; filters are global

---

## Recreating this demo with AI
We produced this prototype **by talking to AI**.  
Even non-coders can iterate a working demo by sharing goals and examples.

See the step-by-step prompt script:  
[`/docs/AI_PROMPT_PLAYBOOK.md`](docs/AI_PROMPT_PLAYBOOK.md)

---

## License / Contact
- License: **Demo use only** (choose a license before production)

