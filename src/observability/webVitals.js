const ENDPOINT = '/api/vitals';
let started = false;
let consentGranted = false;

const sendMetric = metric => {
  if (!consentGranted) return;
  const payload = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    route: window.location.pathname,
    view: new URLSearchParams(window.location.search).get('view') || 'efemerides',
    revision: document.documentElement.dataset.revision || 'unknown',
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
    return;
  }

  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => {});
};

export function setWebVitalsConsent(granted) {
  consentGranted = Boolean(granted);
}

export async function startWebVitals() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const { onCLS, onINP, onLCP } = await import('web-vitals');
  onCLS(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
}
