const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,16}$/i;
const SCRIPT_ID = 'sc-ga4-script';

const PAGE_TITLES = {
  efemerides: 'Efemérides',
  dashboard: 'Dashboard histórico',
  partidos: 'Archivo de partidos',
  'analisis-anual': 'Análisis anual',
  rivales: 'Historial por rival',
  paises: 'Historial por país',
};

const FILTER_KEYS = new Set([
  'date', 'year', 'month', 'tournament', 'decade',
  'rival', 'rivalYear', 'country', 'countryYear',
]);

const PAGINATION_KEYS = new Set(['page', 'rivalPage', 'countryPage']);

let analyticsEnabled = false;
let analyticsInitialized = false;

const measurementId = () => String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const hasValidMeasurementId = () => MEASUREMENT_ID_PATTERN.test(measurementId());

function gtag() {
  window.dataLayer = window.dataLayer || [];
  // gtag.js distinguishes command arguments from ordinary nested arrays.
  window.dataLayer.push(arguments);
}

const cleanLocation = () => `${window.location.origin}${window.location.pathname}`;

const removeAnalyticsCookies = () => {
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_')) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
    }
  });
};

export function enableAnalytics() {
  analyticsEnabled = true;
  if (!hasValidMeasurementId() || typeof document === 'undefined') return false;

  if (analyticsInitialized) {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    return true;
  }

  const gaId = measurementId();
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });
  gtag('consent', 'update', { analytics_storage: 'granted' });
  gtag('js', new Date());
  gtag('config', gaId, {
    send_page_view: false,
    page_location: cleanLocation(),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Lax;Secure',
  });

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  script.referrerPolicy = 'strict-origin-when-cross-origin';
  document.head.appendChild(script);
  analyticsInitialized = true;
  return true;
}

export function disableAnalytics() {
  analyticsEnabled = false;
  if (analyticsInitialized) gtag('consent', 'update', { analytics_storage: 'denied' });
  removeAnalyticsCookies();
}

export function trackPageView(view) {
  if (!analyticsEnabled || !analyticsInitialized || !PAGE_TITLES[view]) return;
  gtag('event', 'page_view', {
    page_title: `Sebiche Celeste — ${PAGE_TITLES[view]}`,
    page_location: cleanLocation(),
    page_path: `/${view}`,
  });
}

export function trackUrlControl(key, isActive) {
  if (!analyticsEnabled || !analyticsInitialized) return;
  if (FILTER_KEYS.has(key)) {
    gtag('event', 'archive_filter', { filter_name: key, is_active: Boolean(isActive) });
  } else if (PAGINATION_KEYS.has(key)) {
    gtag('event', 'archive_pagination', { collection: key });
  }
}

export function trackCalendarSubscribe(client) {
  if (!analyticsEnabled || !analyticsInitialized) return;
  const safeClient = client === 'webcal' ? 'webcal' : 'unknown';
  gtag('event', 'calendar_subscribe', { calendar_client: safeClient });
}

export function trackThemeChange(theme) {
  if (!analyticsEnabled || !analyticsInitialized) return;
  gtag('event', 'theme_change', { theme: theme === 'dark' ? 'dark' : 'light' });
}

export function trackDataLoadError() {
  if (!analyticsEnabled || !analyticsInitialized) return;
  gtag('event', 'archive_load_error', { error_code: 'archive_unavailable' });
}

export const analyticsStatus = () => ({
  enabled: analyticsEnabled,
  initialized: analyticsInitialized,
  configured: hasValidMeasurementId(),
});
