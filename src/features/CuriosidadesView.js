import { useMemo } from 'react';
import StatTile from '../components/StatTile';
import aliases from '../data/scorer-aliases.json';
import { formatMatchDate } from '../domain/matches';
import { SCORER_CAVEAT_FROM, goalTiming, hatTricks, minuteLabel, rivalExtremes, rivalStreaks, scorerVsRival, seasonPoints } from '../domain/curiosidades';

const span = s => (s.start === s.end ? formatMatchDate(s.start) : `${formatMatchDate(s.start)} – ${formatMatchDate(s.end)}`);
const yearHref = y => `/temporadas/${y}`;

function Table({ head, rows }) {
  return (
    <div className="data-table-shell"><div className="overflow-x-auto">
      <table>
        <thead><tr>{head.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div></div>
  );
}

function StreakList({ title, rows, empty }) {
  return (
    <div>
      <h4 className="font-bold mt-3 mb-2">{title}</h4>
      {rows.length ? (
        <ol className="text-sm curio-list">{rows.map(r => (
          <li key={r.rival}><strong>{r.length}</strong> · {r.rival} <span className="copy-muted">({span(r)})</span></li>
        ))}</ol>
      ) : <p className="copy-muted text-sm">{empty}</p>}
    </div>
  );
}

function CuriosidadesView({ matches = [] }) {
  const streaks = useMemo(() => rivalStreaks(matches), [matches]);
  const pairs = useMemo(() => scorerVsRival(matches, aliases), [matches]);
  const hats = useMemo(() => hatTricks(matches, aliases), [matches]);
  const timing = useMemo(() => goalTiming(matches, aliases), [matches]);
  const seasons = useMemo(() => seasonPoints(matches), [matches]);
  const extremes = useMemo(() => rivalExtremes(matches), [matches]);
  const seasonRow = s => (
    <tr key={s.year}>
      <td className="text-center"><a href={yearHref(s.year)}>{s.year}</a></td>
      <td className="text-center">{s.played}</td>
      <td className="text-center">{s.V}-{s.E}-{s.P}</td>
      <td className="text-center">{s.goalsFor}-{s.goalsAgainst}</td>
      <td className="text-center font-bold text-accent">{s.pct}%</td>
    </tr>
  );
  const goalRow = g => (
    <tr key={`${g.date}-${g.name}-${g.minute}-${g.added}`}>
      <td className="text-center font-bold text-accent">{minuteLabel(g)}</td>
      <td>{g.name}</td>
      <td>{g.home} {g.scoreLabel} {g.away}</td>
      <td>{formatMatchDate(g.date)}</td>
    </tr>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <h2 className="section-title">Curiosidades</h2>
        <p className="section-subtitle">Datos raros y rachas sacados solo de nuestro archivo de partidos. Los goleadores están incompletos antes de {SCORER_CAVEAT_FROM}, así que los datos de goles de esa época son un mínimo.</p>
      </div>

      <div className="stat-strip stat-strip--3">
        <StatTile label="Rival más enfrentado" value={extremes.mostPlayed.played} detail={`${extremes.mostPlayed.rival} · partidos`} tone="celeste" />
        <StatTile label="Rival al que más goles le metimos" value={extremes.mostGoalsFor.goalsFor} detail={`${extremes.mostGoalsFor.rival} · en ${extremes.mostGoalsFor.played} PJ`} tone="win" />
        <StatTile label="Rival que más goles nos metió" value={extremes.mostGoalsAgainst.goalsAgainst} detail={`${extremes.mostGoalsAgainst.rival} · en ${extremes.mostGoalsAgainst.played} PJ`} tone="loss" />
      </div>

      <section className="archive-section">
        <h3 className="collection-title">Rachas ante un mismo rival</h3>
        <p className="copy-secondary text-sm">Partidos seguidos contra el mismo club, en todas las competiciones.</p>
        <div className="curio-grid">
          {Object.entries(streaks).map(([id, s]) => <StreakList key={id} title={`${s.label} · récord`} rows={s.record} empty="—" />)}
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Rachas vigentes</h3>
        <p className="copy-secondary text-sm">Rachas que siguen abiertas (3+ partidos) contra rivales que enfrentamos en los últimos 3 años.</p>
        <div className="curio-grid">
          {Object.entries(streaks).map(([id, s]) => <StreakList key={id} title={s.label} rows={s.current} empty="Ninguna abierta." />)}
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Verdugos: más goles a un mismo rival</h3>
        <Table head={['Jugador', 'Rival', 'Goles', 'PJ con gol']} rows={pairs.map(p => (
          <tr key={`${p.name}-${p.rival}`}><td>{p.name}</td><td>{p.rival}</td><td className="text-center font-bold text-accent">{p.goals}</td><td className="text-center">{p.matches}</td></tr>
        ))} />
        <p className="copy-muted text-xs mt-2">PJ con gol: partidos en los que marcó a ese rival.</p>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Hat-tricks ({hats.rows.length})</h3>
        <div className="stat-strip stat-strip--3">
          {hats.leaders.slice(0, 3).map((l, i) => <StatTile key={l.name} label={i ? `${i + 1}.º` : 'Más hat-tricks'} value={l.count} detail={l.name} tone={i ? undefined : 'celeste'} />)}
        </div>
        <Table head={['Fecha', 'Jugador', 'Goles', 'Partido', 'Torneo']} rows={hats.rows.map(h => (
          <tr key={`${h.date}-${h.name}`}>
            <td>{formatMatchDate(h.date)}</td><td>{h.name}</td>
            <td className="text-center font-bold text-accent">{h.goals}</td>
            <td>{h.home} {h.scoreLabel} {h.away}</td><td>{h.tournament}</td>
          </tr>
        ))} />
        <p className="copy-muted text-xs mt-2">Tres o más goles de un mismo jugador en un partido. Antes de {SCORER_CAVEAT_FROM} faltan goleadores de varios partidos.</p>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Los goles más rápidos y más tardíos</h3>
        <h4 className="font-bold mt-2 mb-2">Más rápidos</h4>
        <Table head={['Min.', 'Goleador', 'Partido', 'Fecha']} rows={timing.fastest.map(goalRow)} />
        <h4 className="font-bold mt-4 mb-2">Más tardíos (en el descuento)</h4>
        <Table head={['Min.', 'Goleador', 'Partido', 'Fecha']} rows={timing.latest.map(goalRow)} />
        <p className="copy-muted text-xs mt-2">Sobre {timing.timedGoals} goles con minuto registrado; no cuenta los alargues.</p>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Mejores y peores temporadas</h3>
        <p className="copy-secondary text-sm">Porcentaje de puntos (3 por victoria, 1 por empate) sobre todos los partidos del año, con al menos 15 jugados ({seasons.seasons} temporadas califican).</p>
        <div className="curio-grid curio-grid--2">
          <div><h4 className="font-bold mt-3 mb-2">Mejores</h4><Table head={['Año', 'PJ', 'V-E-P', 'Goles', '% pts']} rows={seasons.best.map(seasonRow)} /></div>
          <div><h4 className="font-bold mt-3 mb-2">Peores</h4><Table head={['Año', 'PJ', 'V-E-P', 'Goles', '% pts']} rows={seasons.worst.map(seasonRow)} /></div>
        </div>
        <p className="copy-muted text-xs mt-2">Algunas temporadas antiguas tienen partidos faltantes en el archivo y quedan fuera por el mínimo.</p>
      </section>
    </div>
  );
}

export default CuriosidadesView;
