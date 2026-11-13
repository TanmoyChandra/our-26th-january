import { describe, it, expect } from 'vitest';
import { toDisplayName, parseCategory, buildGuestInfo } from '@/lib/guest';

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
});

describe('parseCategory', () => {
  it('returns family for "family"', () => {
    expect(parseCategory('family')).toBe('family');
  });
  it('returns general for "general"', () => {
    expect(parseCategory('general')).toBe('general');
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
});
