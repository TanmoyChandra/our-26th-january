import type { GuestInfo, InvitationCategory, InvitationLanguage } from '@/types/invitation';

const VALID_CATEGORIES: InvitationCategory[] = ['family', 'general'];
const CIPHER_KEY = '26-jan-vivah';

export interface DecryptedGuestToken {
  name: string;
  category: InvitationCategory;
  language: InvitationLanguage;
}

/**
 * Encrypt a plaintext guest name or slug, category ('family' | 'general' | 'f' | 'g'),
 * and optional language ('en' | 'bn' | 'b' | 'e') into a single unified URL-safe lowercase hex ciphertext.
 * Format inside payload: `${typeCode}:${langCode}:${name}` (e.g. `f:b:tanmoy-chandra`)
 */
export function encryptGuestName(
  text: string,
  category?: InvitationCategory | string,
  language?: InvitationLanguage | string
): string {
  if (!text) return '';
  const typeCode = (category === 'family' || category === 'f') ? 'f' : 'g';
  const langCode = (language === 'bn' || language === 'b' || language === 'bengali') ? 'b' : 'e';
  const payload = `${typeCode}:${langCode}:${text.trim()}`;
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
 * Decrypt a hex ciphertext back into the original guest name, embedded category, and language.
 * If the input is not a valid ciphertext or decryption fails, falls back gracefully.
 */
export function decryptGuestToken(
  cipherHex: string,
  fallbackType?: string | null,
  fallbackLang?: string | null
): DecryptedGuestToken {
  const defaultCategory = parseCategory(fallbackType);
  const defaultLanguage = parseLanguage(fallbackLang);

  // If not a valid hex string of even length, return raw input as fallback
  if (!cipherHex || cipherHex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(cipherHex)) {
    return { name: cipherHex, category: defaultCategory, language: defaultLanguage };
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

    // 1. Format with embedded category and language: 'f:b:name', 'g:e:name', etc.
    const matchWithLang = /^([fg]):([be]|bn|en):(.+)$/i.exec(result);
    if (matchWithLang) {
      const catCode = matchWithLang[1].toLowerCase();
      const langCode = matchWithLang[2].toLowerCase();
      const name = matchWithLang[3];
      return {
        name,
        category: catCode === 'f' ? 'family' : 'general',
        language: (langCode === 'b' || langCode === 'bn') ? 'bn' : 'en',
      };
    }

    // 2. Legacy format with category prefix only: 'f:name' or 'g:name'
    const matchWithCat = /^([fg]):(.+)$/i.exec(result);
    if (matchWithCat) {
      const catCode = matchWithCat[1].toLowerCase();
      const name = matchWithCat[2];
      return {
        name,
        category: catCode === 'f' ? 'family' : 'general',
        language: defaultLanguage,
      };
    }

    // 3. Legacy token without category or language prefix
    if (/^[a-zA-Z0-9\s_&.,'’\-]+$/.test(result)) {
      return {
        name: result,
        category: defaultCategory,
        language: defaultLanguage,
      };
    }
  } catch {
    // Fall back to original input on error
  }

  return { name: cipherHex, category: defaultCategory, language: defaultLanguage };
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
 * Parse and validate language code.
 * Accepts 'b', 'bn', 'bengali', 'bangla' for Bengali.
 * Defaults to 'en' (English).
 */
export function parseLanguage(raw: string | null | undefined): InvitationLanguage {
  if (!raw) return 'en';
  const clean = raw.toLowerCase().trim();
  if (clean === 'bn' || clean === 'b' || clean === 'bengali' || clean === 'bangla') {
    return 'bn';
  }
  return 'en';
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
 * Automatically decrypts obfuscated ciphertext slugs into original guest names, categories, and language.
 * @param slug   - the [guest] segment from the URL (may be ciphertext with embedded category, or plaintext)
 * @param typeParam - optional fallback or override `type` query param value
 * @param langParam - optional fallback or override `lang` query param value
 */
export function buildGuestInfo(
  slug: string,
  typeParam?: string | null | undefined,
  langParam?: string | null | undefined
): GuestInfo {
  const decoded = decodeURIComponent(slug);
  const decrypted = decryptGuestToken(decoded, typeParam, langParam);
  const language = langParam ? parseLanguage(langParam) : decrypted.language;
  const category = typeParam ? parseCategory(typeParam) : decrypted.category;
  return {
    name: decrypted.name,
    displayName: toDisplayName(decrypted.name),
    category,
    language,
  };
}
