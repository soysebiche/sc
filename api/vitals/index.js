import { normalizeMetric } from '../../src/observability/metricContract.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const metric = normalizeMetric(req.body);
  if (!metric) return res.status(400).json({ error: 'Invalid metric payload' });

  console.log('RUM_METRIC', JSON.stringify(metric));
  return res.status(202).json({ accepted: true });
}
