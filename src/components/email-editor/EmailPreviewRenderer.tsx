'use client'

import * as React from 'react'
import type { Section, CSVRow } from '@/types/email-editor'
import { generateEmailHtml } from '@/lib/email/generateEmailHtml'

interface EmailPreviewRendererProps {
  sections: Section[]
  subjectLine: string
  sampleData: CSVRow | null
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
