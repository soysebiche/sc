// Dependency-free share URL helpers (safe for the eager SPA bundle).
export const SITE_URL = 'https://celeste.sebiche.com';
export const SHARE_TYPES = Object.freeze(['result', 'efemeride', 'h2h', 'scorer']);

export const qs = obj => new URLSearchParams(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();

// Today's date in Lima as YYYY-MM-DD.
export const limaToday = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(now);

export function shareParams(type, { rival, name, date } = {}) {
  if (type === 'h2h') return { type, rival };
  if (type === 'scorer') return { type, name };
  if (type === 'efemeride') return { type, date };
  return { type: 'result' };
}
export const shareUrl = (params, base = SITE_URL) => `${base}/api/share?${qs(params)}`;
export const ogImageUrl = (params, base = SITE_URL) => `${base}/api/og?${qs(params)}`;
export const xIntentUrl = (text, url) => `https://x.com/intent/post?${qs({ text, url })}`;

