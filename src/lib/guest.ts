import type { GuestInfo, InvitationCategory } from '@/types/invitation';

const VALID_CATEGORIES: InvitationCategory[] = ['family', 'general'];

/**
 * Capitalise first letter of each word.
 * Preserves connecting words like "and", "&", "o" nicely.
 */
export function toDisplayName(raw: string): string {
  const decoded = decodeURIComponent(raw).replace(/\+/g, ' ');

  return decoded
    .split(/[\s_-]+/)
    .map((w) => {
      const lower = w.toLowerCase();
      // Keep "&" or lowercase "and" if desired, or capitalize cleanly
      if (lower === '&' || lower === 'and') {
        return '&';
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}

/**
 * Parse and validate the category query param.
 * Accepts 'f' or 'family' for family tier.
 * Accepts 'g' or 'general' (or falls back to) for general tier.
 */
export function parseCategory(raw: string | null | undefined): InvitationCategory {
  if (raw === 'family' || raw === 'f') {
    return 'family';
  }
  if (raw === 'general' || raw === 'g') {
    return 'general';
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
