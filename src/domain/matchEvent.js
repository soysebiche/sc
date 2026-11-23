// SportsEvent JSON-LD for prerendered match pages.
// Google Event rich results require name, startDate, and a Place with name + PostalAddress.
// The archive has no stadium: city (or country) is the most specific location we can cite.
import { CITY_COORDS } from '../data/rival-cities.js';
import { CLUB_NAME, parseCalendarDate } from './matches.js';
import { OG_IMAGE_PATH, SITE_URL, absoluteUrl } from './publicRoutes.js';
import { cityIdForRival } from './venues.js';

export const EVENT_SCHEDULED = 'https://schema.org/EventScheduled';
export const OFFLINE_ATTENDANCE = 'https://schema.org/OfflineEventAttendanceMode';
export const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const COUNTRY_ISO = Object.freeze({
  Perú: 'PE',
  Argentina: 'AR',
  Bolivia: 'BO',
  Brasil: 'BR',
  Chile: 'CL',
  Colombia: 'CO',
  Ecuador: 'EC',
  México: 'MX',
  Paraguay: 'PY',
  USA: 'US',
  Uruguay: 'UY',
  Venezuela: 'VE',
});

function isHomeMatch(match) {
  if (match.isHome === true) return true;
  if (match.isHome === false) return false;
  return match.home === CLUB_NAME;
}

export function eventPlace(match) {
  const country = match.country || '';
  const iso = COUNTRY_ISO[country];
  if (!iso) return null;

  let city = null;
  if (isHomeMatch(match)) {
    city = CITY_COORDS.lima;
  } else {
    const cityId = cityIdForRival(match.opponent, country);
    if (cityId && CITY_COORDS[cityId]) city = CITY_COORDS[cityId];
  }

  const address = { '@type': 'PostalAddress', addressCountry: iso };
  if (city?.name) address.addressLocality = city.name;

  return {
    '@type': 'Place',
    name: city?.name ? `${city.name}, ${city.country || country}` : country,
    address,
  };
}

function sportsTeam(name) {
  const team = { '@type': 'SportsTeam', name };
  if (name === CLUB_NAME) team['@id'] = `${SITE_URL}/#sporting-cristal`;
  return team;
}

/**
 * Google-valid SportsEvent for a completed archive match, or null.
 * Omit Event markup rather than emit one missing required fields.
 * superEvent is a SportsOrganization (the tournament), never a nested Event.
 */
export function matchSportsEvent(entry, description) {
  const match = entry?.match;
  if (!match) return null;
  if (!DATE_ONLY.test(match.date) || !parseCalendarDate(match.date)) return null;
  if (!match.home || !match.away) return null;
  const location = eventPlace(match);
  if (!location) return null;

  const homeTeam = sportsTeam(match.home);
  const awayTeam = sportsTeam(match.away);
  const name = [match.home, match.scoreLabel, match.away].filter(Boolean).join(' ');
  const event = {
    '@type': 'SportsEvent',
    name,
    url: absoluteUrl(entry.path),
    startDate: match.date,
    eventStatus: EVENT_SCHEDULED,
    eventAttendanceMode: OFFLINE_ATTENDANCE,
    sport: 'Soccer',
    location,
    homeTeam,
    awayTeam,
    competitor: [homeTeam, awayTeam],
    image: absoluteUrl(OG_IMAGE_PATH),
  };
  if (description) event.description = description;
  if (match.tournament) {
    event.organizer = { '@type': 'SportsOrganization', name: match.tournament };
    event.superEvent = { '@type': 'SportsOrganization', name: match.tournament };
  }
  return event;
}

export function sportsEventIssues(event) {
  if (!event) return ['missing SportsEvent'];
  const issues = [];
  if (event['@type'] !== 'SportsEvent') issues.push('not SportsEvent');
  if (!event.name) issues.push('missing name');
  if (!DATE_ONLY.test(event.startDate || '')) issues.push('invalid startDate');
  if (event.eventStatus !== EVENT_SCHEDULED) issues.push('invalid eventStatus');
  if (event.location?.['@type'] !== 'Place' || !event.location.name) issues.push('missing location.name');
  if (event.location?.address?.['@type'] !== 'PostalAddress' || !event.location.address.addressCountry) {
    issues.push('missing location.address');
  }
  if (!event.homeTeam?.name || !event.awayTeam?.name) issues.push('incomplete competitors');
  if (!Array.isArray(event.competitor) || event.competitor.length !== 2) issues.push('incomplete competitor list');
  if (event.superEvent?.['@type'] === 'SportsEvent' || event.superEvent?.['@type'] === 'Event') {
    issues.push('nested Event in superEvent');
  }
  if ('score' in event || 'homeScore' in event || 'awayScore' in event) issues.push('non-schema score field');
  return issues;
}
