import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { Section } from '@/types/email-editor';

// JSON Schema matching backend Pydantic model
const GenerationResponseSchema = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          section_id: { type: 'string', description: 'The ID of the personalized section' },
          content: { type: 'string', description: 'The generated text content for this section' },
        },
        required: ['section_id', 'content'],
        additionalProperties: false,
      },
    },
  },
  required: ['sections'],
  additionalProperties: false,
};

/**
 * Build prompt matching backend prompts.py build_prompt() exactly
 */
function buildPrompt(
  allSections: Section[],
  personalizedSections: Section[],
  recipientData: Record<string, string>
): string {
  // 1. Build Email Structure Overview
  const sortedSections = [...allSections].sort((a, b) => a.order - b.order);

  const structureLines: string[] = [];
  for (let i = 0; i < sortedSections.length; i++) {
    const section = sortedSections[i];
    const sType = section.type || 'text';
    const sMode = section.mode || 'static';
    const sId = section.id || '';
    const sName = section.name || 'Section';
    const sContent = section.content || '';

    if (sMode === 'personalized') {
      const fields = section.selectedFields || [];
      const fieldsStr = fields.length > 0 ? fields.join(', ') : 'any available';
      const line = `${i + 1}. [GENERATE - ID: "${sId}"] "${sName}"\n   Instructions: ${sContent}\n   Fields to use: ${fieldsStr}`;
      structureLines.push(line);
    } else if (sType === 'button') {
      const url = section.buttonUrl || 'booking link';
      structureLines.push(`${i + 1}. [CTA BUTTON] "${sContent}" -> ${url}`);
    } else {
      // Static Text - show preview
      // Strip simple HTML tags for context clarity
      let plain = sContent.replace(/<br>/g, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '\n');
      // Rudimentary strip (we don't need perfect HTML parsing here, just context)
      if (plain.length > 150) {
        plain = plain.substring(0, 150) + '...';
      }
      structureLines.push(`${i + 1}. [STATIC] "${sName}": "${plain}"`);
    }
  }

  const emailStructure = structureLines.join('\n\n');

  // 2. Build Recipient Fields
  // Filter out email to avoid confusion/PII leakage if not needed
  const relevantFields: Record<string, string> = {};
  for (const [key, value] of Object.entries(recipientData)) {
    if (!key.toLowerCase().includes('email')) {
      relevantFields[key] = value;
    }
  }

  const fieldsLines: string[] = [];
  for (const [k, v] of Object.entries(relevantFields)) {
    fieldsLines.push(`  ${k}: ${v || '(not provided)'}`);
  }
  const fieldsStr = fieldsLines.join('\n');

  // 3. Sections to Generate List
  const sectionsList = personalizedSections
    .map((s) => `- "${s.name || 'Section'}" (ID: ${s.id})`)
    .join('\n');

  return `You are generating personalized email content for a recipient.

EMAIL STRUCTURE (for context):
${emailStructure}

---

SECTIONS TO GENERATE:
${sectionsList}

---

RECIPIENT DATA:
${fieldsStr}

---

Generate the [GENERATE] sections for this recipient. Follow the instructions provided for each section.
Return content that flows naturally with the static sections around it.
Keep each section concise (1-3 sentences).`;
}

// POST /api/preview/generate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections, recipientData, subjectLine } = body;

    // Validation
    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Invalid sections data' }, { status: 400 });
    }

    if (!recipientData || typeof recipientData !== 'object') {
      return NextResponse.json({ error: 'Invalid recipient data' }, { status: 400 });
    }

    // Filter personalized sections
    const personalizedSections = sections.filter((s: Section) => s.mode === 'personalized');

    if (personalizedSections.length === 0) {
      return NextResponse.json({ error: 'No personalized sections to generate' }, { status: 400 });
    }

    // Check for GROQ_API_KEY
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('GROQ_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI generation service is not configured' },
        { status: 500 }
      );
    }

    // Build prompt matching backend exactly
    const prompt = buildPrompt(sections, personalizedSections, recipientData);

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
          name: 'generation_response',
          schema: GenerationResponseSchema,
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
    if (!responseData.sections || !Array.isArray(responseData.sections)) {
      throw new Error('Invalid response structure from AI');
    }

    // Map to dictionary: sectionId -> content
    const generatedContent: Record<string, string> = {};
    for (const section of responseData.sections) {
      if (section.section_id && section.content) {
        generatedContent[section.section_id] = section.content;
      }
    }

    return NextResponse.json({
      generatedContent,
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Generation request timed out' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
