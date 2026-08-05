import { useEffect, useState } from 'react';
import { startWebVitals } from '../observability/webVitals';

const STORAGE_KEY = 'sc-performance-consent';

function PerformanceConsent() {
  const [choice, setChoice] = useState(() => localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (choice === 'accepted') startWebVitals();
  }, [choice]);

  const choose = value => {
    localStorage.setItem(STORAGE_KEY, value);
    setChoice(value);
  };

  if (choice) {
    return (
      <button type="button" className="performance-preference" onClick={() => setChoice(null)}>
        Medición de rendimiento: {choice === 'accepted' ? 'activa' : 'inactiva'}
      </button>
    );
  }

  return (
    <section className="performance-consent" aria-labelledby="performance-consent-title">
      <div>
        <h2 id="performance-consent-title">Ayúdanos a medir el rendimiento</h2>
        <p>Podemos enviar LCP, INP, CLS, vista y versión. No enviamos nombre, correo ni el contenido de tus consultas.</p>
      </div>
      <div className="performance-consent__actions">
        <button type="button" className="btn btn-ghost" onClick={() => choose('declined')}>No enviar</button>
        <button type="button" className="btn btn-primary" onClick={() => choose('accepted')}>Permitir métricas</button>
      </div>
    </section>
  );
}

export default PerformanceConsent;
