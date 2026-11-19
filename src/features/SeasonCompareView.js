import { useEffect, useMemo } from 'react';
import StatTile from '../components/StatTile';
import aliases from '../data/scorer-aliases.json';
import palmares from '../data/palmares.json';
import { formatMatchDate } from '../domain/matches';
import { matchKey, spaSearch } from '../domain/publicRoutes';
import {
  ALL_PHASE,
  archiveCompareContext,
  compareSeasons,
  phaseSlug,
  resolvePhaseSlug,
} from '../domain/seasons';
import { usePublicCatalog } from '../components/PublicCatalog';
import { useUrlState } from '../hooks/useUrlState';

const isYear = years => value => years.includes(Number(value));

function formatSigned(value) {
  if (value == null) return '—';
  return value > 0 ? `+${value}` : String(value);
}

function BetterCell({ side, winner, children }) {
  const better = winner === side;
  return (
    <td className={`text-center ${better ? 'compare-better' : ''}`.trim()}>
      {better && <span className="sr-only">Mejor valor: </span>}
      {children}
    </td>
  );
}

function CoverageNotes({ season }) {
  if (!season.coverage.notes.length) return null;
  return (
    <ul className="compare-notes">
      {season.coverage.notes.map(note => <li key={note}>{note}</li>)}
    </ul>
  );
}

function MatchFact({ match, rivalHref, matchHref, empty }) {
  if (!match) return <p className="copy-secondary">{empty}</p>;
  const fixture = `${match.home} vs ${match.away}`;
  const rival = rivalHref
    ? <a href={rivalHref}>{match.opponent}</a>
    : match.opponent;
  const title = matchHref ? <a href={matchHref}>{fixture}</a> : fixture;
  return (
    <p>
      <time dateTime={match.date}>{formatMatchDate(match.date)}</time>
      {' · '}
      {title}
      {' · '}
      <strong>{match.scoreLabel}</strong>
      {' · '}
      {rival}
      {match.tournament ? ` · ${match.tournament}` : ''}
    </p>
  );
}

function StreakFact({ streak, empty }) {
  if (!streak?.length) return <p className="copy-secondary">{empty}</p>;
  return (
    <p>
      <strong>{streak.length}</strong>
      {` partidos · ${formatMatchDate(streak.start)} – ${formatMatchDate(streak.end)}`}
    </p>
  );
}

function ScorerList({ scorers }) {
  if (!scorers.length) {
    return <p className="copy-secondary">No hay goles de Sporting Cristal registrados en esta selección. Los autogoles cuentan en el marcador, no aquí.</p>;
  }
  return (
    <ol className="compare-scorers">
      {scorers.map(row => (
        <li key={row.name}>
          <a className="link-accent" href={spaSearch({ view: 'goleadores', jugador: row.name })} rel="nofollow">
            {row.name}
          </a>
          <span> {row.goals}{row.lowerBound ? '*' : ''}</span>
        </li>
      ))}
    </ol>
  );
}

function HonoursList({ honours, phase }) {
  if (!honours.titles.length && !honours.runnersUp.length && !honours.topScorer) {
    return <p className="copy-secondary">Sin títulos ni subcampeonatos en Palmarés para este año.</p>;
  }
  return (
    <div className="compare-honours">
      {phase ? <p className="copy-muted text-xs">Palmarés se anota por año, no por fase.</p> : null}
      {honours.titles.length > 0 && (
        <p><strong>Campeón:</strong> {honours.titles.map(item => item.name).join(' · ')}</p>
      )}
      {honours.runnersUp.length > 0 && (
        <p><strong>Subcampeón:</strong> {honours.runnersUp.map(item => item.name).join(' · ')}</p>
      )}
      {honours.topScorer && (
        <p>
          <strong>Goleador del campeonato peruano:</strong>
          {` ${honours.topScorer.player} (${honours.topScorer.goals})`}
        </p>
      )}
    </div>
  );
}

