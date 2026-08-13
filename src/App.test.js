import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  window.localStorage.clear();
});

test('renders the historical archive with a named date control', async () => {
  render(<App />);

  expect(screen.getByRole('heading', {
    level: 1,
    name: /Sebiche Celeste — Archivo Histórico de Sporting Cristal/i,
  })).toBeInTheDocument();
  expect(await screen.findByText(/Archivo Histórico · 1937 Partidos/i)).toBeInTheDocument();
  expect(await screen.findByLabelText('Fecha para consultar')).toHaveAttribute('type', 'date');
  expect(screen.getByRole('heading', { name: 'Próximos encuentros' })).toBeInTheDocument();
  expect(screen.getAllByText(/Universitario/).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: 'Suscribirme al calendario de partidos de Sporting Cristal' })).toHaveLength(2);
});

test('requires explicit consent before enabling anonymous measurement', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: 'Próximos encuentros' });

  expect(screen.getByRole('heading', { name: 'Ayúdanos a mejorar Sebiche Celeste' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Solo lo necesario' }));

  expect(window.localStorage.getItem('sc-measurement-consent')).toBe('declined');
  expect(screen.getByRole('button', { name: /Medición anónima: inactiva/ })).toBeInTheDocument();
});

test('keeps annual table, summary and sort direction consistent', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'AÑO' }));

  await waitFor(() => {
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByRole('button', { name: 'Mostrar resumen de 2026' })).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: /Ordenar por AÑO, orden descendente/i }));

  await waitFor(() => {
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByRole('button', { name: 'Mostrar resumen de 1956' })).toBeInTheDocument();
  });
});

test('restores a shareable rival view from the URL', async () => {
  window.history.replaceState({}, '', '/?view=rivales&rival=Alianza%20Lima');
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'HISTORIAL VS RIVALES' })).toBeInTheDocument();
  expect(screen.getByLabelText('Buscar rival')).toHaveValue('Alianza Lima');
  expect(screen.getByText(/Balance vs Alianza Lima/i)).toBeInTheDocument();
});

test('normalizes rival aliases from a shared URL', async () => {
  window.history.replaceState({}, '', '/?view=rivales&rival=Union%20Comercio');
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'HISTORIAL VS RIVALES' })).toBeInTheDocument();
  expect(screen.getByLabelText('Buscar rival')).toHaveValue('Unión Comercio');
  expect(screen.getByText(/Balance vs Unión Comercio/i)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/Mostrando 1–18 de 32 partidos/i);
});

test('paginates long rival histories and persists the page in the URL', async () => {
  window.history.replaceState({}, '', '/?view=rivales&rival=Alianza%20Lima');
  render(<App />);

  expect(await screen.findByText(/Mostrando 1–18 de 140 partidos/i)).toBeInTheDocument();
  expect(screen.getAllByRole('article')).toHaveLength(18);
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(screen.getByRole('status')).toHaveTextContent(/Mostrando 19–36 de 140 partidos/i);
  expect(window.location.search).toContain('rivalPage=2');
});

test('paginates country histories independently', async () => {
  window.history.replaceState({}, '', '/?view=paises&country=Argentina');
  render(<App />);

  expect(await screen.findByText(/Mostrando 1–18 de 60 partidos/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(window.location.search).toContain('countryPage=2');
});

test('persists the selected theme', async () => {
  render(<App />);
  await screen.findByText(/1937 Partidos/i);
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo noche' }));

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(window.localStorage.getItem('sc-theme')).toBe('dark');
});

test('restores the active view from a popstate change', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: 'Próximos encuentros' });
  fireEvent.click(screen.getByRole('button', { name: 'RIVALES' }));
  expect(await screen.findByRole('heading', { name: 'HISTORIAL VS RIVALES' })).toBeInTheDocument();

  window.history.replaceState({}, '', '/');
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(await screen.findByRole('heading', { name: 'Próximos encuentros' })).toBeInTheDocument();
});
