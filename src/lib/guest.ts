import type { GuestInfo, InvitationCategory, InvitationLanguage } from '@/types/invitation';

const VALID_CATEGORIES: InvitationCategory[] = ['family', 'general'];
const CIPHER_KEY = '26-jan-vivah';

export interface DecryptedGuestToken {
  name: string;
  category: InvitationCategory;
  language: InvitationLanguage;
}

/**
 * Packs a UTF-8 string containing English/ASCII and Bengali characters into 1 byte per character.
 * Bengali Unicode characters (U+0980 - U+09FF) fit into [0x81 - 0xFE].
 * Standard ASCII (0x00 - 0x7F) stays 1 byte.
 * Reduces Bengali character size by ~65% in raw bytes before encoding.
 */
function packBengali(str: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7f) {
      bytes.push(code);
    } else if (code >= 0x0980 && code <= 0x09ff) {
      bytes.push(0x80 | (code - 0x0980));
    } else if (code === 0x200c) {
      // Zero-width non-joiner
      bytes.push(0x80);
    } else if (code === 0x200d) {
      // Zero-width joiner
      bytes.push(0xff);
    } else {
      // General multi-byte fallback for any other rare unicode characters
      const encoder = new TextEncoder();
      const u = encoder.encode(str[i]);
      for (let j = 0; j < u.length; j++) {
        bytes.push(u[j]);
      }
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Unpacks 1-byte packed characters back to original string.
 */
function unpackBengali(buf: Uint8Array): string {
  let str = '';
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b <= 0x7f) {
      str += String.fromCharCode(b);
    } else if (b === 0x80) {
      str += '\u200c';
    } else if (b === 0xff) {
      str += '\u200d';
    } else if (b >= 0x81 && b <= 0xfe) {
      str += String.fromCharCode(0x0980 + (b & 0x7f));
    } else {
      str += String.fromCharCode(b);
    }
  }
  return str;
}

/**
 * Converts bytes into a URL-safe Base64 string (no '+', '/', or '=').
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts a URL-safe Base64 string back into bytes.
 */
function base64UrlToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a plaintext guest name or slug, category ('family' | 'general' | 'f' | 'g'),
 * and optional language ('en' | 'bn' | 'b' | 'e') into a super-compact URL-safe Base64URL ciphertext token.
 * Bengali characters are compressed to 1 byte each, reducing link size by ~70%.
 * Format inside payload: `${typeCode}:${langCode}:${name}` (e.g. `f:b:তন্ময় চন্দ্র`)
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
  
  const packedBytes = packBengali(payload);
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(CIPHER_KEY);
  const encryptedBytes = new Uint8Array(packedBytes.length);
  for (let i = 0; i < packedBytes.length; i++) {
    encryptedBytes[i] = (packedBytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 11 + 17) & 0xff)) & 0xff;
  }
  return bytesToBase64Url(encryptedBytes);
}

/**
 * Decrypt a token back into the original guest name, embedded category, and language.
 * Automatically supports:
 * 1. New compact Base64URL tokens with 1-byte packed Bengali/English.
 * 2. Legacy hexadecimal tokens (for backward compatibility with previously shared links).
 * 3. Plaintext fallback slugs.
 */
export function decryptGuestToken(
  cipherToken: string,
  fallbackType?: string | null,
  fallbackLang?: string | null
): DecryptedGuestToken {
  const defaultCategory = parseCategory(fallbackType);
  const defaultLanguage = parseLanguage(fallbackLang);

  if (!cipherToken) {
    return { name: cipherToken, category: defaultCategory, language: defaultLanguage };
  }

  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(CIPHER_KEY);

  // 1. Try new compact Base64URL decryptor
  try {
    if (/^[A-Za-z0-9_-]+$/.test(cipherToken)) {
      const encryptedBytes = base64UrlToBytes(cipherToken);
      const decryptedBytes = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        decryptedBytes[i] = (encryptedBytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 11 + 17) & 0xff)) & 0xff;
      }
      const result = unpackBengali(decryptedBytes);

      const matchWithLang = /^([fg]):([be]|bn|en):([\s\S]+)$/i.exec(result);
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

      const matchWithCat = /^([fg]):([\s\S]+)$/i.exec(result);
      if (matchWithCat) {
        const catCode = matchWithCat[1].toLowerCase();
        const name = matchWithCat[2];
        return {
          name,
          category: catCode === 'f' ? 'family' : 'general',
          language: defaultLanguage,
        };
      }
    }
  } catch {
    // Continue to legacy check
  }

  // 2. Try legacy hex decryptor (for backward compatibility with old links)
  if (cipherToken.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(cipherToken)) {
    try {
      const bytes = new Uint8Array(cipherToken.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        const byte = parseInt(cipherToken.substr(i * 2, 2), 16);
        bytes[i] = (byte ^ keyBytes[i % keyBytes.length] ^ ((i * 11 + 17) & 0xff)) & 0xff;
      }
      const decoder = new TextDecoder('utf-8', { fatal: true });
      const result = decoder.decode(bytes);

      const matchWithLang = /^([fg]):([be]|bn|en):([\s\S]+)$/i.exec(result);
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

      const matchWithCat = /^([fg]):([\s\S]+)$/i.exec(result);
      if (matchWithCat) {
        const catCode = matchWithCat[1].toLowerCase();
        const name = matchWithCat[2];
        return {
          name,
          category: catCode === 'f' ? 'family' : 'general',
          language: defaultLanguage,
        };
      }

      if (result && !result.includes('\0')) {
        return {
          name: result,
          category: defaultCategory,
          language: defaultLanguage,
        };
      }
    } catch {
      // Continue to fallback
    }
  }

  // 3. Fallback to original input for plain text names
  return { name: cipherToken, category: defaultCategory, language: defaultLanguage };
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
