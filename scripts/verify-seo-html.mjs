import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../src/domain/publicRoutes.js';

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
      const urlPath = (request.url || '/').split('?')[0];
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
  return { status: response.status, body };
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
  const rivalPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => pathname.startsWith('/rivales/') && pathname !== '/rivales');
  const countryPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => pathname.startsWith('/paises/') && pathname !== '/paises');
  const seasonPath = allLocs.map(loc => new URL(loc).pathname).find(pathname => pathname.startsWith('/temporadas/') && pathname !== '/temporadas');
  if (!matchPath || !rivalPath || !countryPath || !seasonPath) {
    throw new Error('Sitemap is missing match, rival, country or season URLs');
  }

  const home = await curl(origin, '/');
  const partidos = await curl(origin, '/partidos');
  const match = await curl(origin, matchPath);
  const rival = await curl(origin, rivalPath);
  const country = await curl(origin, countryPath);
  const season = await curl(origin, seasonPath);
  const unknownHead = await curl(origin, '/no-existe-esta-ruta', { method: 'HEAD' });
  const unknownGet = await curl(origin, '/no-existe-esta-ruta');
  const querySpa = await curl(origin, '/?view=rivales&rival=Alianza%20Lima');
  const ogImage = await curl(origin, '/og-image.png', { method: 'HEAD' });
  const robots = await curl(origin, '/robots.txt');

  if (home.status !== 200) throw new Error(`GET / returned ${home.status}`);
  if (match.status !== 200) throw new Error(`GET ${matchPath} returned ${match.status}`);
  if (unknownHead.status !== 404) throw new Error(`HEAD unknown returned ${unknownHead.status}`);
  if (unknownGet.status !== 404) throw new Error(`GET unknown returned ${unknownGet.status}`);
  if (ogImage.status !== 200) throw new Error('og-image.png was not published');
  if (querySpa.status !== 200) throw new Error('Shareable query URLs must still hit the home document');

  requireSnippet('/', home.body, 'lang="es-PE"');
  requireSnippet('/', home.body, `rel="canonical" href="${SITE_URL}/"`);
  requireSnippet('/', home.body, '<h1 class="section-title">Archivo histórico de Sporting Cristal</h1>');
  requireSnippet('/', home.body, '"@type":"WebSite"');
  requireSnippet('/', home.body, '"@type":"SportsTeam"');
  requireSnippet('/', home.body, 'twitter:card" content="summary_large_image"');
  requireSnippet('/partidos', partidos.body, `rel="canonical" href="${SITE_URL}/partidos"`);
  requireSnippet(matchPath, match.body, `rel="canonical" href="${SITE_URL}${matchPath}"`);
  requireSnippet(matchPath, match.body, '<h1 class="section-title">');
  requireSnippet(matchPath, match.body, '"@type":"SportsEvent"');
  requireSnippet(matchPath, match.body, '"homeTeam"');
  requireSnippet(matchPath, match.body, '"awayTeam"');
  requireSnippet(matchPath, match.body, '"startDate"');
  requireSnippet(matchPath, match.body, 'href="/rivales/');
  requireSnippet(matchPath, match.body, 'href="/temporadas/');
  requireSnippet(rivalPath, rival.body, `rel="canonical" href="${SITE_URL}${rivalPath}"`);
  requireSnippet(countryPath, country.body, `rel="canonical" href="${SITE_URL}${countryPath}"`);
  requireSnippet(seasonPath, season.body, `rel="canonical" href="${SITE_URL}${seasonPath}"`);
  requireSnippet('/zzz', unknownGet.body, 'Página no encontrada');
  requireSnippet('robots', robots.body, `Sitemap: ${SITE_URL}/sitemap.xml`);
  if (home.body.includes(`rel="canonical" href="${SITE_URL}${matchPath}"`)) {
    throw new Error('Home page inherited a match canonical');
  }
  if (match.body.includes(`rel="canonical" href="${SITE_URL}/"`)) {
    throw new Error('Match page canonical points at the home page');
  }

  const lines = [
    `SEO verify OK against ${origin} (filesystem then 404.html, matching vercel.json)`,
    `GET / → ${home.status} title+canonical+h1+WebSite+SportsTeam`,
    `GET ${matchPath} → ${match.status} SportsEvent+canonical+internal links`,
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
