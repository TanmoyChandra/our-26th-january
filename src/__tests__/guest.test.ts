import { describe, it, expect } from 'vitest';
import {
  toDisplayName,
  parseCategory,
  parseLanguage,
  buildGuestInfo,
  encryptGuestName,
  decryptGuestName,
  decryptGuestToken,
} from '@/lib/guest';

describe('toDisplayName', () => {
  it('capitalises a simple name', () => {
    expect(toDisplayName('rahul')).toBe('Rahul');
  });
  it('capitalises multi-word names', () => {
    expect(toDisplayName('priya kumari')).toBe('Priya Kumari');
  });
  it('decodes URL-encoded characters', () => {
    expect(toDisplayName('priya%20kumari')).toBe('Priya Kumari');
  });
  it('handles hyphenated names', () => {
    expect(toDisplayName('priya-kumari')).toBe('Priya Kumari');
  });
  it('trims whitespace', () => {
    expect(toDisplayName('  rahul  ')).toBe('Rahul');
  });
  it('converts lowercase slug to Proper Case', () => {
    expect(toDisplayName('tanmoy-chandra')).toBe('Tanmoy Chandra');
  });
  it('converts lowercase joint slug to Proper Case with ampersand', () => {
    expect(toDisplayName('tanmoy-chandra-&-parnasha-sen')).toBe('Tanmoy Chandra & Parnasha Sen');
  });
  it('converts all-caps slug to Proper Case', () => {
    expect(toDisplayName('TANMOY-CHANDRA')).toBe('Tanmoy Chandra');
  });
  it('preserves Bengali names correctly', () => {
    expect(toDisplayName('তন্ময়-চন্দ্র')).toBe('তন্ময় চন্দ্র');
  });
});

describe('parseLanguage', () => {
  it('parses "bn" as Bengali', () => {
    expect(parseLanguage('bn')).toBe('bn');
  });
  it('parses single letter "b" as Bengali', () => {
    expect(parseLanguage('b')).toBe('bn');
  });
  it('parses "bengali" as Bengali', () => {
    expect(parseLanguage('bengali')).toBe('bn');
  });
  it('parses "bangla" as Bengali', () => {
    expect(parseLanguage('bangla')).toBe('bn');
  });
  it('parses "en" as English', () => {
    expect(parseLanguage('en')).toBe('en');
  });
  it('parses "e" as English', () => {
    expect(parseLanguage('e')).toBe('en');
  });
  it('defaults to "en" for null, undefined, or unknown', () => {
    expect(parseLanguage(null)).toBe('en');
    expect(parseLanguage(undefined)).toBe('en');
    expect(parseLanguage('fr')).toBe('en');
  });
});

describe('parseCategory', () => {
  it('returns family for "family"', () => {
    expect(parseCategory('family')).toBe('family');
  });
  it('returns family for single letter "f"', () => {
    expect(parseCategory('f')).toBe('family');
  });
  it('returns general for "general"', () => {
    expect(parseCategory('general')).toBe('general');
  });
  it('returns general for single letter "g"', () => {
    expect(parseCategory('g')).toBe('general');
  });
  it('defaults to general for null', () => {
    expect(parseCategory(null)).toBe('general');
  });
  it('defaults to general for undefined', () => {
    expect(parseCategory(undefined)).toBe('general');
  });
  it('defaults to general for empty string', () => {
    expect(parseCategory('')).toBe('general');
  });
  it('defaults to general for invalid value', () => {
    expect(parseCategory('vip')).toBe('general');
  });
  it('is case-sensitive (mixed case = invalid)', () => {
    expect(parseCategory('Family')).toBe('general');
  });
});

describe('buildGuestInfo', () => {
  it('builds a family guest', () => {
    const guest = buildGuestInfo('rahul', 'family');
    expect(guest.name).toBe('rahul');
    expect(guest.displayName).toBe('Rahul');
    expect(guest.category).toBe('family');
  });
  it('builds a general guest', () => {
    const guest = buildGuestInfo('priya', 'general');
    expect(guest.category).toBe('general');
  });
  it('defaults to general when type is missing', () => {
    const guest = buildGuestInfo('anon', null);
    expect(guest.category).toBe('general');
  });
  it('decodes URL-encoded slug', () => {
    const guest = buildGuestInfo('priya%20kumari', 'general');
    expect(guest.name).toBe('priya kumari');
    expect(guest.displayName).toBe('Priya Kumari');
  });
  it('decrypts ciphertext slug with embedded family category without query param', () => {
    const cipher = encryptGuestName('tanmoy-chandra', 'family');
    const guest = buildGuestInfo(cipher, null);
    expect(guest.name).toBe('tanmoy-chandra');
    expect(guest.displayName).toBe('Tanmoy Chandra');
    expect(guest.category).toBe('family');
  });
  it('decrypts ciphertext slug with embedded general category without query param', () => {
    const cipher = encryptGuestName('amit-sharma', 'general');
    const guest = buildGuestInfo(cipher, null);
    expect(guest.name).toBe('amit-sharma');
    expect(guest.displayName).toBe('Amit Sharma');
    expect(guest.category).toBe('general');
  });
  it('decrypts legacy ciphertext slug into Proper Case display name with query param', () => {
    const cipher = encryptGuestName('tanmoy-chandra');
    const guest = buildGuestInfo(cipher, 'f');
    expect(guest.name).toBe('tanmoy-chandra');
    expect(guest.displayName).toBe('Tanmoy Chandra');
    expect(guest.category).toBe('family');
  });
  it('decrypts joint ciphertext slug into Proper Case joint names', () => {
    const cipher = encryptGuestName('tanmoy-chandra-&-parnasha-sen');
    const guest = buildGuestInfo(cipher, 'g');
    expect(guest.displayName).toBe('Tanmoy Chandra & Parnasha Sen');
    expect(guest.category).toBe('general');
  });
});

