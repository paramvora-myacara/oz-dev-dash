import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { createListingGeneralFolder } from '@/utils/supabaseImages';

export async function POST(request: NextRequest) {
  console.log('POST /api/admin/listings called');
  try {
    // Verify admin authentication and role - use same pattern as other admin APIs
    console.log('Verifying admin authentication...');
    const user = await verifyAdmin();
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('User authenticated:', user.email, 'Role:', user.role);

    // Check if user has internal_admin role
    if (user.role !== 'internal_admin') {
      console.log('User does not have internal_admin role:', user.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    console.log('User has internal_admin role');

    const supabase = createAdminClient();

    const body = await request.json();
    const { slug, title, sections } = body;

    if (!slug || !title || !sections) {
      return NextResponse.json(
        { error: 'Slug, title, and sections are required' },
        { status: 400 }
      );
    }

    // Validate that sections is valid JSON
    let sectionsData;
    try {
      sectionsData = JSON.parse(sections);
    } catch (e) {
      return NextResponse.json(
        { error: 'Sections must be valid JSON' },
        { status: 400 }
      );
    }

    // Generate project ID from slug
    const projectId = `${slug}-001`;
    const listingId = crypto.randomUUID();
    const versionId = crypto.randomUUID();

    // Create the general folder in storage
    console.log('Creating general folder for project:', projectId);
    const folderResult = await createListingGeneralFolder(projectId);
    console.log('Folder creation result:', folderResult);
    if (!folderResult.success) {
      console.error('Failed to create general folder:', folderResult.error);
      // Don't fail the request, just log the error - folder will be created on first upload
    } else {
      console.log('General folder created successfully for project:', projectId);
    }

    // Create listing in database (Step 1 from insertion guide)
    console.log('Creating listing record...');
    const { data: listing, error: insertError } = await supabase
      .from('listings')
      .insert({
        id: listingId,
        slug,
        title,
        current_version_id: null, // Will be set after version creation
        has_vault: false, // Default to false, can be updated later
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }
    console.log('Listing created:', listing.id);

    // Create listing version (Step 2 from insertion guide)
    console.log('Creating listing version...');
    const { error: versionError } = await supabase
      .from('listing_versions')
      .insert({
        id: versionId,
        listing_id: listingId,
        version_number: 1, // First version is always 1
        data: sectionsData,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        news_links: []
      });

    if (versionError) {
      console.error('Version insert error:', versionError);
      // Clean up the listing if version creation fails
      await supabase.from('listings').delete().eq('id', listingId);
      return NextResponse.json(
        { error: 'Failed to create listing version' },
        { status: 500 }
      );
    }
    console.log('Listing version created:', versionId);

    // Update listing to reference current version (Step 3 from insertion guide)
    console.log('Updating listing with current version...');
    const { error: updateError } = await supabase
      .from('listings')
      .update({ current_version_id: versionId })
      .eq('id', listingId);

    if (updateError) {
      console.error('Listing update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing with version' },
        { status: 500 }
      );
    }
    console.log('Listing updated with current version');

    // Associate the admin user with the listing
    const { error: associationError } = await supabase
      .from('admin_user_listings')
      .insert({
        user_id: user.id,
        listing_slug: slug
      });

    if (associationError) {
      console.error('Association error:', associationError);
      // Don't fail the request for association errors
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        has_vault: listing.has_vault
      },
      message: 'Listing created successfully'
    });

  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
