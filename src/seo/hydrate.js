import { canonicalPath } from '../domain/publicRoutes';

export function shouldMountSpa(pathname, rootEl) {
  if (canonicalPath(pathname) === '/') return true;
  return !rootEl?.querySelector('.seo-page');
}
