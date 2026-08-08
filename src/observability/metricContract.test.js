import { normalizeMetric } from './metricContract';

test('accepts only bounded Core Web Vitals payloads', () => {
  expect(normalizeMetric({ name: 'LCP', value: 2345.67891, rating: 'good', route: '/', view: 'partidos' })).toMatchObject({
    name: 'LCP',
    value: 2345.6789,
    rating: 'good',
    route: '/',
    view: 'partidos',
  });
  expect(normalizeMetric({ name: 'EMAIL', value: 1, rating: 'good' })).toBeNull();
  expect(normalizeMetric({ name: 'CLS', value: -1, rating: 'poor' })).toBeNull();
});
