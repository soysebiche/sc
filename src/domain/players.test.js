import { describe, expect, it } from 'vitest';
import archive from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import birthdays from '../data/scorer-birthdays.json';
import { parseMatch } from './matches';
import { birthdayFor, filterPlayers, goalNoteParts, listArchivePlayers, sortPlayers } from './players';
import { buildPublicCatalog, slugify } from './publicRoutes';
import { buildResolver, parseScorers } from './scorers';

const matches = archive.map(parseMatch);
const row = (goalsNote, extra = {}) => parseMatch({
  Fecha: extra.date || '2024-05-01',
  Marcador: extra.score || '2-0',
  'Equipo Local': extra.home || 'Sporting Cristal',
  'Equipo Visita': extra.away || 'Rival',
  Torneo: extra.tournament || 'Liga 1',
  'Goles (Solo SC)': goalsNote,
});

describe('scorer aggregation for player cards', () => {
  const players = listArchivePlayers(matches, aliases);
    const catalog = buildPublicCatalog(matches, aliases);
  const names = new Set(players.map(player => player.name));

  it('ranks archive scorers without inventing names', () => {
    expect(players[0]).toMatchObject({ name: 'Jorge Soto', goals: 163 });
    expect(players.length).toBe(catalog.players.length);
    expect(players.length).toBeGreaterThan(300);
  });

  it('excludes own-goal-only rivals from the player catalog', () => {
    const resolve = buildResolver(aliases);
    const cristalGoals = new Set();
    const ownGoalNames = new Set();
    for (const match of matches) {
      for (const scorer of parseScorers({
        'Goles (Solo SC)': match.goalsNote,
        Marcador: match.scoreLabel,
        'Equipo Local': match.home,
        'Equipo Visita': match.away,
        Fecha: match.date,
      })) {
        if (!scorer.name) continue;
        const canonical = resolve(scorer.name, match.date);
        if (scorer.ownGoal) ownGoalNames.add(canonical);
        else cristalGoals.add(canonical);
      }
    }
    const ownGoalOnly = [...ownGoalNames].filter(name => !cristalGoals.has(name));
    expect(ownGoalOnly.length).toBeGreaterThan(0);
    expect(ownGoalOnly).toEqual(expect.arrayContaining(['Ángel Martínez']));
    for (const name of ownGoalOnly) {
      expect(names.has(name)).toBe(false);
    }
  });

  it('does not merge distinct people who share a surname', () => {
    expect(names.has('Oswaldo Ramírez')).toBe(true);
    expect(names.has('Alberto Ramírez')).toBe(true);
    expect(catalog.players.find(player => player.name === 'Oswaldo Ramírez').slug)
      .not.toBe(catalog.players.find(player => player.name === 'Alberto Ramírez').slug);
  });

  it('assigns a unique stable slug per canonical scorer', () => {
    const slugs = catalog.players.map(player => player.slug);
    expect(new Set(slugs).size).toBe(catalog.players.length);
    const soto = catalog.players.find(player => player.name === 'Jorge Soto');
    expect(soto.path).toBe('/jugadores/jorge-soto');
    expect(soto.spa).toBe('/?view=goleadores&jugador=Jorge+Soto');
    expect(catalog.players.find(player => player.name === 'Irven Ávila').slug).toBe('irven-avila');
    expect(slugify('José Pérez')).toBe(slugify('Jose Perez'));
  });

  it('keeps colliding accent variants as separate cards', () => {
    const catalogClash = buildPublicCatalog([
      row('José Pérez'),
      row('Jose Perez', { date: '2024-05-02', away: 'Otro' }),
    ], { players: {} });
    expect(catalogClash.players.map(player => player.name).sort()).toEqual(['Jose Perez', 'José Pérez']);
    expect(new Set(catalogClash.players.map(player => player.slug)).size).toBe(2);
    expect(catalogClash.players.every(player => player.goals === 1)).toBe(true);
  });
});

describe('player index helpers', () => {
  const players = [
    { name: 'Jorge Soto', goals: 160 },
    { name: 'Irven Ávila', goals: 145 },
    { name: 'Luis Bonnet', goals: 141 },
  ];

  it('filters by accent-insensitive search without merging people', () => {
    expect(filterPlayers(players, 'avila').map(player => player.name)).toEqual(['Irven Ávila']);
    expect(filterPlayers(players, 'JORGE').map(player => player.name)).toEqual(['Jorge Soto']);
    expect(filterPlayers(players, '')).toHaveLength(3);
  });

  it('sorts by goals or by name', () => {
    expect(sortPlayers(players, 'goals').map(player => player.name)).toEqual(['Jorge Soto', 'Irven Ávila', 'Luis Bonnet']);
    expect(sortPlayers(players, 'name').map(player => player.name)).toEqual(['Irven Ávila', 'Jorge Soto', 'Luis Bonnet']);
  });

  it('returns a birthday only when the archive file has one', () => {
    expect(birthdayFor('Jorge Soto', birthdays)).toMatchObject({ name: 'Jorge Soto', birthDate: '1971-10-27' });
    expect(birthdayFor('Nadie', birthdays)).toBeNull();
  });
});

describe('goal notes', () => {
  const resolve = buildResolver(aliases);
  const paths = new Map([['Yoshimar Yotún', '/jugadores/yoshimar-yotun']]);

  it('links Cristal scorers and leaves own goals as plain text', () => {
    const parts = goalNoteParts('Yoshimar Yotún (62pen), Ángel Martínez (87og)', '2026-02-17', resolve, paths);
    expect(parts[0]).toMatchObject({ name: 'Yoshimar Yotún', href: '/jugadores/yoshimar-yotun' });
    expect(parts[1]).toMatchObject({ ownGoal: true, href: null });
    expect(parts[1].text).toContain('Ángel Martínez');
  });
});