describe('encryptGuestName and decryptGuestName', () => {
  it('round-trips simple names', () => {
    const original = 'rahul-sharma';
    const cipher = encryptGuestName(original);
    expect(cipher).not.toBe(original);
    expect(/^[A-Za-z0-9_-]+$/.test(cipher)).toBe(true);
    expect(decryptGuestName(cipher)).toBe(original);
  });

  it('round-trips joint names with ampersands', () => {
    const original = 'amit-&-sneha';
    const cipher = encryptGuestName(original);
    expect(cipher).not.toBe(original);
    expect(decryptGuestName(cipher)).toBe(original);
  });

  it('falls back gracefully on plaintext input', () => {
    expect(decryptGuestName('plain-name')).toBe('plain-name');
  });

  it('round-trips embedded family category token', () => {
    const cipher = encryptGuestName('priya-sen', 'family');
    const token = decryptGuestToken(cipher);
    expect(token.name).toBe('priya-sen');
    expect(token.category).toBe('family');
  });

  it('round-trips embedded general category token', () => {
    const cipher = encryptGuestName('sourav-ganguly', 'general');
    const token = decryptGuestToken(cipher);
    expect(token.name).toBe('sourav-ganguly');
    expect(token.category).toBe('general');
  });

  it('round-trips embedded Bengali language and family category', () => {
    const cipher = encryptGuestName('tanmoy-chandra', 'family', 'bn');
    const token = decryptGuestToken(cipher);
    expect(token.name).toBe('tanmoy-chandra');
    expect(token.category).toBe('family');
    expect(token.language).toBe('bn');
  });

  it('round-trips embedded English language and general category', () => {
    const cipher = encryptGuestName('tanmoy-chandra', 'general', 'en');
    const token = decryptGuestToken(cipher);
    expect(token.name).toBe('tanmoy-chandra');
    expect(token.category).toBe('general');
    expect(token.language).toBe('en');
  });

  it('builds guest info with embedded Bengali language', () => {
    const cipher = encryptGuestName('tanmoy-chandra', 'family', 'bn');
    const guest = buildGuestInfo(cipher, null);
    expect(guest.name).toBe('tanmoy-chandra');
    expect(guest.displayName).toBe('Tanmoy Chandra');
    expect(guest.category).toBe('family');
    expect(guest.language).toBe('bn');
  });

  it('round-trips Bengali script in guest name with category and language', () => {
    const original = 'তন্ময়-চন্দ্র-ও-পর্ণাশা-সেন';
    const cipher = encryptGuestName(original, 'family', 'bn');
    const token = decryptGuestToken(cipher);
    expect(token.name).toBe(original);
    expect(token.category).toBe('family');
    expect(token.language).toBe('bn');
    const guest = buildGuestInfo(cipher, null);
    expect(guest.displayName).toBe('তন্ময় চন্দ্র ও পর্ণাশা সেন');
  });

  it('generates super-compact tokens for long Bengali names', () => {
    const original = 'শ্রী তন্ময় চন্দ্র ও শ্রীমতী পর্ণাশা সেন';
    const cipher = encryptGuestName(original, 'family', 'bn');
    expect(cipher.length).toBeLessThan(70);
    const token = decryptGuestToken(cipher);
    expect(token.name).toBe(original);
    expect(token.category).toBe('family');
    expect(token.language).toBe('bn');
  });

  it('preserves backward compatibility with legacy hexadecimal tokens', () => {
    const legacyHex = '45106862284710456f7b3381cff7e8b8d2c3'; // f:b:tanmoy-chandra
    const token = decryptGuestToken(legacyHex);
    expect(token.name).toBe('tanmoy-chandra');
    expect(token.category).toBe('family');
    expect(token.language).toBe('bn');
  });

  it('allows query param to override language when testing', () => {
    const guest = buildGuestInfo('tanmoy-chandra', 'f', 'bn');
    expect(guest.language).toBe('bn');
  });
});
