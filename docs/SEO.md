# SEO de páginas públicas

Sebiche Celeste es una SPA de Vite + React. El HTML del bundle tiene un `#root` vacío, así que Google no puede indexar partidos, rivales o temporadas si cada URL reescribe al homepage.

Las rutas públicas se **pre-renderizan en el build** desde `src/data/historico_completo_sc.json`. El HTML estático ya trae título, descripción, `lang="es-PE"`, canonical propio, Open Graph, Twitter `summary_large_image`, JSON-LD y texto visible con enlaces internos.

El generador es `scripts/generate-public-pages.mjs`. Se ejecuta al final de `npm run build` y escribe, en `dist/`:

- `/index.html` (inicio: WebSite + SportsTeam + BreadcrumbList)
- `/partidos/index.html` y `/partidos/{id}/index.html` para cada partido (SportsEvent + BreadcrumbList)
- `/rivales/index.html` y `/rivales/{slug}/index.html`
- `/paises/index.html` y `/paises/{slug}/index.html`
- `/temporadas/index.html` y `/temporadas/{año}/index.html`
- `/404.html` para URLs desconocidas (`noindex`)
- `/og-image.png` (1200×630)
- `/sitemap.xml` (índice de sitemaps si hay más de 50.000 URLs)
- `/robots.txt`

No se inventan partidos, rivales, países ni temporadas: solo salen valores que ya están en el archivo. Los parámetros compartibles (`view`, `rival`, `country`, `year`, …) no cambian. `seo-boot.js` lee `<meta name="sc-spa">` y deja la SPA en la vista equivalente para que, tras hidratar, el archivo se comporte como siempre.

## Vercel

`vercel.json` **no** reescribe `/(.*)` hacia `/index.html`. Solo existen archivos HTML para rutas conocidas. Cualquier otra URL cae en `404.html` con status 404 (Vercel sirve ese archivo cuando no hay rewrite catch-all). Las query string (`/?view=rivales&rival=Alianza%20Lima`) siguen funcionando porque piden `/`, que sí es un archivo real.

`/api/*` permanece en las serverless functions.

## Sitemap y robots

El sitemap se genera en el build con una `<loc>` por URL pública, más `/privacidad.html` y `/case-study-sebiche-impact.html`. Si el recuento supera 50.000 URLs, `sitemap.xml` pasa a ser un índice (`sitemap-1.xml`, `sitemap-2.xml`, …). `robots.txt` apunta a `https://celeste.sebiche.com/sitemap.xml` y no indexa `/api/`.

## Verificación local

```bash
npm run build
```

`scripts/verify-seo-html.mjs` levanta un servidor estático con las mismas reglas (archivo real o `404.html` con 404) y comprueba:

- `GET /` trae H1, canonical del homepage, `lang="es-PE"`, WebSite, SportsTeam y `twitter:card=summary_large_image`
- un partido, un rival, un país y una temporada tienen canonical propio y contenido en el HTML
- cada partido enlaza a su rival y a su temporada, con SportsEvent (`homeTeam`, `awayTeam`, `startDate`)
- `GET /no-existe-esta-ruta` responde 404
- el sitemap lista todas las URLs públicas
