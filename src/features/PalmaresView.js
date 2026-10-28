import { useMemo } from 'react';
import StatTile from '../components/StatTile';
import data from '../data/palmares.json';
import { seasonHref, palmaresSummary } from '../domain/palmares';

const summary = palmaresSummary(data);

function YearLink({ year, years, className }) {
  const href = seasonHref(year, years);
  return href ? <a href={href} className={className}>{year}</a> : <span className={className}>{year}</span>;
}

function YearChips({ years, archiveYears, tone }) {
  if (!years.length) return <span className="copy-muted">—</span>;
  return (
    <span className="palmares-years">
      {years.map(y => <YearLink key={y} year={y} years={archiveYears} className={`palmares-year palmares-year--${tone}`} />)}
    </span>
  );
}

const Sources = ({ sources }) => (
  <span className="text-xs copy-muted">
    {sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></span>)}
  </span>
);

function PalmaresView({ matches = [] }) {
  const archiveYears = useMemo(() => new Set(matches.map(m => m.year)), [matches]);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <h2 className="section-title">Palmarés</h2>
        <p className="section-subtitle">Títulos oficiales, subcampeonatos y goleadores del torneo. {data.rule}</p>
      </div>

      <div className="stat-strip stat-strip--4">
        <StatTile label="Títulos oficiales" value={summary.titles} tone="celeste" />
        <StatTile label="Ligas peruanas" value={summary.leagueTitles} tone="win" />
        <StatTile label="Subcampeonatos" value={summary.runnersUp} />
        <StatTile label="Goleadores del torneo" value={summary.topScorers} />
      </div>

      {data.competitions.map(c => (
        <section className="archive-section" key={c.id}>
          <h3 className="collection-title">{c.name} <span className="copy-muted text-sm">· {c.scope}</span></h3>
          <div className="palmares-row"><strong>Campeón ({c.titles.length})</strong><YearChips years={c.titles} archiveYears={archiveYears} tone="win" /></div>
          <div className="palmares-row"><strong>Subcampeón ({c.runnersUp.length})</strong><YearChips years={c.runnersUp} archiveYears={archiveYears} tone="draw" /></div>
          {c.note && <p className="copy-secondary text-sm mt-2">{c.note}</p>}
          <p className="mt-2">Fuentes: <Sources sources={c.sources} /></p>
        </section>
      ))}

      <section className="archive-section">
        <h3 className="collection-title">Goleadores del campeonato peruano</h3>
        <div className="data-table-shell"><div className="overflow-x-auto">
          <table>
            <thead><tr><th scope="col">Año</th><th scope="col">Jugador</th><th scope="col">Goles</th></tr></thead>
            <tbody>{data.topScorers.map(s => (
              <tr key={`${s.year}-${s.player}`}>
                <td className="text-center"><YearLink year={s.year} years={archiveYears} /></td>
                <td>{s.player}</td>
                <td className="text-center font-bold text-accent">{s.goals}</td>
              </tr>
            ))}</tbody>
          </table>
        </div></div>
        <p className="mt-2">Fuentes: <Sources sources={data.topScorers[0].sources} /></p>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Lo que no entra (por ahora)</h3>
        <ul className="copy-secondary text-sm palmares-excluded">
          {data.excluded.map(e => <li key={e.item}><strong>{e.item}:</strong> {e.reason}</li>)}
        </ul>
      </section>
    </div>
  );
}

export default PalmaresView;
