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

/** One segment: either all-matching (filters + exclusions) or explicit IDs */
export type CampaignRecipientSegment =
  | {
      selectAllMatching: false;
      contact_ids: string[];
      explicitSelections?: string[];
    }
  | {
      selectAllMatching: true;
      filters: PeopleFiltersForRecipients;
      exclusions: string[];
      explicitSelections?: string[];
      contact_ids?: never;
    };

/** Payload: either legacy single segment or multi-segment (carry-over) */
export type CampaignRecipientSelectionPayload =
  | CampaignRecipientSegment
  | { segments: CampaignRecipientSegment[] };

export function hasRecipientSelection(
  payload: CampaignRecipientSelectionPayload | null
): boolean {
  if (!payload) return false;
  if ("segments" in payload) {
    return (
      payload.segments.length > 0 &&
      payload.segments.some(
        (s) =>
          s.selectAllMatching ||
          (!s.selectAllMatching && (s.contact_ids?.length ?? 0) > 0)
      )
    );
  }
  return (
    payload.selectAllMatching ||
    (!payload.selectAllMatching && (payload.contact_ids?.length ?? 0) > 0)
  );
}
