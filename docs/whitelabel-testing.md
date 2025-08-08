# Whitelabel Testing Guide

## Overview
The whitelabel functionality allows customer domains to serve listing pages without showing the slug in the URL. Edit routes are always served from the platform domain to maintain separation and security.

## Setup

### 1. Environment Variables
Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_PLATFORM_BASE_URL="http://localhost:3000"
```

### 2. Database Setup
Run the SQL script in your Supabase SQL Editor:
```sql
-- From scripts/seed-test-domain.sql
insert into public.domains (hostname, listing_slug)
values ('edge.localhost', 'the-edge-on-main')
on conflict (hostname) do update set listing_slug = excluded.listing_slug;
```

### 3. Local DNS Testing
Add entries to your `/etc/hosts` file for local testing:
```bash
# Add these lines to /etc/hosts
127.0.0.1 edge.localhost
127.0.0.1 marshall.localhost
127.0.0.1 sogood.localhost
```

### 4. Start Development Server
```bash
npm run dev
```

## Testing Scenarios

### Whitelabeled Public Pages
- **Homepage**: `http://edge.localhost:3000/` → serves `/the-edge-on-main`
- **Details page**: `http://edge.localhost:3000/details/property-overview` → serves `/the-edge-on-main/details/property-overview`
- **Other details**: `http://edge.localhost:3000/details/financial-returns` → serves `/the-edge-on-main/details/financial-returns`

### Security: Blocked Routes on Whitelabeled Domains
- **Admin routes**: `http://edge.localhost:3000/admin` → 302 redirect to `http://edge.localhost:3000/`
- **Edit routes**: `http://edge.localhost:3000/edit` → 302 redirect to `http://edge.localhost:3000/`
- **Details edit**: `http://edge.localhost:3000/details/property-overview/edit` → 302 redirect to `http://edge.localhost:3000/`

### Platform Domain Edit Routes (with authentication)
- **Overview edit**: `http://localhost:3000/the-edge-on-main/edit` → requires admin authentication
- **Details edit**: `http://localhost:3000/the-edge-on-main/details/property-overview/edit` → requires admin authentication

### Admin Dashboard
- **View button**: Opens whitelabeled domain (e.g., `http://edge.localhost:3000/`)
- **Edit button**: Always opens platform domain (e.g., `http://localhost:3000/the-edge-on-main/edit`)

## How It Works

### Middleware Logic
1. **Host Detection**: Reads `x-forwarded-host` (for proxies) or `host` header
2. **Domain Lookup**: Queries `domains` table for `hostname` → `listing_slug` mapping
3. **Security Checks**:
   - **Admin/Edit routes**: Blocked on whitelabeled domains, redirected to whitelabeled domain homepage
   - **Public paths**: Rewrite to slugged path (e.g., `/` → `/{slug}`)
4. **Admin Protection**: Cookie-based auth for `/admin` and `/edit` routes on platform domain

### Admin Dashboard
- **View URLs**: Use whitelabeled hostname if available, fallback to relative path
- **Edit URLs**: Always use `NEXT_PUBLIC_PLATFORM_BASE_URL` or relative path

## Production Deployment

### Environment Variables
```bash
NEXT_PUBLIC_PLATFORM_BASE_URL="https://your-app-domain.com"
```

### Domain Mappings
Add real customer domains to the `domains` table:
```sql
insert into public.domains (hostname, listing_slug)
values 
  ('customer1.com', 'customer1-listing'),
  ('customer2.com', 'customer2-listing');
```

### DNS Configuration

#### For Cloud Providers (Recommended)

**Vercel:**
1. Add custom domain in Vercel dashboard
2. Update nameservers at domain registrar to point to Vercel
3. Vercel handles SSL certificates automatically

**Netlify:**
1. Add custom domain in Netlify dashboard
2. Update nameservers at domain registrar to point to Netlify
3. Netlify handles SSL certificates automatically

**AWS/Other Cloud Providers:**
```bash
# A Record (if you have a static IP)
Type: A
Name: @ (or leave blank for root domain)
Value: YOUR_SERVER_IP_ADDRESS

# CNAME for subdomains
Type: CNAME
Name: www
Value: yourdomain.com
```

#### Manual DNS Configuration
```bash
# Root domain
Type: A
Name: @
Value: YOUR_SERVER_IP

# Subdomain
Type: CNAME
Name: www
Value: yourdomain.com

# Additional subdomains if needed
Type: CNAME
Name: api
Value: yourdomain.com
```

### SSL Certificate
- **Cloud providers**: Usually handled automatically
- **Self-hosted**: Use Let's Encrypt or your preferred SSL provider
- **Load balancer**: Configure SSL termination at the load balancer level

## Security Features

### Domain Isolation
- Whitelabeled domains cannot access admin or edit functionality
- All admin/edit routes redirect to the whitelabeled domain's homepage
- Maintains clear separation between customer-facing and admin interfaces

### Authentication Protection
- Admin routes require `oz_admin_basic` cookie
- Edit routes require authentication on platform domain
- Login page accessible without authentication to prevent redirect loops

### Session Management
- Automatic session refresh for Server Components
- Proper cookie handling for Supabase authentication

## Troubleshooting

### Common Issues
1. **Domain not found**: Check `domains` table has the correct `hostname` entry
2. **Edit redirects not working**: Verify `NEXT_PUBLIC_PLATFORM_BASE_URL` is set
3. **Admin auth issues**: Ensure admin cookie is present and valid
4. **RLS blocking**: Add select policy for `domains` table if using RLS
5. **DNS not resolving**: Check DNS propagation (can take 24-48 hours)

### Debug Steps
1. Check browser network tab for redirects
2. Verify middleware logs in development
3. Test with `curl -H "Host: edge.localhost" http://localhost:3000/`
4. Check `/etc/hosts` file for local testing
5. Verify domain mapping in database:
   ```sql
   SELECT * FROM domains WHERE hostname = 'your-domain.com';
   ```

### Testing Commands
```bash
# Test whitelabeled domain
curl -H "Host: edge.localhost" http://localhost:3000/

# Test admin redirect
curl -H "Host: edge.localhost" http://localhost:3000/admin

# Test edit redirect
curl -H "Host: edge.localhost" http://localhost:3000/edit
``` 