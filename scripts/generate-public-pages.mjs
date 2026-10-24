import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatMatchDate, parseMatch, sortMatchesNewest, summarizeMatches } from '../src/domain/matches.js';
import {
  OG_IMAGE_PATH,
  RESULT_WORD,
  SITE_URL,
  absoluteUrl,
  buildPublicCatalog,
  countryPathByName,
  rivalPathByName,
  seasonPathByYear,
} from '../src/domain/publicRoutes.js';
import { OG_HEIGHT, OG_WIDTH } from './og-png.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const HTML_LANG = 'es-PE';
export const SITEMAP_URL_LIMIT = 50000;

const STATIC_SITEMAP_PATHS = [
  '/privacidad.html',
  '/case-study-sebiche-impact.html',
];

export const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatCount = value => Number(value).toLocaleString('es-PE');
const longDate = date => formatMatchDate(date, { day: 'numeric', month: 'long', year: 'numeric' });

function replaceOrInsert(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function replaceJsonLd(html, schema) {
  const script = schema
    ? `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`
    : '';
  if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(html)) {
    return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, script);
  }
  return script ? html.replace('</head>', `    ${script}\n  </head>`) : html;
}

export function applyHead(template, {
  title,
  description,
  pathname,
  index = true,
  schema = null,
  spa = null,
}) {
  const url = absoluteUrl(pathname);
  const image = absoluteUrl(OG_IMAGE_PATH);
  let html = template.replace(/<html lang="[^"]*">/, `<html lang="${HTML_LANG}">`);
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceOrInsert(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsert(html, /<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="${index ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'}" />`);
  html = replaceOrInsert(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, index ? `<link rel="canonical" href="${escapeHtml(url)}" />` : '');
  html = replaceOrInsert(html, /<meta property="og:type" content="[^"]*"\s*\/?>/, '<meta property="og:type" content="website" />');
  html = replaceOrInsert(html, /<meta property="og:locale" content="[^"]*"\s*\/?>/, '<meta property="og:locale" content="es_PE" />');
  html = replaceOrInsert(html, /<meta property="og:site_name" content="[^"]*"\s*\/?>/, '<meta property="og:site_name" content="Sebiche Celeste" />');
  html = replaceOrInsert(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = replaceOrInsert(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsert(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, index ? `<meta property="og:url" content="${escapeHtml(url)}" />` : '');
  html = replaceOrInsert(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  html = replaceOrInsert(html, /<meta property="og:image:width" content="[^"]*"\s*\/?>/, `<meta property="og:image:width" content="${OG_WIDTH}" />`);
  html = replaceOrInsert(html, /<meta property="og:image:height" content="[^"]*"\s*\/?>/, `<meta property="og:image:height" content="${OG_HEIGHT}" />`);
  html = replaceOrInsert(html, /<meta name="twitter:card" content="[^"]*"\s*\/?>/, '<meta name="twitter:card" content="summary_large_image" />');
  html = replaceOrInsert(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = replaceOrInsert(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsert(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  html = replaceOrInsert(html, /<meta name="sc-spa" content="[^"]*"\s*\/?>/, spa ? `<meta name="sc-spa" content="${escapeHtml(spa)}" />` : '');
  return replaceJsonLd(html, schema);
}

export function injectRoot(html, inner) {
  const next = html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${inner}</div>`);
  if (next === html) throw new Error('Cannot prerender: missing empty <div id="root"> in built index.html');
  return next;
}

export function crumbsHtml(items) {
  const list = items.map((item, index) => {
    const last = index === items.length - 1;
    const label = escapeHtml(item.name);
    const body = last || !item.path ? label : `<a href="${escapeHtml(item.path)}">${label}</a>`;
    return `<li>${body}</li>`;
  }).join('');
  return `<nav class="seo-crumbs" aria-label="Migas de pan"><ol>${list}</ol></nav>`;
}

export function breadcrumbList(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path || '/'),
    })),
  };
}

