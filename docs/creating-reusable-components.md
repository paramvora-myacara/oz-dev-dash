# Creating a New Reusable Component for Listings Pages

This guide outlines the process for creating a new, reusable component to be used on the dynamic listings pages. Following these steps will ensure that your new component integrates correctly with the existing data structure, rendering logic, and design system.

## 1. Component Creation and Styling

First, create the new component file in the `src/components/listing/` directory, following the existing structure. For this example, let's assume we're creating a new component for the `details` section of the listings pages.

### File and folder structure

The file and folder structure for each component is organized by the page it will be rendered on, as follows:

-   `src/app/listings/[slug]/details/[detailPage]/page.tsx`: The main page component for each of the detail pages. It fetches the data and passes it to the client component.
-   `src/app/listings/[slug]/details/[detailPage]/detail-page-client.tsx`: The client component that handles the rendering of the different sections of the page.
-   `src/components/listing/details/[detailPage]/[ComponentName].tsx`: The reusable component itself.

### Styling and Responsiveness

Style the component using **Tailwind CSS** to ensure it conforms to the project's design language. All new components must be fully responsive and look good on both desktop and mobile screens. Use responsive prefixes like `md:` and `lg:` to adjust styles for different breakpoints.

## 2. Using Lucide Icons

To maintain a consistent icon set, all icons should be imported from the `lucide-react` library. The project uses a dynamic import system for icons, so you don't need to import them directly in your component.

### The `iconMap`

The `iconMap.ts` file, located at `src/components/listing/details/shared/iconMap.ts`, dynamically exports all `lucide-react` icons. This allows you to render icons by name using the `iconMap`.

To use an icon, simply pass the icon name as a string to your component and render it as follows:

```tsx
import { iconMap } from '@/components/listing/details/shared/iconMap';

const Icon = iconMap[iconName];

return <Icon className="w-6 h-6" />;
```

## 3. Integrating with the Section Renderer

The listings pages use a section renderer to dynamically display components based on the `type` field in the data. To make your new component available to the renderer, you'll need to add it to the `switch` statement in the page's client component.

There are two main section renderers in the project:

-   `src/app/listings/[slug]/listing-page-client.tsx`: For the main listings page.
-   `src/app/listings/[slug]/details/[detailPage]/detail-page-client.tsx`: For the detail pages.

Add a new `case` to the `switch` statement that matches the `type` of your new component, and render your component, passing the `data` object as props.

## 4. Updating the Dynamic Sections API

The `dynamic-sections-api.md` file, located in the `docs` directory, documents the JSON structure required to render content on the listings pages. When you create a new component, you must update this file to include the schema for your new component.

-   Add a new section to the document that describes your component, its `type`, and the data it requires.
-   Provide a clear and concise description of the component's purpose and functionality.
-   Include a TypeScript interface for the component's data schema.

## 5. Updating the TypeScript Schema

The project's TypeScript types are defined in `src/types/listing.ts`. When you create a new component, you'll need to update this file to include the new types for your component's data.

-   Create a new interface for your component's data.
-   Add your new data interface to the appropriate section type union. For example, if your new component is for the `Property Overview` page, you would add it to the `PropertyOverviewSection` type.

## 6. Component Width and Layout Rules

To ensure a consistent and visually appealing layout, it is important to specify whether a component should take up the full width of the page or half of it. This is especially important for half-width components, which must always be used in pairs.

### Full-Width Components

Full-width components take up the entire width of the page and are the standard for most components.

### Half-Width Components

Half-width components are designed to appear in a two-column layout. To maintain this layout, these components must be used in pairs. If only one half-width component is needed, it should not be used, as this will leave a blank space on the page.

When updating the `dynamic-sections-api.md` file, be sure to specify the component's width and any layout rules that apply to it.

### Components with Multiple Metrics

For components that display a group of items, such as metrics or features, it is important to specify the number of items that should be displayed in a single row. This ensures that the layout remains consistent and that the number of items is always a multiple of the intended number.

When updating the `dynamic-sections-api.md` file, be sure to specify the number of items that should be displayed in a single row and any layout rules that apply to it.

By following these steps, you can ensure that your new reusable component is correctly integrated into the project and that it is easy for other developers to use and maintain. 