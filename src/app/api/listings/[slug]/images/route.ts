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
    const files = formData.getAll('file') as File[];
    const category = formData.get('category') as string;

    if (!files || files.length === 0 || !category) {
      return NextResponse.json(
        { error: 'Files and category are required' },
        { status: 400 }
      );
    }

    // Generate project ID from slug
    const projectId = `${slug}-001`;

    // Upload images
    const results = await Promise.all(
      files.map(file => uploadImage(projectId, category, file))
    );

    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);

    if (successfulUploads.length === 0 && files.length > 0) {
      return NextResponse.json(
        { error: failedUploads[0]?.error || 'Upload failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      urls: successfulUploads.map(r => r.url),
      message: `${successfulUploads.length} images uploaded successfully${failedUploads.length > 0 ? `, ${failedUploads.length} failed` : ''}`
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