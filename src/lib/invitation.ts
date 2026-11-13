import type { EventDetails, InvitationCategory } from '@/types/invitation';
import { INVITATION_CONFIG } from '@/config/invitation';

/**
 * Return only the events visible to the given category.
 * General guests NEVER see events where visibleTo = ['family'] only.
 */
export function getVisibleEvents(category: InvitationCategory): EventDetails[] {
  return INVITATION_CONFIG.events.filter((event) =>
    event.visibleTo.includes(category)
  );
}

/**
 * Check whether an event is visible to a given category.
 */
export function isEventVisible(event: EventDetails, category: InvitationCategory): boolean {
  return event.visibleTo.includes(category);
}

/**
 * Get the full invitation config (for display components).
 */
export function getInvitationConfig() {
  return INVITATION_CONFIG;
}
