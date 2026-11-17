import type { InvitationLanguage } from '@/types/invitation';

export interface TranslationStrings {
  // Action Buttons
  open: string;
  close: string;
  read: string;
  scroll: string;
  fold: string;
  loading: string;

  // Envelope front
  envelopeTo: string;

  // Location shortcut
  googleMapsLabel: string;
  venueName: string;

  // Categories & labels
  family: string;
  general: string;
  preview: string;

  // Invitation Content / Events
  ceremonyTitle: string;
  ceremonySubtitle: string;
  groom: string;
  groomParents: string;
  and: string;
  bride: string;
  brideParents: string;
  date: string;

  // Events schedule
  eventScheduleTitle: string;
  ashirbadTitle: string;
  ashirbadSubtitle: string;
  ashirbadDescription: string;
  engagementTitle: string;
  engagementDescription: string;
  rsvpTitle: string;
  rsvpDeadline: string;
  contactPrompt: string;
}

export const TRANSLATIONS: Record<InvitationLanguage, TranslationStrings> = {
  en: {
    open: 'OPEN',
    close: 'CLOSE',
    read: 'READ',
    scroll: 'SCROLL',
    fold: 'FOLD',
    loading: 'Loading..',

    envelopeTo: 'To..',

    googleMapsLabel: 'Open venue in Google Maps: Atithi Inn',
    venueName: 'Atithi Inn',

    family: 'Family',
    general: 'General',
    preview: 'Preview',

    ceremonyTitle: 'Engagement Ceremony',
    ceremonySubtitle: 'of',
    groom: 'Tanmoy Chandra',
    groomParents: 'son of Tapas Chandra & Tapati Chandra',
    and: '&',
    bride: 'Parnasha Sen',
    brideParents: 'daughter of Krishna Sen and Swapna Sen',
    date: '26 January 2027',

    eventScheduleTitle: 'Event Schedule',
    ashirbadTitle: 'Ashirbad',
    ashirbadSubtitle: 'Morning Ceremony',
    ashirbadDescription: 'A sacred morning ceremony to seek blessings.',
    engagementTitle: 'Engagement & Registry',
    engagementDescription: 'Join us to celebrate the engagement ceremony.',
    rsvpTitle: 'RSVP & Enquiries',
    rsvpDeadline: 'Kindly respond by the requested date.',
    contactPrompt: 'For queries, please reach out to',
  },
  bn: {
    open: 'খুলুন',
    close: 'বন্ধ করুন',
    read: 'পড়ুন',
    scroll: 'স্ক্রোল করুন',
    fold: 'ভাঁজ করুন',
    loading: 'লোড হচ্ছে..',

    envelopeTo: 'প্রতি..',

    googleMapsLabel: 'গুগল ম্যাপে অনুষ্ঠানের স্থান দেখুন: অতিথি ইন',
    venueName: 'অতিথি ইন',

    family: 'পারিবারিক',
    general: 'সাধারণ',
    preview: 'প্রিভিউ',

    ceremonyTitle: 'শুভ বাগদান অনুষ্ঠান',
    ceremonySubtitle: 'এর শুভলগ্নে',
    groom: 'শ্রী তন্ময় চন্দ্র',
    groomParents: 'পিতা: শ্রী তাপস চন্দ্র ও মাতা: শ্রীমতী তপতী চন্দ্র',
    and: 'ও',
    bride: 'শ্রীমতী পর্ণাশা সেন',
    brideParents: 'পিতা: শ্রী কৃষ্ণ সেন ও মাতা: শ্রীমতী স্বপ্না সেন',
    date: '২৬শে জানুয়ারি ২০২৭',

    eventScheduleTitle: 'অনুষ্ঠান সূচি',
    ashirbadTitle: 'আশীর্বাদ',
    ashirbadSubtitle: 'প্রাতঃকালীন মাঙ্গলিক অনুষ্ঠান',
    ashirbadDescription: 'নবজীবনের প্রাক্কালে গুরুজনদের আশীর্বাদ লাভের পুণ্য অনুষ্ঠান।',
    engagementTitle: 'বাগদান ও রেজিস্ট্রি',
    engagementDescription: 'আমাদের শুভ বাগদান ও রেজিস্ট্রি অনুষ্ঠানে আপনাদের সাদর আমন্ত্রণ।',
    rsvpTitle: 'যোগাযোগ ও সম্মতি',
    rsvpDeadline: 'অনুগ্রহ করে নির্দিষ্ট সময়ের মধ্যে আপনার উপস্থিতি নিশ্চিত করুন।',
    contactPrompt: 'যেকোনো জিজ্ঞাসায় যোগাযোগ করুন:',
  },
};

export function getTranslations(lang?: InvitationLanguage | null): TranslationStrings {
  return TRANSLATIONS[lang === 'bn' ? 'bn' : 'en'];
}
