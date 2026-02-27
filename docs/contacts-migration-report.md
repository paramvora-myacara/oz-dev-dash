# Contacts → CRM Migration Report

**Date:** 2026-02-27  
**Status:** ✅ Identity migration complete — follow-up tasks remain  
**Environment:** Production (`rsbjjbiwpmmzjcemjeyf.supabase.co`)

---

## Table of Contents

1. [Objective](#objective)
2. [Pre-Migration Analysis](#pre-migration-analysis)
3. [Migration Strategy Decisions](#migration-strategy-decisions)
4. [What Was Executed](#what-was-executed)
5. [Post-Migration State](#post-migration-state)
6. [Scripts & Artifacts](#scripts--artifacts)
7. [Remaining Work](#remaining-work)

---

## Objective

Migrate the legacy `contacts` table (32,584 rows from email outreach lists, website signups, and warm contacts) into the new consolidated CRM schema (people, emails, phones, organizations + junction tables). The new schema was already populated with QOZB property contacts (~13,839 people) and Family Office contacts (~2,765 people) from prior imports.

---

## Pre-Migration Analysis

### Overlap Audits

Two audit scripts were developed and run to understand the degree of overlap between outreach email lists and existing CRM data:

#### Email Overlap (`audit_email_list_overlap.py`)
- **32,761 unique outreach emails** across all CSV lists
- **756 emails (2.3%)** overlap with QOZB + Family Office data
- **Implication:** Migration is primarily net-new inserts, with a small enrichment pass

#### Company Overlap (`audit_company_overlap.py`)
- **9,080 unique outreach companies** (normalized)
- **2,184 companies (24%)** overlap with existing organizations
  - Developer lists ↔ QOZB: **48% overlap** (developers are QOZB property owners)
  - Investor lists ↔ Family Office: **~3% overlap**
  - Fund lists: near zero overlap

#### Live Contacts Analysis (`audit_contacts_for_crm_migration.py`)
Read the production `contacts` table and compared against the new CRM schema:

| Metric | Count | % |
|--------|------:|--:|
| Total contacts | 32,584 | 100% |
| Email match (will enrich) | 727 | 2.2% |
| Email new (will create) | 31,852 | 97.8% |
| Phone match | 1,629 | — |
| Phone new | 2,048 | — |
| Company match (exact) | 6,431 | — |
| Company new | 6,322 unique | — |
| Has name | 32,526 | 99.8% |
| Has role | 22,239 | 68.3% |
| Has location | 26,906 | 82.6% |
| Has user_id | 210 | 0.6% |
| Globally bounced | 2,630 | 8.1% |
| Globally unsubscribed | 272 | 0.8% |
| Duplicate emails in contacts | 4 | — |

---

## Migration Strategy Decisions

### 1. Full Migration (Option A) — Chosen
Move all data from `contacts` into the new normalized schema. The `contacts` table is preserved (not dropped) until all downstream consumers are migrated.

### 2. Merge Rule: Email = Same Person
If an email from the `contacts` table already exists in the `emails` table, the corresponding `people` record is **enriched** (tags merged, lead_status upgraded, org links added) — not duplicated.

### 3. Organization Matching: Case-Insensitive Exact Match
No suffix stripping (LLC, Inc, etc.) for the import. Normalized matching was used for the audit only.  
**Rationale:** False positives from fuzzy matching are worse than missed merges. Missed merges can be manually resolved later.

### 4. Data Source: Production `contacts` Table (not CSVs)
The `contacts` table is richer than the raw CSVs — it includes:
- SparkPost bounce/suppression data
- Warm contacts enrichment (lead_status)
- Eventbrite webinar metadata in details JSONB
- Website signup user_id links
- Campaign activity data

### 5. Campaign Tables Retained
`campaign_recipients` and `email_queue` are kept as-is. `campaign_recipients` will need FK migration to `people.id` in a follow-up pass.

---

## What Was Executed

### Import Order
1. **QOZB Import** (`import_qozb_to_crm.py`) — 13,839 people, 11,848 orgs, 21,274 properties
2. **Family Office Import** (`import_family_office_to_crm.py`) — 2,765 people, 1,202 orgs
3. **Contacts Import** (`import_contacts_to_crm.py`) — 31,852 new people, 727 enriched

### Contacts Migration Phases (Production Run)

| Phase | Action | Result |
|-------|--------|--------|
| **Phase 1** | Fetch all data | 32,584 contacts + existing CRM entities |
| **Phase 2** | Collect unique entities | 31,852 new emails, 1,155 new phones, 6,322 new orgs |
| **Phase 3** | Upsert entity tables | Emails, phones, organizations upserted. 54 email statuses updated (bounced/suppressed) |
| **Phase 4** | Resolve people | 31,852 to create, 727 to enrich |
| **Phase 5** | Insert people | 31,852 people inserted |
| **Phase 6** | Enrich existing people | 727 people enriched (tags merged, lead_status upgraded, user_id set) |
| **Phase 7** | Insert junction records | person_emails: 31,852 ✅, person_phones: 3,476 ✅, person_organizations: 29,014 ✅ |
| **Phase 8** | Save mapping | 32,583 contact_id → person_id mappings saved |

### Column Mapping (contacts → new schema)

| `contacts` column | → New Schema Location |
|---|---|
| `email` | `emails.address` + `person_emails` junction |
| `name` | `people.first_name` + `last_name` (split on first space) |
| `company` | `organizations.name` + `person_organizations` junction |
| `role` | `person_organizations.title` |
| `phone_number` | `phones.number` + `person_phones` junction |
| `contact_types` | `people.tags` |
| `details` | `people.details` (selective: location, import_source, webinar data) |
| `user_id` | `people.user_id` |
| `location` | `people.details.location` |
| `source` | `person_emails.source` |
| `globally_bounced` | `emails.status = 'bounced'` |
| `globally_unsubscribed` | `emails.status = 'suppressed'` |
| `suppression_reason` | `emails.metadata.suppression_reason` |
| `suppression_date` | `emails.metadata.suppression_date` |
| `created_at` | `people.created_at` (preserved, not NOW()) |

### Bug Encountered & Fixed
The initial run of `import_contacts_to_crm.py` failed at Phase 7 on `person_organizations` because the script included a `source` field that doesn't exist on that table (it only exists on `person_emails` and `person_phones`). Fixed by:
1. Removing `source` from `person_organizations` junction dicts in the main script
2. Running a one-off fix script (`/tmp/fix_person_orgs.py`) to complete the 29,014 remaining upserts

---

## Post-Migration State

### Production Database Totals

| Entity | Before Migration | After Migration |
|--------|----------------:|----------------:|
| **People** | 16,604 | **48,456** |
| **Emails** | 4,056 | **35,908** |
| **Phones** | 26,438 | **27,593** |
| **Organizations** | 13,046 | **19,365** |
| **person_emails** | 4,106 | **~35,958** |
| **person_phones** | 14,699 | **~18,175** |
| **person_organizations** | 16,772 | **45,786** |

### Data Quality Notes
- **4 duplicate emails** in the contacts table were handled by first-wins dedup
- **727 enriched people** had their tags merged (e.g., a QOZB developer who was also on the investor outreach list now has both `['qozb_contact', 'developer']` tags)
- **210 contacts with user_id** (website signups) had their user_id set on the corresponding `people` record
- **2,630 bounced emails** and **272 unsubscribed emails** had their `emails.status` correctly set

---

## Scripts & Artifacts

### Audit Scripts (read-only, in `oz-doc-processor/contact_merge_scripts/`)

| Script | Purpose |
|--------|---------|
| `audit_email_list_overlap.py` | Compare outreach CSVs against QOZB/FO emails |
| `audit_company_overlap.py` | Compare outreach company names against QOZB/FO orgs |
| `audit_contacts_for_crm_migration.py` | Live analysis of contacts table vs. new CRM schema (uses dual prod/local connections) |

### Import Scripts (in `oz-doc-processor/`)

| Script | Purpose | Target |
|--------|---------|--------|
| `analyze_qozb_contacts/import_qozb_to_crm.py` | Import QOZB property contacts | people, orgs, properties, phones, emails + junctions |
| `contact_merge_scripts/import_family_office_to_crm.py` | Import Family Office contacts | people, orgs, phones, emails, linkedin + junctions |
| `contact_merge_scripts/import_contacts_to_crm.py` | **Import legacy contacts** | people, orgs, phones, emails + junctions |

### Reports (in `oz-doc-processor/contact_merge_scripts/`)

| File | Contents |
|------|----------|
| `email_list_overlap_report.md` | Email overlap audit results |
| `company_overlap_report.md` | Company overlap audit results |
| `contacts_migration_analysis_report.md` | Pre-migration impact analysis |
| `contacts_to_people_mapping.json` | **32,583 mappings** of `contacts.id → {person_id, user_id?}` |

### Database Backup
A production `pg_dump` was taken before migration: `oz-dev-dash/prod_data_only.sql`

---

## Remaining Work

### High Priority

#### 1. Migrate `campaign_recipients` Foreign Keys
The `campaign_recipients` table still references `contacts.id`. It needs:
- Add `person_id` and `email_id` columns (FK to `people` and `emails`)
- Backfill using `contacts_to_people_mapping.json`
- Update application code to use the new FKs
- Eventually drop the `contact_id` column

**Data needed:** The mapping JSON is already saved at `contact_merge_scripts/contacts_to_people_mapping.json`.

#### 2. Rewrite `add_signup_to_contacts()` Trigger
The existing database trigger inserts into the `contacts` table when a new user signs up. It needs to be rewritten to insert into `people` + `emails` + `person_emails` instead.

**Current trigger:** Creates a contact row with `source='website_signup'` and `contact_types=['investor']`.  
**New trigger:** Should create a `people` row + `emails` row + `person_emails` junction.

#### 3. Backfill Activities Table
The `activities` table (from the consolidated CRM plan) needs to be populated with historical campaign activity data. This requires:
- Converting `campaign_recipients` send/open/click/bounce events into activity records
- Deciding on polymorphic vs. separate tables for each outreach modality (discussed but not decided in this session)

### Medium Priority

#### 4. Update Application Code
- CRM UI components (`PeopleTable.tsx`, `CompaniesTable.tsx`) should already work with the new schema
- Any code reading from `contacts` directly needs to be migrated to read from `people` + joins
- The `/admin/prospects` page aggregation logic may need updates

#### 5. Rename/Drop Legacy `contacts` Table
After all consumers are migrated and validated:
1. Rename `contacts` → `contacts_legacy`
2. Monitor for any breakage
3. Eventually drop

#### 6. Email Queue Integration
`email_queue` currently works on `to_email` (text field), so it doesn't need FK changes. However, it could benefit from a `person_id` FK for better tracking.

### Low Priority

#### 7. Manual Org Dedup
The exact-match strategy means some orgs may have near-duplicates (e.g., "Greystar" vs "Greystar LLC"). A future admin tool or script could identify and merge these.

#### 8. Enrich Org Details
Many organizations from the contacts import only have `name` and `org_type`. They could be enriched with details from external sources or manual entry.

---

## Activities Table Design (Open Discussion)

In this session, we discussed but did not resolve whether the `activities` table should be:

**Option A: Single polymorphic table**
- One `activities` table with a `type` column (`email_sent`, `call_made`, `linkedin_message`, etc.)
- Pros: Simple queries, single timeline view, easy to add new types
- Cons: Sparse columns, type-specific fields in JSONB

**Option B: Separate tables per modality**
- `email_activities`, `call_activities`, `linkedin_activities`
- Pros: Strong typing, clear schemas per modality
- Cons: More complex queries for unified timeline, more tables to maintain

This decision is deferred to when the activities backfill work begins.
