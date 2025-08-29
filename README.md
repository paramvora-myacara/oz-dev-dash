# OZ Developer Dashboard

A Next.js-based admin dashboard for managing OZ Listings properties with analytics capabilities.

## Features

- **Admin Authentication**: Secure login system for property managers and internal staff
- **Property Management**: Edit and manage listing content with version control
- **Analytics Dashboard**: Track user engagement and property performance
- **Role-Based Access**: Different permissions for internal admins vs. customers

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Analytics Dashboard Setup

The analytics dashboard provides insights into user events and property performance. To set it up:

1. **Database Migration**: Run `scripts/add-role-column.sql` in Supabase
2. **Create Events Table**: Run `scripts/create-user-events-table.sql` if needed
3. **Update User Roles**: Set internal team members to `internal_admin` role
4. **Test**: Navigate to `/admin/analytics` after setup

See [ANALYTICS_SETUP.md](docs/ANALYTICS_SETUP.md) for detailed setup instructions.

## Project Structure

- `src/app/admin/` - Admin dashboard and analytics pages
- `src/components/admin/` - Reusable admin components
- `src/lib/admin/` - Authentication and admin utilities
- `scripts/` - Database migration and setup scripts
- `docs/` - Documentation and setup guides

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
