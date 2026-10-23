import { useMemo } from 'react';
import StatTile from '../components/StatTile';
import aliases from '../data/scorer-aliases.json';
import { formatMatchDate } from '../domain/matches';
import { tournamentRecords } from '../domain/rivals';
import { calculateHomeAway, calculateRecords, calculateStreaks, winRate } from '../domain/stats';

const range = s => (s ? `${formatMatchDate(s.start)} – ${formatMatchDate(s.end)}` : '—');

function MatchTable({ title, rows }) {
  return (
    <section className="archive-section">
      <h3 className="collection-title">{title}</h3>
      <div className="data-table-shell"><div className="overflow-x-auto">
        <table>
          <thead><tr><th scope="col">Fecha</th><th scope="col">Partido</th><th scope="col">Marcador</th><th scope="col">Torneo</th></tr></thead>
          <tbody>{rows.map(m => (
            <tr key={`${m.date}-${m.home}-${m.away}`}>
              <td>{formatMatchDate(m.date)}</td>
              <td>{m.home} vs {m.away}</td>
              <td className="text-center font-bold">{m.scoreLabel}</td>
              <td>{m.tournament}</td>
            </tr>
          ))}</tbody>
        </table>
      </div></div>
    </section>
  );
}

const splitCells = s => (
  <>
    <td className="text-center">{s.played}</td>
    <td className="text-center text-victory">{s.V}</td>
    <td className="text-center text-draw">{s.E}</td>
    <td className="text-center text-defeat">{s.P}</td>
    <td className="text-center font-bold text-accent">{winRate(s)}%</td>
  </>
);

function SplitTable({ title, rows, labelHeader }) {
  return (
    <section className="archive-section">
      <h3 className="collection-title">{title}</h3>
      <div className="data-table-shell"><div className="overflow-x-auto">
        <table>
          <thead><tr>
            <th scope="col" rowSpan="2">{labelHeader}</th>
            <th scope="colgroup" colSpan="5">Local</th><th scope="colgroup" colSpan="5">Visita</th>
          </tr><tr>
            {['PJ', 'V', 'E', 'D', '%V', 'PJ', 'V', 'E', 'D', '%V'].map((h, i) => <th scope="col" key={i}>{h}</th>)}
          </tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.label}><td>{r.label}</td>{splitCells(r.home)}{splitCells(r.away)}</tr>
          ))}</tbody>
        </table>
      </div></div>
    </section>
  );
}

function RecordsView({ matches }) {
  const streaks = useMemo(() => calculateStreaks(matches), [matches]);
  const records = useMemo(() => calculateRecords(matches), [matches]);
  const homeAway = useMemo(() => calculateHomeAway(matches), [matches]);
  const byTournament = useMemo(() => tournamentRecords(matches, aliases), [matches]);
  const { home, away } = homeAway.overall;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <h2 className="section-title">Rachas y récords</h2>
        <p className="section-subtitle">Calculados en orden cronológico sobre todo el archivo.</p>
      </div>

      <section className="archive-section">
        <h3 className="collection-title">Rachas</h3>
        <div className="stat-strip stat-strip--3 stat-strip--context">
          {Object.entries(streaks).map(([id, s]) => (
            <StatTile key={id} label={`${s.label} · récord`} value={s.record?.length ?? 0} detail={range(s.record)} align="left" tone="celeste" />
          ))}
        </div>
        <div className="stat-strip stat-strip--3 stat-strip--context mt-3">
          {Object.entries(streaks).map(([id, s]) => (
            <StatTile key={id} label={`${s.label} · actual`} value={s.current?.length ?? 0} detail={s.current ? range(s.current) : 'Sin racha activa'} align="left" />
          ))}
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Récord por torneo</h3>
        <div className="data-table-shell"><div className="overflow-x-auto">
          <table>
            <thead><tr>{['Torneo', 'Años', 'PJ', 'V', 'E', 'D', 'GF', 'GC', '%V', 'Goleador'].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
            <tbody>{byTournament.map(t => (
              <tr key={t.family}>
                <td title={t.variants.join(' · ')}>{t.family}</td>
                <td className="text-center">{t.firstYear === t.lastYear ? t.firstYear : `${t.firstYear}–${t.lastYear}`}</td>
                <td className="text-center">{t.played}</td>
                <td className="text-center text-victory">{t.V}</td><td className="text-center text-draw">{t.E}</td><td className="text-center text-defeat">{t.P}</td>
                <td className="text-center">{t.goalsFor}</td><td className="text-center">{t.goalsAgainst}</td>
                <td className="text-center font-bold text-accent">{t.winRate}%</td>
                <td>{t.topScorer ? `${t.topScorer.name} (${t.topScorer.goals}${t.topScorer.lowerBound ? '*' : ''})` : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div></div>
        <p className="copy-secondary text-sm mt-2">Las variantes de nombre se agrupan (pasa el cursor sobre el torneo para verlas). * total mínimo: faltan goleadores antes de 1990.</p>
      </section>

      <MatchTable title="Mayores goleadas a favor" rows={records.biggestWins} />
      <MatchTable title="Mayores derrotas" rows={records.biggestLosses} />
      <MatchTable title="Partidos con más goles" rows={records.highestScoring} />

      <section className="archive-section">
        <h3 className="collection-title">Marcadores más repetidos (Cristal primero)</h3>
        <div className="stat-strip stat-strip--5">
          {records.scorelines.slice(0, 5).map(s => <StatTile key={s.score} label={s.score} value={s.count} detail="partidos" />)}
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Local vs. visita</h3>
        <div className="stat-strip stat-strip--4">
          <StatTile label="Local · % victorias" value={`${winRate(home)}%`} detail={`${home.V}V ${home.E}E ${home.P}D · ${home.played} PJ`} tone="win" />
          <StatTile label="Local · goles" value={`${home.goalsFor}-${home.goalsAgainst}`} />
          <StatTile label="Visita · % victorias" value={`${winRate(away)}%`} detail={`${away.V}V ${away.E}E ${away.P}D · ${away.played} PJ`} tone="celeste" />
          <StatTile label="Visita · goles" value={`${away.goalsFor}-${away.goalsAgainst}`} />
        </div>
      </section>
      <SplitTable title="Local vs. visita por década" labelHeader="Década" rows={homeAway.perDecade.map(d => ({ ...d, label: `${d.decade}s` }))} />
      <SplitTable title="Local vs. visita por rival (10+ partidos)" labelHeader="Rival" rows={homeAway.perRival.map(r => ({ ...r, label: r.name }))} />
    </div>
  );
}

export default RecordsView;
