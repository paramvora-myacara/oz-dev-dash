import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const FAMILY_OFFICE_TEMPLATE = `Hi {name} - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies. After 25 years in CRE, I'm now working with leading OZ sponsors and startups in the US. I'd love to hear your thoughts on OZ investing and share what I've learned as well.`;

const DEVELOPER_TEMPLATE = `Hey {name}, I know that you have OZ projects in your pipeline and I wanted to reach out and share with you what we are doing to help other sponsors procure top investors, looking for OZ projects.`;

function renderMessage(template: string, firstName: string): string {
    return template.replace(/\{name\}/g, firstName || '');
}

function selectTemplate(tags: string[]): string {
    // Prioritize family office when both tags are present
    if (tags.includes('family_office')) return FAMILY_OFFICE_TEMPLATE;
    if (tags.includes('developer')) return DEVELOPER_TEMPLATE;
    return FAMILY_OFFICE_TEMPLATE;
}

// GET /api/crm/linkedin-queue?status=queued&sender=Jeff
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sender = searchParams.get('sender');

    let query = supabase
        .from('linkedin_outreach_queue')
        .select(`
            *,
            people:person_id (
                id, first_name, last_name, display_name, tags,
                person_organizations ( organizations ( name ) )
            ),
            linkedin_profiles:linkedin_profile_id ( url, connection_status )
        `)
        .order('queued_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }
    if (sender && sender !== 'all') {
        query = query.eq('sender_account', sender);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

// POST /api/crm/linkedin-queue
// Body: { person_ids: string[], sender_account: string }
export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const { person_ids, sender_account } = await request.json();

        if (!person_ids?.length || !sender_account) {
            return NextResponse.json(
                { error: 'person_ids and sender_account are required' },
                { status: 400 }
            );
        }

        // Fetch people with their LinkedIn profiles and tags
        const { data: people, error: fetchError } = await supabase
            .from('people')
            .select(`
                id, first_name, last_name, display_name, tags,
                person_linkedin ( is_primary, linkedin_profiles ( id, url, is_expired ) )
            `)
            .in('id', person_ids);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        const queueRows: Record<string, unknown>[] = [];
        const skipped: { id: string; reason: string }[] = [];

        type PersonRow = typeof people extends (infer R)[] ? R : never;
        type LinkedInProfile = { id: string; url: string; is_expired?: boolean | null };
        for (const person of (people || [])) {
            const links = (person as PersonRow & {
                person_linkedin?: { is_primary?: boolean; linkedin_profiles?: LinkedInProfile }[];
            }).person_linkedin || [];

            // Prefer primary, but always ignore expired profiles.
            const sorted = [...links].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
            const chosen = sorted.find((l) => l.linkedin_profiles?.url && !l.linkedin_profiles?.is_expired);
            const profile = chosen?.linkedin_profiles;

            if (!profile?.url) {
                skipped.push({ id: person.id, reason: links.length > 0 ? 'Only expired LinkedIn profiles' : 'No LinkedIn profile' });
                continue;
            }
            if (!person.first_name) {
                skipped.push({ id: person.id, reason: 'No first name' });
                continue;
            }

            const template = selectTemplate(person.tags || []);
            const message = renderMessage(template, person.first_name);

            queueRows.push({
                person_id: person.id,
                linkedin_profile_id: profile.id,
                linkedin_url: profile.url,
                person_name: person.display_name || person.first_name,
                message,
                sender_account,
                status: 'queued',
            });
        }

        if (queueRows.length === 0) {
            return NextResponse.json({ queued: 0, skipped }, { status: 200 });
        }

        // Insert — partial unique index will reject duplicates
        const { data: inserted, error: insertError } = await supabase
            .from('linkedin_outreach_queue')
            .insert(queueRows)
            .select();

        if (insertError) {
            // Handle unique constraint violations gracefully
            if (insertError.code === '23505') {
                return NextResponse.json(
                    { error: 'Some people are already queued', details: insertError.message },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            queued: inserted?.length || 0,
            skipped,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid request';
        return NextResponse.json(
            { error: message },
            { status: 400 }
        );
    }
}
