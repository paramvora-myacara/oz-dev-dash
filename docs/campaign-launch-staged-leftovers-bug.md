# Campaign launch: staged leftovers, stuck review UI, and fixes

This document records a production bug in the email campaign flow (OZ DevDash + OZL backend), how we diagnosed it, what we ruled out, and what we shipped to prevent recurrence. Use it when overhauling campaigns, launch, or the review/complete UX.

---

## Symptoms (what admins saw)

1. **Stuck on Review** after launch: the stepper stayed on “Review” even when the campaign header showed **Completed** and thousands of recipients.
2. **Small number of emails in review**: e.g. “3 of 3 emails” while the campaign showed **9,386 recipients**—a huge mismatch between audience size and staged list.
3. **Launch button error** on a completed campaign:  
   `Campaign must be in staged or draft status to launch`  
   So the UI still offered launch, but the API refused because `campaigns.status` was already `completed`.
4. **Slack / admin event** could report an email count that did not match reality (e.g. event said all were launched while a few rows remained `staged` in `email_queue`).

---

## Architecture (relevant pieces)

### Data model

- **`campaigns`**: metadata and `status` (`draft`, `staged`, `scheduled`, `sending`, `completed`, etc.) and `total_recipients`.
- **`campaign_recipients`**: who is on the campaign; `selected_email` may be set when recipients are chosen in the CRM flow.
- **`email_queue`**: one row per outbound message. Key fields:
  - `status`: `staged` (generated, not scheduled), `queued`, `processing`, `sent`, `failed`
  - `scheduled_for`: set when launch schedules the send; `null` while `staged`

### Backend flows

- **Generate** (`process_generate_task`): reads recipients, resolves email from person data, inserts `email_queue` rows with `status='staged'`, sets campaign to `staged`.
- **Launch** (`process_launch_task`): loads all `status='staged'` for the campaign, computes `scheduled_for` / domain / `from_email`, upserts rows to `status='queued'`, then sets campaign to `scheduled` and emits `campaign_launched` admin event.
- **Completion** (`check_and_update_completed_campaign`): can mark campaign `completed` when there is no `queued`/`processing` and no future scheduled work; **it does not require `staged == 0`**.

### DevDash

- Polls **`GET /campaigns/{id}/status`** for `status`, `staged_count`, `queued_count`, etc.
- **Important**: on that endpoint, `staged_count` is implemented as **count of rows where `scheduled_for IS NULL`**, not strictly `status = 'staged'` (backend nuance).
- Step routing previously forced **Review** whenever `staged_count > 0`, **even if** `campaigns.status` was `completed`.

---

## Root causes (multiple layers)

### 1) Launch could leave rows in `staged`

The launch task upserts in batches and incremented a local “queued” counter without a final **invariant check** that every staged row actually left `staged`. Transient write issues, partial batch behavior, or other edge cases could leave a **small number** of rows still `staged` with `scheduled_for = null` while the rest were scheduled and eventually sent.

**Observed case (VIP campaign):** ~9,382 rows scheduled/sent; **exactly 3** remained `staged`. The admin event payload had claimed a full count; DB truth showed a mismatch.

### 2) Completion logic ignored leftover `staged`

`check_and_update_completed_campaign` does not require zero `staged` emails. So the campaign could flip to **`completed`** while a few `staged` rows still existed.

### 3) DevDash forced Review when anything looked “unscheduled”

Effectively: if `staged_count > 0`, treat as `staged` and show Review **regardless** of `campaigns.status`. That produced:

- Header: **Completed**
- Stepper: **Review** with a few visible emails  
  → confusing and blocked the “complete” experience.

### 4) Recipient count vs queue count (educational, not always the bug)

- **`total_recipients`** is updated when recipients are saved (`POST .../recipients` replaces the list and sets count).
- **Generate** creates `email_queue` rows only for recipients it does not skip (no person, no resolvable email, etc.).
- Replacing the recipient list **does not** clear `email_queue`. That can create **audience vs queue** mismatches if generate is not re-run after a bulk recipient change.

For the VIP incident, DB showed ~9k queue rows and ~9k sent; the “3 left” problem was **not** primarily “only 3 people ever generated”—it was **3 rows never transitioned off `staged`**.

### 5) What we ruled out for that campaign: generate/launch time overlap

We checked:

- **`email_queue.created_at`** burst: generation finished in a short window (~18:13:54–18:14:08 UTC).
- **`admin_events`** for `campaign_launched`: created **after** that window (~18:19:23 UTC).
- The 3 stuck rows were **created before** the launch event timestamp.

So **“launch started while generate was still inserting”** was **not** supported by timestamps for that campaign. The more plausible explanation was **launch scheduling not fully persisting** for a tiny subset of rows, plus **no post-check** to fix or classify them.

---

## Escape hatch and product behavior (after fix)

We did **not** add a separate “schedule leftovers” API. The escape hatch is:

1. **Backend**: After launch’s main loop, **enforce the invariant**  
   `no email_queue rows with status='staged' for this campaign`.
   - Retry scheduling leftover ids a few times.
   - If still stuck, set those rows to **`failed`** with a clear `error_message` (e.g. launch scheduling failed after N retries).
2. **UI**: Existing **Completed** page already lists **failed emails** and supports **Retry failed**—admins see and recover from the few that could not be scheduled.
3. **DevDash routing**: If `campaigns.status === 'completed'`, always show the **Complete** step so we never trap users on Review when the campaign is already completed.

**Admin / Slack notification**: `campaign_launched` is emitted **only after** retries and failover, with **`email_count`** derived from DB counts (`queued + processing + sent`) plus extra fields for transparency (`failed`, `staged_remaining`, etc.).

---

## Code locations (reference)

| Area | Repository | File / area |
|------|------------|-------------|
| Launch invariant, retry, mark failed, deferred admin event | `ozl-backend` | `services/api/tasks/launch.py` — `process_launch_task` |
| Launch API guard (unchanged for this doc) | `ozl-backend` | `services/api/routers/campaigns.py` — `POST .../launch` |
| Status endpoint semantics | `ozl-backend` | `services/api/routers/campaigns.py` — `GET .../{id}/status` |
| Completed always shows Complete step | `oz-dev-dash` | `src/app/admin/campaigns/[id]/page.tsx` — step `useEffect` |

---

## Invariants we now rely on

After a successful **launch task** run (no uncaught exception before the end):

- **`email_queue` for that campaign should have `status != 'staged'` for every row that was part of launch** (either `queued` or `failed` after failover).
- **`campaign_launched`** reflects post-retry DB state, not an optimistic counter.

---

## If you overhaul the system later

Suggested directions (not all implemented):

1. **Single source of truth for “ready to launch”**: e.g. job row or `campaigns.generation_job_status` so the UI cannot offer launch until generate is terminal.
2. **Stricter completion**: do not mark `completed` while `staged > 0` (or while launch job failed).
3. **Replace offset pagination** on mutable `email_queue` sets with **keyset** pagination or a single SQL `UPDATE ... RETURNING` for scheduling.
4. **Align `staged_count` in `/status`** with `status='staged'` if product language is “staged emails” not “null scheduled_for”.
5. **Recipient replace vs queue**: on bulk recipient replace, either clear/regenerate queue or block launch until counts match.

---

## Revision history

- **Document added**: records investigation of VIP-style “3 staged + completed + stuck review” incident, root causes, and the invariant + retry + fail + UI routing fix in `ozl-backend` and `oz-dev-dash`.
