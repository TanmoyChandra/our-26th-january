export type InvitationCategory = 'family' | 'general';

export interface GuestInfo {
  name: string;         // decoded from URL slug
  displayName: string;  // capitalised for display
  category: InvitationCategory;
}

export interface EventDetails {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  description: string;
  visibleTo: InvitationCategory[]; // which categories can see this event
}

export interface InvitationConfig {
  coupleName: { person1: string; person2: string };
  events: EventDetails[];
  contact: { name: string; phone: string; email?: string };
  rsvpDeadline?: string;
}
