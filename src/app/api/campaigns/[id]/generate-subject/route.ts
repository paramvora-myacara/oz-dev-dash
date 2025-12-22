import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import Groq from 'groq-sdk';
import type { Section } from '@/types/email-editor';

const SubjectResponseSchema = {
  type: 'object',
  properties: {
    subject: {
      type: 'string',
      description: 'The generated subject line',
    },
  },
  required: ['subject'],
  additionalProperties: false,
};

// POST /api/campaigns/:id/generate-subject
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { instructions } = await request.json();

    if (!instructions || typeof instructions !== 'string' || instructions.trim().length === 0) {
      return NextResponse.json({ error: 'Instructions are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get campaign with sections
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('name, sections')
      .eq('id', id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Extract email content from sections for context
    const sections: Section[] = campaign.sections || [];
    const emailContent = sections
      .filter((s: Section) => s.type === 'text')
      .map((s: Section) => {
        if (s.mode === 'personalized') {
          return `[Personalized content about ${s.name}]`;
        }
        return s.content;
      })
      .join(' ')
      .substring(0, 500); // Limit to first 500 chars to avoid prompt bloat

    // Check for GROQ_API_KEY
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('GROQ_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI generation service is not configured' },
        { status: 500 }
      );
    }

    // Generate subject using AI
    // NOTE: All behavioral instructions (audience, tone, constraints) come from `instructions`,
    // which is fully visible/editable in the frontend. The backend only adds factual context.
    const prompt = `${instructions}

---
CAMPAIGN CONTEXT:
- Name: "${campaign.name}"

EMAIL CONTENT CONTEXT:
${emailContent}
`;

    // Initialize Groq client
    const groq = new Groq({ apiKey: groqApiKey });

    // Generate content using Groq
    const response = await groq.chat.completions.create({
      model: 'moonshotai/kimi-k2-instruct-0905',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'subject_generation_response',
          schema: SubjectResponseSchema,
        },
      },
    });

    // Parse response
    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Empty response from AI');
    }

    const responseData = JSON.parse(responseContent);

    // Validate response structure
    if (!responseData.subject || typeof responseData.subject !== 'string') {
      throw new Error('Invalid response structure from AI');
    }

    // Persist the prompt used for this campaign (best-effort; don't fail generation if this fails)
    try {
      await supabase
        .from('campaigns')
        .update({
          subject_prompt: instructions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (e) {
      console.error('Failed to persist subject_prompt for campaign', id, e);
    }

    return NextResponse.json({ subject: responseData.subject });
  } catch (error) {
    console.error('POST /api/campaigns/:id/generate-subject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