function siteChrome({ heading, intro, crumbs, extra }) {
  return `<div class="app-shell seo-page">
    <header class="app-header"><div class="app-header__inner"><div class="app-header__layout">
      <a href="/" class="brand-lockup"><img src="/sebiche-celeste-logo.webp" alt="Sebiche Celeste" width="512" height="233" class="brand-logo" /></a>
      <nav class="seo-nav" aria-label="Archivo público">
        <a href="/partidos">Partidos</a>
        <a href="/rivales">Rivales</a>
        <a href="/paises">Países</a>
        <a href="/temporadas">Temporadas</a>
      </nav>
    </div></div></header>
    <main id="main-content" class="w-full max-w-7xl mx-auto px-4 py-6 flex-1">
      ${crumbsHtml(crumbs)}
      <h1 class="section-title">${escapeHtml(heading)}</h1>
      <p class="section-subtitle">${escapeHtml(intro)}</p>
      ${extra}
    </main>
  </div>`;
}

function matchSentence(match) {
  const word = RESULT_WORD[match.resultCode] || 'Resultado';
  return `${word} ${match.scoreLabel} de Sporting Cristal ante ${match.opponent} el ${longDate(match.date)} en ${match.tournament}.`;
}

export function groupedMatchList(entries) {
  const sorted = [...entries].sort((a, b) => (a.match.date < b.match.date ? 1 : a.match.date > b.match.date ? -1 : 0));
  const years = [];
  const byYear = new Map();
  sorted.forEach(entry => {
    const year = entry.match.year;
    if (!byYear.has(year)) {
      byYear.set(year, []);
      years.push(year);
    }
    byYear.get(year).push(entry);
  });
  return years.map(year => {
    const heading = year == null ? 'Sin año' : `<a href="${seasonPathByYear(year)}">${year}</a>`;
    const items = byYear.get(year).map(entry => {
      const match = entry.match;
      return `<li><a href="${escapeHtml(entry.path)}">${escapeHtml(formatMatchDate(match.date))} · ${escapeHtml(match.home)} vs. ${escapeHtml(match.away)} · ${escapeHtml(match.scoreLabel)}</a> · ${escapeHtml(match.tournament)}</li>`;
    }).join('');
    return `<section class="archive-section"><h2 class="collection-title">${heading}</h2><ul class="seo-list">${items}</ul></section>`;
  }).join('');
}

function statsLine(matches) {
  const stats = summarizeMatches(matches);
  return `${formatCount(stats.total)} partidos · ${formatCount(stats.victories)} victorias · ${formatCount(stats.draws)} empates · ${formatCount(stats.defeats)} derrotas · goles ${formatCount(stats.goalsFor)}-${formatCount(stats.goalsAgainst)}`;
}

function jsonLdGraph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function matchSportsEvent(entry) {
  const match = entry.match;
  const event = {
    '@type': 'SportsEvent',
    name: `${match.home} vs. ${match.away}`,
    url: absoluteUrl(entry.path),
    startDate: match.date,
    sport: 'Soccer',
    homeTeam: { '@type': 'SportsTeam', name: match.home },
    awayTeam: { '@type': 'SportsTeam', name: match.away },
    image: absoluteUrl(OG_IMAGE_PATH),
  };
  if (match.tournament) event.superEvent = { '@type': 'SportsEvent', name: match.tournament };
  return event;
}

