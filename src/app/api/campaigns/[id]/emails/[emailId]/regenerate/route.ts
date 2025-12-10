import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { generateEmailHtml } from '@/lib/email/generateEmailHtml';
import { generateUnsubscribeUrl } from '@/lib/email/unsubscribe';
import { generateForSingleRecipient } from '@/lib/ai/generatePersonalizedContent';
import type { Section } from '@/types/email-editor';

// Convert any rich-text/HTML into plain text for text-mode campaigns
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

// Helper to replace template variables
const replaceVariables = (text: string, row: Record<string, string>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
        return value !== undefined ? value : match;
    });
};

// POST /api/campaigns/:id/emails/:emailId/regenerate
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; emailId: string }> }
) {
    try {
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: campaignId, emailId } = await params;
        const supabase = createAdminClient();

        // 1. Get the email from email_queue
        const { data: email, error: emailError } = await supabase
            .from('email_queue')
            .select('*')
            .eq('id', emailId)
            .eq('campaign_id', campaignId)
            .single();

        if (emailError || !email) {
            return NextResponse.json({ error: 'Email not found' }, { status: 404 });
        }

        if (email.status !== 'staged') {
            return NextResponse.json(
                { error: 'Can only regenerate staged emails' },
                { status: 400 }
            );
        }

        // 2. Get campaign configuration
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const sections: Section[] = campaign.sections || [];
        const personalizedSections = sections.filter((s) => s.mode === 'personalized');

        if (personalizedSections.length === 0) {
            return NextResponse.json(
                { error: 'No personalized sections to regenerate' },
                { status: 400 }
            );
        }

        // 3. Get recipient data from email metadata
        const recipientData = (email.metadata || {}) as Record<string, string>;

        // 4. Generate new AI content
        const aiContentMap = await generateForSingleRecipient(sections, recipientData);

        // 5. Build new email body
        const subjectLineContent = campaign.subject_line?.content || '';
        const subject = replaceVariables(subjectLineContent, recipientData);
        const unsubscribeUrl = generateUnsubscribeUrl(email.to_email, process.env.NEXT_PUBLIC_APP_URL);

        let body: string;

        if (campaign.email_format === 'text') {
            body = sections
                .filter((s: Section) => s.type === 'text')
                .sort((a, b) => a.order - b.order)
                .map((s: Section) => {
                    if (s.mode === 'personalized') {
                        const aiContent = aiContentMap.get(s.id);
                        return aiContent || `[${s.name} - AI generation failed]`;
                    }
                    return stripHtmlToText(replaceVariables(s.content || '', recipientData));
                })
                .join('\n\n');
            body += `\n\n---\nIf you'd prefer not to receive these emails, you can unsubscribe here: ${unsubscribeUrl}`;
        } else {
            const sectionsWithAiContent = sections.map((s: Section) => {
                if (s.mode === 'personalized') {
                    const aiContent = aiContentMap.get(s.id);
                    return {
                        ...s,
                        content: aiContent || `[${s.name} - AI generation failed]`,
                    };
                }
                return s;
            });
            body = generateEmailHtml(sectionsWithAiContent, subject, recipientData, unsubscribeUrl);
        }

        // 6. Update the email
        const { data: updatedEmail, error: updateError } = await supabase
            .from('email_queue')
            .update({
                subject,
                body,
                is_edited: false, // Reset edited flag since it's AI-generated now
                updated_at: new Date().toISOString(),
            })
            .eq('id', emailId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to update email: ' + updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            email: {
                id: updatedEmail.id,
                toEmail: updatedEmail.to_email,
                subject: updatedEmail.subject,
                body: updatedEmail.body,
                isEdited: updatedEmail.is_edited,
            },
        });
    } catch (error) {
        console.error('POST /api/campaigns/:id/emails/:emailId/regenerate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
