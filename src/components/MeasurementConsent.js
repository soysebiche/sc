const STORAGE_KEY = 'sc-measurement-consent';

function MeasurementConsent({ choice, onChange }) {
  const choose = value => {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
    onChange(value);
  };

  if (choice) {
    return (
      <button type="button" className="performance-preference" onClick={() => choose(null)}>
        Medición anónima: {choice === 'accepted' ? 'activa' : 'inactiva'} · cambiar
      </button>
    );
  }

  return (
    <section className="performance-consent" aria-labelledby="measurement-consent-title">
      <div>
        <h2 id="measurement-consent-title">Ayúdanos a mejorar Sebiche Celeste</h2>
        <p>Con tu permiso medimos rendimiento y uso anónimo. Nunca enviamos nombres, correos, texto escrito ni valores de búsqueda.</p>
      </div>
      <div className="performance-consent__actions">
        <button type="button" className="btn btn-ghost" onClick={() => choose('declined')}>Solo lo necesario</button>
        <button type="button" className="btn btn-primary" onClick={() => choose('accepted')}>Permitir medición</button>
      </div>
    </section>
  );
}

export { STORAGE_KEY };
export default MeasurementConsent;
