# SignWell Recipients Implementation (DEPRECATED)

**⚠️ DEPRECATED:** This document describes the old implementation that used developer recipient fields. These database fields have been removed as of migration `20251230120318_remove_redundant_developer_fields.sql`. Developer information is now static text in the CA document template.

This document outlines the implementation of dynamic recipients in the SignWell API integration, specifically for adding a "Developer Entity" recipient with the developer entity name and email based on the listing being signed.

## Overview

The SignWell API now automatically adds a second recipient called "Developer Entity" with the developer entity name and email based on which listing the user is signing for. This approach uses recipients instead of template fields for better document structure.

## Database Changes

### 1. Added Developer Fields

New fields have been added to the `public.listings` table:

```sql
ALTER TABLE public.listings 
ADD COLUMN developer_entity_name text;

ALTER TABLE public.listings 
ADD COLUMN developer_ca_email text;

ALTER TABLE public.listings 
ADD COLUMN developer_ca_name text;
```

### 2. Populated with Developer Information

Each listing has been updated with its corresponding developer information:

- **The Edge on Main**: 
  - `developer_entity_name`: `ACARA OZ Fund I LLC`
  - `developer_ca_name`: `ACARA OZ Fund I LLC`
  - `developer_ca_email`: `legal@acara.com`

- **SoGood Dallas**: 
  - `developer_entity_name`: `Hoque Global`
  - `developer_ca_name`: `Hoque Global`
  - `developer_ca_email`: `legal@hoque.com`

- **The Marshall St. Louis**: 
  - `developer_entity_name`: `Aptitude Development`
  - `developer_ca_name`: `Aptitude Development`
  - `developer_ca_email`: `legal@aptitude.com`

- **University of Nevada, Reno**: 
  - `developer_entity_name`: `UP Campus`
  - `developer_ca_name`: `UP Campus`
  - `developer_ca_email`: `legal@upcampus.com`

## API Implementation

### SignWell Document Creation Route

The `/api/signwell/create-document` route now:

1. **Fetches the listing**: Queries the `public.listings` table to get the developer information for the target listing
2. **Adds a second recipient**: Includes the "Developer Entity" as a second recipient with the developer name and email
3. **Maintains template fields**: Still includes the `developer_entity_name` in template fields for backward compatibility

```typescript
// Fetch developer information from database
const { data: listing, error: listingError } = await supabase
  .from('listings')
  .select('developer_entity_name, developer_ca_email, developer_ca_name')
  .eq('slug', targetSlug)
  .single()

// Include both recipients
recipients: [
  {
    id: "1",
    placeholder_name: "receiving party",
    name: fullName,
    email: email,
  },
  {
    id: "2",
    placeholder_name: "developer entity",
    name: listing.developer_ca_name || listing.developer_entity_name || "Development Entity",
    email: listing.developer_ca_email || "noreply@development-entity.com"
  }
],

// Template fields for backward compatibility
template_fields: [
  {
    api_id: "developer_entity_name",
    value: listing.developer_entity_name || "Development Entity"
  }
]
```

## SignWell Template Configuration

### Recipient Setup

In your SignWell template, you need to create two recipient placeholders:

1. **Receiving Party** (ID: "1")
   - **Placeholder Name**: `receiving party`
   - **Field Type**: Signature field for the user

2. **Developer Entity** (ID: "2")
   - **Placeholder Name**: `developer entity`
   - **Field Type**: Text field (pre-populated, not editable)
   - **Position**: Place it where you want the developer entity name to appear

### Template Field Setup

Additionally, you can create a template field with:

- **API ID**: `developer_entity_name`
- **Field Type**: Text field (not signature or initials)
- **Position**: Place it where you want the developer entity name to appear

### Recipient Properties

- **Receiving Party**: 
  - Editable: Yes (user fills in their name and email)
  - Required: Yes
  - Can sign: Yes

- **Developer Entity**:
  - Editable: No (pre-populated from database)
  - Required: Yes
  - Can sign: No (informational only)

## Migration Steps

### 1. Run Database Schema Update

```bash
# In Supabase SQL Editor, run:
docs/sql/oz-schema.sql
```

### 2. Apply Developer Information

```bash
# In Supabase SQL Editor, run:
scripts/add-developer-ca-fields.sql
```

### 3. Verify Implementation

```sql
-- Check that all listings have developer information
SELECT slug, title, developer_entity_name, developer_ca_name, developer_ca_email
FROM public.listings 
ORDER BY slug;
```

## Testing

### Test the Integration

1. **Navigate to any listing page**
2. **Click "Request Vault Access"**
3. **Fill out the confidentiality agreement form**
4. **Verify the "Developer Entity" recipient is added with the correct name and email**

### Debug Logging

The API route includes comprehensive logging:

```typescript
console.error('Error fetching listing:', listingError)
console.error('SignWell API error:', errorData)
```

## Environment Variables

Ensure these environment variables are set:

```bash
NEXT_PUBLIC_SIGNWELL_API_KEY=your_api_key
NEXT_PUBLIC_SIGNWELL_TEMPLATE_ID=your_template_id
```

## Future Enhancements

### Additional Recipients

Consider adding more recipients for different document types:

- **Witness**: For documents requiring witness signatures
- **Notary**: For notarized documents
- **Legal Counsel**: For legal review

### Dynamic Recipient Mapping

Create a configuration file to map listing properties to recipient information:

```typescript
const recipientMappings = {
  'the-edge-on-main': {
    disclosing_entity: 'ACARA OZ Fund I LLC',
    contact_email: 'legal@acara.com',
    // ... other recipient details
  }
}
```

## Troubleshooting

### Common Issues

1. **Recipient not appearing**: Check that the placeholder names match exactly in SignWell
2. **Database errors**: Verify the new developer fields exist in the listings table
3. **Template errors**: Ensure both recipient placeholders are configured in your template

### Error Handling

The implementation includes fallback values:

```typescript
name: listing.developer_ca_name || listing.developer_entity_name || "Development Entity"
email: listing.developer_ca_email || "noreply@development-entity.com"
```

This ensures the document creation doesn't fail if the database fields are missing.

## Benefits of This Approach

### Advantages over Template Fields

1. **Better Document Structure**: Recipients are a more natural way to represent parties in legal documents
2. **Easier Template Management**: No need to manage complex field mappings
3. **Audit Trail**: SignWell tracks recipient information for compliance
4. **Flexibility**: Easy to add/remove recipients without changing template structure
5. **Dual Approach**: Maintains both recipients and template fields for maximum flexibility

### Use Cases

This approach is ideal for:
- Confidentiality Agreements
- Non-Disclosure Agreements
- Investment Agreements
- Any document with multiple parties 