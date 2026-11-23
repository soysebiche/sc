import { formatMatchDate } from './matches.js';

export const RIVAL_TITLE_MAX = 60;
export const RIVAL_DESC_MIN = 150;
export const RIVAL_DESC_MAX = 160;

const LAST_DATE = Object.freeze({ day: 'numeric', month: 'short', year: 'numeric' });

function shortTeam(name) {
  return name === 'Sporting Cristal' ? 'Cristal' : name;
}

export function rivalTitle(name) {
  const full = `Sporting Cristal vs ${name}: historial | Celeste`;
  if (full.length <= RIVAL_TITLE_MAX) return full;
  return `Cristal vs ${name}: historial | Celeste`;
}

export function rivalHeading(name) {
  return `Sporting Cristal vs. ${name}: historial`;
}

function lastResultPhrases(last) {
  if (!last) return [''];
  const date = formatMatchDate(last.date, LAST_DATE);
  return [
    ` Último: ${last.home} ${last.scoreLabel} ${last.away} (${date}).`,
    ` Último: ${shortTeam(last.home)} ${last.scoreLabel} ${shortTeam(last.away)} (${date}).`,
    ` Último: ${last.scoreLabel} el ${date}.`,
  ];
}

function recordPhrases(total) {
  const played = total?.played ?? 0;
  const victories = total?.V ?? 0;
  const draws = total?.E ?? 0;
  const defeats = total?.P ?? 0;
  const goals = `${total?.goalsFor ?? 0}-${total?.goalsAgainst ?? 0}`;
  return [
    `${played} PJ, ${victories}V ${draws}E ${defeats}P, goles ${goals}`,
    `${played} PJ, ${victories}V ${draws}E ${defeats}P`,
    `${victories}V ${draws}E ${defeats}P en ${played} PJ`,
  ];
}

function tidy(text) {
  return text.replace(/\s+/g, ' ').replace(/\s+\./g, '.').replace(/\.{2,}/g, '.').trim();
}

function clipDescription(text, max = RIVAL_DESC_MAX) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  const body = (at >= RIVAL_DESC_MIN - 5 ? cut.slice(0, at) : cut).replace(/[.,;: ]+$/, '');
  return `${body}.`;
}

function finalizeDescription(text) {
  const cleaned = tidy(text);
  if (cleaned.length >= RIVAL_DESC_MIN && cleaned.length <= RIVAL_DESC_MAX) return cleaned;
  if (cleaned.length > RIVAL_DESC_MAX) return clipDescription(cleaned);
  const fillers = [
    ' Archivo.',
    ' Ver archivo.',
    ' Archivo celeste.',
    ' Archivo histórico.',
    ' Archivo histórico celeste.',
    ' Consulta el archivo celeste.',
    ' Consulta el historial en Celeste.',
  ];
  for (const filler of fillers) {
    const next = tidy(`${cleaned.replace(/\.+$/, '')}.${filler}`);
    if (next.length >= RIVAL_DESC_MIN && next.length <= RIVAL_DESC_MAX) return next;
  }
  return cleaned;
}

export function rivalDescription(name, h2h = {}) {
  const records = recordPhrases(h2h.total || {});
  const lasts = lastResultPhrases(h2h.lastMatch);
  const heads = [
    `Historial Sporting Cristal vs ${name}`,
    `Historial de Sporting Cristal vs ${name}`,
    `Historial Cristal vs ${name}`,
    `Sporting Cristal vs ${name} historial`,
  ];
  const pads = [
    '',
    ' Resultados en Celeste.',
    ' Archivo de resultados en Celeste.',
    ' Historial y resultados en Celeste.',
  ];

  const candidates = [];
  heads.forEach(head => {
    records.forEach(record => {
      lasts.forEach(last => {
        pads.forEach(pad => {
          candidates.push(tidy(`${head}: ${record}.${last}${pad}`));
        });
      });
    });
  });

  const hit = candidates.find(text => text.length >= RIVAL_DESC_MIN && text.length <= RIVAL_DESC_MAX);
  if (hit) return hit;

  const under = candidates.filter(text => text.length < RIVAL_DESC_MIN).sort((a, b) => b.length - a.length)[0];
  if (under) return finalizeDescription(under);

  const longestFit = candidates.filter(text => text.length <= RIVAL_DESC_MAX).sort((a, b) => b.length - a.length)[0];
  if (longestFit) return finalizeDescription(longestFit);
  return finalizeDescription(candidates[0]);
}
