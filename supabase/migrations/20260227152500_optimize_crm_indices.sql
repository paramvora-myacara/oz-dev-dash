-- Migration to optimize CRM lookups and sorting
-- 1. Add index on organization_id in person_organizations for faster company -> people lookups
CREATE INDEX IF NOT EXISTS idx_person_organizations_org_id ON person_organizations(organization_id);

-- 2. Add index on created_at in organizations for faster list sorting
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC);
