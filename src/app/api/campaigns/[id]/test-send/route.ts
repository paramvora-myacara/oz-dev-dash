import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { generateEmailHtml } from '@/components/email-editor/EmailPreviewRenderer';

// Convert any rich-text/HTML into plain text for text-mode test sends
const stripHtmlToText = (input: string): string =>
  input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

// POST /api/campaigns/:id/test-send
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({ error: 'testEmail is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get sample data from first staged email, or use placeholder
    const { data: sampleEmail } = await supabase
      .from('email_queue')
      .select('metadata')
      .eq('campaign_id', campaignId)
      .eq('status', 'staged')
      .limit(1)
      .single();

    const sampleData = sampleEmail?.metadata || {
      Name: 'Test User',
      Email: testEmail,
      Company: 'Test Company',
    };

    // Replace variables helper
    const replaceVariables = (text: string, row: Record<string, string>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
        return value !== undefined ? value : match;
      });
    };

    // Generate email content
    const subjectLineContent = campaign.subject_line?.content || 'Test Email';
    const subject = `[TEST] ${replaceVariables(subjectLineContent, sampleData)}`;
    
    let emailBody: string;
    if (campaign.email_format === 'text') {
      emailBody = (campaign.sections || [])
        .filter((s: any) => s.type === 'text')
        .map((s: any) => stripHtmlToText(replaceVariables(s.content || '', sampleData)))
        .join('\n\n');
    } else {
      emailBody = generateEmailHtml(campaign.sections || [], subject, sampleData);
    }

    // Send via SparkPost (or your email service)
    const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;
    
    if (!SPARKPOST_API_KEY) {
      // Fallback: just return the generated content for review
      return NextResponse.json({
        success: true,
        message: 'Test email content generated (SPARKPOST_API_KEY not set)',
        preview: {
          to: testEmail,
          subject,
          body: emailBody.substring(0, 500) + '...',
        },
      });
    }

    // Send via SparkPost
    const sparkpostResponse = await fetch('https://api.sparkpost.com/api/v1/transmissions', {
      method: 'POST',
      headers: {
        'Authorization': SPARKPOST_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: [{ address: { email: testEmail } }],
        content: {
          from: 'test@connect-ozlistings.com', // Use a test sender
          subject,
          html: campaign.email_format === 'html' ? emailBody : undefined,
          text: campaign.email_format === 'text' ? emailBody : undefined,
        },
        metadata: {
          campaign_id: campaignId,
          is_test: true,
        },
      }),
    });

    if (!sparkpostResponse.ok) {
      const errorText = await sparkpostResponse.text();
      console.error('SparkPost error:', errorText);
      return NextResponse.json({
        error: 'Failed to send test email',
        details: errorText,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/test-send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
