import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PrimaryNav from './PrimaryNav';

const TABS = [
  { id: 'efemerides', label: 'EFEMÉRIDES' },
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'paises', label: 'PAÍSES' },
];

test('scrolls the active section tab into view without moving the page', () => {
  const scrollTo = vi.fn();
  const { rerender } = render(<PrimaryNav tabs={TABS} activeTab="efemerides" onSelect={() => {}} />);
  const nav = screen.getByRole('navigation', { name: 'Secciones principales' });

  Object.defineProperty(nav, 'scrollLeft', { configurable: true, writable: true, value: 0 });
  nav.scrollTo = scrollTo;
  vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
    left: 0, width: 200, right: 200, top: 0, bottom: 44, height: 44,
  });

  const paises = screen.getByRole('button', { name: 'PAÍSES' });
  vi.spyOn(paises, 'getBoundingClientRect').mockReturnValue({
    left: 280, width: 80, right: 360, top: 0, bottom: 44, height: 44,
  });

  rerender(<PrimaryNav tabs={TABS} activeTab="paises" onSelect={() => {}} />);

  expect(scrollTo).toHaveBeenCalledWith({ left: 220, behavior: 'smooth' });
});
