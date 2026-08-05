export const METRIC_NAMES = new Set(['CLS', 'INP', 'LCP']);
export const METRIC_RATINGS = new Set(['good', 'needs-improvement', 'poor']);

export function normalizeMetric(body) {
  if (!body || !METRIC_NAMES.has(body.name) || !Number.isFinite(body.value) || body.value < 0) return null;
  if (!METRIC_RATINGS.has(body.rating)) return null;

  return {
    name: body.name,
    value: Number(body.value.toFixed(4)),
    rating: body.rating,
    delta: Number.isFinite(body.delta) ? Number(body.delta.toFixed(4)) : null,
    navigationType: String(body.navigationType || 'unknown').slice(0, 40),
    route: String(body.route || '/').slice(0, 120),
    view: String(body.view || 'efemerides').slice(0, 40),
    revision: String(body.revision || 'unknown').slice(0, 40),
  };
}