async function writeHtml(pathname, html) {
  const target = pathname === '/'
    ? path.join(DIST, 'index.html')
    : path.join(DIST, pathname.replace(/^\//, ''), 'index.html');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
  return target;
}

export function buildSitemapDocuments(entries, lastmod) {
  const loc = pathname => escapeHtml(absoluteUrl(pathname));
  const urlXml = entry => {
    const changefreq = entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : '';
    const priority = entry.priority ? `\n    <priority>${entry.priority}</priority>` : '';
    return `  <url>\n    <loc>${loc(entry.path)}</loc>\n    <lastmod>${lastmod}</lastmod>${changefreq}${priority}\n  </url>`;
  };
  const wrapUrlset = urls => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(urlXml).join('\n')}\n</urlset>\n`;

  if (entries.length <= SITEMAP_URL_LIMIT) {
    return [{ filename: 'sitemap.xml', xml: wrapUrlset(entries) }];
  }

  const chunks = [];
  for (let index = 0; index < entries.length; index += SITEMAP_URL_LIMIT) {
    chunks.push(entries.slice(index, index + SITEMAP_URL_LIMIT));
  }
  const files = chunks.map((chunk, index) => ({
    filename: `sitemap-${index + 1}.xml`,
    xml: wrapUrlset(chunk),
  }));
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map(file => `  <sitemap>\n    <loc>${loc(`/${file.filename}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`).join('\n')}\n</sitemapindex>\n`;
  return [{ filename: 'sitemap.xml', xml: indexXml }, ...files];
}

function assertContains(label, html, snippets) {
  for (const snippet of snippets) {
    if (!html.includes(snippet)) throw new Error(`${label} is missing ${JSON.stringify(snippet)}`);
  }
}

export async function generatePublicPages({ distDir = DIST, dataDir = path.join(ROOT, 'src', 'data') } = {}) {
  const [viteHtml, records, metadata] = await Promise.all([
    readFile(path.join(distDir, 'index.html'), 'utf8'),
    readFile(path.join(dataDir, 'historico_completo_sc.json'), 'utf8').then(JSON.parse),
    readFile(path.join(dataDir, 'archive-metadata.json'), 'utf8').then(JSON.parse),
  ]);

  const matches = records.map(parseMatch);
  const catalog = buildPublicCatalog(matches);
  // Legacy URL kept for already-shared links: serve the brand-kit home OG there too.
  const ogPng = await readFile(path.join(ROOT, 'public', 'og', 'home.png'));
  await writeFile(path.join(distDir, 'og-image.png'), ogPng);

  const crumbsHome = [{ name: 'Inicio', path: '/' }];
  const pageCount = {
    home: 1,
    indexes: 4,
    matches: catalog.matches.length,
    rivals: catalog.rivals.length,
    countries: catalog.countries.length,
    seasons: catalog.seasons.length,
    notFound: 1,
  };

  const homeTitle = 'Sebiche Celeste | Archivo histórico de Sporting Cristal';
  const homeDescription = `Archivo histórico de Sporting Cristal: ${formatCount(metadata.recordCount)} partidos, rivales, países y temporadas desde ${longDate(metadata.firstMatchDate)}.`;
  const recent = sortMatchesNewest(catalog.matches.map(entry => entry.match)).slice(0, 12);
  const recentById = new Map(catalog.matches.map(entry => [entry.id, entry]));
  const recentLinks = recent.map(match => {
    const entry = catalog.matches.find(item => item.match === match) || [...recentById.values()].find(item => item.match.date === match.date && item.match.home === match.home && item.match.away === match.away);
    return `<li><a href="${escapeHtml(entry.path)}">${escapeHtml(formatMatchDate(match.date))} · ${escapeHtml(match.home)} vs. ${escapeHtml(match.away)} · ${escapeHtml(match.scoreLabel)}</a></li>`;
  }).join('');
  const homeInner = siteChrome({
    heading: 'Archivo histórico de Sporting Cristal',
    intro: homeDescription,
    crumbs: crumbsHome,
    extra: `<p>${escapeHtml(statsLine(matches))}</p>
      <p><a href="/partidos">Partidos</a> · <a href="/rivales">Rivales</a> · <a href="/paises">Países</a> · <a href="/temporadas">Temporadas</a></p>
      <section class="archive-section"><h2 class="collection-title">Últimos partidos</h2><ul class="seo-list">${recentLinks}</ul></section>`,
  });
  const homeHtml = injectRoot(applyHead(viteHtml, {
    title: homeTitle,
    description: homeDescription,
    pathname: '/',
    schema: jsonLdGraph([
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Sebiche Celeste',
        url: `${SITE_URL}/`,
        inLanguage: HTML_LANG,
        description: homeDescription,
        about: { '@id': `${SITE_URL}/#sporting-cristal` },
      },
      {
        '@type': 'SportsTeam',
        '@id': `${SITE_URL}/#sporting-cristal`,
        name: 'Sporting Cristal',
        sport: 'Soccer',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo512.png`,
      },
      breadcrumbList(crumbsHome),
    ]),
  }), homeInner);

  const notFoundInner = siteChrome({
    heading: 'Página no encontrada',
    intro: 'Esta URL no existe en el archivo de Sporting Cristal.',
    crumbs: crumbsHome,
    extra: '<p><a href="/">Volver al inicio</a> · <a href="/partidos">Partidos</a> · <a href="/rivales">Rivales</a></p>',
  });
  const notFoundHtml = injectRoot(applyHead(viteHtml, {
    title: 'Página no encontrada | Sebiche Celeste',
    description: 'Esta URL no existe en el archivo histórico de Sporting Cristal.',
    pathname: '/404',
    index: false,
    schema: null,
  }), notFoundInner);

  const partidosCrumbs = [...crumbsHome, { name: 'Partidos', path: '/partidos' }];
  const partidosTitle = 'Partidos de Sporting Cristal | Sebiche Celeste';
  const partidosDescription = `Consulta los ${formatCount(catalog.matches.length)} partidos oficiales de Sporting Cristal en el archivo, con resultado, fecha y competición.`;
  const partidosHtml = injectRoot(applyHead(viteHtml, {
    title: partidosTitle,
    description: partidosDescription,
    pathname: '/partidos',
    spa: catalog.indexes.partidos.spa,
    schema: jsonLdGraph([breadcrumbList(partidosCrumbs)]),
  }), siteChrome({
    heading: 'Partidos de Sporting Cristal',
    intro: partidosDescription,
    crumbs: partidosCrumbs,
    extra: groupedMatchList(catalog.matches),
  }));

  const rivalesCrumbs = [...crumbsHome, { name: 'Rivales', path: '/rivales' }];
  const rivalesTitle = 'Rivales de Sporting Cristal | Sebiche Celeste';
  const rivalesDescription = `Historial de Sporting Cristal frente a ${formatCount(catalog.rivals.length)} rivales del archivo.`;
  const rivalesIndexHtml = injectRoot(applyHead(viteHtml, {
    title: rivalesTitle,
    description: rivalesDescription,
    pathname: '/rivales',
    spa: catalog.indexes.rivales.spa,
    schema: jsonLdGraph([breadcrumbList(rivalesCrumbs)]),
  }), siteChrome({
    heading: 'Rivales de Sporting Cristal',
    intro: rivalesDescription,
    crumbs: rivalesCrumbs,
    extra: `<ul class="seo-list">${catalog.rivals.map(rival => `<li><a href="${escapeHtml(rival.path)}">${escapeHtml(rival.name)}</a> · ${formatCount(rival.matches.length)} partidos</li>`).join('')}</ul>`,
  }));

  const paisesCrumbs = [...crumbsHome, { name: 'Países', path: '/paises' }];
  const paisesTitle = 'Países enfrentados por Sporting Cristal | Sebiche Celeste';
  const paisesDescription = `Historial internacional y doméstico de Sporting Cristal por país: ${catalog.countries.map(item => item.name).join(', ')}.`;
  const paisesIndexHtml = injectRoot(applyHead(viteHtml, {
    title: paisesTitle,
    description: paisesDescription,
    pathname: '/paises',
    spa: catalog.indexes.paises.spa,
    schema: jsonLdGraph([breadcrumbList(paisesCrumbs)]),
  }), siteChrome({
    heading: 'Países enfrentados por Sporting Cristal',
    intro: paisesDescription,
    crumbs: paisesCrumbs,
    extra: `<ul class="seo-list">${catalog.countries.map(country => `<li><a href="${escapeHtml(country.path)}">${escapeHtml(country.name)}</a> · ${formatCount(country.matches.length)} partidos</li>`).join('')}</ul>`,
  }));

  const temporadasCrumbs = [...crumbsHome, { name: 'Temporadas', path: '/temporadas' }];
  const temporadasTitle = 'Temporadas de Sporting Cristal | Sebiche Celeste';
  const temporadasDescription = `Temporadas del archivo de Sporting Cristal, de ${catalog.seasons.at(-1)?.year} a ${catalog.seasons[0]?.year}.`;
  const temporadasIndexHtml = injectRoot(applyHead(viteHtml, {
    title: temporadasTitle,
    description: temporadasDescription,
    pathname: '/temporadas',
    spa: catalog.indexes.temporadas.spa,
    schema: jsonLdGraph([breadcrumbList(temporadasCrumbs)]),
  }), siteChrome({
    heading: 'Temporadas de Sporting Cristal',
    intro: temporadasDescription,
    crumbs: temporadasCrumbs,
    extra: `<ul class="seo-list">${catalog.seasons.map(season => `<li><a href="${escapeHtml(season.path)}">Temporada ${season.year}</a> · ${formatCount(season.matches.length)} partidos</li>`).join('')}</ul>`,
  }));

  const pages = [
    { path: '/', html: homeHtml },
    { path: '/partidos', html: partidosHtml },
    { path: '/rivales', html: rivalesIndexHtml },
    { path: '/paises', html: paisesIndexHtml },
    { path: '/temporadas', html: temporadasIndexHtml },
  ];

  catalog.matches.forEach(entry => {
    const match = entry.match;
    const heading = `${match.home} vs. ${match.away}`;
    const description = matchSentence(match);
    const crumbs = [...partidosCrumbs, { name: heading, path: entry.path }];
    const rivalHref = rivalPathByName(catalog, match.opponent);
    const countryHref = match.country ? countryPathByName(catalog, match.country) : null;
    const extra = `<section class="archive-section">
        <p><time datetime="${escapeHtml(match.date)}">${escapeHtml(longDate(match.date))}</time> · ${escapeHtml(match.tournament)} · ${escapeHtml(RESULT_WORD[match.resultCode] || 'Resultado')} ${escapeHtml(match.scoreLabel)}</p>
        ${match.goalsNote ? `<p>Goles de Sporting Cristal: ${escapeHtml(match.goalsNote)}</p>` : ''}
        <p><a href="${escapeHtml(rivalHref)}">Historial vs. ${escapeHtml(match.opponent)}</a>
          ${match.year != null ? ` · <a href="${seasonPathByYear(match.year)}">Temporada ${match.year}</a>` : ''}
          ${countryHref ? ` · <a href="${escapeHtml(countryHref)}">${escapeHtml(match.country)}</a>` : ''}</p>
      </section>`;
    pages.push({
      path: entry.path,
      html: injectRoot(applyHead(viteHtml, {
        title: `${heading} ${match.scoreLabel} | Sebiche Celeste`,
        description,
        pathname: entry.path,
        spa: entry.spa,
        schema: jsonLdGraph([matchSportsEvent(entry), breadcrumbList(crumbs)]),
      }), siteChrome({ heading, intro: description, crumbs, extra })),
    });
  });

  catalog.rivals.forEach(rival => {
    const heading = `Sporting Cristal vs. ${rival.name}`;
    const description = `Historial de Sporting Cristal vs. ${rival.name}: ${statsLine(rival.matches.map(item => item.match))}.`;
    const crumbs = [...rivalesCrumbs, { name: rival.name, path: rival.path }];
    pages.push({
      path: rival.path,
      html: injectRoot(applyHead(viteHtml, {
        title: `${heading} | Sebiche Celeste`,
        description,
        pathname: rival.path,
        spa: rival.spa,
        schema: jsonLdGraph([breadcrumbList(crumbs)]),
      }), siteChrome({
        heading,
        intro: description,
        crumbs,
        extra: groupedMatchList(rival.matches),
      })),
    });
  });

  catalog.countries.forEach(country => {
    const heading = `Sporting Cristal vs. ${country.name}`;
    const description = `Partidos de Sporting Cristal contra equipos de ${country.name}: ${statsLine(country.matches.map(item => item.match))}.`;
    const crumbs = [...paisesCrumbs, { name: country.name, path: country.path }];
    pages.push({
      path: country.path,
      html: injectRoot(applyHead(viteHtml, {
        title: `${heading} | Sebiche Celeste`,
        description,
        pathname: country.path,
        spa: country.spa,
        schema: jsonLdGraph([breadcrumbList(crumbs)]),
      }), siteChrome({
        heading,
        intro: description,
        crumbs,
        extra: groupedMatchList(country.matches),
      })),
    });
  });

  catalog.seasons.forEach(season => {
    const heading = `Temporada ${season.year} de Sporting Cristal`;
    const description = `Partidos de Sporting Cristal en la temporada ${season.year}: ${statsLine(season.matches.map(item => item.match))}.`;
    const crumbs = [...temporadasCrumbs, { name: String(season.year), path: season.path }];
    pages.push({
      path: season.path,
      html: injectRoot(applyHead(viteHtml, {
        title: `${heading} | Sebiche Celeste`,
        description,
        pathname: season.path,
        spa: season.spa,
        schema: jsonLdGraph([breadcrumbList(crumbs)]),
      }), siteChrome({
        heading,
        intro: description,
        crumbs,
        extra: groupedMatchList(season.matches),
      })),
    });
  });

  await writeFile(path.join(distDir, '404.html'), notFoundHtml, 'utf8');
  const concurrency = 32;
  for (let index = 0; index < pages.length; index += concurrency) {
    await Promise.all(pages.slice(index, index + concurrency).map(page => writeHtml(page.path, page.html)));
  }

  const sitemapEntries = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/partidos', changefreq: 'weekly', priority: '0.9' },
    { path: '/rivales', changefreq: 'weekly', priority: '0.8' },
    { path: '/paises', changefreq: 'weekly', priority: '0.8' },
    { path: '/temporadas', changefreq: 'weekly', priority: '0.8' },
    ...STATIC_SITEMAP_PATHS.map(staticPath => ({ path: staticPath, changefreq: 'yearly', priority: '0.3' })),
    ...catalog.rivals.map(rival => ({ path: rival.path, changefreq: 'monthly', priority: '0.6' })),
    ...catalog.countries.map(country => ({ path: country.path, changefreq: 'monthly', priority: '0.5' })),
    ...catalog.seasons.map(season => ({ path: season.path, changefreq: 'monthly', priority: '0.6' })),
    ...catalog.matches.map(entry => ({ path: entry.path, changefreq: 'yearly', priority: '0.5' })),
  ];
  const sitemapFiles = buildSitemapDocuments(sitemapEntries, metadata.lastUpdated);
  await Promise.all(sitemapFiles.map(file => writeFile(path.join(distDir, file.filename), file.xml, 'utf8')));

  const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  await writeFile(path.join(distDir, 'robots.txt'), robots, 'utf8');

  const sampleMatch = catalog.matches[0];
  const sampleRival = catalog.rivals.find(rival => rival.name === 'Alianza Lima') || catalog.rivals[0];
  const sampleCountry = catalog.countries.find(country => country.name === 'Argentina') || catalog.countries[0];
  const sampleSeason = catalog.seasons[0];
  const matchHtml = pages.find(page => page.path === sampleMatch.path).html;
  const rivalHtml = pages.find(page => page.path === sampleRival.path).html;

  assertContains('home', homeHtml, [
    homeTitle,
    `rel="canonical" href="${SITE_URL}/"`,
    '<h1 class="section-title">Archivo histórico de Sporting Cristal</h1>',
    'href="/partidos"',
    'href="/rivales"',
    '"@type":"WebSite"',
    '"@type":"SportsTeam"',
    '"name":"Sporting Cristal"',
    'lang="es-PE"',
    'twitter:card" content="summary_large_image"',
    `og:image" content="${SITE_URL}${OG_IMAGE_PATH}"`,
  ]);
  assertContains('match', matchHtml, [
    '<h1 class="section-title">',
    sampleMatch.match.scoreLabel,
    sampleMatch.match.tournament,
    `rel="canonical" href="${absoluteUrl(sampleMatch.path)}"`,
    '"@type":"SportsEvent"',
    '"homeTeam"',
    '"awayTeam"',
    '"startDate"',
    rivalPathByName(catalog, sampleMatch.match.opponent),
    seasonPathByYear(sampleMatch.match.year),
  ]);
  assertContains('rival', rivalHtml, [
    sampleRival.name,
    `rel="canonical" href="${absoluteUrl(sampleRival.path)}"`,
    '"@type":"BreadcrumbList"',
  ]);
  assertContains('404', notFoundHtml, ['Página no encontrada', 'noindex,nofollow']);

  const generatedPages = pages.length;
  process.stdout.write(
    `Generated ${generatedPages} public HTML pages (${pageCount.matches} matches, ${pageCount.rivals} rivals, ${pageCount.countries} countries, ${pageCount.seasons} seasons) and ${sitemapEntries.length} sitemap URLs.\n`,
  );

  return {
    generatedPages,
    sitemapUrls: sitemapEntries.length,
    pageCount,
    sampleMatch,
    sampleRival,
    sampleCountry,
    sampleSeason,
    sitemapFiles: sitemapFiles.map(file => file.filename),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  generatePublicPages().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
