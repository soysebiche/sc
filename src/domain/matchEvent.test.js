import { describe, expect, test } from 'vitest';
import {
  EVENT_SCHEDULED,
  eventPlace,
  matchSportsEvent,
  sportsEventIssues,
} from './matchEvent';

const completedAway = {
  path: '/partidos/1956-08-05-alianza-lima',
  match: {
    home: 'Alianza Lima',
    away: 'Sporting Cristal',
    date: '1956-08-05',
    tournament: 'Liga',
    country: 'Perú',
    isHome: false,
    opponent: 'Alianza Lima',
    scoreLabel: '2-1',
  },
};

describe('match SportsEvent JSON-LD', () => {
  test('completed matches keep EventScheduled, Place, organizer and both teams', () => {
    const event = matchSportsEvent(completedAway, 'Derrota 2-1 de Sporting Cristal ante Alianza Lima.');
    expect(sportsEventIssues(event)).toEqual([]);
    expect(event.eventStatus).toBe(EVENT_SCHEDULED);
    expect(event.location.address.addressCountry).toBe('PE');
    expect(event.location.address.addressLocality).toBe('Lima');
    expect(event.organizer.name).toBe('Liga');
    expect(event.superEvent['@type']).toBe('SportsOrganization');
    expect(event.competitor.map(team => team.name)).toEqual(['Alianza Lima', 'Sporting Cristal']);
    expect(event.name).toContain('2-1');
    expect(event.description).toContain('2-1');
    expect(event.score).toBeUndefined();
  });

  test('home matches use Lima as city-level Place, not a stadium', () => {
    const place = eventPlace({
      isHome: true,
      country: 'Perú',
      opponent: 'Alianza Atlético',
    });
    expect(place.name).toBe('Lima, Perú');
    expect(place.address.addressLocality).toBe('Lima');
    expect(place.address.streetAddress).toBeUndefined();
  });

  test('away matches use the rival home city when the map has it', () => {
    const place = eventPlace({
      isHome: false,
      country: 'Perú',
      opponent: 'Alianza Atlético',
    });
    expect(place.name).toBe('Sullana, Perú');
    expect(place.address.addressLocality).toBe('Sullana');
  });

  test('unmapped away matches fall back to country instead of inventing a city', () => {
    const place = eventPlace({
      isHome: false,
      country: 'Perú',
      opponent: 'Pirata',
    });
    expect(place.name).toBe('Perú');
    expect(place.address.addressLocality).toBeUndefined();
    expect(place.address.addressCountry).toBe('PE');
  });

  test('omits Event markup when startDate or location cannot be filled', () => {
    expect(matchSportsEvent({
      path: '/partidos/tbd',
      match: { ...completedAway.match, date: 'TBD' },
    })).toBeNull();
    expect(matchSportsEvent({
      path: completedAway.path,
      match: { ...completedAway.match, country: '' },
    })).toBeNull();
    expect(sportsEventIssues(null)).toContain('missing SportsEvent');
  });
});
