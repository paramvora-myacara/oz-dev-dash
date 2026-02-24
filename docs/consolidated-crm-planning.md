# Consolidated CRM System: Research & Planning

> **Purpose**: This document captures the complete research, analysis, and architectural planning for consolidating the three separate outreach systems (email campaigns, calling/prospects, LinkedIn automation) into a single unified CRM system. It is the source of truth for all further planning and implementation work.
>
> **Created**: February 24, 2026

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
   - [System 1: Email Outreach (Campaign System)](#system-1-email-outreach-campaign-system)
   - [System 2: Calling Outreach (Prospects System)](#system-2-calling-outreach-prospects-system)
   - [System 3: LinkedIn Outreach (Planned)](#system-3-linkedin-outreach-planned)
   - [Site Event Tracking (oz-homepage)](#site-event-tracking-oz-homepage)
   - [Data Sources Inventory](#data-sources-inventory)
   - [Import Mechanisms](#import-mechanisms)
2. [Key Problems With Current Architecture](#2-key-problems-with-current-architecture)
3. [Off-the-Shelf Solutions Analysis](#3-off-the-shelf-solutions-analysis)
4. [CRM Data Model Comparison](#4-crm-data-model-comparison)
5. [Proposed Data Model](#5-proposed-data-model)
6. [Schema Design Trade-offs](#6-schema-design-trade-offs)
7. [Migration Strategy](#7-migration-strategy)
8. [Unified UI Concept](#8-unified-ui-concept)
9. [Modularity for Future Channels](#9-modularity-for-future-channels)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Open Design Decisions](#11-open-design-decisions)

---

## 1. Current State Analysis

Three completely separate systems exist that don't talk to each other, each built around a different data source and outreach channel.

### System 1: Email Outreach (Campaign System)

**Data sources**: Investor lists (`InvestorsData-29-10-2025_cleaned.csv`), developer lists (`Developers Rows (1).csv`, `developers.csv`), fund lists, warm contacts (webinar attendees, site users).

**Tables**: `contacts`, `campaigns`, `campaign_steps`, `campaign_recipients`, `email_queue`

**Flow**: Contacts are imported via `import_contacts.ts` / `import_warm_contacts.ts` / `import_eventbrite_webinar.ts` into the `contacts` table. Campaigns are created in the UI, contacts are selected as recipients, emails are AI-generated, staged for review, then launched via SparkPost with domain rotation. Replies are detected by the `inbox-sync` service, and multi-step sequences are handled by the `followup-scheduler`.

**Backend services** (ozl-backend, Python):
- `campaign-runner` -- Polls `email_queue`, sends via SparkPost. Batch processing (20/batch), working hours enforcement (9am-5pm Pacific), JIT AI generation for empty bodies, circuit breaker (pauses after 10 consecutive errors), 30-domain rotation.
- `followup-scheduler` -- Polls `campaign_recipients.next_email_at`, creates new `email_queue` entries for next steps based on step edge delays.
- `inbox-sync` -- Polls Gmail every 15 minutes, matches replies via threading headers (In-Reply-To, References, X-Google-Original-Message-ID) against `email_queue.thread_id` or `sparkpost_message_id`. Updates `campaign_recipients` to `replied`, cancels queued emails, sends Slack notification.

#### Database Schema: Email System

**`campaigns`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| name | TEXT, NOT NULL | |
| email_format | TEXT | DEFAULT 'text', CHECK: 'html' or 'text' |
| status | TEXT | DEFAULT 'draft'. Values: draft, staged, scheduled, sending, completed, paused, cancelled |
| total_recipients | INTEGER | DEFAULT 0 |
| sender | TEXT, NOT NULL | CHECK: 'todd_vitzthum' or 'jeff_richmond' |
| entry_step_id | UUID, FK → campaign_steps.id | If set, campaign is a sequence |
| exit_conditions | JSONB | DEFAULT: `{"reply": true, "unsubscribe": true, "bounce": true, "spamComplaint": true}` |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**`campaign_steps`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| campaign_id | UUID, FK → campaigns.id | CASCADE DELETE |
| name | TEXT | DEFAULT 'Email Step' |
| subject | JSONB | DEFAULT `{"mode": "static", "content": ""}` |
| sections | JSONB | DEFAULT `[]` |
| edges | JSONB | DEFAULT `[]`. Graph edges for sequence flow. `[{targetStepId, delayDays, delayHours, delayMinutes, condition}]` |
| step_order | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**`campaign_recipients`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| campaign_id | UUID, FK → campaigns.id | CASCADE DELETE |
| contact_id | UUID, FK → contacts.id | CASCADE DELETE |
| selected_email | TEXT | Specific email chosen for this campaign |
| status | TEXT | DEFAULT 'selected'. Values: selected, queued, sent, bounced, etc. |
| metadata | JSONB | DEFAULT `{}` |
| sent_at | TIMESTAMPTZ | |
| current_step_id | UUID, FK → campaign_steps.id | Current position in sequence |
| next_step_id | UUID, FK → campaign_steps.id | Next target in sequence |
| next_email_at | TIMESTAMPTZ | Next scheduled email time |
| exit_reason | TEXT | completed, replied, unsubscribed, bounced, spam_complaint, manual |
| replied_at | TIMESTAMPTZ | |
| reply_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | |

UNIQUE(campaign_id, contact_id)

**`email_queue`**
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL, PK | |
| to_email | TEXT, NOT NULL | |
| subject | TEXT, NOT NULL | |
| body | TEXT, NOT NULL | Can be empty for JIT generation |
| from_email | TEXT | Set at launch |
| domain_index | INTEGER | 0-29, set at launch |
| delay_seconds | INTEGER, NOT NULL | |
| status | TEXT | DEFAULT 'queued'. Values: staged, queued, processing, sent, failed |
| metadata | JSONB | Recipient data |
| campaign_id | UUID, FK → campaigns.id | |
| is_edited | BOOLEAN | DEFAULT false |
| scheduled_for | TIMESTAMPTZ | NULL for staged, set at launch |
| sent_at | TIMESTAMPTZ | |
| error_message | TEXT | |
| thread_id | UUID | DEFAULT gen_random_uuid(). For email threading |
| step_id | UUID, FK → campaign_steps.id | Link to specific step |
| sparkpost_message_id | TEXT | For reply threading |

**`contacts`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| email | TEXT, NOT NULL, UNIQUE | |
| name | TEXT | |
| company | TEXT | |
| role | TEXT | |
| location | TEXT | |
| source | TEXT | Origin file name |
| phone_number | TEXT | |
| details | JSONB | DEFAULT `{}` |
| contact_type | TEXT | DEFAULT 'developer'. Legacy column |
| contact_types | TEXT[] | DEFAULT ARRAY['developer']. Modern array column |
| user_id | UUID, FK → auth.users.id | Links to authenticated website users |
| globally_bounced | BOOLEAN | |
| globally_unsubscribed | BOOLEAN | |
| suppression_reason | TEXT | |
| suppression_date | TIMESTAMPTZ | |
| search_vector | tsvector | GENERATED. Full-text search on name, email, company, location |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### Email System UI Pages

- `/admin/campaigns` -- Campaign list with 7-day schedule, capacity tracking, summary stats
- `/admin/campaigns/new` -- Campaign creation wizard
- `/admin/campaigns/[id]` -- Campaign editor (4-step: Design → Contacts → Preview → Launch). Features: AI email content editor, subject line generation, contact selection, email preview/validation, staged email review/editing, test email sending, domain rotation launch, failed email retry, SparkPost metrics summary.
- `/admin/campaigns/contacts` -- Contact management with advanced filtering (location, source, contact types, campaign history, email status, tags, lead status, website events). Contact detail panel with 360° view and campaign history.
- `/admin/inbox` -- IMAP email fetching, reply viewing, reply sending.

#### Email System API Routes (oz-dev-dash → ozl-backend proxy)

All campaign routes proxy from oz-dev-dash (`/api/backend-proxy/campaigns/*`) to ozl-backend (`/api/v1/campaigns/*`):
- Campaign CRUD, generate emails, launch, retry-failed, test-send, generate-subject, preview
- Steps CRUD (list, create, batch replace)
- Emails CRUD (list, get, update, delete)
- Recipients (list, add)
- Webhooks: SparkPost (`/api/webhooks/sparkpost`) -- handles bounce, unsubscribe, delivery, spam_complaint
- Contact profile: `GET /api/contacts/[id]/profile` -- 360° view with website events, campaign history
- Inbox: `GET /api/inbox`, `GET /api/inbox/[uid]`, `POST /api/inbox/reply`

#### Email Infrastructure

- **Provider**: SparkPost API
- **Domains**: 30 domains for rotation (e.g., `connect-ozlistings.com`, `engage-ozlistings.com`)
- **Senders**: Todd Vitzthum or Jeff Richmond
- **Threading**: UUID-based `thread_id` embedded in Message-ID
- **AI generation**: Groq API (model: `moonshotai/kimi-k2-instruct-0905`), variable replacement (`{{FirstName}}`, `{{Company}}`, etc.)
- **Scheduling**: 3.5 min interval between emails per domain, random 0-30s jitter, weekends skipped

---

### System 2: Calling Outreach (Prospects System)

**Data source**: QOZB Development Projects CSV (`All QOZB Development Projects USA - 20260126.xlsx - Results.csv`, ~21,287 rows of property + contact data).

**Tables**: `prospects`, `prospect_phones`, `prospect_calls`, `linkedin_search_results`

**Flow**: QOZB properties are imported via `import-prospects.ts` + `migrate-prospect-phones.ts` into `prospects` and `prospect_phones`. The UI is phone-number-centric -- users (Jeff, Todd, Michael, Param, Aryan) see a queue of phone numbers, acquire a lock, call, log the outcome, and optionally trigger a follow-up email via Gmail API.

**Backend**: No separate backend service. All logic lives in oz-dev-dash API routes. Uses Supabase Realtime for live updates.

#### Database Schema: Calling System

**Enum: `prospect_call_status`**
Values: new, called, answered, no_answer, invalid_number, follow_up, closed, rejected, do_not_call, locked, pending_signup

**Enum: `linkedin_automation_status`**
Values: search_pending, searching, search_complete, search_failed, connection_pending, connecting, invited, failed

**`prospects`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| property_name | TEXT, NOT NULL | |
| market | TEXT | |
| submarket | TEXT | |
| address | TEXT | |
| city | TEXT | |
| state | TEXT | |
| zip | TEXT | |
| phone_numbers | JSONB | DEFAULT `[]`. Array of phone objects (legacy) |
| call_status | prospect_call_status | DEFAULT 'new' |
| lockout_until | TIMESTAMPTZ | |
| follow_up_at | TIMESTAMPTZ | |
| last_called_at | TIMESTAMPTZ | |
| last_called_by | TEXT | |
| viewing_by | TEXT | Optimistic locking |
| viewing_since | TIMESTAMPTZ | |
| extras | JSONB | DEFAULT `{}` |
| search_vector | tsvector | GENERATED |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(property_name, address)

**`prospect_phones`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| prospect_id | UUID, FK → prospects.id | CASCADE DELETE |
| phone_number | TEXT, NOT NULL | |
| labels | TEXT[] | DEFAULT `{}` |
| contact_name | TEXT | |
| contact_email | TEXT | |
| entity_names | TEXT | |
| entity_addresses | TEXT | |
| call_status | prospect_call_status | DEFAULT 'new' |
| lockout_until | TIMESTAMPTZ | |
| follow_up_at | TIMESTAMPTZ | |
| last_called_at | TIMESTAMPTZ | |
| last_called_by | TEXT | |
| call_count | INT | DEFAULT 0 |
| viewing_by | TEXT | |
| viewing_since | TIMESTAMPTZ | |
| linkedin_url | TEXT | |
| extras | JSONB | DEFAULT `{}` |
| search_vector | tsvector | GENERATED |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(prospect_id, phone_number)

**`prospect_calls`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| prospect_id | UUID, FK → prospects.id | CASCADE DELETE |
| prospect_phone_id | UUID, FK → prospect_phones.id | |
| caller_name | TEXT, NOT NULL | |
| outcome | prospect_call_status, NOT NULL | |
| phone_used | TEXT | |
| email_captured | TEXT | |
| email_status | TEXT | |
| email_error | TEXT | |
| email_template | TEXT | |
| email_message_id | TEXT | |
| linkedin_status | linkedin_automation_status | |
| linkedin_url | TEXT | |
| linkedin_error | TEXT | |
| called_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**`linkedin_search_results`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| prospect_phone_id | UUID, FK → prospect_phones.id | CASCADE DELETE |
| call_log_id | UUID, FK → prospect_calls.id | CASCADE DELETE |
| profile_url | TEXT, NOT NULL | |
| profile_name | TEXT | |
| profile_title | TEXT | |
| profile_company | TEXT | |
| profile_location | TEXT | |
| profile_image_url | TEXT | |
| search_query | TEXT, NOT NULL | |
| rank | INTEGER, NOT NULL | |
| selected | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | |

**Database Function: `get_unique_prospect_phones()`**
Aggregates prospect phones with filtering, pagination, and sorting. Returns one row per unique phone number with best representative ID. Handles filtering by search, state, status, roles, min_properties.

#### Calling System UI

- `/admin/prospects` -- Main dashboard with 3 tabs:
  - **Prospects tab**: Main calling queue. User auth (Jeff, Todd, Michael, Param, Aryan), password-protected. Real-time updates via Supabase subscriptions. Advanced filtering. Prospect detail sheet with call history. Call logging modal. Add contact modal (property mode or entity mode). Pagination (50/page).
  - **LinkedIn Queue tab**: LinkedIn automation queue.
  - **Leaderboard tab**: Caller performance stats.

#### Calling System API Routes (all in oz-dev-dash)

- `GET /api/prospects` -- List with filtering
- `POST /api/prospects` -- Create (property or entity mode)
- `POST /api/prospects/[id]/call` -- Log call (legacy)
- `POST/DELETE /api/prospects/[id]/lock` -- Lock management
- `GET /api/prospect-phones` -- Aggregated phones (uses RPC function)
- `POST /api/prospect-phones/[id]/call` -- Log call
- `GET /api/prospect-phones/[id]` -- Detailed data
- `POST/DELETE /api/prospect-phones/[id]/lock` -- Lock management
- `GET /api/prospect-phones/check` -- Check phone number
- `GET /api/call-history` -- Call history
- `POST /api/follow-up-email` -- Send follow-up (Gmail API, templates based on outcome)

#### Calling Data Flow

1. **Prospect creation**: Property mode creates `prospect` → `prospect_phone`. Entity mode finds/creates shadow properties → `prospect_phone` records for all properties with same entity name.
2. **Call logging**: Acquire lock → Log call (`prospect_calls` record) → Update `prospect_phones` (call_status, last_called_at, etc.) → Release lock → Trigger follow-up email if eligible (pending_signup, no_answer, invalid_number).
3. **Follow-up emails**: Templates based on outcome, sent via Gmail API (`sendGmailEmail`), tracked in `prospect_calls.email_status`.
4. **Real-time**: Supabase Realtime subscriptions on `prospect_phones` and `prospect_calls`. Lock status updates in real-time.

---

### System 3: LinkedIn Outreach (Planned)

**Data source**: Family Office Database (`USA_Family_Office_Consolidated.csv`, ~2,865 records).

**Status**: Partially implemented. The `linkedin-automation` service exists in ozl-backend (TypeScript/Node.js, Browserbase/Playwright/Stagehand). The database tables (`family_office_firms`, `family_office_contacts`, `linkedin_tasks`) are designed but **not yet created**. A mock UI exists at `/admin/linkedin`.

**Documentation**: `docs/linkedin_outreach_implementation.md`

#### Planned Database Schema: LinkedIn System

**`family_office_firms`** (NOT YET CREATED)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| name | TEXT, indexed | |
| website | TEXT | |
| aum | TEXT | |
| investment_prefs | TEXT | |
| about_company | TEXT | |
| company_email | TEXT | Stored at firm level (98.6% consistency per analysis) |
| category | TEXT | 'SF' or 'MF' |
| year_founded | TEXT | |
| city, state, country | TEXT | |
| status | ENUM | active, blocked, replied |

**`family_office_contacts`** (NOT YET CREATED)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| firm_id | UUID, FK → family_office_firms.id | |
| first_name, last_name | TEXT | |
| title | TEXT | |
| linkedin_url | TEXT | Deduplication key |
| personal_email | TEXT | |
| phone_number | TEXT | |
| alma_mater | TEXT | |
| linkedin_rich_details | TEXT | |

**`linkedin_tasks`** (NOT YET CREATED)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID, PK | |
| source_id | UUID | Links to contacts/prospects |
| source_type | TEXT | 'family_office_contacts', 'prospect_calls', 'contacts' |
| firm_id | UUID, FK | For rotation logic |
| message | TEXT | Pre-generated personalized message |
| status | ENUM | pending, queued, connecting, invited, failed, stopped |
| account_name | TEXT | 'Jeff' or 'Todd' |
| executed_at | TIMESTAMPTZ | |

#### Planned LinkedIn Workflow

1. **Selection phase (6:00 PM daily)**: Cron job triggers `BatchService.ts`. Two-pass algorithm: Pass 1 = firms with zero historical records (one contact per firm). Pass 2 = firms with outreach older than 14 days. Generates personalized messages. Creates `linkedin_tasks` with `status='queued'`.
2. **Review phase (6:00 PM - 6:30 PM)**: UI displays "Tonight's Batch" for review. Messages are read-only.
3. **Execution phase (6:30 PM)**: Automation service processes queued tasks. Uses `FOR UPDATE SKIP LOCKED` for concurrency. Sends connection requests via Browserbase. Updates status.
4. **Daily limits**: 20 requests per account per day. One person per firm per day globally.

#### Existing LinkedIn Components

- `linkedin_search_results` table (exists, used by calling system)
- LinkedIn status tracking in `prospect_calls` table
- LinkedIn URL storage in `prospect_phones` table
- API: `GET /api/linkedin/search-results?callId=...`, `POST /api/linkedin/retry`
- Backend: `services/linkedin-automation/` -- TypeScript/Node.js, Browserbase, Playwright/Stagehand, node-cron
- UI: `LinkedInQueue` tab in prospects page, mock `/admin/linkedin` page

---

### Site Event Tracking (oz-homepage)

**Tables**: `user_events`, `user_attribution`

#### Tracking Mechanisms

Two tracking systems in oz-homepage:

1. **`useEventTracker` hook** (`src/hooks/useEventTracker.ts`) -- Listing-specific events on `/listings/*` pages. Types: `request_vault_access`, `page_view`, `contact_developer`.

2. **`trackUserEvent` function** (`src/lib/analytics/trackUserEvent.js`) -- Site-wide. Requires authenticated session. Auto-includes current path in metadata.

All events stored in Supabase `user_events` table:
```
user_events:
  - id (PK)
  - user_id (FK to auth.users)
  - event_type (string)
  - metadata (JSONB)
  - endpoint (string, URL path)
  - created_at (timestamp)
```

Attribution tracking via `/api/attribution`:
```
user_attribution:
  - user_id (PK, FK to auth.users)
  - utm_source, utm_medium, utm_campaign, utm_term, utm_content
  - initial_utm_* (first touch)
  - initial_referrer, last_referrer
  - initial_landing_page_url
  - visits (integer)
  - last_synced_at (timestamp)
```

#### Event Types Tracked

- **Listing events**: listing_clicked, listing_inquiry_started, listing_inquiry_submitted, viewed_listings
- **Vault access**: request_vault_access (with hasSignedCA metadata)
- **Developer contact**: contact_developer (with developer email)
- **Webinar events**: webinar_page_viewed, webinar_registration_click, webinar_scroll_to_final_cta, webinar_scroll_to_recording, webinar_watch_replay_click
- **OZ checking**: oz_check_performed, oz_check_completed
- **Tax calculator**: tax_calculator_used, tax_calculator_button_clicked
- **Community**: community_interest_expressed
- **Book**: book_purchase_click, book_lead_magnet_click
- **Developer page**: developers_page_cta_clicked, oz_check_button_clicked
- **Page views**: page_view (on sign-in)

#### Integration Points

- All events in Supabase `user_events` table (same database as oz-dev-dash)
- `contacts.user_id` FK to `auth.users.id` links contacts to website users
- Trigger `add_signup_to_contacts()` auto-creates contact when someone signs up on website
- `user-event-processor` service (ozl-backend) picks up events and sends Slack notifications
- No external analytics integration (no active GA/Mixpanel/etc.)
- The `contacts/[id]/profile` API already pulls in website events for the contact 360° view

#### Admin Events

`admin_events` table:
```
admin_events:
  - id (UUID, PK)
  - event_type (string)
  - payload (JSONB)
  - status (pending, processed, failed)
  - processed_at (timestamp)
  - created_at (timestamp)
```

Types processed by user-event-processor: `developer_signup`, `campaign_launched`, `listing_created`, `reply_received`, `request_vault_access`, `contact_developer`, `qozb_support_requested`.

---

### Data Sources Inventory

All source data lives in `/Users/aryanjain/Documents/OZL/UsefulDocs/`.

#### Outreach-Lists/

| File | Schema | Purpose | Row Count |
|------|--------|---------|-----------|
| InvestorsData-29-10-2025.csv & _cleaned.csv | name, email, phone_number, role, company, location, source, details | Investor contacts with JSON details | Thousands |
| Investor-List-1-9-26.csv | Name, Email, Phone Number, Role, Company, Location, Source, Details | More recent investor list (Jan 9, 2026) | |
| developers.csv | Name, Email, Phone Number, Role, Company, Location, Source, Details | Developer contacts | Hundreds |
| Developers Rows (1).csv | name, email, phone_number, role, company, location, source, details | Developer list with OZ property details (ZIP, City, State, Units, etc.) | Hundreds |
| funds.csv | Name, Email, Phone Number, Role, Company, Location, Source, Details | OZ funds | ~237 |
| CapMatch Funds Rows.csv | name, email, phone_number, role, company, location, source, details | Funds from CapMatch/opportunity-funds-listing | |
| GHL-Chris-Dec-Dump.csv | Contact Id, First Name, Last Name, Name, Phone, Email, Created, Last Activity, Tags | GoHighLevel contact dump | |
| OZL-Chris-n8n-extracted.csv | name, email, phone_number, role, company, location, source, details | n8n-extracted leads with profile analysis and email sequences | |
| OZL-Chris-n8n-leads.csv | first_name, last_name, phone_number, company, location, title, industry, linkedin_URL, company_website, profile, email, 1st-3rd email subject/body, sent status, replied, sentiment, lead_type | Structured leads with email campaign tracking | |
| overlapping_contacts_with_header.csv | name, email, phone_number, role, company, location, source, details | Consolidated overlapping contacts | ~1,700 |
| EventbriteWebinar-Alden-Attendees_*.csv | Order details, attendee info, event details, ticket info | Eventbrite webinar attendees | |

#### Outreach-Lists/WarmList/

| File | Purpose | Rows |
|------|---------|------|
| final_warm_contacts_merged.csv | Merged warm contacts from all webinar sources | ~415 |
| unified_warm_list.csv | Unified warm contact list | ~312 |
| OZ Listings Users Rows.csv / _clean.csv | Platform user exports | ~180 / ~143 |
| EventBriteWebinars.csv | Eventbrite attendees | ~175 |
| Alden-OfficeHr1-.csv | Specific Alden webinar attendees | ~59 |
| FamilyOffices.csv, Legal101.csv, OZUnlocked.csv, Recap.csv, TaxCliff.csv | Webinar registration reports | 65-126 each |

#### FamilyOfficeDatabase-Lists/

| File | Purpose | Rows |
|------|---------|------|
| USA_Family_Office_Consolidated.csv | **MASTER LIST**. Merged from all sources. | 2,865 |
| USA Family Office.csv | Original master before Real Estate merge | 2,759 |
| Multifamily-Office-USAFilter.csv | MFO subset (100% contained in master) | ~1,520 |
| Single-Family-USAFilter.csv | SFO subset (100% contained in master) | ~1,241 |
| RealEstate-SFO-MFO-USAFilter.csv | Real estate-focused FOs (69 new contacts) | ~1,155 |

Family Office CSV schema: `# of Firms, Firm Name, Contact First Name, Contact Last Name, Contact Title/Position, Phone Number, Personal Email Address, Company Email Address, Company Street Address, City, State/Province, Postal/Zip Code, Country, Region, Alma Mater, LinkedIn Profile, Company's Areas of Investments/Interest, Year Founded, AUM, Secondary Email, LinkedIn Rich Details, Deep Search, Additional Company/Contact Information, Website, About Company, Category`

MERGE_STRATEGY.md: Master = Multifamily + Single-Family. Real Estate list added 69 new contacts and 36 conflicting records (master data prioritized).

#### QOZB-Contacts/

| File | Purpose | Rows |
|------|---------|------|
| All QOZB Development Projects USA - 20260126.xlsx - Results.csv | Comprehensive QOZB development projects with contact info for Trustees, Owners, Special Servicers, Managers | ~21,287 |

QOZB CSV schema: `Market, Submarket, PropertyID, Property Name, Address, City, County, State, ZIP, Phone Number, Property Special Status, Units, SqFt, Completion Date, Impr. Rating, Loc. Rating, [Trustee/Owner/Special Servicer/Manager] Contact First Name, Last Name, Email, Address, City, State, ZIP, Country, Phone Number, Website, Latitude, Longitude`

---

### Import Mechanisms

All import scripts live in oz-dev-dash.

| Script | Target Table | Source | Dedup Key |
|--------|-------------|--------|-----------|
| `scripts/import_contacts.ts` | contacts | Any CSV with contact fields | email (upsert on conflict) |
| `scripts/import_warm_contacts.ts` | contacts | Merged warm contacts CSV | email (upsert), sets lead_status='warm' |
| `scripts/import_eventbrite_webinar.ts` | contacts | Eventbrite export CSV | email, sets contact_types=['investor'], lead_status='warm' |
| `scripts/prospect-management/import-prospects.ts` | prospects | QOZB CSV | property_name + address |
| `scripts/prospect-management/migrate-prospect-phones.ts` | prospect_phones | prospects.phone_numbers JSONB | prospect_id + phone_number |
| `scripts/prospect-management/run-pipeline.ts` | prospects + prospect_phones | QOZB CSV | Orchestrates import + migration |
| `scripts/export_family_office_contacts.ts` | CSV output | contacts (family-office tags) | Export only |

No family office import script exists yet (planned `import_family_offices.ts` not built).

No cross-system deduplication exists. Each import has its own dedup logic.

#### Data Analysis Work (oz-doc-processor/contact_merge_scripts/)

Scripts that analyzed the Family Office data before import:

- **check_company_email.py**: Found 98.6% of firms (362/367) share the same company email across contacts. Supports storing company_email at firm level.
- **check_duplicate_contacts.py**: Found firm name variations (e.g., "Pathstone" vs "Pathstone Family Office, LLC") containing different individuals.
- **check_duplicate_linkedin.py**: Found 76 duplicate LinkedIn URLs and 39 duplicate name+firm combinations. Import must deduplicate at linkedin_url level.
- **find_fuzzy_duplicate_firms.py**: Found 16 potential duplicate groups. Blind regex dedup is risky (false positives like "Acadia Family Office" [MD] vs "Acadia Management Co. Inc." [MA]).
- **resolve_conflicting_emails.py**: Identified 5 firms with conflicting emails (variations like `info@` vs individual emails).
- **perform_merge.py**: Merges USA Family Office + RealEstate CSVs using composite key (Firm Name, First Name, Last Name, Company Email).
- **check_superset.py**: Compares multiple CSV files for overlap.
- **audit_all_emails.py**: Audits CSV emails against existing Supabase contacts table.
- **count_companies.py**: Basic statistics on firm distribution.

Key conclusions:
- Store company_email at firm level (98.6% consistency)
- Deduplicate by linkedin_url to prevent messaging same person/company page multiple times
- Keep exact Firm Name matches as distinct firms (avoid fuzzy merging due to false positives)

---

### Other Relevant Tables

**`admin_events`** -- Event queue for system events, processed by user-event-processor for Slack notifications.

**`processor_state`** -- Tracks last processed time for the user-event-processor service.

**`listings`** -- Referenced by user-event-processor for developer contact events.

**`oz_webinars`** -- Webinar data (slug, title, description, banner, recording link, start/end time).

### Backend Architecture (ozl-backend)

6 microservices, all Docker Compose:
1. **api** (FastAPI) -- Main REST API, port 8000
2. **campaign-runner** (Python) -- Email sending worker
3. **followup-scheduler** (Python) -- Follow-up email scheduling
4. **inbox-sync** (Python) -- Gmail reply detection
5. **user-event-processor** (Python) -- Slack notifications, auto-intro emails
6. **linkedin-automation** (TypeScript/Node.js) -- LinkedIn connection automation

**Caddy** reverse proxy routes `/api/*` to api:8000.

**Shared library** (`shared-lib/ozl_shared`): db, config, email_sender (SparkPost), email_renderer, prompts (Groq AI), scheduling, gmail_sender, admin_events.

---

## 2. Key Problems With Current Architecture

### Problem 1: Three separate identity models for "a person"

- **`contacts`**: `email` as UNIQUE key. Stores name, company, role, location, source. Used for email campaigns.
- **`prospect_phones`**: `phone_number` as identifier (within a prospect). Stores contact_name, contact_email, entity info. Used for calling.
- **Planned `family_office_contacts`**: `linkedin_url` as dedup key. Stores first/last name, title, personal email. Used for LinkedIn.

The same person (e.g., a family office principal who is also a QOZB property owner) could exist as three separate records with no link between them.

### Problem 2: Property data pollutes the person model

The `prospects` table mixes property data (market, submarket, address, city, state, zip) with outreach state (call_status, lockout_until, follow_up_at). `prospect_phones` is the actual "person" being reached but is modeled as a child of a property rather than a first-class entity.

### Problem 3: No unified activity history

Email activities → `campaign_recipients` + `email_queue`. Call activities → `prospect_calls`. LinkedIn activities → would be in `linkedin_tasks`. No single timeline showing: "We emailed this person, they didn't respond, then we called them, and now we want to connect on LinkedIn."

### Problem 4: No shared contact deduplication

Each import script has its own dedup logic: `import_contacts.ts` upserts on email, `import-prospects.ts` upserts on property_name+address, planned LinkedIn import deduplicates on linkedin_url. No cross-system dedup exists.

### Problem 5: Adding new channels requires building from scratch

Every new outreach method (WhatsApp, direct mail, text, etc.) would require new tables, new API routes, new UI pages, and new import scripts -- a full parallel system.

---

## 3. Off-the-Shelf Solutions Analysis

### Options Evaluated

#### Major Paid CRMs

| Solution | Data Model | Stack | Price | Fit |
|----------|-----------|-------|-------|-----|
| **Salesforce** | Lead/Contact/Account/Opportunity/Activity | Proprietary | $25-150/user/mo | Overkill. Enterprise complexity for a small team. |
| **HubSpot** | Contact/Company/Deal/Ticket/Engagement | Proprietary | Free-$20+/user/mo | Good contact model, but built-in email/calling won't replace custom SparkPost/Gmail systems. |
| **Attio** | People/Companies/Custom Objects/Lists | Proprietary | Free (3 users), $29/user/mo Pro | Most interesting modern option. Flexible object model, good API. But still a separate system to sync with. |
| **folk** | Contacts/Companies | Proprietary | Paid | Too simple. Personal CRM, not outreach automation. |

#### Open Source Self-Hosted CRMs

| Solution | Data Model | Stack | Fit |
|----------|-----------|-------|-----|
| **Twenty** (~40K GitHub stars) | People/Companies/Opportunities/Notes/Tasks + Custom Objects | TypeScript, Next.js, NestJS, PostgreSQL | Closest stack match. Modern UI. But uses its own PostgreSQL, not Supabase. Would lose Realtime, Auth, Edge Functions. |
| **Atomic CRM** | Contacts/Companies/Deals/Notes/Tasks | React, react-admin, Supabase | Built on Supabase (same DB!). But lightweight (~15K LOC), basic features, react-admin framework differs from our Next.js app. |
| **EspoCRM** | Salesforce-like | PHP | Mature but old tech. Poor stack alignment. |
| **SuiteCRM / Odoo** | Salesforce-like | PHP | Enterprise-grade, heavy. Poor stack alignment. |

### Requirements Matrix

| Requirement | Salesforce | HubSpot | Attio | Twenty | Atomic CRM | Custom Build |
|---|---|---|---|---|---|---|
| Unified people list | Yes | Yes | Yes | Yes | Yes | Yes |
| Multi-channel contact methods | Yes | Yes | Yes | Partial | No | Yes |
| Email campaigns (SparkPost, 30 domains, AI gen) | No | No | No | No | No | **Already built** |
| Calling UI (real-time locks, Supabase) | No | Partial | No | No | No | **Already built** |
| LinkedIn automation (Browserbase) | No | No | No | No | No | **Already built** |
| Site event tracking integration | Via API | Via API | Via API | Via API | Possible | **Already built** |
| Supabase auth integration | No | No | No | No | Yes | **Already built** |
| Activity timeline | Yes | Yes | Yes | Yes | Yes | Needs building |
| Custom properties (real estate) | Yes | Yes | Yes | Yes | No | Yes |
| Modular new channels | Via apps | Via apps | Via API | Custom objects | Fork | Yes |

### Why Buy Doesn't Work

The three most complex and valuable systems -- SparkPost email campaigns with AI generation and domain rotation, real-time calling UI with Supabase subscriptions, and Browserbase LinkedIn automation -- are **execution-layer systems** that no CRM provides. They are deeply integrated with Supabase (real-time subscriptions, shared auth, triggers).

If you adopted a CRM like Twenty or Attio:
1. You'd run the CRM alongside existing systems
2. You'd need **bidirectional sync** between the CRM and Supabase tables
3. Campaign/calling/LinkedIn systems would still live in your codebase, reading from Supabase
4. The CRM becomes an **extra synchronization layer** that adds complexity rather than reducing it

**Attio as a view layer**: API is good enough to sync data to and use as a read-only UI. But at $29/user/month with a growing team, cost adds up. And you lose tight Supabase Realtime integration.

**Twenty as a framework (fork it?)**: TypeScript/Next.js matches our stack, but it uses its own PostgreSQL with metadata-driven schema, not Supabase. Porting existing code into Twenty's framework would be more work than building the consolidated CRM view from scratch.

**Atomic CRM as starting point**: Built on Supabase (same database!), but uses react-admin framework. Adopting it means rebuilding campaign editor, calling UI, LinkedIn queue in a different framework. Lateral move, not forward progress.

### Conclusion: Build Custom

The hard parts are already built. What's missing is the **unifying layer** -- the consolidated people model and the 360-degree view. That's a focused project.

---

## 4. CRM Data Model Comparison

### Industry Standard Models

#### Salesforce (the grandfather)

```
Lead ──(conversion)──> Contact ──> Account
                           │           │
                           └─── Opportunity ───> Activity (Task/Event)
```

- **Lead/Contact split**: Leads are unqualified, Contacts are qualified. Conversion is a first-class operation. Designed for large teams with SDR → AE handoff.
- **Account** = company. Contacts belong to Accounts.
- **Opportunity** = deal with dollar value moving through pipeline stages.
- **Activity** = Tasks (to-dos) and Events (meetings/calls), attached to any entity via polymorphic relationships (TaskRelation, EventRelation).

#### HubSpot (simplified Salesforce)

```
Contact ──> Company
    │
    └─── Deal ───> Engagement (email/call/meeting/note)
```

- **No Lead/Contact split**. Single Contact object with `lifecycle_stage` field (subscriber → lead → MQL → SQL → opportunity → customer → evangelist). Simpler, avoids awkward "conversion" step.

#### Attio (modern flexible)

```
People ──> Companies
   │
   └─── Lists (flexible groupings)
   │
   └─── Custom Objects (anything)
```

- **Everything is an Object with Attributes**. People and Companies are built-in objects. Custom objects for anything. Lists model processes (like a "Call Queue" list or "LinkedIn Batch" list).
- Objects, Attributes, Records, Lists as four foundational concepts.

#### Twenty (open source modern)

```
People ──> Companies
   │
   └─── Opportunities
   │
   └─── Notes, Tasks
```

- Standard objects: People, Companies, Opportunities, Notes, Tasks.
- Metadata-driven custom objects via API.
- Field types: Text, Email, Phone, Address, Date, Number, Currency, Boolean, Select, Multi-Select, Rating, Links, Domain, Array, Relation, JSON.

### How Our Proposed Model Compares

#### Alignment with industry:
- **Single People entity (no Lead/Contact split)**: Same as HubSpot, Attio, Twenty. Modern consensus. Lead/Contact split only needed for large teams with formal SDR→AE handoff. With a small team doing multi-channel outreach, a `lead_status` field is simpler and equivalent.
- **Organizations as separate entity**: Universal (Account in Salesforce, Company everywhere else). Standard and correct.
- **Unified activity timeline**: Universal. Salesforce has Activities, HubSpot has Engagements, Attio has timeline entries, Twenty has timeline events. Polymorphic `activity_type` discriminator is the standard pattern.
- **Properties as domain-specific entity**: Standard CRMs handle this via custom objects. We make it first-class because it's core to our business.

#### Divergences from industry (and why):

1. **`contact_methods` as a separate normalized table**: Standard CRMs store email/phone as fields on the Contact record (with multi-value support). We need a separate table because we track **status and metadata per contact method per channel** (this email bounced via SparkPost, this phone is invalid, this LinkedIn URL is a company page). Standard CRMs track bounce status within their own email system -- they don't need to synchronize across SparkPost, Gmail API, and Browserbase.

2. **Channel-specific queue tables**: Doesn't exist in standard CRMs. They have built-in email/calling/social. We need execution queues because we have custom automation layers (SparkPost domains, Browserbase LinkedIn, custom calling UI).

3. **No Deals/Opportunities table**: Every standard CRM has this. Not proposed because current system doesn't track pipeline value or deal stages. Trivially addable later.

---

## 5. Proposed Data Model

### Core Principle: People-First, Contact Entities as First-Class

Instead of organizing by outreach channel, organize around **people** and **organizations**, with contact points (phones, emails, LinkedIn profiles) as independent entities linked via junction tables. This allows multiple people to share a phone number, one person to have multiple emails, and status tracking at both the entity level ("this phone is disconnected") and the relationship level ("this is John's primary phone").

### Entity Relationship Overview

```
organizations ◄──── person_organizations ────► people
                                                 │
                          ┌──────────────────────┼──────────────────────┐
                          │                      │                      │
                   person_phones          person_emails          person_linkedin
                          │                      │                      │
                       phones                 emails           linkedin_profiles

people ──── person_properties ────► properties

people ──── activities (email_id, phone_id, linkedin_id FKs)
                │
           campaigns ──── campaign_recipients (email_id FK)
                │
           email_queue (existing)
           linkedin_queue (new)

people ──── user_events (via user_id)
```

### Layer 1: Core Entities

```sql
-- The central entity: a person you might interact with
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    first_name TEXT,
    last_name TEXT,
    display_name TEXT GENERATED ALWAYS AS (
        COALESCE(first_name || ' ' || last_name, first_name, last_name)
    ) STORED,

    -- Classification
    lead_status TEXT DEFAULT 'new',  -- new, warm, hot, customer, lost, do_not_contact
    tags TEXT[] DEFAULT '{}',

    -- Source tracking
    sources TEXT[] DEFAULT '{}',  -- e.g., ['qozb_csv', 'family_office_db', 'website_signup']

    -- Link to authenticated website user (if they've signed up)
    user_id UUID REFERENCES auth.users(id),

    -- Flexible metadata
    details JSONB DEFAULT '{}',

    -- Search (name only; email/phone search handled via cross-table query function)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            COALESCE(first_name, '') || ' ' ||
            COALESCE(last_name, '')
        )
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Contact Point Entities ═══
-- Each contact method is a first-class entity with its own status lifecycle.
-- Multiple people can share a phone number (common in QOZB data).
-- One person can have multiple emails. Junction tables link them.

CREATE TABLE phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,       -- normalized: digits only
    display_number TEXT,               -- formatted: "(212) 555-0100"
    status TEXT DEFAULT 'active',      -- active, invalid, disconnected
    carrier_type TEXT,                 -- mobile, landline, voip
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL UNIQUE,      -- lowercase, trimmed
    status TEXT DEFAULT 'active',      -- active, hard_bounced, soft_bounced, suppressed
    bounce_type TEXT,                  -- hard, soft, complaint
    suppression_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE linkedin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,          -- normalized URL
    profile_name TEXT,
    profile_title TEXT,
    profile_company TEXT,
    profile_location TEXT,
    profile_image_url TEXT,
    connection_status TEXT,            -- none, pending, connected
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Junction Tables: People ↔ Contact Points ═══

CREATE TABLE person_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    phone_id UUID NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
    label TEXT,                        -- 'work', 'mobile', 'property_line', 'switchboard'
    is_primary BOOLEAN DEFAULT false,
    source TEXT,                       -- 'qozb_import', 'manual', 'family_office_csv'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, phone_id)
);

CREATE TABLE person_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    label TEXT,                        -- 'work', 'personal', 'secondary'
    is_primary BOOLEAN DEFAULT false,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, email_id)
);

CREATE TABLE person_linkedin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    linkedin_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, linkedin_id)
);

-- ═══ Junction Table: People ↔ Organizations ═══

CREATE TABLE person_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT,                        -- their role/title at this org
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, organization_id)
);

-- Companies, firms, funds, developers
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    org_type TEXT,  -- 'family_office', 'developer', 'fund', 'investor', 'law_firm', etc.
    category TEXT,  -- 'SFO', 'MFO', etc.

    website TEXT,
    company_email TEXT,
    phone TEXT,

    -- Location
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT DEFAULT 'US',

    -- Business details
    aum TEXT,
    year_founded TEXT,
    investment_prefs TEXT,
    about TEXT,
    industry TEXT,

    -- Outreach state
    status TEXT DEFAULT 'active',  -- active, blocked, do_not_contact

    details JSONB DEFAULT '{}',

    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            COALESCE(name, '') || ' ' ||
            COALESCE(city, '') || ' ' ||
            COALESCE(state, ''))
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Layer 2: Properties (Decoupled from People)

```sql
-- Real estate properties (from QOZB data and listings)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    market TEXT,
    submarket TEXT,

    units INTEGER,
    sqft INTEGER,
    completion_date TEXT,
    latitude DECIMAL,
    longitude DECIMAL,

    details JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(property_name, address)
);

-- Many-to-many: people <-> properties
CREATE TABLE person_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    role TEXT NOT NULL,  -- 'owner', 'manager', 'trustee', 'special_servicer', 'developer'

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(person_id, property_id, role)
);
```

### Layer 3: Unified Activity Timeline

```sql
-- Every interaction with a person, regardless of channel
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,

    -- What happened
    activity_type TEXT NOT NULL,  -- 'email_sent', 'email_received', 'call_made',
                                  -- 'linkedin_invite_sent', 'linkedin_accepted',
                                  -- 'site_visit', 'webinar_attended', 'note_added',
                                  -- 'status_changed', 'tag_added', etc.
    channel TEXT,  -- 'email', 'phone', 'linkedin', 'website', 'manual', etc.

    -- Contact method entity used (FK to the specific entity)
    email_id UUID REFERENCES emails(id) ON DELETE SET NULL,
    phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
    linkedin_id UUID REFERENCES linkedin_profiles(id) ON DELETE SET NULL,

    -- Context
    campaign_id UUID REFERENCES campaigns(id),
    performed_by TEXT,  -- 'jeff', 'todd', 'system', 'automation'

    -- Outcome (for calls, emails, etc.)
    outcome TEXT,  -- 'answered', 'no_answer', 'bounced', 'replied', 'accepted', etc.

    -- Flexible payload
    details JSONB DEFAULT '{}',

    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_person_time ON activities(person_id, occurred_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_channel ON activities(channel);
```

### Layer 4: Campaigns (Channel-Aware)

Keep the existing campaign system largely as-is, add channel awareness:

```sql
-- Existing campaigns table, add:
ALTER TABLE campaigns ADD COLUMN channel TEXT DEFAULT 'email';  -- 'email', 'linkedin'

-- campaign_recipients: add email_id FK for selecting which email to use
ALTER TABLE campaign_recipients ADD COLUMN email_id UUID REFERENCES emails(id);
-- When adding a person to a campaign, default to their is_primary=true email.
-- The email_id points to the specific email entity being used for this campaign.
-- existing selected_email TEXT column can be kept for backward compatibility.

-- campaign_steps, email_queue stay the same

-- NEW: LinkedIn-specific execution queue
CREATE TABLE linkedin_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id),
    campaign_id UUID REFERENCES campaigns(id),

    linkedin_id UUID NOT NULL REFERENCES linkedin_profiles(id),  -- FK to linkedin entity
    message TEXT,
    account_name TEXT NOT NULL,  -- 'jeff', 'todd'

    status TEXT DEFAULT 'queued',  -- queued, processing, invited, accepted, failed
    scheduled_for TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    error_message TEXT,

    details JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No call_queue table. Calling is manual and ad-hoc.
-- Users browse the people list, pick someone, call, and log the result as an activity.
```

### Layer 5: Search Strategy

With no denormalized email/phone on the `people` table, search uses a cross-table query function:

```sql
-- Cross-table search: finds people by name, email, phone, or org
CREATE OR REPLACE FUNCTION search_people(query TEXT, result_limit INT DEFAULT 50)
RETURNS TABLE (person_id UUID, match_source TEXT)
LANGUAGE sql AS $$
    SELECT DISTINCT p.id AS person_id, 'name' AS match_source FROM people p
    WHERE p.first_name ILIKE '%' || query || '%'
       OR p.last_name ILIKE '%' || query || '%'
    UNION
    SELECT DISTINCT pe.person_id, 'email' FROM person_emails pe
    JOIN emails e ON pe.email_id = e.id
    WHERE e.address ILIKE '%' || query || '%'
    UNION
    SELECT DISTINCT pp.person_id, 'phone' FROM person_phones pp
    JOIN phones ph ON pp.phone_id = ph.id
    WHERE ph.number ILIKE '%' || query || '%'
       OR ph.display_number ILIKE '%' || query || '%'
    LIMIT result_limit;
$$;
```

This can be optimized to a database view or materialized view later if needed.

### Layer 5: Site Events Integration

```sql
-- user_events already exists and is fine.
-- Key link: people.user_id -> auth.users.id -> user_events.user_id

-- View for quick person activity lookup
CREATE VIEW person_site_events AS
SELECT
    p.id AS person_id,
    ue.event_type,
    ue.metadata,
    ue.endpoint,
    ue.created_at
FROM people p
JOIN user_events ue ON ue.user_id = p.user_id
WHERE p.user_id IS NOT NULL;
```

---

## 6. Schema Design Trade-offs

### Decision 1: First-class contact entities vs. single `contact_methods` table

| Approach | Pros | Cons |
|----------|------|------|
| **First-class entity tables (chosen)** (`phones`, `emails`, `linkedin_profiles` + junction tables) | Shared phone numbers are structural, not duplicated text. Per-entity status tracking separate from per-person relationship metadata. Forces dedup at import (UNIQUE on number/address). Phone-centric calling view is trivial. | More tables (~14 vs ~8). More joins for person detail. Import scripts need "find or create" logic. |
| **Single `contact_methods` table** (person_id, channel, value) | Fewer tables. Simpler queries. Standard CRM pattern. | Same phone stored as duplicate text across people. Status ambiguity. Dedup is query-based, not structural. Rebuilds the `get_unique_prospect_phones()` grouping problem. |
| **Multi-value columns** (`emails TEXT[]`, `phones TEXT[]`) | Simplest queries, all data on one row. | Can't track status per email/phone. Can't model shared phone numbers. Adding new channel = ALTER TABLE. |

**Resolution**: First-class entity tables. The QOZB data has widespread phone sharing across people (same switchboard for owner and manager). The `contact_methods` approach would recreate the same grouping/dedup problems we already solved with `get_unique_prospect_phones()`. The extra joins are negligible at our data volume (~25K records).

### Decision 2: Denormalized primary fields vs. just joins

| Approach | Pros | Cons |
|----------|------|------|
| **Just joins (chosen)** | Single source of truth. No staleness risk. No sync triggers. Simpler schema. | Every query showing contact info needs joins. Can't filter `WHERE primary_email IS NOT NULL` without a join. |
| **Denormalized `primary_*` on `people`** | Faster list view queries. Full-text search can include email/phone. | Two sources of truth. Requires triggers or app logic to keep in sync. Data WILL drift. |

**Resolution**: Start with just joins. At ~25K records, PostgreSQL handles 4-6 way joins in < 10ms. If performance becomes a concern, a database view (`CREATE VIEW people_view AS ...`) can be added at any time without schema changes. No denormalized fields, no triggers, no staleness.

### Decision 3: Polymorphic activities table vs. separate tables per type

| Approach | Pros | Cons |
|----------|------|------|
| **Single polymorphic table (chosen)** | Single query for full timeline. Easy to add new activity types. Standard CRM pattern. | `details` JSONB has no schema enforcement. |
| **Separate tables** (`email_activities`, `call_activities`, etc.) | Strong schema per type. | UNION queries for timeline. Adding new channel = new table + new UNION. |

**Resolution**: Polymorphic table wins. Activities reference the specific contact entity used (`email_id`, `phone_id`, `linkedin_id` FKs) for queryability — e.g., "show all outreach on this shared phone number across all people."

### Decision 4: Campaign model -- generalize or keep channel-specific?

**Resolution**: Hybrid approach.
- **Campaigns table** = planning layer. Keep existing email campaign system. Add `channel` column. LinkedIn batches can also be campaigns.
- **Queue tables** = channel-specific execution. `email_queue` (existing), `linkedin_queue` (new). No `call_queue` — calling is manual and ad-hoc, logged directly as activities.
- **Activities** = what actually happened. Unified, channel-agnostic.

### Decision 5: Person ↔ Organization relationship

**Resolution**: Junction table (`person_organizations`) instead of FK on `people`. Allows one person to belong to multiple organizations (e.g., a family office principal who is also a QOZB property owner at a different company).

---

## 7. Migration Strategy

**Approach: Big Bang Cutover**

Build the new schema, run migration, switch all services at once. This is viable because:
- Small data volume (~25K contacts) — migration runs in minutes, every record can be validated
- Solo developer — maintaining dual-write logic across 6 backend services is harder than cutting over
- Internal tool — no external API consumers, no SLAs
- Source CSVs still exist as ultimate fallback
- Supabase database snapshots provide instant rollback

### Phase 1: Create new tables

Create all new tables: `people`, `organizations`, `phones`, `emails`, `linkedin_profiles`, `person_phones`, `person_emails`, `person_linkedin`, `person_organizations`, `properties`, `person_properties`, `activities`, `linkedin_queue`.

### Phase 2: Data migration script

> **TODO**: Define the exact merge cascade / matching logic for deduplication across sources. Key questions:
> - Email match → same person? (likely yes)
> - LinkedIn match → same person? (likely yes)
> - Phone + name match → same person? (likely yes, but threshold TBD)
> - Name + org match → same person? (needs review — too many false positives?)
> - When fields conflict, what wins? (website signup > manual > CSV import?)

High-level steps:

**Step 1**: Migrate `contacts` table → `people` + `emails` + `person_emails`. Each contact's email becomes an `emails` entity row + a `person_emails` link.

**Step 2**: Migrate `prospect_phones` → `people` + `phones` + `person_phones` + `properties` + `person_properties`. Dedup phone numbers (same number = same `phones` entity, linked to multiple people).

**Step 3**: Import Family Office data → `people` + `organizations` + `person_organizations` + `emails` + `linkedin_profiles` + junction links. Dedup by linkedin_url and email.

**Step 4**: Link `user_id` from existing contacts to new `people` rows.

**Step 5**: Create `organizations` from distinct company/firm names across all sources.

#### Pre-migration data test: Orphan property phones

Before migration, run a Python script against the QOZB CSV to determine:
1. How many rows have a property-level `Phone Number` that does NOT match any Owner/Manager/Trustee Contact Phone Number?
2. Of those orphan phones, how many have at least one entity name (Owner/Manager/Trustee company)?
3. Of those orphans, how many have NO entity at all?

This determines whether orphan property phones should be linked to the organization, a synthetic person, or simply skipped.

### Phase 3: Backfill activities

- Convert `prospect_calls` → `activities` entries (channel='phone', phone_id FK)
- Convert `campaign_recipients` + `email_queue` sent records → `activities` entries (channel='email', email_id FK)
- Keep `user_events` separate with a view (cleaner than duplicating)

### Phase 4: Update all services and cutover

Update all backend services and API routes simultaneously:
- Campaign system: recipient selection reads from `people` + `person_emails` instead of `contacts`
- Calling system: reads from `people` + `person_phones` + `phones` instead of `prospect_phones`
- LinkedIn system: reads from `people` + `person_linkedin` + `linkedin_profiles`
- `campaign-runner`, `followup-scheduler`, `inbox-sync`: update any `contacts` table references

**Before cutover**: `grep -r "contacts\|prospect_phones\|prospect_calls\|property_associations\|contact_methods" --include="*.py" --include="*.ts" --include="*.tsx"` across all repos to ensure every reference is updated.

### Phase 5: Retire old tables

Rename old tables (e.g., `contacts` → `contacts_legacy`) and keep for a few weeks as safety net. Then drop.

---

## 8. Unified UI Concept

### Main CRM View (`/admin/crm`)

**Left Panel: People List**
- Searchable (via `search_people()` function), filterable list of all people
- Filters: organization type, lead status, tags, has email/phone/linkedin, outreach history, site activity, location, source
- Columns: Name, Organization, Title, Channels (icons for email/phone/linkedin), Last Activity, Lead Status
- Bulk selection for "Add to campaign" or "Add to LinkedIn queue"

**Right Panel: Person Detail (360-degree view)**
- **Header**: Name, title(s), organization(s) (from `person_organizations`), lead status badge, tags
- **Contact points**: All linked emails (from `person_emails` → `emails`), phones (from `person_phones` → `phones`), LinkedIn profiles — each with entity-level status (active/bounced/invalid)
- **Properties**: Associated QOZB properties (from `person_properties`)
- **Timeline**: Unified chronological feed of ALL interactions (from `activities`):
  - Emails sent/received (with `email_id` FK showing which address was used)
  - Calls made (with `phone_id` FK, outcomes and notes)
  - LinkedIn invites/connections (with `linkedin_id` FK)
  - Site visits (pages viewed, webinars attended, vault access requests)
  - Manual notes
- **Quick actions**: "Send email", "Add to campaign", "Log call", "Connect on LinkedIn", "Add note"

### Channel-Specific Views (Tabs or Sub-Pages)

- **Email Campaigns** (`/admin/crm/campaigns`) -- existing campaign system, mostly unchanged
- **Calling** (`/admin/crm/calls`) -- people list filtered to those with phone numbers, calling is manual (no queue)
- **LinkedIn Queue** (`/admin/crm/linkedin`) -- planned LinkedIn batch system
- **Analytics** (`/admin/crm/analytics`) -- unified metrics across all channels

---

## 9. Modularity for Future Channels

To add a new channel (e.g., WhatsApp, SMS, direct mail):

1. **Create a new contact point entity table** (e.g., `whatsapp_numbers` with `id`, `number`, `status`, etc.)
2. **Create a junction table** (e.g., `person_whatsapp` with `person_id`, `whatsapp_id`, `is_primary`, `label`)
3. **Create a channel-specific queue table** (e.g., `whatsapp_queue`) following the same pattern as `email_queue` and `linkedin_queue`
4. **Add an FK on `activities`** (e.g., `whatsapp_id UUID REFERENCES whatsapp_numbers(id)`)
5. **Create a backend service/worker** that processes the queue
6. **Add a UI tab** in the CRM for managing that channel's queue
7. All activities automatically flow into the unified `activities` table and timeline

No changes to core `people`, `organizations`, or `activities` tables (beyond the optional FK). No changes to the CRM list/detail views. The `search_people()` function can be extended with an additional UNION clause.

---

## 10. Implementation Roadmap

**Total estimate: 6-8 weeks** for a developer working full-time.

### Sprint 1: Foundation (1-2 weeks)
- Create all new tables: `people`, `organizations`, `phones`, `emails`, `linkedin_profiles`, junction tables, `properties`, `person_properties`, `activities`
- Run orphan property phones data test (Python script against QOZB CSV)
- Write migration script to merge `contacts` + `prospect_phones` + family office data into `people` + entity tables
- Backfill `activities` from `prospect_calls` and `campaign_recipients`/`email_queue`
- Create `search_people()` cross-table search function
- Basic unified CRM list page

### Sprint 2: People Detail & Timeline (1 week)
- Person 360-degree detail view with timeline
- Display all linked contact methods (phones, emails, LinkedIn) with status
- Wire up site events via `user_id` link
- Quick action buttons (send email, log call, add note)

### Sprint 3: Reconnect Email Campaigns (1 week)
- Point campaign recipient selection at `people` + `person_emails` + `emails`
- Add email selection (default to `is_primary`, allow override) when adding recipients
- Update `campaign_recipients.email_id` FK usage
- Ensure campaign-runner, followup-scheduler, inbox-sync work with new model

### Sprint 4: Reconnect Calling System (1 week)
- Port calling UI to work against `people` + `person_phones` + `phones`
- Port call logging to write to `activities` (with `phone_id` FK)
- No call_queue needed — calling is manual, users browse people list

### Sprint 5: LinkedIn Integration (1-2 weeks)
- Import family office data into `people` + `organizations` + `person_organizations` + `linkedin_profiles`
- Create `linkedin_queue` table
- Build LinkedIn queue UI and batch selection
- Wire up `linkedin-automation` service to `linkedin_queue` table
- Activity logging for LinkedIn actions (with `linkedin_id` FK)

### Sprint 6: Polish & Analytics (1 week)
- Unified analytics dashboard
- Bulk operations (tag, assign, add to campaign)
- Advanced filtering and saved views
- Search improvements (optimize `search_people()` if needed, consider views)

---

## 11. Open Design Decisions

### Resolved

| Decision | Resolution |
|----------|------------|
| Contact method storage | First-class entity tables (`phones`, `emails`, `linkedin_profiles`) with junction tables. Not a single `contact_methods` table. |
| Denormalized primary fields | No. Just joins. Add views later if needed for optimization. |
| Campaign generalization | Hybrid: `campaigns` table with `channel` field. Channel-specific queues (`email_queue`, `linkedin_queue`). No `call_queue`. |
| Migration approach | Big bang cutover. |
| Person ↔ Organization | Junction table (`person_organizations`), not FK on people. |
| Activities ↔ Contact methods | FKs on activities (`email_id`, `phone_id`, `linkedin_id`). |
| Search | Cross-table `search_people()` function. Optimize later if needed. |

### Still Open

#### 1. Merge strategy for duplicate people (TODO)
When the same person appears in multiple data sources, what's the merge cascade?
- Email match → same person?
- LinkedIn URL match → same person?
- Phone + name match → same person?
- Name + org match → same person?
- When fields conflict, what wins? (website signup > manual > CSV import?)
- For unresolvable conflicts: keep both values in `details` JSONB?

#### 2. Orphan property phones
Pending data test (Python script against QOZB CSV). See Migration Strategy Phase 2 for test specification. Decision depends on results — may link to org, create synthetic person, or skip.

#### 3. Calling system backend location
Currently all in oz-dev-dash API routes. Should it move to ozl-backend for consistency with email campaigns and LinkedIn?

#### 4. Organization deduplication
Family Office firms, QOZB entities, and companies from contacts table will have overlapping/duplicate organizations. Fuzzy matching analysis showed 16 groups of potential duplicates just in family office data. How aggressive should automated merging be?
- Suggested: Keep exact Firm Name matches as distinct firms (avoid fuzzy merging due to false positives).

---

## Appendix: ozl-backend Service Architecture

```
ozl-backend/
├── services/
│   ├── api/                    # FastAPI, port 8000
│   │   ├── main.py
│   │   ├── routers/            # campaigns, steps, emails, recipients, webhooks
│   │   ├── middleware/         # auth.py (Basic Auth)
│   │   ├── tasks/              # generate.py, launch.py, retry_failed.py
│   │   └── scripts/            # generate_gmail_token.py, credentials.json, token.json
│   ├── campaign-runner/        # SparkPost email sending worker
│   ├── followup-scheduler/     # Multi-step sequence scheduling
│   ├── inbox-sync/             # Gmail reply detection
│   ├── user-event-processor/   # Slack notifications, auto-intro emails
│   │   └── gmail/              # Gmail OAuth token
│   └── linkedin-automation/    # TypeScript/Node.js, Browserbase/Playwright
├── shared-lib/                 # ozl_shared: db, config, email_sender, renderer, prompts, scheduling, gmail, admin_events
├── Caddyfile                   # Reverse proxy: /api/* → api:8000
└── docker-compose.yml          # Orchestrates all services
```

## Appendix: oz-dev-dash Relevant Structure

```
oz-dev-dash/
├── src/app/
│   ├── admin/
│   │   ├── campaigns/          # Campaign list, new, [id] editor, contacts
│   │   ├── prospects/          # Prospects calling dashboard (3 tabs)
│   │   ├── linkedin/           # LinkedIn mock UI
│   │   ├── inbox/              # Email inbox
│   │   ├── analytics/          # Analytics dashboard
│   │   └── login/              # Admin login
│   └── api/
│       ├── backend-proxy/      # Proxy to ozl-backend
│       ├── prospects/          # Prospect CRUD, call logging
│       ├── prospect-phones/    # Phone CRUD, call logging, lock management
│       ├── contacts/           # Contact profile (360° view)
│       ├── call-history/       # Call history
│       ├── follow-up-email/    # Gmail follow-up
│       ├── inbox/              # IMAP email
│       ├── linkedin/           # LinkedIn search results, retry
│       └── cron/               # Eventbrite sync
├── scripts/
│   ├── import_contacts.ts
│   ├── import_warm_contacts.ts
│   ├── import_eventbrite_webinar.ts
│   ├── export_family_office_contacts.ts
│   └── prospect-management/
│       ├── import-prospects.ts
│       ├── migrate-prospect-phones.ts
│       └── run-pipeline.ts
├── supabase/
│   ├── migrations/             # All database migrations
│   └── seed.sql
└── docs/
    └── linkedin_outreach_implementation.md
```

## Appendix: oz-homepage Event Tracking

```
oz-homepage/
├── src/
│   ├── hooks/useEventTracker.ts          # Listing-specific event tracking
│   ├── lib/
│   │   ├── analytics/trackUserEvent.js   # Site-wide event tracking
│   │   └── admin-events.js               # Admin event tracking
│   ├── app/api/attribution/route.js      # UTM/referrer tracking
│   └── docs/EventDictionary.md           # Event type documentation
└── Supabase tables: user_events, user_attribution, admin_events
```
