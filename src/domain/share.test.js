import { describe, expect, it } from 'vitest';
import { buildCard, shareHtml, shareUrl, xIntentUrl } from './share';

const base = { home: 'Sporting Cristal', isHome: true, tournament: 'Liga 1', scGoals: 2, opponentGoals: 0, resultCode: 'V' };
const matches = [
  { ...base, date: '2026-10-18', year: 2026, away: 'Comerciantes Unidos', opponent: 'Comerciantes Unidos', scoreLabel: '4-2', goalsNote: "Távara (7')" },
  { ...base, date: '1999-10-23', year: 1999, away: 'Alianza Lima', opponent: 'Alianza Lima', scoreLabel: '2-0', goalsNote: 'Jorge Soto (2)' },
];
const aliases = { players: {} };

describe('share cards', () => {
  it('builds the latest result card', () => {
    const c = buildCard(matches, aliases, { type: 'result' });
    expect(c.big).toBe('4-2');
    expect(c.title).toContain('Comerciantes Unidos');
  });
  it('builds efeméride, h2h and scorer cards', () => {
    expect(buildCard(matches, aliases, { type: 'efemeride', date: '2026-10-23' }).big).toBe('1 partidos');
    expect(buildCard(matches, aliases, { type: 'h2h', rival: 'Alianza Lima' }).big).toBe('1V 0E 0D');
    const s = buildCard(matches, aliases, { type: 'scorer', name: 'Jorge Soto' });
    expect(s.spaPath).toBe('/?view=goleadores&jugador=Jorge+Soto');
    expect(buildCard(matches, aliases, { type: 'scorer', name: 'Nadie' })).toBeNull();
  });
  it('renders escaped OG html that redirects to the SPA', () => {
    const params = { type: 'scorer', name: 'Jorge Soto' };
    const html = shareHtml(buildCard(matches, aliases, params), params, 'https://x.test');
    expect(html).toContain('og:image" content="https://x.test/api/og?type=scorer&amp;name=Jorge+Soto"');
    expect(html).toContain('url=https://x.test/?view=goleadores&amp;jugador=Jorge+Soto');
    expect(shareUrl(params, 'https://x.test')).toBe('https://x.test/api/share?type=scorer&name=Jorge+Soto');
    expect(xIntentUrl('hola', 'https://a.b')).toBe('https://x.com/intent/post?text=hola&url=https%3A%2F%2Fa.b');
  });
});
