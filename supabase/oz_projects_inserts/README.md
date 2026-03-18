# OZ projects — SQL inserts

Inserts for `public.oz_projects` aligned with listing slugs on the homepage.

- **`projected_irr_10yr`** — display scale (e.g. `19` for 19%, not `0.19`).
- **`equity_multiple_10yr`** — display scale (e.g. `3.08` for 3.08x).
- Re-running inserts duplicates rows; delete by `project_slug` before re-seeding if needed.

Files:

| File | Projects |
|------|----------|
| `insert_levi_tierramark_oz_projects.sql` | TierraMark at Camp Verde, Regal Apartments |
| `insert_hidden_lake_hyatt_baltic_lakewire_oz_projects.sql` | Hidden Lake, Portland Hyatt, 491 Baltic, Lake Wire |
