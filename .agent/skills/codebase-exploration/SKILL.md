---
name: codebase-exploration
description: General knowledge for exploring the oz-dev-dash repository, including database migrations and admin pages.
---

# Codebase Exploration Guide (oz-dev-dash)

Use this information when exploring the `oz-dev-dash` codebase, writing queries, or attempting to understand the system architecture.

### Database & Migrations
- **Supabase Migrations**: The migrations for the Postgres database are located in `oz-dev-dash/supabase/migrations`.

### Admin Routes & Legacy Pages
- **Current Admin Pages**: The active administrative pages are located in `/admin/*`.
- **Legacy Admin**: Legacy code for the system in this repository includes the `/admin` page.
- **External Routing**: The functionality of the legacy `/admin` page is now handled through the `/dashboard` route in the separate `oz-homepage` repository.
