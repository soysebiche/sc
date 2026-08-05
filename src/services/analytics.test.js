import {
  analyticsStatus,
  disableAnalytics,
  enableAnalytics,
  trackPageView,
  trackUrlControl,
} from './analytics';
import { vi } from 'vitest';

beforeEach(() => {
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
  window.dataLayer = [];
  document.getElementById('sc-ga4-script')?.remove();
  disableAnalytics();
});

test('remains inert when no valid GA4 measurement ID is configured', () => {
  expect(enableAnalytics()).toBe(false);
  trackPageView('efemerides');
  trackUrlControl('rival', true);

  expect(analyticsStatus()).toMatchObject({ enabled: true, initialized: false, configured: false });
  expect(window.dataLayer).toEqual([]);
  expect(document.getElementById('sc-ga4-script')).not.toBeInTheDocument();
});

test('never treats arbitrary URL keys as analytics parameters', () => {
  enableAnalytics();
  trackUrlControl('email', true);
  trackUrlControl('token', true);
  expect(window.dataLayer).toEqual([]);
});

test('queues only sanitized page and allowlisted filter data when configured', () => {
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-6H6LMJ1E37');
  expect(enableAnalytics()).toBe(true);

  window.history.replaceState({}, '', '/?rival=Texto%20privado');
  trackPageView('rivales');
  trackUrlControl('rival', true);
  trackUrlControl('token', true);

  const serialized = JSON.stringify(window.dataLayer);
  expect(serialized).toContain('archive_filter');
  expect(serialized).toContain('page_location');
  expect(serialized).not.toContain('Texto%20privado');
  expect(serialized).not.toContain('token');
});

afterEach(() => vi.unstubAllEnvs());
