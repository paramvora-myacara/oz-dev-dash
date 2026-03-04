export interface PeopleFiltersForRecipients {
  search?: string;
  tag?: string[];
  location?: string;
  role?: string;
  source?: string;
  lead_status?: string[];
  email_status?: string[];
  has_email?: "all" | "true" | "false";
  has_linkedin?: "all" | "true" | "false";
  has_phone?: "all" | "true" | "false";
  campaign_history?: string | string[];
  campaign_response?: string[];
  exclude_campaign_ids?: string[];
}

export type CampaignRecipientSelectionPayload =
  | {
      selectAllMatching: false;
      contact_ids: string[];
      explicitSelections?: string[];
      filters?: PeopleFiltersForRecipients;
      exclusions?: string[];
    }
  | {
      selectAllMatching: true;
      filters: PeopleFiltersForRecipients;
      exclusions: string[];
      explicitSelections?: string[];
      contact_ids?: never;
    };
