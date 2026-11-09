import { formatMatchDate, summarizeMatches } from './matches.js';
import { RESULT_WORD } from './publicRoutes.js';

const LONG_DATE = Object.freeze({
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function longMatchDate(date) {
  return formatMatchDate(date, LONG_DATE);
}

export function venuePhrase(match) {
  const side = match.isHome ? 'como local' : 'como visita';
  return match.country ? `${side} (${match.country})` : side;
}

export function sortEntriesChronologically(entries) {
  return [...entries].sort((a, b) => {
    if (a.match.date < b.match.date) return -1;
    if (a.match.date > b.match.date) return 1;
    return String(a.id).localeCompare(String(b.id));
  });
}

export function adjacentEntries(entries, id) {
  const ordered = sortEntriesChronologically(entries);
  const index = ordered.findIndex(entry => entry.id === id);
  if (index < 0) return { prev: null, next: null, index: -1, total: ordered.length, ordered };
  return {
    prev: ordered[index - 1] || null,
    next: ordered[index + 1] || null,
    index,
    total: ordered.length,
    ordered,
  };
}

export function h2hContext(entry, rivalEntries) {
  const ordered = sortEntriesChronologically(rivalEntries);
  const index = ordered.findIndex(item => item.id === entry.id);
  const n = index + 1;
  const total = ordered.length;
  const priorStats = summarizeMatches(ordered.slice(0, Math.max(index, 0)).map(item => item.match));
  const opponent = entry.match.opponent;
  const stop = opponent.endsWith('.') ? '' : '.';
  const h2hSentence = index <= 0
    ? `Primer partido del archivo entre Sporting Cristal y ${opponent}${stop}`
    : `Es el partido ${n} de ${total} frente a ${opponent}${stop} Antes de este cruce: ${priorStats.victories}V ${priorStats.draws}E ${priorStats.defeats}P.`;

  return {
    n,
    total,
    priorStats,
    prevRival: index > 0 ? ordered[index - 1] : null,
    nextRival: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null,
    h2hSentence,
  };
}

export function matchHeading(match) {
  return `${match.home} ${match.scoreLabel} ${match.away} · ${longMatchDate(match.date)} · ${match.tournament}`;
}

export function matchTitle(match) {
  const word = RESULT_WORD[match.resultCode] || 'Partido';
  return `${word} ${match.scoreLabel}: ${match.home} vs. ${match.away} (${longMatchDate(match.date)}, ${match.tournament}) | Sebiche Celeste`;
}

export function matchDescription(match, context = {}) {
  const word = RESULT_WORD[match.resultCode] || 'Resultado';
  const scorers = match.goalsNote ? ` Goles de Sporting Cristal: ${match.goalsNote}.` : '';
  const h2h = context.h2hSentence ? ` ${context.h2hSentence}` : '';
  return `${word} ${match.scoreLabel} de Sporting Cristal ante ${match.opponent} el ${longMatchDate(match.date)} en ${match.tournament}, ${venuePhrase(match)}.${scorers}${h2h}`.trim();
}

export function matchLinkLabel(entry) {
  const match = entry.match;
  return `${formatMatchDate(match.date)} · ${match.home} ${match.scoreLabel} ${match.away}`;
}
