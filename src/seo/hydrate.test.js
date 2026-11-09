import { shouldMountSpa } from './hydrate';

describe('SPA mount on public archive HTML', () => {
  const seoRoot = { querySelector: selector => (selector === '.seo-page' ? {} : null) };
  const emptyRoot = { querySelector: () => null };

  test('homepage still hydrates the interactive archive', () => {
    expect(shouldMountSpa('/', seoRoot)).toBe(true);
    expect(shouldMountSpa('/index.html', seoRoot)).toBe(true);
  });

  test('keeps prerendered match, rival and season pages as unique HTML', () => {
    expect(shouldMountSpa('/partidos/1956-08-05-alianza-lima', seoRoot)).toBe(false);
    expect(shouldMountSpa('/rivales/alianza-lima/', seoRoot)).toBe(false);
    expect(shouldMountSpa('/temporadas/1991', seoRoot)).toBe(false);
  });

  test('hydrates unknown documents that are not prerendered archive pages', () => {
    expect(shouldMountSpa('/partidos/1956-08-05-alianza-lima', emptyRoot)).toBe(true);
    expect(shouldMountSpa('/privacidad.html', emptyRoot)).toBe(true);
  });
});
