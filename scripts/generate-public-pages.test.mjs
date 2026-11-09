import assert from 'node:assert/strict';
import test from 'node:test';
import { applyHead, breadcrumbList, buildSitemapDocuments, escapeHtml, injectRoot, matchSportsEvent, SITEMAP_URL_LIMIT, sitemapLastmod } from './generate-public-pages.mjs';

const shell = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Old</title>
    <meta name="description" content="old" />
    <link rel="canonical" href="https://celeste.sebiche.com/" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

test('escapes HTML in titles and attributes', () => {
  assert.equal(escapeHtml('A & B <C> "D"'), 'A &amp; B &lt;C&gt; &quot;D&quot;');
});

test('applyHead sets Spanish Peru language, unique canonical and social tags', () => {
  const html = applyHead(shell, {
    title: 'Sporting Cristal vs. Alianza Lima | Sebiche Celeste',
    description: 'Historial celeste.',
    pathname: '/rivales/alianza-lima/',
    spa: '/?view=rivales&rival=Alianza Lima',
    prev: '/partidos/1956-08-05-alianza-lima',
    next: '/partidos/1956-08-18-ciclista-lima',
    schema: { '@type': 'BreadcrumbList' },
  });
  assert.match(html, /lang="es-PE"/);
  assert.match(html, /rel="canonical" href="https:\/\/celeste.sebiche.com\/rivales\/alianza-lima"/);
  assert.doesNotMatch(html, /rel="canonical" href="[^"]+\/"/);
  assert.match(html, /rel="prev" href="https:\/\/celeste.sebiche.com\/partidos\/1956-08-05-alianza-lima"/);
  assert.match(html, /rel="next" href="https:\/\/celeste.sebiche.com\/partidos\/1956-08-18-ciclista-lima"/);
  assert.match(html, /twitter:card" content="summary_large_image"/);
  assert.match(html, /og:image" content="https:\/\/celeste.sebiche.com\/og\/home.png"/);
  assert.match(html, /name="sc-spa" content="\/\?view=rivales&amp;rival=Alianza Lima"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
});

test('injectRoot fills the SPA mount and refuses a missing root', () => {
  const html = injectRoot(shell, '<h1>Archivo</h1>');
  assert.match(html, /<div id="root"><h1>Archivo<\/h1><\/div>/);
  assert.throws(() => injectRoot('<html></html>', '<h1>x</h1>'), /missing empty/);
});

test('SportsEvent omits location when the archive has no venue', () => {
  const event = matchSportsEvent({
    path: '/partidos/1956-08-05-alianza-lima',
    match: {
      home: 'Alianza Lima',
      away: 'Sporting Cristal',
      date: '1956-08-05',
      tournament: 'Liga',
    },
  });
  assert.equal(event['@type'], 'SportsEvent');
  assert.equal(event.startDate, '1956-08-05');
  assert.equal(event.homeTeam.name, 'Alianza Lima');
  assert.equal(event.awayTeam.name, 'Sporting Cristal');
  assert.equal(event.location, undefined);
});

test('splits a sitemap index above 50k URLs', () => {
  const entries = Array.from({ length: SITEMAP_URL_LIMIT + 2 }, (_, index) => ({ path: `/p/${index}` }));
  const files = buildSitemapDocuments(entries, '2026-10-23');
  assert.equal(files[0].filename, 'sitemap.xml');
  assert.match(files[0].xml, /<sitemapindex /);
  assert.equal(files.length, 3);
  assert.match(files[1].xml, /<urlset /);
  assert.equal((files[1].xml.match(/<url>/g) || []).length, SITEMAP_URL_LIMIT);
  assert.equal((files[2].xml.match(/<url>/g) || []).length, 2);
});

test('keeps per-URL lastmod and splits a sitemap index by group', () => {
  assert.equal(sitemapLastmod('1956-08-05', '2026-11-07'), '1956-08-05');
  assert.equal(sitemapLastmod('nope', '2026-11-07'), '2026-11-07');
  const files = buildSitemapDocuments([
    { path: '/', group: 'pages', lastmod: '2026-11-07' },
    { path: '/partidos/1956-08-05-alianza-lima', group: 'matches', lastmod: '1956-08-05' },
    { path: '/partidos/2026-11-07-adt', group: 'matches', lastmod: '2026-11-07' },
  ], '2026-11-07', { splitByGroup: true });
  assert.equal(files[0].filename, 'sitemap.xml');
  assert.match(files[0].xml, /<sitemapindex /);
  assert.equal(files[1].filename, 'sitemap-pages.xml');
  assert.equal(files[2].filename, 'sitemap-matches.xml');
  assert.match(files[2].xml, /<lastmod>1956-08-05<\/lastmod>/);
  assert.match(files[2].xml, /<lastmod>2026-11-07<\/lastmod>/);
  assert.match(files[0].xml, /sitemap-matches\.xml/);
});

test('breadcrumb JSON-LD keeps absolute items', () => {
  const crumbs = breadcrumbList([
    { name: 'Inicio', path: '/' },
    { name: 'Partidos', path: '/partidos' },
  ]);
  assert.equal(crumbs.itemListElement[0].item, 'https://celeste.sebiche.com/');
  assert.equal(crumbs.itemListElement[1].item, 'https://celeste.sebiche.com/partidos');
});
