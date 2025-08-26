import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyAdminCanEditSlug } from '@/lib/admin/auth';
import { uploadImage, deleteImage, getFilenameFromUrl } from '@/utils/supabaseImages';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Verify admin authorization
    const adminUser = await verifyAdminCanEditSlug(slug);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file || !category) {
      return NextResponse.json(
        { error: 'File and category are required' },
        { status: 400 }
      );
    }

    // Generate project ID from slug
    const projectId = `${slug}-001`;

    // Upload image
    const result = await uploadImage(projectId, category, file);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Verify admin authorization
    const adminUser = await verifyAdminCanEditSlug(slug);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, category } = body;

    if (!imageUrl || !category) {
      return NextResponse.json(
        { error: 'Image URL and category are required' },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const filename = getFilenameFromUrl(imageUrl);
    if (!filename) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }

    // Generate project ID from slug
    const projectId = `${slug}-001`;

    // Delete image
    const result = await deleteImage(projectId, category, filename);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 