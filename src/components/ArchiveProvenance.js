import { formatMatchDate } from '../domain/matches';

function ArchiveProvenance({ metadata }) {
  return (
    <section className="provenance" aria-labelledby="provenance-title">
      <div className="provenance__summary">
        <div>
          <p className="provenance__eyebrow">Procedencia del archivo</p>
          <h2 id="provenance-title">{metadata.recordCount.toLocaleString('es-PE')} partidos · {formatMatchDate(metadata.firstMatchDate, { year: 'numeric' })}–{formatMatchDate(metadata.latestMatchDate, { year: 'numeric' })}</h2>
        </div>
        <p>Actualizado el <time dateTime={metadata.lastUpdated}>{formatMatchDate(metadata.lastUpdated, { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
      </div>

      <details className="provenance__details">
        <summary>Fuentes, método y límites</summary>
        <div className="provenance__grid">
          <div>
            <h3>Fuentes</h3>
            <ul>
              {metadata.sources.map(source => (
                <li key={source.name}>
                  {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.name}</a> : <strong>{source.name}</strong>}
                  <span>{source.scope}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Método</h3>
            <ul>{metadata.methodology.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>Límites conocidos</h3>
            <ul>{metadata.limitations.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
        <a className="provenance__correction" href={metadata.correctionsUrl} target="_blank" rel="noreferrer">Reportar una corrección de datos</a>
      </details>
    </section>
  );
}

export default ArchiveProvenance;
