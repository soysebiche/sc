import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  expect(await screen.findByText(/1,936|1936 Partidos/i)).toBeInTheDocument();
  expect(await screen.findByLabelText('Fecha para consultar')).toHaveAttribute('type', 'date');
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
  expect(screen.getByText(/Historial de encuentros \(/i)).not.toHaveTextContent('(0 partidos)');
});

test('persists the selected theme', async () => {
  render(<App />);
  await screen.findByText(/1936 Partidos/i);
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo noche' }));

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(window.localStorage.getItem('sc-theme')).toBe('dark');
});
