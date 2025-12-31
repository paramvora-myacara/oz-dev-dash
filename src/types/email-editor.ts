// Types for the Email Editor

export type SectionMode = 'static' | 'personalized';
export type SectionType = 'text' | 'button';

export interface Section {
  id: string;
  name: string;
  type: SectionType; // 'text' for paragraphs, 'button' for CTA buttons
  mode: SectionMode;
  content: string; // For static: the actual text; For personalized: AI instructions
  buttonUrl?: string; // URL for button type
  selectedFields?: string[]; // CSV fields to use (for personalized mode)
  order: number;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  description?: string;
  defaultSections: Omit<Section, 'order'>[];
}

// Campaign-related types
export type CampaignStatus = 'draft' | 'staged' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'cancelled';
export type EmailFormat = 'html' | 'text';
export type QueuedEmailStatus = 'staged' | 'queued' | 'processing' | 'sent' | 'failed' | 'rejected';
export type CampaignSender = 'todd_vitzthum' | 'jeff_richmond';

export interface Campaign {
  id: string;
  name: string;
  templateSlug: string | null;
  sections: Section[];
  subjectLine: {
    mode: SectionMode;
    content: string;
    selectedFields?: string[];
  };
  emailFormat: EmailFormat;
  status: CampaignStatus;
  subjectPrompt?: string | null;
  totalRecipients: number;
  sender: CampaignSender;
  sentCount?: number;
  failedCount?: number;
  createdAt: string;
  updatedAt: string;
  // Sequence fields (unified model: campaign with steps = sequence)
  entryStepId?: string | null;
  exitConditions?: ExitConditions;
  steps?: CampaignStep[];
  timezone?: string;
  workingHoursStart?: number;
  workingHoursEnd?: number;
  skipWeekends?: boolean;
  // Sequence stats
  activeEnrollments?: number;
  repliedCount?: number;
}

// ---------- Sequence Step Types ----------

export interface StepEdge {
  targetStepId: string;
  delayDays: number;
  delayHours: number;
  condition?: StepCondition | null;
}

export interface StepCondition {
  type: 'webinar_registered' | 'not_registered' | 'opened' | 'clicked' | 'custom';
  value?: string;
}

export interface CampaignStep {
  id: string;
  campaignId: string;
  name: string;
  subject: {
    mode: SectionMode;
    content: string;
    selectedFields?: string[];
  };
  sections: Section[];
  edges: StepEdge[];
  createdAt: string;
  updatedAt?: string;
}

export interface ExitConditions {
  reply: boolean;
  unsubscribe: boolean;
  bounce: boolean;
  spamComplaint: boolean;
}

export const DEFAULT_EXIT_CONDITIONS: ExitConditions = {
  reply: true,
  unsubscribe: true,
  bounce: true,
  spamComplaint: true,
};

// Helper to check if a campaign is a sequence (has steps)
export function isSequence(campaign: Campaign): boolean {
  return campaign.entryStepId != null;
}

export interface QueuedEmail {
  id: string;
  campaignId: string;
  toEmail: string;
  fromEmail: string | null;
  subject: string;
  body: string;
  status: QueuedEmailStatus;
  scheduledFor: string | null;
  domainIndex: number | null;
  isEdited: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  errorMessage?: string | null;
  sentAt?: string | null;
}

export interface GenerateResponse {
  success: boolean;
  staged: number;
  errors?: string[];
}

export interface SampleEmail {
  toEmail: string;
  subject: string;
  body: string;
  recipientData: Record<string, string>;
}

export interface GenerateSamplesResponse {
  success: boolean;
  samples: SampleEmail[];
  errors?: string[];
}

export interface LaunchResponse {
  success: boolean;
  queued: number;
  scheduling: {
    timezone: string;
    intervalMinutes: number;
    startTimeUTC: string;
    estimatedEndTimeUTC: string;
    emailsByDay: Record<string, number>;
    totalDays: number;
  };
}

export interface CSVRow {
  [key: string]: string;
}

export interface SampleData {
  rows: CSVRow[];
  columns: string[];
}

// Props types for components
export interface SectionProps {
  section: Section;
  onChange: (section: Section) => void;
  onDelete: () => void;
  availableFields: string[];
  isFirst?: boolean;
  isLast?: boolean;
}

export interface PreviewPanelProps {
  sections: Section[];
  subjectLine: { mode: SectionMode; content: string; selectedFields?: string[] };
  sampleData: SampleData | null;
  selectedSampleIndex: number;
  onSampleIndexChange: (index: number) => void;
  onGeneratePreview: () => void;
  isGenerating: boolean;
  previewHtml: string | null;
}

export interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, mode: SectionMode) => void;
}

// Default templates
export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'outreach-marketing',
    slug: 'outreach-marketing',
    name: 'Outreach Marketing',
    description: 'Cold outreach email for OZ developers',
    defaultSections: [
      {
        id: 'opening',
        name: 'Opening Line',
        type: 'text',
        mode: 'personalized',
        content: 'Mention their specific project and location. Sound impressed by what they\'re building.',
        selectedFields: ['FirstName', 'Company', 'City', 'Address'],
      },
      {
        id: 'pitch',
        name: 'Your Pitch',
        type: 'text',
        mode: 'static',
        content: 'I\'m Jeff Richmond, founder of OZListings—the premier AI-powered marketplace for Opportunity Zone investments.\n\nWe connect developers like you with qualified investors actively seeking OZ deals, streamline your capital raise process, and provide comprehensive deal marketing services.',
      },
      {
        id: 'cta-text',
        name: 'Call to Action',
        type: 'text',
        mode: 'static',
        content: 'Would you be open to a 15-minute call this week to discuss how we can help accelerate your capital raise?',
      },
      {
        id: 'cta-button',
        name: 'CTA Button',
        type: 'button',
        mode: 'static',
        content: 'Book Your Complimentary Call',
        buttonUrl: 'https://ozlistings.com/schedule-a-call',
      },
      {
        id: 'urgency',
        name: 'Urgency Reminder',
        type: 'text',
        mode: 'personalized',
        content: 'Add in some urgency reminder for this - make it more urgent',
        selectedFields: ['FirstName', 'Company'],
      },
      {
        id: 'signoff',
        name: 'Sign-off',
        type: 'text',
        mode: 'static',
        content: 'Best,\nJeff',
      },
    ],
  },
  {
    id: 'follow-up',
    slug: 'follow-up',
    name: 'Follow-up Email',
    description: 'Follow-up for non-responders',
    defaultSections: [
      {
        id: 'reminder',
        name: 'Reminder',
        type: 'text',
        mode: 'personalized',
        content: 'Reference your previous email and their project briefly.',
        selectedFields: ['FirstName', 'Company'],
      },
      {
        id: 'value-add',
        name: 'Value Add',
        type: 'text',
        mode: 'static',
        content: 'I wanted to share a quick case study of how we helped a similar developer raise $15M in just 6 weeks through our platform.',
      },
      {
        id: 'cta',
        name: 'Call to Action',
        type: 'text',
        mode: 'static',
        content: 'Would a brief call be helpful? I\'m happy to walk you through the process.',
      },
      {
        id: 'cta-button',
        name: 'CTA Button',
        type: 'button',
        mode: 'static',
        content: 'Schedule a Call',
        buttonUrl: 'https://ozlistings.com/schedule-a-call',
      },
    ],
  },
  {
    id: 'blank',
    slug: 'blank',
    name: 'Blank Template',
    description: 'Start from scratch',
    defaultSections: [],
  },
];
