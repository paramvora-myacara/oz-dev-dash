---
name: import-new-lists-to-crm-system
description: Use this skill when writing scripts or workflows to import new contact lists (e.g., CSVs, scraped data) into the consolidated CRM. It contains rules for creating core entities (people, organizations), contact points (emails, phones, linkedin), managing junction tables, handling deduplication, and correctly using JSONB metadata vs top-level columns.
---

# CRM Data Import Guidelines

When building scripts to import new lists into the consolidated CRM database, adhere to the following architectural rules:

## 1. Source Tracking & Attribution
- **Do not overwrite `people.details.source`**: This field represents the *genesis list* (the very first list that introduced the human to the database). It should only be set when the `person` row is initially created.
- **Track overlap via Junction Tables**: Attributing a contact to multiple lists is done via the contact endpoints they provide. 
  - E.g., a person already exists from the `family_office` list (so `people.details.source` = 'family_office'). If you later find their phone number in the `qozb` list, do NOT change their `details.source`. Instead, create a `person_phones` junction with `source: 'qozb'`.

## 2. Creating Entities: Required vs. Optional
Maintain strict isolation between the human, their contact methods, and the relationships connecting them.

### A: The Person (The Human Core)
- **Table:** `people`
- **Required:** Only `first_name` and/or `last_name`. A person can exist with no contact methods if only the name is known.
- **Rule:** Never save emails or phones directly on the `people` entity.
- **JSONB `details`:** Use for human-specific, transient attributes that do not belong globally.
  - *Examples*: `alma_mater: "UC Berkeley"`, `last_webinar_attended: "QOZB 101"`, `import_source: "warm_list"`

### B: The Endpoints (Communication Routes)
- **Tables:** `emails`, `phones`, `linkedin_profiles`
- **Required:** Only the value itself (e.g., `number`, `address`, `url`). Created independently of the person.
- **JSONB `metadata`:** Use for technical characteristics of the endpoint, completely ignoring who owns it.
  - *Examples*: Phone `carrier: "Verizon"`, Email `sparkpost_bounce_code: "550"`, LinkedIn `last_scraped_at: "..."`

### C: The Junctions (Contextual Glue)
- **Tables:** `person_emails`, `person_phones`, `person_linkedin`, `person_organizations`
- **Required:** Foreign Keys (e.g., `person_id`, `email_id`).
- **Attributes:** Use fields on these tables to describe the relationship.
  - *Examples*: `is_primary: true`, `label: "work"`, `title: "Managing Director"`, `source: "qozb_import"`

## 3. Data Modeling: Real Columns vs JSONB Details
When mapping new data fields, use the following criteria to decide between adding an `ALTER TABLE` real column vs storing it in a JSONB `details`/`metadata` column:

### Make it a REAL Column if:
1. **It applies universally** to almost all rows (e.g., `first_name`, `address`).
2. **You execute business logic against it** (e.g., `lead_status` controls outreach campaigns, `org_type` controls dashboard filtering).
3. **You sort or deeply group by it frequently.**

### Put it in `details` or `metadata` JSONB if:
1. **It is highly list-specific** (e.g., `Improvement Rating` from QOZB). Adding it as a real column would result in 80% NULLs for non-QOZB records.
2. **It is scraping/enrichment residue** (e.g., `AUM`, `Investment Prefs`). It is useful to render in the UI, but the system isn't running mathematical or conditional logic on it.
3. **It is legacy tracking logic** historically kept for context (e.g., `ticket_type` from old EventBrite CSVs).

**Summary:** Keep the core schema (boxes and arrows linking People ↔ Endpoints ↔ Orgs) strictly normalized, and rely on JSONB for "leaf" data that only needs to be displayed to a human in the UI.
