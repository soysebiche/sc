import { act, fireEvent, render, screen } from '@testing-library/react';
import { UrlStateProvider, useUrlState } from './useUrlState';

function Probe() {
  const [view, setView] = useUrlState('view', 'efemerides', { history: 'push' });
  const [year, setYear] = useUrlState('year', '');
  const [page] = useUrlState('page', '1');

  return (
    <div>
      <span data-testid="view">{view}</span>
      <span data-testid="year">{year}</span>
      <span data-testid="page">{page}</span>
      <button type="button" onClick={() => setView('rivales')}>open-rivales</button>
      <button type="button" onClick={() => setYear('')}>clear-year</button>
      <button type="button" onClick={() => setYear('2024', { page: { value: '1', defaultValue: '1' } })}>year-and-page</button>
    </div>
  );
}

function renderStore() {
  return render(
    <UrlStateProvider>
      <Probe />
    </UrlStateProvider>
  );
}

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

test('hydrates shareable params from the current URL', () => {
  window.history.replaceState({}, '', '/?view=rivales&rival=Alianza%20Lima');
  function RivalProbe() {
    const [view] = useUrlState('view', 'efemerides');
    const [rival] = useUrlState('rival', '');
    return <span>{view}:{rival}</span>;
  }
  render(<UrlStateProvider><RivalProbe /></UrlStateProvider>);
  expect(screen.getByText('rivales:Alianza Lima')).toBeInTheDocument();
});

test('omits a param when it returns to its default', () => {
  window.history.replaceState({}, '', '/?year=2024');
  renderStore();
  fireEvent.click(screen.getByRole('button', { name: 'clear-year' }));
  expect(window.location.search).toBe('');
  expect(screen.getByTestId('year')).toHaveTextContent('');
});

test('uses pushState only for history: push keys', () => {
  const push = vi.spyOn(window.history, 'pushState');
  const replace = vi.spyOn(window.history, 'replaceState');
  renderStore();
  fireEvent.click(screen.getByRole('button', { name: 'open-rivales' }));
  expect(push).toHaveBeenCalled();
  expect(screen.getByTestId('view')).toHaveTextContent('rivales');
  const replaceCallsBefore = replace.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'year-and-page' }));
  expect(replace.mock.calls.length).toBeGreaterThan(replaceCallsBefore);
  push.mockRestore();
  replace.mockRestore();
});

test('writes year and page in one history update', () => {
  window.history.replaceState({}, '', '/?page=3');
  const replace = vi.spyOn(window.history, 'replaceState');
  renderStore();
  replace.mockClear();
  fireEvent.click(screen.getByRole('button', { name: 'year-and-page' }));
  expect(replace).toHaveBeenCalledTimes(1);
  expect(window.location.search).toBe('?year=2024');
  expect(screen.getByTestId('year')).toHaveTextContent('2024');
  expect(screen.getByTestId('page')).toHaveTextContent('1');
  replace.mockRestore();
});

test('one popstate updates every subscribed key', () => {
  renderStore();
  fireEvent.click(screen.getByRole('button', { name: 'open-rivales' }));
  fireEvent.click(screen.getByRole('button', { name: 'year-and-page' }));
  window.history.replaceState({}, '', '/?view=paises&year=1956');
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(screen.getByTestId('view')).toHaveTextContent('paises');
  expect(screen.getByTestId('year')).toHaveTextContent('1956');
  expect(screen.getByTestId('page')).toHaveTextContent('1');
});
