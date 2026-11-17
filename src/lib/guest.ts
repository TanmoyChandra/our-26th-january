import type { GuestInfo, InvitationCategory } from '@/types/invitation';

const VALID_CATEGORIES: InvitationCategory[] = ['family', 'general'];
const CIPHER_KEY = '26-jan-vivah';

/**
 * Encrypt a plaintext guest name or slug into a URL-safe lowercase hex ciphertext.
 */
export function encryptGuestName(text: string): string {
  if (!text) return '';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text.trim());
  const keyBytes = encoder.encode(CIPHER_KEY);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const xored = (bytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 11 + 17) & 0xff)) & 0xff;
    hex += xored.toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Decrypt a hex ciphertext back into the original guest name string.
 * If the input is not a valid ciphertext or decryption fails, falls back gracefully to raw text.
 */
export function decryptGuestName(cipherHex: string): string {
  // If not a valid hex string of even length, return raw input as fallback
  if (!cipherHex || cipherHex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(cipherHex)) {
    return cipherHex;
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
    // Sanity check: must contain reasonable characters
    if (/^[a-zA-Z0-9\s_&.,'’\-]+$/.test(result)) {
      return result;
    }
  } catch {
    // Fall back to original input on error
  }

  return cipherHex;
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
 * Automatically decrypts obfuscated ciphertext slugs into original guest names.
 * @param slug   - the [guest] segment from the URL (may be ciphertext or plaintext)
 * @param typeParam - the `type` query param value
 */
export function buildGuestInfo(slug: string, typeParam: string | null | undefined): GuestInfo {
  const decoded = decodeURIComponent(slug);
  const decryptedName = decryptGuestName(decoded);
  return {
    name: decryptedName,
    displayName: toDisplayName(decryptedName),
    category: parseCategory(typeParam),
  };
}
