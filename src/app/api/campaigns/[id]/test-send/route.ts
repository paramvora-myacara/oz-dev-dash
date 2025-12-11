import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { generateEmailHtml } from '@/lib/email/generateEmailHtml';
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
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  console.log('[test-send] Starting test send request');
  
  try {
    console.log('[test-send] Verifying admin user...');
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      console.log('[test-send] Unauthorized - no admin user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('[test-send] Admin user verified:', adminUser.email || adminUser.id);

    console.log('[test-send] Parsing params and body...');
    const { id: campaignId } = await params;
    console.log('[test-send] Campaign ID:', campaignId);
    
    const body = await request.json();
    console.log('[test-send] Request body:', { 
      testEmail: body.testEmail, 
      recipientEmailId: body.recipientEmailId 
    });
    
    const { testEmail, recipientEmailId } = body;

    if (!testEmail) {
      console.log('[test-send] Missing testEmail');
      return NextResponse.json({ error: 'testEmail is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      console.log('[test-send] Invalid email format:', testEmail);
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    console.log('[test-send] Email validated:', testEmail);

    console.log('[test-send] Creating Supabase client...');
    const supabase = createAdminClient();

    // Get campaign
    console.log('[test-send] Fetching campaign from database...');
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      console.error('[test-send] Campaign fetch error:', campaignError);
      return NextResponse.json({ 
        error: 'Campaign not found',
        details: campaignError.message 
      }, { status: 404 });
    }
    
    if (!campaign) {
      console.log('[test-send] Campaign not found for ID:', campaignId);
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    
    console.log('[test-send] Campaign found:', {
      id: campaign.id,
      name: campaign.name,
      emailFormat: campaign.email_format,
      sectionsCount: campaign.sections?.length || 0
    });

    // Get sample data from selected recipient email, or first staged email, or use placeholder
    console.log('[test-send] Fetching recipient data...');
    let sampleData: Record<string, string>;
    
    if (recipientEmailId) {
      console.log('[test-send] Using recipientEmailId:', recipientEmailId);
      const { data: selectedEmail, error: emailError } = await supabase
        .from('email_queue')
        .select('metadata')
        .eq('id', recipientEmailId)
        .eq('campaign_id', campaignId)
        .single();
      
      if (emailError) {
        console.error('[test-send] Error fetching recipient email:', emailError);
      }
      
      console.log('[test-send] Selected email metadata:', selectedEmail?.metadata ? Object.keys(selectedEmail.metadata) : 'none');
      
      sampleData = selectedEmail?.metadata || {
        Name: 'Test User',
        Email: testEmail,
        Company: 'Test Company',
      };
    } else {
      console.log('[test-send] No recipientEmailId, fetching first staged email...');
      const { data: sampleEmail, error: sampleError } = await supabase
        .from('email_queue')
        .select('metadata')
        .eq('campaign_id', campaignId)
        .eq('status', 'staged')
        .limit(1)
        .single();

      if (sampleError) {
        console.error('[test-send] Error fetching sample email:', sampleError);
      }

      console.log('[test-send] Sample email metadata:', sampleEmail?.metadata ? Object.keys(sampleEmail.metadata) : 'none');

      sampleData = sampleEmail?.metadata || {
        Name: 'Test User',
        Email: testEmail,
        Company: 'Test Company',
      };
    }
    
    console.log('[test-send] Sample data keys:', Object.keys(sampleData));

    // Replace variables helper
    const replaceVariables = (text: string, row: Record<string, string>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
        return value !== undefined ? value : match;
      });
    };

    // Generate AI content for personalized sections using Groq
    console.log('[test-send] Generating AI content with Groq...');
    const sections: Section[] = campaign.sections || [];
    console.log('[test-send] Sections count:', sections.length);
    
    const personalizedSections = sections.filter((s) => s.mode === 'personalized');
    console.log('[test-send] Personalized sections:', personalizedSections.length);
    
    let generatedContent: Record<string, string> = {};
    
    if (personalizedSections.length > 0) {
      // Check for GROQ_API_KEY
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) {
        console.error('[test-send] GROQ_API_KEY is not set');
        throw new Error('AI generation service is not configured');
      }

      // Build prompt matching backend exactly
      console.log('[test-send] Building prompt...');
      console.log('[test-send] Sample data keys:', Object.keys(sampleData));
      console.log('[test-send] Sample data full:', JSON.stringify(sampleData, null, 2));
      console.log('[test-send] Personalized sections:', personalizedSections.map(s => ({ id: s.id, name: s.name, content: s.content?.substring(0, 100) })));
      
      const prompt = buildPrompt(sections, personalizedSections, sampleData);
      console.log('[test-send] Prompt length:', prompt.length);
      console.log('[test-send] Full prompt:', prompt);

      // Initialize Groq client
      console.log('[test-send] Initializing Groq client...');
      const groq = new Groq({ apiKey: groqApiKey });

      try {
        // Generate content using Groq
        console.log('[test-send] Calling Groq API...');
        console.log('[test-send] JSON Schema being sent:', JSON.stringify(GenerationResponseSchema, null, 2));
        
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

        console.log('[test-send] Groq API response received');
        console.log('[test-send] Response object keys:', Object.keys(response));
        console.log('[test-send] Response choices length:', response.choices?.length);
        console.log('[test-send] Response choice finish_reason:', response.choices[0]?.finish_reason);

        // Parse response
        const responseContent = response.choices[0]?.message?.content;
        if (!responseContent) {
          console.error('[test-send] Empty response from Groq');
          console.error('[test-send] Full response object:', JSON.stringify(response, null, 2));
          throw new Error('Empty response from AI');
        }

        console.log('[test-send] FULL RAW RESPONSE CONTENT:', responseContent);
        console.log('[test-send] Parsing JSON response...');
        
        let responseData;
        try {
          responseData = JSON.parse(responseContent);
        } catch (parseError: any) {
          console.error('[test-send] JSON parse error:', parseError);
          console.error('[test-send] Full response content:', responseContent);
          throw new Error(`Failed to parse JSON: ${parseError?.message}`);
        }
        
        console.log('[test-send] Parsed response data:', JSON.stringify(responseData, null, 2));
        console.log('[test-send] Response data keys:', Object.keys(responseData));
        
        // Validate response structure
        if (!responseData.sections || !Array.isArray(responseData.sections)) {
          console.error('[test-send] Invalid response structure:', responseData);
          throw new Error('Invalid response structure from AI');
        }

        console.log('[test-send] Response sections count:', responseData.sections.length);

        // Map to dictionary: sectionId -> content
        for (const section of responseData.sections) {
          if (section.section_id && section.content) {
            generatedContent[section.section_id] = section.content;
          }
        }
        
        console.log('[test-send] Generated content keys:', Object.keys(generatedContent));
      } catch (groqError: any) {
        console.error('[test-send] Groq API error:', groqError);
        console.error('[test-send] Groq API error stack:', groqError?.stack);
        throw new Error(`Groq API failed: ${groqError?.message || 'Unknown error'}`);
      }
    } else {
      console.log('[test-send] No personalized sections, skipping AI generation');
    }

    // Generate email content
    console.log('[test-send] Generating email content...');
    const subjectLineContent = campaign.subject_line?.content || 'Test Email';
    console.log('[test-send] Subject line content:', subjectLineContent);
    
    const subject = replaceVariables(subjectLineContent, sampleData);
    console.log('[test-send] Processed subject:', subject);
    
    let emailBody: string;
    try {
      if (campaign.email_format === 'text') {
        console.log('[test-send] Generating text format email...');
        const orderedSections = sections
          .filter((s: Section) => s.type === 'text')
          .sort((a, b) => a.order - b.order);
        
        emailBody = orderedSections
          .map((s: Section) => {
            if (s.mode === 'personalized') {
              const aiContent = generatedContent[s.id];
              return aiContent || `[${s.name} - AI generation failed]`;
            }
            return stripHtmlToText(replaceVariables(s.content || '', sampleData));
          })
          .join('\n\n');
        console.log('[test-send] Text email body length:', emailBody.length);
      } else {
        console.log('[test-send] Generating HTML format email...');
        emailBody = generateEmailHtml(sections, subject, sampleData, undefined, generatedContent);
        console.log('[test-send] HTML email body length:', emailBody.length);
      }
    } catch (bodyError: any) {
      console.error('[test-send] Email body generation error:', bodyError);
      console.error('[test-send] Email body generation error stack:', bodyError?.stack);
      throw new Error(`Email body generation failed: ${bodyError?.message || 'Unknown error'}`);
    }

    // Send via SparkPost (or your email service)
    console.log('[test-send] Checking SparkPost API key...');
    const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;
    
    if (!SPARKPOST_API_KEY) {
      console.log('[test-send] SPARKPOST_API_KEY not set, returning preview');
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

    // Send via SparkPost (matching backend email_sender.py exactly)
    console.log('[test-send] Sending email via SparkPost...');
    
    // Determine if body is HTML or plain text (matching backend logic: checks for < and >)
    const isHtml = emailBody.includes('<') && emailBody.includes('>');
    const textBody = !isHtml ? emailBody : undefined;
    const htmlBody = isHtml ? emailBody : undefined;
    
    // Build payload matching backend email_sender.py exactly
    const sparkpostPayload: Record<string, any> = {
      recipients: [{ address: { email: testEmail } }],
      content: {
        from: 'jeff@connect-ozlistings.com',
        subject,
      },
      options: {
        click_tracking: false, // Matching backend
      },
      metadata: {
        campaign_id: campaignId,
        is_test: true,
      },
    };
    
    // Only add html/text if they exist (matching backend - no undefined values)
    if (htmlBody) {
      sparkpostPayload.content.html = htmlBody;
    }
    if (textBody) {
      sparkpostPayload.content.text = textBody;
    }
    
    console.log('[test-send] SparkPost payload:', {
      to: testEmail,
      subject,
      format: campaign.email_format,
      isHtml,
      bodyLength: emailBody.length,
      hasHtml: !!htmlBody,
      hasText: !!textBody
    });
    
    try {
      const sparkpostResponse = await fetch('https://api.sparkpost.com/api/v1/transmissions', {
        method: 'POST',
        headers: {
          'Authorization': SPARKPOST_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sparkpostPayload),
      });

      console.log('[test-send] SparkPost response status:', sparkpostResponse.status);

      if (!sparkpostResponse.ok) {
        const errorText = await sparkpostResponse.text();
        console.error('[test-send] SparkPost error response:', errorText);
        return NextResponse.json({
          error: 'Failed to send test email',
          details: errorText,
        }, { status: 500 });
      }

      const responseData = await sparkpostResponse.json();
      console.log('[test-send] SparkPost success:', responseData);
      
      const duration = Date.now() - startTime;
      console.log(`[test-send] Request completed successfully in ${duration}ms`);
      
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${testEmail}`,
      });
    } catch (sparkpostError: any) {
      console.error('[test-send] SparkPost request error:', sparkpostError);
      console.error('[test-send] SparkPost request error stack:', sparkpostError?.stack);
      throw new Error(`SparkPost request failed: ${sparkpostError?.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[test-send] Request failed after ${duration}ms`);
    console.error('[test-send] Error type:', error?.constructor?.name);
    console.error('[test-send] Error message:', error?.message);
    console.error('[test-send] Error stack:', error?.stack);
    
    // Log additional error details if available
    if (error?.cause) {
      console.error('[test-send] Error cause:', error.cause);
    }
    if (error?.response) {
      console.error('[test-send] Error response:', error.response);
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}
