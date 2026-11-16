import type { InvitationConfig } from '@/types/invitation';

export const INVITATION_CONFIG: InvitationConfig = {
  coupleName: {
    person1: '[Name 1]',
    person2: '[Name 2]',
  },
  events: [
    {
      id: 'ashirbad',
      title: 'Ashirbad',
      subtitle: 'Morning Ceremony',
      date: '26 January 2027',
      time: '[Time TBD]',
      venue: '[Venue TBD]',
      venueAddress: '[Address TBD]',
      description: 'A sacred morning ceremony to seek blessings.',
      visibleTo: ['family'],      // ← ONLY family sees this
    },
    {
      id: 'engagement',
      title: 'Engagement & Registry',
      subtitle: undefined,
      date: '26 January 2027',
      time: '[Time TBD]',
      venue: '[Venue TBD]',
      venueAddress: '[Address TBD]',
      description: 'Join us to celebrate the engagement.',
      visibleTo: ['family', 'general'],
    },
  ],
  contact: {
    name: '[Contact Name]',
    phone: '[Phone Number]',
    email: '[email@example.com]',
  },
  rsvpDeadline: '[Date TBD]',
};

export const VENUE_MAPS_CONFIG = {
  venueName: 'Atithi Inn',
  address: 'Atithi Inn, Kolkata',
  googleMapsUrl: 'https://maps.app.goo.gl/8F2Cs3GL8AmYpQpYA',
};
