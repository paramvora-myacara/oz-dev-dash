# Image Section Methodology

This document outlines the standard methodology for implementing image-enabled sections in the OZ Dev Dash application. We have transitioned from a "URL-Driven" (JSON-based) approach to a "Folder-Driven" (Storage-based) approach for maximum flexibility and ease of maintenance.

## 1. Folder-Driven Methodology

The current standard is to have components automatically scan specific Supabase Storage folders rather than storing URLs in the listing JSON.

### Benefits
- **Zero JSON Maintenance**: You don't need to manually update URLs in the listing data.
- **Dynamic Updates**: Simply uploading a file to the correct folder makes it appear on the site immediately.
- **Resilience**: Changing names or data in the JSON won't break image links.

### Storage Structure Convention
Images are stored in the `oz-projects-images` bucket using the following pattern:
`{projectId}/{category-path}/[sub-category-or-slug]/{filename}`

**Examples:**
- **Hero Images**: `celadon-001/general/`
- **Floor Plans**: `celadon-001/details/property-overview/floorplansitemapsection/floorplan/`
- **Sponsor About**: `celadon-001/details/sponsor-profile/about/`
- **Leadership Team**: `celadon-001/details/sponsor-profile/leadership/[member-name-slug]/`

## 2. Implementation Checklist

### A. Component Setup
1.  **Fetch on Load**: Use `getAvailableImages` from `@/utils/supabaseImages` inside a `useEffect`.
2.  **State Management**: Store the result in a local state (e.g., `const [images, setImages] = useState<string[]>([])`).
3.  **Automatic Rescan**: The `onImagesChange` callback of the `ImageManager` should simply trigger a re-fetch of the folder content.

### B. UI/UX Standards
1.  **Aspect Ratios**: Use consistent aspect ratios (e.g., `aspect-[4/3]` for sponsor photos, `aspect-square` for avatars).
2.  **Containment**: Always use `object-contain` for property/sponsor photos to ensure logos or rectangular images aren't cropped. Add a neutral background (e.g., `bg-white` or `bg-gray-100`) to the container.
3.  **Optional Rendering**:
    - If a section is empty, hide the image container entirely to maintain a clean text-only layout.
    - For grids (like Leadership), if at least one item has an image, show placeholders for the rest to maintain alignment.
4.  **Edit Mode**: Always provide a clear "Manage Images" button (using the `Plus` icon) when `isEditMode` is true.

### C. Technical Example (Leadership Member)
```tsx
const loadMemberImages = useCallback(async () => {
  const images = await getAvailableImages(
    projectId, 
    `details/sponsor-profile/leadership/${slugify(member.name)}`
  );
  setMemberImages(images);
}, [projectId, member.name]);
```

## 3. Image Manager Integration

Use the `@/components/editor/ImageManager` component for all upload/delete functionality.

```tsx
<ImageManager
  listingSlug={listingSlug}
  isOpen={isOpen}
  onClose={onClose}
  onImagesChange={handleImagesChange} // Trigger re-scan here
  defaultCategory={`details/sponsor-profile/leadership/${slugify(member.name)}`}
/>
```

## 4. Legend of Categories
The standard categories are defined in `src/utils/supabaseImages.ts` and mapped to user-friendly names in `src/components/editor/ImageManager.tsx`. When adding a new section, ensure the category path is added to these files if it's a new top-level category.
