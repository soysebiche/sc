import fixturesData from '../data/upcoming-fixtures.json';
import { trackCalendarSubscribe } from '../services/analytics';

const DATE_FORMAT = new Intl.DateTimeFormat('es-PE', {
  timeZone: fixturesData.calendar.timeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const TIME_FORMAT = new Intl.DateTimeFormat('es-PE', {
  timeZone: fixturesData.calendar.timeZone,
  hour: 'numeric',
  minute: '2-digit',
});

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2v4M18 2v4M3 9h18" />
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="m9 15 2 2 4-5" />
    </svg>
  );
}

export function CalendarSubscribeLink({ compact = false }) {
  return (
    <a
      className={`calendar-subscribe${compact ? ' calendar-subscribe--compact' : ''}`}
      href={fixturesData.calendar.subscriptionUrl}
      onClick={() => trackCalendarSubscribe('webcal')}
      aria-label="Suscribirme al calendario de partidos de Sporting Cristal"
    >
      <CalendarIcon />
      <span>{compact ? 'Suscribirme' : 'Suscribirme al calendario'}</span>
    </a>
  );
}

function UpcomingMatches() {
  return (
    <section className="upcoming" aria-labelledby="upcoming-title">
      <div className="upcoming__heading">
        <div>
          <p className="upcoming__eyebrow">Programación oficial</p>
          <h2 id="upcoming-title" className="section-title">Próximos encuentros</h2>
          <p className="section-subtitle">Solo partidos con día y hora confirmados.</p>
        </div>
        <div className="upcoming__subscription">
          <CalendarSubscribeLink />
          <span>Se actualiza sin acceder a tu cuenta.</span>
        </div>
      </div>

      <ol className="upcoming__list">
        {fixturesData.fixtures.map((fixture, index) => (
          <li className="upcoming-match" key={fixture.id}>
            <div className="upcoming-match__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
            <time className="upcoming-match__when" dateTime={fixture.start}>
              <strong>{DATE_FORMAT.format(new Date(fixture.start)).replace('.', '')}</strong>
              <span>{TIME_FORMAT.format(new Date(fixture.start))}</span>
            </time>
            <div className="upcoming-match__fixture">
              <strong>{fixture.homeTeam} <span>vs.</span> {fixture.awayTeam}</strong>
              <span>{fixture.venue}</span>
            </div>
            <div className="upcoming-match__competition">
              <strong>{fixture.round}</strong>
              <span>{fixture.competition}</span>
            </div>
          </li>
        ))}
      </ol>

      <p className="upcoming__source">
        Verificado el 4 de agosto de 2026 en{' '}
        <a href={fixturesData.calendar.sourceUrl} target="_blank" rel="noreferrer">Liga 1</a>.
        La programación puede cambiar.
      </p>
    </section>
  );
}

export default UpcomingMatches;
