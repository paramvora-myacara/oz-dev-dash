
# Analytics Dashboard Implementation Plan

## 1. Overview

This document outlines the plan to build a unified analytics dashboard in the `oz-dev-dash` application. The dashboard will serve two primary user types: internal team members (`internal_admin`) and external clients (`customer`). It will provide insights into user events, displaying site-wide data for internal admins and listing-specific data for customers.

The core of this feature is a single, dynamic page that adapts its content based on the user's role and permissions.

## 2. Authentication & Data Model Changes

### 2.1. `admin_users` Table Modification

To differentiate between internal staff and customers, we will introduce a `role` column to the `admin_users` table.

-   **Action:** Create a SQL migration script.
-   **Details:**
    -   Add a new column: `role` of type `TEXT`.
    -   Set a `DEFAULT` value of `'customer'` for the `role` column. This ensures all existing users are correctly categorized.
    -   Manually update the `role` to `'internal_admin'` for all internal team members after the migration.

### 2.2. Update `/api/admin/me` Endpoint

The frontend needs to be aware of the user's role to render the correct UI.

-   **Action:** Modify the `GET` handler in `src/app/api/admin/me/route.ts`.
-   **Details:**
    -   Adjust the Supabase query to select the new `role` column from the `admin_users` table.
    -   Include the `role` in the JSON response sent to the client.

## 3. Backend Implementation

### 3.1. New Analytics API Endpoint

We will create a single, robust API endpoint to handle all analytics data requests.

-   **Action:** Create a new API route at `src/app/api/analytics/summary/route.ts`.
-   **Endpoint:** `GET /api/analytics/summary`
-   **Query Parameters:**
    -   `slug` (optional, string): The slug of a specific listing. If omitted, the endpoint will return site-wide data.
-   **Logic:**
    1.  Verify the user's session using the existing admin authentication (`verifyAdmin`).
    2.  Fetch the user's `role` and their associated listings from the database.
    3.  **Authorization:**
        -   If no `slug` is provided:
            -   Check if the user's `role` is `'internal_admin'`. If not, return a 403 Forbidden error.
            -   Proceed to query site-wide data.
        -   If a `slug` is provided:
            -   If the user is a `'customer'`, verify that the requested `slug` is in their list of associated listings. If not, return a 403 Forbidden error.
            -   Internal admins are implicitly authorized to view any slug.
    4.  **Data Querying & Aggregation (SQL):**
        -   The endpoint will calculate two time windows: "This Week" (the last 7 days) and "Last Week" (the 7 days prior).
        -   It will execute a single SQL query against the `user_events` table to get all necessary data efficiently.
        -   The query will use conditional aggregation (`COUNT(CASE WHEN ... THEN 1 END)`) to count events within each time window, grouped by `event_type`.
        -   For listing-specific data, a `WHERE` clause will filter events based on a key in the `metadata` JSON object (e.g., `WHERE metadata->>'propertyId' = 'some-slug'`).
        -   *Conceptual SQL Example:*
            ```sql
            SELECT
              event_type,
              COUNT(CASE WHEN created_at >= 'LAST_WEEK_START' AND created_at < 'LAST_WEEK_END' THEN 1 END) AS last_week_count,
              COUNT(CASE WHEN created_at >= 'THIS_WEEK_START' AND created_at < 'THIS_WEEK_END' THEN 1 END) AS this_week_count
            FROM
              user_events
            GROUP BY
              event_type;
            ```
    5.  **Processing & Response:**
        -   The raw counts are returned from the database.
        -   The API will calculate the percentage change for each event type using the formula `(this_week_count - last_week_count) / last_week_count`.
        -   It will then structure this data into a clean JSON array and send it to the frontend. Example:
            ```json
            {
              "analytics": [
                {
                  "eventType": "page_view",
                  "lastWeek": 1204,
                  "thisWeek": 1512,
                  "change": 0.256
                },
                {
                  "eventType": "listing_clicked",
                  "lastWeek": 350,
                  "thisWeek": 298,
                  "change": -0.149
                }
              ]
            }
            ```

## 4. Frontend Implementation

### 4.1. New Unified Analytics Page

