// Player cards derived from archive scorers. Own goals never create a card.
import { aliasKey, buildResolver, parseEntry, splitEntries } from './scorers.js';
import { rankScorers } from './stats.js';

export function filterPlayers(players, query) {
  const needle = aliasKey(query);
  if (!needle) return players;
  return players.filter(player => aliasKey(player.name).includes(needle));
}

export function sortPlayers(players, sort = 'goals') {
  const rows = [...players];
  if (sort === 'name') {
    return rows.sort((a, b) => a.name.localeCompare(b.name, 'es') || b.goals - a.goals);
  }
  return rows.sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, 'es'));
}

export function birthdayFor(name, entries = []) {
  return entries.find(entry => entry.name === name) || null;
}

export function listArchivePlayers(matches, aliases) {
  return rankScorers(matches, aliases);
}

// Split a `Goles (Solo SC)` note into display parts. Own-goal names stay plain text.
export function goalNoteParts(raw, date, resolve, pathByName) {
  const text = String(raw || '').trim();
  if (!text) return [];
  return splitEntries(text).map(entry => {
    const parsed = parseEntry(entry);
    let href = null;
    if (parsed.name && !parsed.ownGoal) {
      const canonical = resolve(parsed.name, date);
      href = pathByName?.get(canonical) || null;
    }
    const idx = parsed.name ? entry.indexOf(parsed.name) : -1;
    if (idx < 0 || !href) {
      return {
        text: entry,
        name: parsed.name || '',
        before: '',
        after: entry,
        href: null,
        ownGoal: Boolean(parsed.ownGoal),
      };
    }
    return {
      text: entry,
      name: parsed.name,
      before: entry.slice(0, idx),
      after: entry.slice(idx + parsed.name.length),
      href,
      ownGoal: false,
    };
  });
}

export function linkedGoalsNoteHtml(raw, date, aliases, pathByName, escape) {
  const resolve = typeof aliases === 'function' ? aliases : buildResolver(aliases);
  const parts = goalNoteParts(raw, date, resolve, pathByName);
  if (!parts.length) return '';
  return parts.map(part => {
    if (!part.href) return escape(part.text);
    return `${escape(part.before)}<a href="${escape(part.href)}">${escape(part.name)}</a>${escape(part.after)}`;
  }).join(', ');
}
