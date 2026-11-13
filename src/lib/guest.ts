import type { GuestInfo, InvitationCategory } from '@/types/invitation';

const VALID_CATEGORIES: InvitationCategory[] = ['family', 'general'];

/**
 * Capitalise first letter of each word.
 */
export function toDisplayName(raw: string): string {
  return decodeURIComponent(raw)
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Parse and validate the category query param.
 * Falls back to 'general' on missing or invalid input.
 */
export function parseCategory(raw: string | null | undefined): InvitationCategory {
  if (raw && VALID_CATEGORIES.includes(raw as InvitationCategory)) {
    return raw as InvitationCategory;
  }
  return 'general';
}

/**
 * Build a GuestInfo object from URL parts.
 * @param slug   - the [guest] segment from the URL (may be URL-encoded)
 * @param typeParam - the `type` query param value
 */
export function buildGuestInfo(slug: string, typeParam: string | null | undefined): GuestInfo {
  const decoded = decodeURIComponent(slug);
  return {
    name: decoded,
    displayName: toDisplayName(slug),
    category: parseCategory(typeParam),
  };
}
