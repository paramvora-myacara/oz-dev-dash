import { createClient } from '@/utils/supabase/client'
import type { EmailTemplate } from '@/types/email-editor'

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching email templates:', error)
        return []
    }

    // Map database fields to application type
    return (data || []).map((template: any) => ({
        id: template.id,
        slug: template.name.toLowerCase().replace(/\s+/g, '-'),
        name: template.name,
        description: template.description || '',
        defaultSections: template.default_sections || [],
    }))
}

export async function saveEmailTemplate(template: {
    name: string;
    description?: string;
    defaultSections: any[]
}): Promise<EmailTemplate | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('email_templates')
        .upsert({
            name: template.name,
            description: template.description,
            default_sections: template.defaultSections,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'name'
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving email template:', error)
        throw error
    }

    return {
        id: data.id,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        name: data.name,
        description: data.description || '',
        defaultSections: data.default_sections || [],
    }
}
