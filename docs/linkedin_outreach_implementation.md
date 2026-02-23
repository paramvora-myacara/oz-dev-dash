# Final Implementation Plan: LinkedIn Outreach for Family Offices

This document outlines the technical design and integration plan for the Family Office LinkedIn outreach system.

## 1. Objectives & Overview
- **Automate Outreach**: Systematically send connection requests and personalized messages to individuals at Family Offices.
- **Maintain Deliverability**: Avoid LinkedIn spam detection via strict rate limiting and company rotation.
- **Predictability & Control**: Provide a UI dashboard for monitoring and manually overriding scheduled tasks.
- **Multi-Account Support**: Concurrent execution for accounts like Jeff and Todd.

## 2. Infrastructure & Logic Decisions

### 2.1. Concurrency & Locking
- **Strategy**: Database-level locking using Postgres `FOR UPDATE SKIP LOCKED`.
- **Rationale**: Safe for high-concurrency background workers. If a worker session crashes, the database automatically releases the lock immediately, preventing "stuck" tasks.
- **Observability**: Workers update the task status to `connecting` in the same transaction as picking the row, ensuring the UI always shows which account is handling which contact.

### 2.2. Company Rotation & "Two-Pass" Strategy
To ensure broad coverage across the 2,500 contacts, we use a two-pass selection logic:

1.  **Pass 1 (Broad Outreach)**: Target firms with **zero** pending or active outreach. Pick the first available contact. This ensures we hit every firm once before moving to a second person at any company.
2.  **Pass 2 (Deep Outreach)**: If the daily limit (20/account) isn't reached, target firms where:
    - Outreach to a previous person happened more than **14 days ago**.
    - There has been **no reply** from that firm.
    - Pick the *next* contact in the list for that firm.

**Daily Limits**:
- 20 connection requests per account per day.
- Limit outreach to **one person per firm per day** globally across all Oz Listing accounts.

### 2.3. Hybrid Selection (Tonight's Batch)
- **Selection Phase (6:00 PM)**: A background script runs within the **existing `linkedin-automation` service** via `node-cron`. It identifies the "Best 40" contacts (20 Jeff, 20 Todd).
- **Message Generation**: During this phase, the system generates the personalized message (see Section 2.4) and stores it in the `message` column of the `linkedin_tasks` table.
- **Review Phase (6:00 PM - 6:30 PM)**: The `oz-dev-dash` dashboard displays "Tonight's Batch", allowing the user to review the specific contacts and the exact messages to be sent.
- **Execution Phase (6:30 PM)**: The automation service starts and processes only items in the `queued` status, using the pre-generated message from the database.

### 2.4. Connection Message Template
The following template will be used for all Family Office outreach:

> "Hi {first_name} - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies. After 25 years in CRE, I'm now working with leading OZ sponsors and startups in the US. I’d love to hear your thoughts on OZ investing and share what I’ve learned as well."

**Integration Logic**:
- **Generator**: The `BatchService.ts` (Selection Phase) handles the string interpolation.
- **Storage**: The plain-text message is saved to `linkedin_tasks.message`.
- **UI**: The message is displayed as **read-only** in the `oz-dev-dash` Dashboard during the 30-minute review window for inspection. (Removed "editable" per discussion to simplify implementation).
- **Execution**: `QueueService.ts` simply passes this string to `LinkedInService.ts`.

---

## 3. Data Model

### 3.1. `family_office_firms` [NEW]
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key. |
| `name` | TEXT | Canonical firm name (Indexed). |
| `website` | TEXT | Firm website. |
| `aum` | TEXT | Assets Under Management. |
| `investment_prefs` | TEXT | Areas of interest for personalization. |
| `status` | ENUM | `active`, `blocked` (Stop all outreach to this firm), `replied` (Successfully engaged). |

### 3.2. `family_office_contacts` [NEW]
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key. |
| `firm_id` | UUID | FK to `family_office_firms`. |
| `first_name`, `last_name`| TEXT | Used for message personalization. |
| `title` | TEXT | Contact's role. |
| `linkedin_url` | TEXT | Target profile URL. |

### 3.3. `linkedin_tasks` [NEW]
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key. |
| `source_id` | UUID | Links to `family_office_contacts`, `prospect_calls`, or `contacts`. |
| `source_type` | TEXT | Specifies the linked table (e.g., 'family_office_contacts'). |
| `firm_id` | UUID | FK used for rotation and blocking logic. |
| `message` | TEXT | Pre-generated message (populated at 6:00 PM). |
| `status` | ENUM | `pending`, `queued`, `connecting`, `invited`, `failed`, `stopped`. |
| `account_name` | TEXT | Assigned account (Jeff/Todd). |
| `executed_at` | TIMESTAMPTZ | Timestamp of last attempt. |

---

## 4. UI Dashboard (`oz-dev-dash`)

### 4.1. Location: `/admin/linkedin`
A dedicated command center for managing automation.

- **Tonight's Batch Preview**: Shows the 40 contacts queued for the daily batch.
- **Firm Management**: Searchable list of firms with a **"Stop Firm Outreach"** toggle.
- **Unified Queue**: View of all `pending` contacts across the ecosystem, sorted by priority.

### 4.2. Stop Outreach Mechanism
- **Manual Control**: Since automatic reply detection on LinkedIn is not feasible, the UI will provide actions to "Stop Firm" or mark as "Replied".
- **Effect**: Clicking "Stop Firm" marks the firm as `blocked`. Marking as replied sets the firm to `replied`. Both actions transition all related `pending`/`queued` tasks to `stopped`.

---

## 5. Implementation Roadmap

### Phase 1: Data & Import
- Create Supabase migrations for normalized tables and tasks.
- Develop `import_family_offices.ts` script to parse CSV and seed the database.

### Phase 2: Backend Logic (Service Refactor)
- **`index.ts`**: Add 6:00 PM cron for the selection phase.
- **`QueueService.ts`**: Refactor to be source-agnostic, processing from the `linkedin_tasks` table.
- **`BatchService.ts` [NEW]**: Implement the Two-Pass selection SQL logic and message generation.

### Phase 3: Frontend Dashboard
- Build the `/admin/linkedin` page in `oz-dev-dash`.
- Implement batch review and firm blocking interfaces.

### Phase 4: Verification
- Dry-run import.
- Parallel execution test (Jeff/Todd sessions) in `dryRun` mode.
- Company rotation verification over multiple simulated days.
