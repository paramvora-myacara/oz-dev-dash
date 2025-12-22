export const BASE_DOMAINS = [
  // Original 7 domains (may be toggled on/off as needed)
  'connect-ozlistings.com',
  'engage-ozlistings.com',
  'get-ozlistings.com',
  'join-ozlistings.com',
  'outreach-ozlistings.com',
  'ozlistings-reach.com',
  'reach-ozlistings.com',

  // New warmed domains
  'access-ozlistings.com',
  'contact-ozlistings.com',
  'direct-ozlistings.com',
  'grow-ozlistings.com',
  'growth-ozlistings.com',
  'link-ozlistings.com',
  'network-ozlistings.com',
  'ozlistings-access.com',
  'ozlistings-connect.com',
  'ozlistings-contact.com',
  'ozlistings-direct.com',
  'ozlistings-engage.com',
  'ozlistings-get.com',
  'ozlistings-grow.com',
  'ozlistings-join.com',
  'ozlistings-link.com',
  'ozlistings-network.com',
  'ozlistings-outreach.com',
  'ozlistings-team.com',
  'ozlistngs-growth.com',
  'team-ozlistings.com',
];

export type CampaignSender = 'todd_vitzthum' | 'jeff_richmond';

export function generateDomainConfig(sender: CampaignSender) {
  const senderLocal = sender === 'todd_vitzthum' ? 'todd.vitzthum' : 'jeff.richmond';
  const displayName = sender === 'todd_vitzthum' ? 'Todd Vitzthum' : 'Jeff Richmond';

  return BASE_DOMAINS.map((domain) => ({
    domain,
    sender_local: senderLocal,
    display_name: displayName,
  }));
}


