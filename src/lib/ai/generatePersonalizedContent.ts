import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { Section, CSVRow } from '@/types/email-editor';

// Batch size for processing recipients
const BATCH_SIZE = 10;

// Schema for structured AI response
const BatchResponseSchema = z.object({
    results: z.array(z.object({
        recipientIndex: z.number().describe('Index of the recipient in the batch (0-based)'),
        sections: z.array(z.object({
            sectionId: z.string().describe('ID of the personalized section'),
            content: z.string().describe('The generated content for this section'),
        })),
    })),
});

type BatchResponse = z.infer<typeof BatchResponseSchema>;

/**
 * Build the prompt for a batch of recipients
 */
function buildBatchPrompt(
    allSections: Section[],
    personalizedSections: Section[],
    recipients: Array<{ index: number; fields: Record<string, string> }>
): string {
    // Build email structure overview with all sections
    const emailStructure = allSections
        .sort((a, b) => a.order - b.order)
        .map((s, i) => {
            if (s.mode === 'personalized') {
                return `${i + 1}. [GENERATE - ID: "${s.id}"] "${s.name}"
   Instructions: ${s.content}
   Fields to use: ${s.selectedFields?.join(', ') || 'any available'}`;
            } else if (s.type === 'button') {
                return `${i + 1}. [CTA BUTTON] "${s.content}" → ${s.buttonUrl || 'booking link'}`;
            } else {
                // Static text - show preview for context
                const plainText = s.content
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .trim();
                const preview = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
                return `${i + 1}. [STATIC] "${s.name}": "${preview}"`;
            }
        })
        .join('\n\n');

    // Build recipients list
    const recipientsList = recipients
        .map((r) => {
            const fields = Object.entries(r.fields)
                .filter(([key]) => !key.toLowerCase().includes('email')) // Don't include email in AI context
                .map(([key, value]) => `  ${key}: ${value || '(not provided)'}`)
                .join('\n');
            return `Recipient ${r.index}:\n${fields}`;
        })
        .join('\n\n');

    // Sections to generate (just the IDs)
    const sectionsToGenerate = personalizedSections
        .map((s) => `- "${s.name}" (ID: ${s.id})`)
        .join('\n');

    return `You are generating personalized email content for ${recipients.length} recipients.

EMAIL STRUCTURE (for context):
${emailStructure}

---

SECTIONS TO GENERATE:
${sectionsToGenerate}

---

RECIPIENTS:
${recipientsList}

---

Generate the [GENERATE] sections for each recipient. Follow the instructions provided for each section.
Return content that flows naturally with the static sections around it.
Keep each section concise (1-3 sentences).`;
}

/**
 * Generate personalized content for a single batch of recipients
 */
export async function generatePersonalizedBatch(
    allSections: Section[],
    personalizedSections: Section[],
    recipients: Array<{ index: number; fields: Record<string, string> }>
): Promise<BatchResponse['results']> {
    if (personalizedSections.length === 0) {
        return [];
    }

    const prompt = buildBatchPrompt(allSections, personalizedSections, recipients);

    const { object } = await generateObject({
        model: google('gemini-2.5-flash-lite'),
        schema: BatchResponseSchema,
        prompt,
    });

    return object.results;
}

/**
 * Generate personalized content for all recipients in batches
 * Returns a Map of email -> Map of sectionId -> content
 */
export async function generateAllPersonalizedContent(
    sections: Section[],
    recipients: CSVRow[],
    onProgress?: (completed: number, total: number) => void
): Promise<Map<string, Map<string, string>>> {
    const personalizedSections = sections.filter((s) => s.mode === 'personalized');

    if (personalizedSections.length === 0) {
        return new Map();
    }

    const results = new Map<string, Map<string, string>>();
    const batches = chunkArray(recipients, BATCH_SIZE);
    let completed = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        // Build batch with indices
        const batchRecipients = batch.map((row, localIndex) => ({
            index: localIndex,
            fields: row,
        }));

        try {
            const batchResults = await generatePersonalizedBatch(
                sections,
                personalizedSections,
                batchRecipients
            );

            // Store results keyed by recipient email
            for (const result of batchResults) {
                const recipient = batch[result.recipientIndex];
                const email = (recipient.Email || recipient.email || '').toLowerCase().trim();

                if (email) {
                    const sectionMap = new Map<string, string>();
                    for (const section of result.sections) {
                        sectionMap.set(section.sectionId, section.content);
                    }
                    results.set(email, sectionMap);
                }
            }
        } catch (error) {
            console.error(`Error generating batch ${batchIndex}:`, error);
            // Continue with next batch - failed recipients will get placeholder content
        }

        completed += batch.length;
        onProgress?.(completed, recipients.length);
    }

    return results;
}

/**
 * Generate personalized content for a single recipient (used for regeneration)
 */
export async function generateForSingleRecipient(
    sections: Section[],
    recipientData: Record<string, string>
): Promise<Map<string, string>> {
    const personalizedSections = sections.filter((s) => s.mode === 'personalized');

    if (personalizedSections.length === 0) {
        return new Map();
    }

    const results = await generatePersonalizedBatch(
        sections,
        personalizedSections,
        [{ index: 0, fields: recipientData }]
    );

    const sectionMap = new Map<string, string>();
    if (results[0]) {
        for (const section of results[0].sections) {
            sectionMap.set(section.sectionId, section.content);
        }
    }

    return sectionMap;
}

/**
 * Helper to chunk an array into smaller arrays
 */
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
