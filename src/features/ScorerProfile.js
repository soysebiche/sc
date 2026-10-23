import { lazy, Suspense, useMemo } from 'react';
import MinuteBars from '../components/MinuteBars';
import ShareButton from '../components/ShareButton';
import StatTile from '../components/StatTile';
import { ResultBadge } from '../components/HeadToHead';
import aliases from '../data/scorer-aliases.json';
import { scorerProfile } from '../domain/goals';
import { formatMatchDate } from '../domain/matches';
import { SCORER_COMPLETE_FROM } from '../domain/stats';

const ScorerYearChart = lazy(() => import('../components/ScorerYearChart'));

function CountTable({ title, rows, keyName, head }) {
  return (
    <section className="archive-section">
      <h3 className="collection-title">{title}</h3>
      <div className="data-table-shell"><div className="overflow-x-auto"><table>
        <thead><tr><th scope="col">{head}</th><th scope="col">Goles</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r[keyName]}><td>{r[keyName]}</td><td className="text-center font-bold text-accent">{r.goals}</td></tr>)}</tbody>
      </table></div></div>
    </section>
  );
}

function ScorerProfile({ matches, name, onBack }) {
  const p = useMemo(() => scorerProfile(matches, aliases, name), [matches, name]);
  if (!p) {
    return (
      <div className="archive-section archive-empty-state">
        <p>No encontramos goles de “{name}” en el archivo.</p>
        <button type="button" className="btn btn-primary" onClick={onBack}>Volver al ranking</button>
      </div>
    );
  }
  const total = `${p.total}${p.lowerBound ? '*' : ''}`;
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <button type="button" className="btn btn-ghost mb-2" onClick={onBack}>← Ranking de goleadores</button>
        <h2 className="section-title">{p.name}</h2>
        <p className="section-subtitle">{p.yearSeries[0].year === p.yearSeries[p.yearSeries.length - 1].year ? p.yearSeries[0].year : `${p.yearSeries[0].year}–${p.yearSeries[p.yearSeries.length - 1].year}`} · {p.matches} partidos con gol</p>
        {p.lowerBound && <p className="text-xs copy-muted mt-1">* Total mínimo: antes de {SCORER_COMPLETE_FROM} faltan goleadores en el archivo.</p>}
        <div className="mt-3"><ShareButton type="scorer" name={p.name} text={`${p.name}: ${total} goles con Sporting Cristal`} /></div>
      </div>

      <div className="stat-strip stat-strip--4">
        <StatTile label="Goles" value={total} tone="celeste" detail={`Mejor año: ${p.bestYear.year} (${p.bestYear.goals})`} />
        <StatTile label="Dobletes" value={p.braces} />
        <StatTile label="Hat-tricks o más" value={p.hatTricks} />
        <StatTile label="Goles 90' o más" value={p.minutes.late} detail={`${p.minutes.known} goles con minuto`} />
      </div>
      <div className="stat-strip stat-strip--3 stat-strip--context">
        <StatTile label="Primer gol" value={formatMatchDate(p.first.date)} detail={`vs. ${p.first.opponent} (${p.first.home} ${p.first.scoreLabel} ${p.first.away})`} align="left" />
        <StatTile label="Último gol" value={formatMatchDate(p.last.date)} detail={`vs. ${p.last.opponent} (${p.last.home} ${p.last.scoreLabel} ${p.last.away})`} align="left" />
        <StatTile label="Víctima favorita" value={p.rivals[0].rival} detail={`${p.rivals[0].goals} goles`} align="left" />
      </div>

      {p.yearSeries.length > 1 && <Suspense fallback={<div className="archive-skeleton" role="status"><span>Cargando gráfico…</span></div>}><ScorerYearChart data={p.yearSeries} /></Suspense>}

      {p.minutes.known > 0 && (
        <section className="archive-section">
          <h3 className="collection-title">¿En qué minuto marca?</h3>
          <MinuteBars buckets={p.minutes.buckets} caption={`Basado en ${p.minutes.known} de ${p.total} goles con minuto registrado.`} />
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <CountTable title="Rivales favoritos" rows={p.rivals.slice(0, 10)} keyName="rival" head="Rival" />
        <CountTable title="Goles por torneo" rows={p.tournaments} keyName="tournament" head="Torneo" />
      </div>

      <section className="archive-section">
        <h3 className="collection-title">Partidos con gol ({p.rows.length})</h3>
        <div className="data-table-shell"><div className="overflow-x-auto"><table>
          <thead><tr><th scope="col">Fecha</th><th scope="col">Partido</th><th scope="col">Marcador</th><th scope="col">Goles</th><th scope="col">Torneo</th></tr></thead>
          <tbody>{p.rows.map(m => (
            <tr key={`${m.date}-${m.home}-${m.away}`}>
              <td>{formatMatchDate(m.date)}</td>
              <td>{m.home} vs {m.away}</td>
              <td className="text-center font-bold"><ResultBadge code={m.resultCode} /> {m.scoreLabel}</td>
              <td className="text-center">{m.goals}{m.minutes ? ` (${m.minutes.map(x => `${x}'`).join(', ')})` : ''}</td>
              <td>{m.tournament}</td>
            </tr>
          ))}</tbody>
        </table></div></div>
      </section>
    </div>
  );
}

export default ScorerProfile;
