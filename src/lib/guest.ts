import type { GuestInfo, InvitationCategory } from '@/types/invitation';

const VALID_CATEGORIES: InvitationCategory[] = ['family', 'general'];
const CIPHER_KEY = '26-jan-vivah';

export interface DecryptedGuestToken {
  name: string;
  category: InvitationCategory;
}

/**
 * Encrypt a plaintext guest name or slug AND optional category ('family' | 'general' | 'f' | 'g')
 * into a single unified URL-safe lowercase hex ciphertext.
 * Format inside payload: `${typeCode}:${name}` (e.g. `f:tanmoy-chandra`)
 */
export function encryptGuestName(text: string, category?: InvitationCategory | string): string {
  if (!text) return '';
  const typeCode = (category === 'family' || category === 'f') ? 'f' : 'g';
  const payload = category ? `${typeCode}:${text.trim()}` : text.trim();
  const encoder = new TextEncoder();
  const bytes = encoder.encode(payload);
  const keyBytes = encoder.encode(CIPHER_KEY);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const xored = (bytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 11 + 17) & 0xff)) & 0xff;
    hex += xored.toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Decrypt a hex ciphertext back into the original guest name and embedded category.
 * If the input is not a valid ciphertext or decryption fails, falls back gracefully.
 */
export function decryptGuestToken(cipherHex: string, fallbackType?: string | null): DecryptedGuestToken {
  const defaultCategory = parseCategory(fallbackType);

  // If not a valid hex string of even length, return raw input as fallback
  if (!cipherHex || cipherHex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(cipherHex)) {
    return { name: cipherHex, category: defaultCategory };
  }

  try {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(CIPHER_KEY);
    const bytes = new Uint8Array(cipherHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      const byte = parseInt(cipherHex.substr(i * 2, 2), 16);
      bytes[i] = (byte ^ keyBytes[i % keyBytes.length] ^ ((i * 11 + 17) & 0xff)) & 0xff;
    }
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const result = decoder.decode(bytes);

    // 1. Check if it contains the embedded category prefix 'f:' or 'g:'
    if (/^[fg]:/.test(result)) {
      const catCode = result[0];
      const name = result.slice(2);
      return {
        name,
        category: catCode === 'f' ? 'family' : 'general',
      };
    }

    // 2. Legacy token without category prefix
    if (/^[a-zA-Z0-9\s_&.,'’\-]+$/.test(result)) {
      return {
        name: result,
        category: defaultCategory,
      };
    }
  } catch {
    // Fall back to original input on error
  }

  return { name: cipherHex, category: defaultCategory };
}

/**
 * Backward-compatible helper for decrypting name only
 */
export function decryptGuestName(cipherHex: string): string {
  return decryptGuestToken(cipherHex).name;
}

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
 * Automatically decrypts obfuscated ciphertext slugs into original guest names and categories.
 * @param slug   - the [guest] segment from the URL (may be ciphertext with embedded category, or plaintext)
 * @param typeParam - optional fallback `type` query param value
 */
export function buildGuestInfo(slug: string, typeParam: string | null | undefined): GuestInfo {
  const decoded = decodeURIComponent(slug);
  const decrypted = decryptGuestToken(decoded, typeParam);
  return {
    name: decrypted.name,
    displayName: toDisplayName(decrypted.name),
    category: decrypted.category,
  };
}
