'use client'

import * as React from 'react'
import { render } from '@react-email/components'
import type { Section, CSVRow } from '@/types/email-editor'

// Brand colors matching OutreachMarketing template
const BRAND = {
  primary: '#1e88e5',
  primaryLight: '#bfdbfe',
  textDark: '#111827',
  textMuted: '#4b5563',
  textLight: '#9ca3af',
  bgLight: '#f3f4f6',
  bgCard: '#ffffff',
  bgFooter: '#f9fafb',
  border: '#e5e7eb',
}

interface EmailPreviewRendererProps {
  sections: Section[]
  subjectLine: string
  sampleData: CSVRow | null
}

// Replace {{variables}} with sample data
function replaceVariables(content: string, data: CSVRow | null): string {
  if (!data) return content
  return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return data[variable] || data[variable.toLowerCase()] || data[variable.toUpperCase()] || match
  })
}

// Strip HTML tags for plain sections
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
}

// Convert HTML content to React elements (basic conversion)
function htmlToText(html: string): string {
  // Replace <br> and </p> with newlines, then strip other tags
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

// Generate the email HTML using React Email styling
export function generateEmailHtml(
  sections: Section[],
  subjectLine: string,
  sampleData: CSVRow | null
): string {
  const processedSubject = replaceVariables(subjectLine, sampleData)
  
  // Build sections HTML
  const sectionsHtml = sections.map((section) => {
    if (section.type === 'button') {
      // CTA Button - Full Width
      const buttonText = section.mode === 'personalized' 
        ? `[${section.name} - AI Generated]`
        : replaceVariables(section.content, sampleData)
      const buttonUrl = section.buttonUrl || '#'
      
      return `
        <div style="margin: 24px 0; text-align: center;">
          <a href="${buttonUrl}" style="
            background-color: ${BRAND.primary};
            color: #ffffff;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            display: block;
            width: 100%;
            box-sizing: border-box;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
          ">${buttonText}</a>
        </div>
      `
    } else {
      // Text section
      if (section.mode === 'personalized') {
        // Placeholder for AI-generated content
        return `
          <div style="
            margin: 0 0 16px 0;
            padding: 12px 16px;
            background-color: #eff6ff;
            border: 1px dashed ${BRAND.primary};
            border-radius: 8px;
          ">
            <div style="font-size: 12px; font-weight: 600; color: ${BRAND.primary}; margin-bottom: 4px;">
              ✨ ${section.name} (Personalized)
            </div>
            <div style="font-size: 14px; color: ${BRAND.textMuted}; font-style: italic;">
              AI will generate unique content for each recipient
              ${section.selectedFields && section.selectedFields.length > 0 
                ? `<br><span style="font-size: 12px;">Using: ${section.selectedFields.join(', ')}</span>` 
                : ''}
            </div>
          </div>
        `
      } else {
        // Static text content
        const content = replaceVariables(section.content, sampleData)
        // Convert line breaks and basic formatting
        const formattedContent = content
          .split('\n\n')
          .map(paragraph => {
            const processedParagraph = paragraph
              .replace(/\n/g, '<br>')
              .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')
              .replace(/<a href="(.*?)">(.*?)<\/a>/g, `<a href="$1" style="color: ${BRAND.primary}; text-decoration: underline;">$2</a>`)
            return `<p style="margin: 0 0 16px 0; font-size: 15px; color: ${BRAND.textMuted}; line-height: 1.6;">${processedParagraph}</p>`
          })
          .join('')
        
        return formattedContent
      }
    }
  }).join('')

  // Full email HTML with OZListings branding
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${processedSubject}</title>
</head>
<body style="
  font-family: 'Avenir', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background-color: ${BRAND.bgLight};
  margin: 0;
  padding: 16px 0;
  font-size: 15px;
  line-height: 1.6;
">
  <div style="
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    background-color: ${BRAND.bgCard};
    border-radius: 16px;
    border: 1px solid ${BRAND.border};
    overflow: hidden;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08), 0 8px 20px rgba(15, 23, 42, 0.06);
  ">
    <!-- Header -->
    <div style="
      background-color: ${BRAND.primary};
      padding: 18px 20px;
    ">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="140" valign="middle">
            <img 
              src="https://ozlistings.com/oz-listings-horizontal2-logo-white.webp" 
              alt="OZListings" 
              width="140" 
              height="32" 
              style="display: block; max-width: 140px; height: auto;"
            >
          </td>
          <td valign="middle" style="padding-left: 12px;">
            <div style="
              margin: 0;
              font-size: 11px;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: ${BRAND.primaryLight};
            ">OZListings</div>
            <div style="
              margin: 2px 0 0 0;
              font-size: 18px;
              line-height: 1.4;
              color: #ffffff;
              font-weight: 800;
            ">${processedSubject || 'Email Preview'}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Content -->
    <div style="padding: 20px 20px 18px 20px;">
      ${sectionsHtml || '<p style="color: #9ca3af; font-style: italic;">Add sections to see preview</p>'}
    </div>

    <!-- Footer -->
    <div style="
      border-top: 1px solid ${BRAND.border};
      padding: 12px 24px 20px 24px;
      background-color: ${BRAND.bgFooter};
    ">
      <p style="
        margin: 0 0 4px 0;
        font-size: 11px;
        color: ${BRAND.textLight};
      ">
        This email was sent to you because you're listed as a developer with
        an Opportunity Zone project. If you'd prefer not to receive these
        emails, you can unsubscribe.
      </p>
      <p style="
        margin: 0;
        font-size: 11px;
        color: ${BRAND.textLight};
      ">
        © ${new Date().getFullYear()} OZListings. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `

  return html
}

export default function EmailPreviewRenderer({ sections, subjectLine, sampleData }: EmailPreviewRendererProps) {
  const html = generateEmailHtml(sections, subjectLine, sampleData)
  
  return (
    <iframe
      srcDoc={html}
      title="Email Preview"
      className="w-full h-full border-0"
      sandbox="allow-same-origin"
    />
  )
}
