import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PublicCatalogProvider } from './PublicCatalog';
import { RandomMatchLaunch, RandomMatchPanel } from './RandomMatch';

const matches = [
  {
    date: '1991-03-03', year: 1991, home: 'Sporting Cristal', away: 'Alianza Lima', opponent: 'Alianza Lima',
    scoreLabel: '2-0', resultCode: 'V', tournament: 'Descentralizado', isHome: true, month: 'Marzo',
  },
  {
    date: '1994-07-07', year: 1994, home: 'Universitario', away: 'Sporting Cristal', opponent: 'Universitario',
    scoreLabel: '1-1', resultCode: 'E', tournament: 'Descentralizado', isHome: false, month: 'Julio',
  },
  {
    date: '2018-04-04', year: 2018, home: 'Sporting Cristal', away: 'Melgar', opponent: 'Melgar',
    scoreLabel: '3-1', resultCode: 'V', tournament: 'Apertura', isHome: true, month: 'Abril',
  },
];

function renderPanel({ rng, navigate, variant = 'panel' } = {}) {
  const view = variant === 'launch'
    ? <RandomMatchLaunch matches={matches} rng={rng} navigate={navigate} />
    : <RandomMatchPanel matches={matches} rng={rng} navigate={navigate} />;
  return render(<PublicCatalogProvider matches={matches}>{view}</PublicCatalogProvider>);
}

describe('random match UI', () => {
  test('home panel opens a filtered catalog path with an injectable RNG', () => {
    const navigate = vi.fn();
    renderPanel({ rng: () => 0, navigate });

    fireEvent.click(screen.getByLabelText('Solo victorias'));
    fireEvent.click(screen.getByLabelText('Solo clásicos (Alianza o Universitario)'));
    fireEvent.change(screen.getByLabelText('Década'), { target: { value: '1990' } });
    fireEvent.click(screen.getByRole('button', { name: 'Partido al azar' }));

    expect(navigate).toHaveBeenCalledWith('/partidos/1991-03-03-alianza-lima');
  });

  test('shows an empty-pool message instead of navigating', () => {
    const navigate = vi.fn();
    renderPanel({ rng: () => 0, navigate });

    fireEvent.click(screen.getByLabelText('Solo clásicos (Alianza o Universitario)'));
    fireEvent.change(screen.getByLabelText('Década'), { target: { value: '2010' } });
    fireEvent.click(screen.getByRole('button', { name: 'Partido al azar' }));

    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('No hay partidos con esos filtros.');
  });

  test('header launch ignores filters and still lands on a match page', () => {
    const navigate = vi.fn();
    renderPanel({ rng: () => 0.999, navigate, variant: 'launch' });
    fireEvent.click(screen.getByRole('button', { name: 'Partido al azar' }));
    expect(navigate).toHaveBeenCalledWith('/partidos/2018-04-04-melgar');
  });
});