This is the central hub for all analytics.

-   **Action:** Create a new page component at `src/app/admin/analytics/page.tsx`.
-   **URL:** `/admin/analytics`
-   **Page Logic:**
    1.  The page will be a client component (`'use client'`).
    2.  On load, it will use the `useAdminAuth` hook to get the user's data, including their `role` and `listings`.
    3.  **State Management:**
        -   It will use state (e.g., `useState`) to manage the currently selected view (e.g., `selectedSlug`, which can be `null` for the site-wide view).
    4.  **Initial View Logic:**
        -   If `role` is `'internal_admin'`, `selectedSlug` will default to `null` (site-wide).
        -   If `role` is `'customer'` and they have one listing, `selectedSlug` will default to that listing's slug.
        -   If `role` is `'customer'` and they have multiple listings, `selectedSlug` will default to the first listing in their array.
    5.  **Data Fetching:**
        -   A `useEffect` hook will trigger a fetch to the `/api/analytics/summary` endpoint whenever `selectedSlug` changes.
        -   The fetched data will be stored in the component's state.
    6.  **UI Components:**
        -   The page will contain a `<Header />` component that includes the title ("Site-Wide Analytics" or "Analytics for [Listing Name]").
        -   It will feature a `<Dropdown />` menu for selecting the analytics view.
            -   For internal admins, this dropdown will be populated with all listings plus a "Site-Wide" option.
            -   For customers, it will only contain the listings they own. It will be hidden or disabled if they only have one.
        -   It will render a reusable `<AnalyticsDisplay />` component, passing the fetched analytics data as a prop.

### 4.2. Reusable Analytics Component

To avoid code duplication.

-   **Action:** Create a new component at `src/components/admin/AnalyticsDisplay.tsx`.
-   **Props:**
    -   `data`: An array of the analytics data objects from the API.
    -   `isLoading`: A boolean to show a loading state.
-   **Content & Display Logic:**
    -   **Data Table:**
        -   The component will map over the `data` array to render a row for each event.
        -   It will use a number formatter to display the `change` value as a percentage (e.g., `0.256` becomes `"25.6%"`).
        -   Conditional styling will be applied to the "Change" column: green text and a "▲" icon for positive changes, red text and a "▼" icon for negative changes.
    -   **Bar Chart (Chart.js):**
        -   The component will transform the `data` prop into a format suitable for Chart.js.
        -   `labels`: An array of `eventType` strings for the x-axis.
        -   `datasets`: An array of two objects, one for "Last Week" and one for "This Week". Each object will contain the `label`, the `data` array of counts, and a distinct `backgroundColor`.
        -   The chart will be configured with a legend, tooltips on hover, and responsive design settings.

### 4.3. Navigation

-   **Action:** Add a "View Analytics" button to the main admin dashboard page (`src/app/admin/page.tsx`).
-   **Details:**
    -   This button will be a simple Next.js `<Link>` component pointing to `/admin/analytics`.
    -   It will be visible to all authenticated admin users, regardless of their role.

## 5. Implementation Steps & Task Breakdown

1.  **Backend Setup:**
    -   [ ] Create the SQL migration script to add the `role` column to `admin_users`.
    -   [ ] Apply the migration to the database.
    -   [ ] Manually update roles for internal team members.
    -   [ ] Update the `/api/admin/me` route to return the user's role.
2.  **API Development:**
    -   [ ] Create the new `/api/analytics/summary` API route.
    -   [ ] Implement the core data fetching and week-over-week calculation logic in SQL.
    -   [ ] Add the role-based authorization logic to the endpoint.
3.  **Frontend Development:**
    -   [ ] Create the `<AnalyticsDisplay />` component with the table and chart.
    -   [ ] Create the main `/admin/analytics/page.tsx` page.
    -   [ ] Implement the state management and data fetching logic on the analytics page.
    -   [ ] Build and populate the view-selection dropdown menu.
4.  **Integration & Final Touches:**
    -   [ ] Add the "View Analytics" button to the main admin dashboard.
    -   [ ] Thoroughly test the entire flow for both internal admin and customer roles.
    -   [ ] Test edge cases (customer with one listing, customer with multiple listings). 