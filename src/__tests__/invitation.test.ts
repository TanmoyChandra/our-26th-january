import { describe, it, expect } from 'vitest';
import { getVisibleEvents, isEventVisible } from '@/lib/invitation';
import type { EventDetails } from '@/types/invitation';

describe('getVisibleEvents', () => {
  it('family guests see all events', () => {
    const events = getVisibleEvents('family');
    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  it('general guests do NOT see Ashirbad (family-only event)', () => {
    const events = getVisibleEvents('general');
    const ashirbad = events.find((e) => e.id === 'ashirbad');
    expect(ashirbad).toBeUndefined();
  });

  it('general guests see Engagement & Registry', () => {
    const events = getVisibleEvents('general');
    const engagement = events.find((e) => e.id === 'engagement');
    expect(engagement).toBeDefined();
  });

  it('family guests see Ashirbad', () => {
    const events = getVisibleEvents('family');
    const ashirbad = events.find((e) => e.id === 'ashirbad');
    expect(ashirbad).toBeDefined();
  });

  it('general events list is a subset of family events list', () => {
    const familyEvents = getVisibleEvents('family').map((e) => e.id);
    const generalEvents = getVisibleEvents('general').map((e) => e.id);
    generalEvents.forEach((id) => {
      expect(familyEvents).toContain(id);
    });
  });
});

describe('isEventVisible', () => {
  const familyOnlyEvent: EventDetails = {
    id: 'test-family',
    title: 'Family Only',
    date: '26 January 2027',
    time: '09:00',
    venue: 'Test',
    venueAddress: 'Test',
    description: 'Test',
    visibleTo: ['family'],
  };

  const sharedEvent: EventDetails = {
    id: 'test-shared',
    title: 'Shared',
    date: '26 January 2027',
    time: '14:00',
    venue: 'Test',
    venueAddress: 'Test',
    description: 'Test',
    visibleTo: ['family', 'general'],
  };

  it('family-only event is visible to family', () => {
    expect(isEventVisible(familyOnlyEvent, 'family')).toBe(true);
  });
  it('family-only event is NOT visible to general', () => {
    expect(isEventVisible(familyOnlyEvent, 'general')).toBe(false);
  });
  it('shared event is visible to family', () => {
    expect(isEventVisible(sharedEvent, 'family')).toBe(true);
  });
  it('shared event is visible to general', () => {
    expect(isEventVisible(sharedEvent, 'general')).toBe(true);
  });
});
