import { useMemo } from 'react';
import aliases from '../data/scorer-aliases.json';
import fixturesData from '../data/upcoming-fixtures.json';
import StatTile from '../components/StatTile';
import { MatchList, recordLine, ResultBadge, ScorerList, TotalsStrip } from '../components/HeadToHead';
import { formatMatchDate } from '../domain/matches';
import { buildPreview, nextFixture } from '../domain/rivals';

const WHEN = new Intl.DateTimeFormat('es-PE', { timeZone: fixturesData.calendar.timeZone, weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });

function MatchPreview({ matches }) {
  const preview = useMemo(() => buildPreview(matches, nextFixture(fixturesData.fixtures), aliases), [matches]);
  if (!preview) return null;
  const { fixture, isHome, rival, h2h, form } = preview;
  const venueRecord = isHome ? h2h.home : h2h.away;
  const lineage = h2h.names.filter(n => n !== rival);

  return (
    <section className="archive-section match-preview" aria-labelledby="preview-title">
      <p className="upcoming__eyebrow">Previa · {fixture.round} · {fixture.competition}</p>
      <h2 id="preview-title" className="section-title">{fixture.homeTeam} vs. {fixture.awayTeam}</h2>
      <p className="section-subtitle">{WHEN.format(new Date(fixture.start))} · {fixture.venue}</p>

      <div className="stat-strip stat-strip--3 stat-strip--context mt-3">
        <StatTile label="Forma de Cristal (últimos 5)" value={<span className="flex gap-1">{[...form.last].reverse().map(m => <ResultBadge key={m.date + m.opponent} code={m.resultCode} />)}</span>} detail={form.last[0] ? `Último: ${form.last[0].home} ${form.last[0].scoreLabel} ${form.last[0].away}` : ''} align="left" tone="celeste" />
        <StatTile label="Racha actual" value={form.unbeaten ? `${form.unbeaten.length} sin perder` : 'Sin racha'} detail={form.winning ? `${form.winning.length} victorias seguidas` : 'Viene de no ganar'} align="left" />
        <StatTile label={`Como ${isHome ? 'local' : 'visita'} vs. ${rival}`} value={venueRecord.played ? `${venueRecord.winRate}%` : '—'} detail={venueRecord.played ? `${recordLine(venueRecord)} · ${venueRecord.played} PJ` : 'Sin antecedentes'} align="left" />
      </div>

      {h2h.total.played === 0 ? (
        <p className="mt-3">Primer partido oficial contra {rival} en el archivo. ¡Se escribe historia!</p>
      ) : (
        <>
          <h3 className="collection-title mt-4">Historial vs. {rival}{lineage.length ? ` (incluye ${lineage.join(', ')})` : ''}</h3>
          <TotalsStrip total={h2h.total} />
          <p className="copy-secondary text-sm mt-2">Primer cruce: {formatMatchDate(h2h.firstMatch.date)} · Local {recordLine(h2h.home)} · Visita {recordLine(h2h.away)}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-3 [&>*]:min-w-0">
            <MatchList title={`Últimos ${h2h.last.length} vs. ${rival}`} rows={h2h.last} />
            <ScorerList title={`Goleadores celestes vs. ${rival}`} scorers={h2h.topScorers} />
          </div>
        </>
      )}
    </section>
  );
}

export default MatchPreview;
