### Goal
- Build a user-centric admin portal at `/admin` that works on each customer’s custom domain.
- Do not use Supabase Auth for gatekeeping; use a dedicated Supabase table for admin users.
- Keep authorization simple: users only see and edit listings they’re allowed to manage.
- No JWT/session signing/refresh logic; use a minimal stateless cookie approach.

### High-level UX
- Public site: remains unchanged on each custom domain (e.g., `property.example.com`).
- Admin access: navigate to `property.example.com/admin`.
  - If not authenticated: show login form.
  - If authenticated: show a user-centric dashboard listing all properties the user can manage (even if they belong to other domains), with actions: View, Edit, Details.

### URL and routing model
- Dashboard (user-centric): `/admin`
- Edit listing: `/{slug}/edit` (still accessible on any domain; links from the dashboard should prefer the canonical custom domain for each listing where possible)
- Optional: listing-scoped dashboard for future use: `/{slug}/dashboard` (can remain unimplemented until needed)

### Custom-domain handling (middleware)
- Keep public page requests as-is.
- For `/admin` and `/{slug}/edit`:
  - Validate presence of our admin credential cookie (see Auth model) and verify against DB.
  - For `/{slug}/edit`, also verify the authenticated user has permission to edit the specific `slug`.
- Retain existing Supabase SSR session refresh for event tracking if present, but do not rely on it for admin access.

### Auth model (custom, simplified, no hashing, no JWT)
We will store admin users and their permissions in Supabase tables. Authentication is done by setting a basic credential cookie and verifying it on every request.

- Tables (SQL outline):
  - `admin_users`:
    - `id` uuid primary key default `gen_random_uuid()`
    - `email` text unique not null
    - `password` text not null  // plaintext as requested (see Security notes)
  - `admin_user_listings` (many-to-many permissions):
    - `id` uuid pk default `gen_random_uuid()`
    - `user_id` uuid references `admin_users(id)` on delete cascade
    - `listing_slug` text not null
    - unique(user_id, listing_slug)
  - `domains` (custom domain mapping):
    - `id` uuid pk default `gen_random_uuid()`
    - `hostname` text unique not null (e.g., `property.example.com`)
    - `listing_slug` text not null
    - `created_at` timestamptz default now()

- Sessions/cookies
  - No JWT, no signed session, no refresh logic.
  - On successful login, set an HttpOnly cookie `oz_admin_basic` that contains `base64(email:password)`.
  - Each protected route decodes this cookie, reads `admin_users` by `email`, and verifies the `password` matches. If valid, the user is treated as authenticated.
  - TTL: session cookie (clears on browser close). You may add a `Max-Age` later if needed.

- Passwords
  - Stored in plaintext per request. Strongly discouraged for production. See Security considerations.

### API routes (Next.js Route Handlers)
- `POST /api/admin/login`
  - Body: { email, password }
  - Server-side logic:
    - Use Supabase service role key to read `admin_users` by `email`.
    - Verify `password` equals DB value.
    - If ok, set `oz_admin_basic` cookie with `base64(email:password)` (HttpOnly, Secure, SameSite=Lax, Path=/).
    - Return 200 with basic profile: { userId, email }.
- `POST /api/admin/logout`
  - Clear `oz_admin_basic` cookie.
- `GET /api/admin/me`
  - Decode and verify `oz_admin_basic`.
  - Return current user profile and allowed listings (join `admin_user_listings`).

### Middleware changes (`src/middleware.ts`)
- Preserve any existing Supabase SSR session refresh for event tracking.
- Add admin protection:
  - If path starts with `/admin` or ends with `/edit`:
    - Decode and validate `oz_admin_basic` (`email:password`). Lookup user, confirm password match.
    - If invalid/absent: rewrite/redirect to `/admin/login`.
  - If path matches `/{slug}/edit`:
    - After validating credentials, check authorization by querying `admin_user_listings` to confirm user can edit `slug`. If unauthorized → 403 or redirect to `/admin`.

### Pages to add (App Router)
- `src/app/admin/login/page.tsx`
  - Client component with login form (email/password) → calls `/api/admin/login`.
  - On success, redirect to `/admin`.
- `src/app/admin/page.tsx`
  - Client component. On mount, calls `/api/admin/me`.
  - Renders a list of accessible listings with actions:
    - View: link to canonical custom domain homepage (if available) or fallback `/{slug}` on current domain.
    - Edit: link to that domain’s `/{slug}/edit`.
- `src/app/[slug]/edit/page.tsx`
  - Client page; renders the same listing UI as public, but with editable components enabled (see editable-components plan).
  - Requires admin credential cookie + authorization.



### Permissions logic
- Authorization checks happen in:
  - Middleware (blocks navigation)
  - Server routes (`/api/admin/*`, `/api/listings/*`) as a second line of defense
- Model:
  - Without roles, treat all authorized users as editors for their assigned listings.



### Data for dashboard
- `/admin` needs to list properties for the user:
  - Query `admin_user_listings` joined to `domains` (optional) to display the canonical domain next to each listing.
  - Show links:
    - View: `https://{hostname}/` if available, else `/{slug}` on current domain
    - Edit: `https://{hostname}/{slug}/edit` if available, else `/{slug}/edit`

### Incremental rollout plan
1. Create Supabase tables and seed an initial admin user (plaintext password, per request).
2. Add server utilities to query Supabase with service role (server-only).
3. Implement `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me` using the `oz_admin_basic` cookie.
4. Add `src/app/admin/login/page.tsx` and `src/app/admin/page.tsx`.
5. Extend middleware to protect `/admin` and `/{slug}/edit` by verifying the `oz_admin_basic` cookie against the DB.
6. Add `src/app/[slug]/edit/page.tsx` (initially a placeholder confirming edit access); wire authorization check.
7. Hook in the editable UI in a later step (see `docs/editable-components.md`).
