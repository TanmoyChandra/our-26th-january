import { describe, it, expect } from 'vitest';
import {
  toDisplayName,
  parseCategory,
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
    expect(/^[0-9a-f]+$/.test(cipher)).toBe(true);
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
});
