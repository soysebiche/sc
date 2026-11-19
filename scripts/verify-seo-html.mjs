import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../src/domain/publicRoutes.js';
import { redirectLocation } from '../src/domain/publicRedirects.js';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

async function resolveFile(urlPath) {
  const relative = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const candidates = relative
    ? [path.join(DIST, relative), path.join(DIST, relative, 'index.html')]
    : [path.join(DIST, 'index.html')];
  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function startServer() {
  return new Promise(resolve => {
    const server = createServer(async (request, response) => {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
      const urlPath = requestUrl.pathname;
      const dest = redirectLocation(urlPath, requestUrl.search);
      if (dest) {
        response.writeHead(308, { Location: dest });
        response.end();
        return;
      }
      const filePath = await resolveFile(urlPath);
      if (!filePath) {
        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(await readFile(path.join(DIST, '404.html')));
        return;
      }
      response.writeHead(200, { 'Content-Type': contentType(filePath) });
      response.end(await readFile(filePath));
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}

async function curl(origin, urlPath, { method = 'GET' } = {}) {
  const response = await fetch(`${origin}${urlPath}`, { method, redirect: 'manual' });
  const body = method === 'HEAD' ? '' : await response.text();
  return { status: response.status, body, location: response.headers.get('location') };
}

function requireSnippet(label, body, snippet) {
  if (!body.includes(snippet)) throw new Error(`${label} missing ${JSON.stringify(snippet)}`);
}

function countSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
}

const { server, origin } = await startServer();
try {
  const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  const sitemapLocs = countSitemapLocs(sitemap);
  const isIndex = sitemap.includes('<sitemapindex');
  const allLocs = [];
  if (isIndex) {
    for (const loc of sitemapLocs) {
      const childPath = new URL(loc).pathname;
      const child = await curl(origin, childPath);
      if (child.status !== 200) throw new Error(`${childPath} returned ${child.status}`);
      allLocs.push(...countSitemapLocs(child.body));
    }
  } else {
    allLocs.push(...sitemapLocs);
  }

  const matchPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => pathname.startsWith('/partidos/') && pathname !== '/partidos');
  const playerPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => pathname.startsWith('/jugadores/') && pathname !== '/jugadores');
  const rivalPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => pathname.startsWith('/rivales/') && pathname !== '/rivales');
  const countryPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => pathname.startsWith('/paises/') && pathname !== '/paises');
  const seasonPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => /^\/temporadas\/\d{4}$/.test(pathname));
  if (!matchPath || !playerPath || !rivalPath || !countryPath || !seasonPath) {
    throw new Error('Sitemap is missing match, player, rival, country or season URLs');
  }

  const home = await curl(origin, '/');
  const partidos = await curl(origin, '/partidos');
  const match = await curl(origin, matchPath);
  const player = await curl(origin, playerPath);
  const jugadores = await curl(origin, '/jugadores');
  const rival = await curl(origin, rivalPath);
  const rivalesIndex = await curl(origin, '/rivales');
  const rivalAlias = await curl(origin, '/rivales/real-garcilaso');
  const country = await curl(origin, countryPath);
  const season = await curl(origin, seasonPath);
  const compare = await curl(origin, '/temporadas/comparar');
  const compareAlias = await curl(origin, '/comparar');
  const unknownHead = await curl(origin, '/no-existe-esta-ruta', { method: 'HEAD' });
  const unknownGet = await curl(origin, '/no-existe-esta-ruta');
  const querySpa = await curl(origin, '/?view=rivales&rival=Alianza%20Lima');
  const ogImage = await curl(origin, '/og/home.png', { method: 'HEAD' });
  const robots = await curl(origin, '/robots.txt');
  const slash = await curl(origin, `${matchPath}/`);
  const indexHtml = await curl(origin, `${matchPath}/index.html`);
  const upper = await curl(origin, matchPath.replace('/partidos/', '/Partidos/'));
  const playerSlash = await curl(origin, `${playerPath}/`);
  const playerEnglish = await curl(origin, playerPath.replace('/jugadores/', '/players/'));
  const english = await curl(origin, matchPath.replace('/partidos/', '/matches/'));
  const locale = await curl(origin, `/en${matchPath}`);
  const celestePath = await curl(origin, `/celeste${matchPath}`);
  const queryOnMatch = await curl(origin, `${matchPath}?utm=1`);

  if (home.status !== 200) throw new Error(`GET / returned ${home.status}`);
  if (match.status !== 200) throw new Error(`GET ${matchPath} returned ${match.status}`);
  if (unknownHead.status !== 404) throw new Error(`HEAD unknown returned ${unknownHead.status}`);
  if (unknownGet.status !== 404) throw new Error(`GET unknown returned ${unknownGet.status}`);
  if (ogImage.status !== 200) throw new Error('og/home.png was not published');
  if (querySpa.status !== 200) throw new Error('Shareable query URLs must still hit the home document');
  if (slash.status !== 308) throw new Error(`GET ${matchPath}/ returned ${slash.status}, expected 308`);
  if (indexHtml.status !== 308) throw new Error(`GET ${matchPath}/index.html returned ${indexHtml.status}, expected 308`);
  if (upper.status !== 308) throw new Error(`GET uppercase match path returned ${upper.status}, expected 308`);
  if (player.status !== 200) throw new Error(`GET ${playerPath} returned ${player.status}`);
  if (jugadores.status !== 200) throw new Error(`GET /jugadores returned ${jugadores.status}`);
  if (playerSlash.status !== 308) throw new Error(`GET ${playerPath}/ returned ${playerSlash.status}, expected 308`);
  if (playerEnglish.status !== 308) throw new Error(`GET /players/... returned ${playerEnglish.status}, expected 308`);
  if (playerSlash.location !== playerPath) throw new Error(`player slash Location was ${playerSlash.location}`);
  if (playerEnglish.location !== playerPath) throw new Error(`player english Location was ${playerEnglish.location}`);
  if (english.status !== 308) throw new Error(`GET /matches/... returned ${english.status}, expected 308`);
  if (locale.status !== 308) throw new Error(`GET /en/... returned ${locale.status}, expected 308`);
  if (celestePath.status !== 308) throw new Error(`GET /celeste/... returned ${celestePath.status}, expected 308`);
  if (queryOnMatch.status !== 308) throw new Error(`GET match with query returned ${queryOnMatch.status}, expected 308`);
  const expectedMatch = matchPath;
  for (const [label, result] of [
    ['slash', slash],
    ['index.html', indexHtml],
    ['uppercase', upper],
    ['english', english],
    ['locale', locale],
    ['celeste prefix', celestePath],
    ['query', queryOnMatch],
  ]) {
    if (result.location !== expectedMatch) {
      throw new Error(`${label} redirect Location was ${result.location}, expected ${expectedMatch}`);
    }
  }
  if (!allLocs.includes(`${SITE_URL}${matchPath}`)) {
    throw new Error(`Sitemap is missing canonical ${SITE_URL}${matchPath}`);
  }

  requireSnippet('/', home.body, 'lang="es-PE"');
  requireSnippet('/', home.body, `rel="canonical" href="${SITE_URL}/"`);
  requireSnippet('/', home.body, '<h1 class="section-title">Archivo histórico de Sporting Cristal</h1>');
  requireSnippet('/', home.body, 'href="/partidos"');
  requireSnippet('/', home.body, 'href="/jugadores"');
  requireSnippet('/', home.body, 'href="/rivales"');
  requireSnippet('/', home.body, 'href="/temporadas"');
  requireSnippet('/', home.body, '"@type":"WebSite"');
  requireSnippet('/', home.body, '"@type":"SportsTeam"');
  requireSnippet('/', home.body, 'twitter:card" content="summary_large_image"');
  requireSnippet('/partidos', partidos.body, `rel="canonical" href="${SITE_URL}/partidos"`);
  requireSnippet('/partidos', partidos.body, 'href="/temporadas/');
  requireSnippet(matchPath, match.body, `rel="canonical" href="${SITE_URL}${matchPath}"`);
  requireSnippet(matchPath, match.body, '<h1 class="section-title">');
  requireSnippet(matchPath, match.body, '"@type":"SportsEvent"');
  requireSnippet(matchPath, match.body, '"homeTeam"');
  requireSnippet(matchPath, match.body, '"awayTeam"');
  requireSnippet(matchPath, match.body, '"startDate"');
  requireSnippet(matchPath, match.body, 'href="/rivales/');
  requireSnippet(matchPath, match.body, 'href="/temporadas/');
  requireSnippet(matchPath, match.body, 'Partidos contiguos');
  requireSnippet(matchPath, match.body, 'Mismo torneo');
  requireSnippet(matchPath, match.body, '"@type":"BreadcrumbList"');
  requireSnippet(matchPath, match.body, 'Temporada ');
  requireSnippet(matchPath, match.body, 'rel="nofollow"');
  requireSnippet(matchPath, match.body, 'seo-facts');
  requireSnippet('/jugadores', jugadores.body, `rel="canonical" href="${SITE_URL}/jugadores"`);
  requireSnippet(playerPath, player.body, `rel="canonical" href="${SITE_URL}${playerPath}"`);
  requireSnippet(playerPath, player.body, '"@type":"Person"');
  requireSnippet(playerPath, player.body, 'href="/partidos/');
  requireSnippet(playerPath, player.body, 'Goles por competición');
  requireSnippet(playerPath, player.body, 'rel="nofollow"');
  requireSnippet(rivalPath, rival.body, `rel="canonical" href="${SITE_URL}${rivalPath}"`);
  requireSnippet(rivalPath, rival.body, 'href="/partidos/');
  requireSnippet(rivalPath, rival.body, 'Local y visita');
  requireSnippet(rivalPath, rival.body, 'Goleadores celestes');
  requireSnippet('/rivales', rivalesIndex.body, '<th scope="col">PJ</th>');
  if (rivalesIndex.status !== 200) throw new Error(`GET /rivales returned ${rivalesIndex.status}`);
  if (rivalAlias.status !== 308 || rivalAlias.location !== '/rivales/cusco-fc') {
    throw new Error(`GET /rivales/real-garcilaso returned ${rivalAlias.status} ${rivalAlias.location}`);
  }
  requireSnippet(countryPath, country.body, `rel="canonical" href="${SITE_URL}${countryPath}"`);
  requireSnippet(seasonPath, season.body, `rel="canonical" href="${SITE_URL}${seasonPath}"`);
  requireSnippet(seasonPath, season.body, 'href="/partidos/');
  requireSnippet(seasonPath, season.body, 'href="/temporadas/comparar');
  if (compare.status !== 200) throw new Error(`GET /temporadas/comparar returned ${compare.status}`);
  if (compareAlias.status !== 308 || compareAlias.location !== '/temporadas/comparar') {
    throw new Error(`GET /comparar returned ${compareAlias.status} ${compareAlias.location}`);
  }
  requireSnippet('/temporadas/comparar', compare.body, `rel="canonical" href="${SITE_URL}/temporadas/comparar"`);
  requireSnippet('/temporadas/comparar', compare.body, 'compare-table');
  requireSnippet('/temporadas/comparar', compare.body, '3 por victoria');
  requireSnippet('/zzz', unknownGet.body, 'Página no encontrada');
  requireSnippet('robots', robots.body, `Sitemap: ${SITE_URL}/sitemap.xml`);
  if (home.body.includes(`rel="canonical" href="${SITE_URL}${matchPath}"`)) {
    throw new Error('Home page inherited a match canonical');
  }
  if (match.body.includes(`rel="canonical" href="${SITE_URL}/"`)) {
    throw new Error('Match page canonical points at the home page');
  }
  if (match.body.includes(`rel="canonical" href="${SITE_URL}${matchPath}/"`)) {
    throw new Error('Match canonical has a trailing slash');
  }
  const matchLastmods = [...(await readFile(path.join(DIST, 'sitemap-matches.xml'), 'utf8')).matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(item => item[1]);
  if (new Set(matchLastmods).size < 2) {
    throw new Error('Match sitemap lastmod values are not per-match');
  }

  const lines = [
    `SEO verify OK against ${origin} (filesystem then 404.html, matching vercel.json)`,
    `GET / → ${home.status} title+canonical+h1+WebSite+SportsTeam`,
    `GET ${matchPath} → ${match.status} SportsEvent+canonical+unique copy+prev/next`,
    `GET ${matchPath}/ → ${slash.status}`,
    `GET ${playerPath} → ${player.status} Person+canonical+match links`,
    `GET ${rivalPath} → ${rival.status}`,
    `GET ${countryPath} → ${country.status}`,
    `GET ${seasonPath} → ${season.status}`,
    `HEAD /no-existe-esta-ruta → ${unknownHead.status}`,
    `GET /no-existe-esta-ruta → ${unknownGet.status}`,
    `sitemap URLs → ${allLocs.length}`,
    '',
  ];
  process.stdout.write(lines.join('\n'));
} finally {
  server.close();
}
