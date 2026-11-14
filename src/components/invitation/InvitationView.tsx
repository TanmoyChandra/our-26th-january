'use client';

import type { GuestInfo, EventDetails, InvitationConfig } from '@/types/invitation';
import { InvitationExperience } from './InvitationExperience';

interface InvitationViewProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
}

export function InvitationView({ guestInfo, events, config }: InvitationViewProps) {
  return (
    <InvitationExperience
      guestInfo={guestInfo}
      events={events}
      config={config}
    />
  );
}

