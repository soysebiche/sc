// Sebiche Celeste UI kit v1 — componentes React sin dependencias (solo clases de ui-kit.css).
import React from 'react';

export const DISCLAIMER = 'Proyecto independiente de hinchas. Sin relación oficial con el Club Sporting Cristal.';
const KIND = { V: 'win', G: 'win', E: 'draw', D: 'loss', P: 'loss' };
const LABEL = { win: 'Victoria', draw: 'Empate', loss: 'Derrota' };
const SHORT = { win: 'V', draw: 'E', loss: 'P' };
export const resultKind = (r) => KIND[r] || 'draw';

export function Stripe() { return <div className="sc-stripe" aria-hidden="true"><i /><i /><i /></div>; }

/** Cabecera con logo (usa el SVG master, nunca redibujado) y tabs. */
export function SiteHeader({ logoSrc = '/brand/sebiche-celeste-lockup-horizontal-color.svg', tabs = [], current, onSelect, actions }) {
  return (
    <header className="sc-header">
      <Stripe />
      <div className="sc-header__bar">
        <img className="sc-header__logo" src={logoSrc} alt="Sebiche Celeste" />
        {actions}
      </div>
      <nav className="sc-tabs" aria-label="Secciones">
        {tabs.map((t) => (
          <button key={t.id} className="sc-tab" aria-current={t.id === current ? 'page' : undefined} onClick={() => onSelect && onSelect(t.id)}>{t.label}</button>
        ))}
      </nav>
    </header>
  );
}

export function ResultBadge({ result }) {
  const k = resultKind(result);
  return <span className={`sc-badge sc-badge--${k}`} aria-label={LABEL[k]}><b aria-hidden="true" />{SHORT[k]}</span>;
}

export function StatTile({ label, value, delta, tone }) {
  return (
    <div className={`sc-card sc-stat${tone ? ` sc-stat--${tone}` : ''}`}>
      <span className="sc-stat__label">{label}</span>
      <span className="sc-stat__value">{value}</span>
      {delta && <span className="sc-stat__delta">{delta}</span>}
    </div>
  );
}

/** Partido del archivo. `match` usa las claves de historico_completo_sc.json. */
export function MatchCard({ match }) {
  const k = resultKind(match['Resultado']);
  return (
    <article className={`sc-card sc-match sc-match--${k}`} aria-label={`${LABEL[k]}: ${match['Equipo Local']} ${match['Marcador']} ${match['Equipo Visita']}`}>
      <time className="sc-match__date" dateTime={match['Fecha']}>{match['Fecha']}</time>
      <div>
        <div className="sc-match__teams">{match['Equipo Local']}<span className="sc-match__score">{match['Marcador'].replace('-', '–')}</span>{match['Equipo Visita']}</div>
        <div className="sc-match__meta">{match['Torneo']}{match['Goles (Solo SC)'] && match['Goles (Solo SC)'] !== '-' ? ` · ${match['Goles (Solo SC)']}` : ''}</div>
      </div>
      <ResultBadge result={match['Resultado']} />
    </article>
  );
}

export function DistributionBar({ win, draw, loss, label = 'Distribución de resultados' }) {
  const total = win + draw + loss || 1;
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
  return (
    <figure className="sc-dist" style={{ margin: 0 }}>
      <div className="sc-dist__bar" role="img" aria-label={`${label}: ${win} victorias, ${draw} empates, ${loss} derrotas`}>
        <span className="sc-dist__seg--win" style={{ width: pct(win) }} />
        <span className="sc-dist__seg--draw" style={{ width: pct(draw) }} />
        <span className="sc-dist__seg--loss" style={{ width: pct(loss) }} />
      </div>
      <figcaption className="sc-dist__legend"><span>V {win} · {pct(win)}</span><span>E {draw}</span><span>P {loss}</span></figcaption>
    </figure>
  );
}

export function DataTable({ columns, rows, caption }) {
  return (
    <table className="sc-table">
      {caption && <caption className="sc-eyebrow" style={{ textAlign: 'left', paddingBottom: 8 }}>{caption}</caption>}
      <thead><tr>{columns.map((c) => <th key={c.key} className={c.num ? 'num' : undefined} scope="col">{c.label}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{columns.map((c) => <td key={c.key} className={c.num ? 'num' : undefined}>{r[c.key]}</td>)}</tr>)}</tbody>
    </table>
  );
}

export function Button({ variant = 'primary', ...props }) {
  return <button className={`sc-btn${variant === 'ghost' ? ' sc-btn--ghost' : ''}`} {...props} />;
}

export function Disclaimer() { return <p className="sc-disclaimer">{DISCLAIMER}</p>; }
