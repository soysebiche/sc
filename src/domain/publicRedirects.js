// Duplicate public URL variants → one canonical path. Used by Edge middleware and the SEO verifier.

const FILE_EXT = /\.[a-z0-9]+$/i;
const SKIP_HEAD = new Set(['api', 'assets', 'fonts', 'icons', 'og']);
const ARCHIVE_HEAD = new Set(['partidos', 'rivales', 'paises', 'temporadas']);
const LOCALE_HEAD = new Set(['en', 'es']);
const ALIAS_HEAD = new Map([
  ['matches', 'partidos'],
  ['match', 'partidos'],
  ['partido', 'partidos'],
  ['games', 'partidos'],
  ['game', 'partidos'],
  ['rivals', 'rivales'],
  ['rival', 'rivales'],
  ['seasons', 'temporadas'],
  ['season', 'temporadas'],
  ['temporada', 'temporadas'],
  ['years', 'temporadas'],
  ['year', 'temporadas'],
  ['countries', 'paises'],
  ['country', 'paises'],
  ['pais', 'paises'],
]);

function stripIndexAndSlash(pathname) {
  let path = String(pathname || '/').split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+$/, '');
  if (!path || path === '/index.html') return '/';
  if (path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length);
  return path || '/';
}

function isSkippedFile(pathname) {
  const last = pathname.split('/').filter(Boolean).pop() || '';
  return FILE_EXT.test(last) && last !== 'index.html';
}

export function isArchivePath(pathname) {
  const path = stripIndexAndSlash(pathname);
  if (path === '/') return false;
  return ARCHIVE_HEAD.has(path.split('/').filter(Boolean)[0]);
}

export function normalizePublicPath(pathname) {
  const original = String(pathname || '/').split('?')[0].split('#')[0] || '/';
  if (isSkippedFile(original)) return stripIndexAndSlash(original);

  let segs = original.split('/').filter(Boolean);
  if (segs[0] && SKIP_HEAD.has(segs[0].toLowerCase())) return stripIndexAndSlash(original);

  if (segs[0] && segs[0].toLowerCase() === 'celeste') segs = segs.slice(1);
  if (segs[0] && LOCALE_HEAD.has(segs[0].toLowerCase())) segs = segs.slice(1);

  if (segs[0]) {
    const head = segs[0].toLowerCase();
    segs[0] = ALIAS_HEAD.get(head) || head;
  }

  if (segs[0] && ARCHIVE_HEAD.has(segs[0])) {
    segs = segs.map(seg => seg.toLowerCase());
  }

  return stripIndexAndSlash(`/${segs.join('/')}`);
}

export function redirectLocation(pathname, search = '') {
  const originalPath = String(pathname || '/').split('?')[0].split('#')[0] || '/';
  const originalSearch = search || '';
  if (isSkippedFile(originalPath)) return null;

  const segs = originalPath.split('/').filter(Boolean);
  if (segs[0] && SKIP_HEAD.has(segs[0].toLowerCase())) return null;

  const destPath = normalizePublicPath(originalPath);
  const destSearch = isArchivePath(destPath) ? '' : originalSearch;
  const dest = `${destPath}${destSearch}`;
  const current = `${originalPath}${originalSearch}`;
  return dest === current ? null : dest;
}