function SplitLine({ label, split }) {
  const points = split.V * 3 + split.E;
  return (
    <p>
      <strong>{label}:</strong>
      {` ${split.played} PJ · ${split.V}V ${split.E}E ${split.P}P · ${points} pts · ${split.goalsFor}-${split.goalsAgainst} (${formatSigned(split.goalsFor - split.goalsAgainst)})`}
    </p>
  );
}

function SeasonPicker({ id, label, year, phase, years, phases, onYear, onPhase }) {
  const phaseId = `${id}-phase`;
  return (
    <fieldset className="compare-picker">
      <legend>{label}</legend>
      <div>
        <label htmlFor={id} className="block text-sm font-medium mb-2">Año</label>
        <select id={id} value={year} onChange={event => onYear(event.target.value)}>
          {years.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={phaseId} className="block text-sm font-medium mb-2">Fase</label>
        <select id={phaseId} value={phase} onChange={event => onPhase(event.target.value)} disabled={phases.length === 0}>
          <option value="">Temporada completa</option>
          {phases.map(family => <option key={family} value={family}>{family}</option>)}
        </select>
        <p className="copy-muted text-xs mt-2">Solo aparecen fases con partidos en el archivo de ese año.</p>
      </div>
    </fieldset>
  );
}

function SeasonCompareView({ matches }) {
  const catalog = usePublicCatalog();
  const ctx = useMemo(() => archiveCompareContext(matches, palmares), [matches]);
  const yearOptions = ctx.years;
  const [yearAParam, setYearA] = useUrlState('a', '', { validate: isYear(yearOptions) });
  const [yearBParam, setYearB] = useUrlState('b', '', { validate: isYear(yearOptions) });
  const [phaseAParam, setPhaseA] = useUrlState('ap', '');
  const [phaseBParam, setPhaseB] = useUrlState('bp', '');

  const yearA = yearAParam || String(ctx.defaults.a || '');
  const yearB = yearBParam || String(ctx.defaults.b === Number(yearA) ? (yearOptions.find(year => year !== Number(yearA)) || ctx.defaults.b) : ctx.defaults.b || '');
  const phasesA = ctx.slots.find(slot => slot.year === Number(yearA))?.phases || [];
  const phasesB = ctx.slots.find(slot => slot.year === Number(yearB))?.phases || [];
  const phaseA = resolvePhaseSlug(matches, Number(yearA), phaseAParam);
  const phaseB = resolvePhaseSlug(matches, Number(yearB), phaseBParam);

  useEffect(() => {
    if (yearAParam || yearBParam || !ctx.defaults.a || !ctx.defaults.b) return;
    setYearA(String(ctx.defaults.a), { b: { value: String(ctx.defaults.b), defaultValue: '' } });
  }, [ctx.defaults.a, ctx.defaults.b, setYearA, yearAParam, yearBParam]);

  const compared = useMemo(
    () => compareSeasons(
      matches,
      aliases,
      palmares,
      { year: Number(yearA), phase: phaseA || ALL_PHASE },
      { year: Number(yearB), phase: phaseB || ALL_PHASE },
      { latestYear: ctx.latestYear, latestMatchDate: ctx.latestMatchDate },
    ),
    [matches, yearA, yearB, phaseA, phaseB, ctx.latestYear, ctx.latestMatchDate],
  );

  const changeYearA = next => {
    const nextPhases = ctx.slots.find(slot => slot.year === Number(next))?.phases || [];
    const keep = nextPhases.includes(phaseA) ? phaseSlug(phaseA) : '';
    setYearA(next, { ap: { value: keep, defaultValue: '' } });
  };
  const changeYearB = next => {
    const nextPhases = ctx.slots.find(slot => slot.year === Number(next))?.phases || [];
    const keep = nextPhases.includes(phaseB) ? phaseSlug(phaseB) : '';
    setYearB(next, { bp: { value: keep, defaultValue: '' } });
  };
  const swap = () => {
    setYearA(yearB, {
      b: { value: yearA, defaultValue: '' },
      ap: { value: phaseB ? phaseSlug(phaseB) : '', defaultValue: '' },
      bp: { value: phaseA ? phaseSlug(phaseA) : '', defaultValue: '' },
    });
  };

  const matchHref = match => (match ? catalog.matchPathByKey.get(matchKey(match)) : null);
  const rivalHref = match => (match ? catalog.rivalPathByName.get(match.opponent) : null);
  const display = row => {
    if (row.id === 'goalDiff' || row.id === 'biggestWin' || row.id === 'biggestLoss') {
      return { left: formatSigned(row.left), right: formatSigned(row.right) };
    }
    return {
      left: row.displayLeft ?? (row.left == null ? '—' : row.left),
      right: row.displayRight ?? (row.right == null ? '—' : row.right),
    };
  };

  const palmaresGapText = ctx.palmaresGaps.map(row => (
    `${row.year} (${row.kind === 'title' ? 'título' : 'subcampeón'}: ${row.competition})`
  )).join(' · ');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <div>
          <h2 className="section-title">Comparar temporadas</h2>
          <p className="section-subtitle">
            Dos temporadas del archivo, lado a lado. Los puntos se calculan con 3 por victoria y 1 por empate.
            Elige también una fase (Apertura, Clausura, copa) cuando el año la tiene.
          </p>
        </div>
        <p className="seo-spa-link"><a href="/temporadas/comparar">Ficha pública del comparador</a></p>
      </div>

      <section className="archive-section" aria-label="Huecos del archivo">
        <h3 className="collection-title">El archivo tiene huecos</h3>
        <p>
          No se ocultan temporadas incompletas. Faltan {ctx.missingYears.length} años entre {yearOptions.at(-1)} y {yearOptions[0]}:
          {' '}{ctx.missingYears.join(', ')}.
        </p>
        {palmaresGapText ? (
          <p className="mt-2">
            Palmarés registra honores en años sin partidos en el archivo: {palmaresGapText}.
          </p>
        ) : null}
      </section>

      <div className="compare-toolbar">
        <SeasonPicker
          id="compare-a"
          label="Temporada A"
          year={yearA}
          phase={phaseA}
          years={yearOptions}
          phases={phasesA}
          onYear={changeYearA}
          onPhase={value => setPhaseA(value ? phaseSlug(value) : '')}
        />
        <div className="compare-toolbar__swap">
          <button type="button" className="btn btn-ghost" onClick={swap}>Intercambiar</button>
        </div>
        <SeasonPicker
          id="compare-b"
          label="Temporada B"
          year={yearB}
          phase={phaseB}
          years={yearOptions}
          phases={phasesB}
          onYear={changeYearB}
          onPhase={value => setPhaseB(value ? phaseSlug(value) : '')}
        />
      </div>

      {compared.sameSelection && (
        <p className="archive-section" role="status">Elige dos temporadas o fases distintas para comparar.</p>
      )}

      <div className="compare-heads">
        {[compared.left, compared.right].map(season => (
          <section className="archive-section" key={`head-${season.label}`}>
            <h3 className="balance-title">{season.label}</h3>
            <p className="seo-spa-link"><a href={season.path}>Ver temporada {season.year}</a></p>
            <div className="stat-strip stat-strip--4">
              <StatTile label="Partidos" value={season.summary.played} tone="celeste" />
              <StatTile label="V-E-P" value={`${season.summary.V}-${season.summary.E}-${season.summary.P}`} />
              <StatTile label="Puntos" value={season.summary.points} detail="3 por victoria" tone="win" />
              <StatTile label="Goles" value={`${season.summary.goalsFor}-${season.summary.goalsAgainst}`} detail={formatSigned(season.summary.goalDiff)} tone="celeste" />
            </div>
            <CoverageNotes season={season} />
          </section>
        ))}
      </div>

      <section className="archive-section">
        <h3 className="collection-title">Lado a lado</h3>
        <p className="copy-muted text-xs mb-3">El valor más favorable de cada fila se marca en verde. Empates y cantidad de partidos no se declaran mejores.</p>
        <div className="data-table-shell"><div className="overflow-x-auto">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">Métrica</th>
                <th scope="col">{compared.left.label}</th>
                <th scope="col">{compared.right.label}</th>
              </tr>
            </thead>
            <tbody>
              {compared.rows.map(row => {
                const values = display(row);
                return (
                  <tr key={row.id}>
                    <th scope="row">{row.label}</th>
                    <BetterCell side="left" winner={row.winner}>{values.left}</BetterCell>
                    <BetterCell side="right" winner={row.winner}>{values.right}</BetterCell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div></div>
      </section>

      <div className="compare-grid">
        <section className="archive-section">
          <h3 className="collection-title">Local y visita · {compared.left.label}</h3>
          <SplitLine label="Local" split={compared.left.home} />
          <SplitLine label="Visita" split={compared.left.away} />
        </section>
        <section className="archive-section">
          <h3 className="collection-title">Local y visita · {compared.right.label}</h3>
          <SplitLine label="Local" split={compared.right.home} />
          <SplitLine label="Visita" split={compared.right.away} />
        </section>
        <section className="archive-section">
          <h3 className="collection-title">Goleadores · {compared.left.label}</h3>
          <ScorerList scorers={compared.left.scorers} />
        </section>
        <section className="archive-section">
          <h3 className="collection-title">Goleadores · {compared.right.label}</h3>
          <ScorerList scorers={compared.right.scorers} />
        </section>
        <section className="archive-section">
          <h3 className="collection-title">Récords · {compared.left.label}</h3>
          <p className="stat-label">Mayor victoria</p>
          <MatchFact match={compared.left.biggestWin} matchHref={matchHref(compared.left.biggestWin)} rivalHref={rivalHref(compared.left.biggestWin)} empty="Sin victoria registrada." />
          <p className="stat-label mt-3">Peor derrota</p>
          <MatchFact match={compared.left.biggestLoss} matchHref={matchHref(compared.left.biggestLoss)} rivalHref={rivalHref(compared.left.biggestLoss)} empty="Sin derrota registrada." />
          <p className="stat-label mt-3">Racha de victorias</p>
          <StreakFact streak={compared.left.winningStreak} empty="Sin racha de victorias." />
          <p className="stat-label mt-3">Racha invicta</p>
          <StreakFact streak={compared.left.unbeatenStreak} empty="Sin racha invicta." />
        </section>
        <section className="archive-section">
          <h3 className="collection-title">Récords · {compared.right.label}</h3>
          <p className="stat-label">Mayor victoria</p>
          <MatchFact match={compared.right.biggestWin} matchHref={matchHref(compared.right.biggestWin)} rivalHref={rivalHref(compared.right.biggestWin)} empty="Sin victoria registrada." />
          <p className="stat-label mt-3">Peor derrota</p>
          <MatchFact match={compared.right.biggestLoss} matchHref={matchHref(compared.right.biggestLoss)} rivalHref={rivalHref(compared.right.biggestLoss)} empty="Sin derrota registrada." />
          <p className="stat-label mt-3">Racha de victorias</p>
          <StreakFact streak={compared.right.winningStreak} empty="Sin racha de victorias." />
          <p className="stat-label mt-3">Racha invicta</p>
          <StreakFact streak={compared.right.unbeatenStreak} empty="Sin racha invicta." />
        </section>
        <section className="archive-section">
          <h3 className="collection-title">Palmarés · {compared.left.year}</h3>
          <HonoursList honours={compared.left.honours} phase={compared.left.phase} />
        </section>
        <section className="archive-section">
          <h3 className="collection-title">Palmarés · {compared.right.year}</h3>
          <HonoursList honours={compared.right.honours} phase={compared.right.phase} />
        </section>
      </div>
    </div>
  );
}

export default SeasonCompareView;
