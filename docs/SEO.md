# SEO de páginas públicas

Sebiche Celeste es una SPA de Vite + React. El HTML del bundle tiene un `#root` vacío, así que Google no puede indexar partidos, rivales o temporadas si cada URL reescribe al homepage.

Las rutas públicas se **pre-renderizan en el build** desde `src/data/historico_completo_sc.json`. El HTML estático ya trae título, descripción, `lang="es-PE"`, canonical propio, Open Graph, Twitter `summary_large_image`, JSON-LD y texto visible con enlaces internos.

En `/partidos/{id}`, `/jugadores/{slug}`, `/rivales/{slug}`, `/paises/{slug}`, `/temporadas/{año}` y sus índices, el documento prerenderizado **se conserva**: `seo-boot.js` no reescribe la URL bonita a `/?view=…` y el bundle no monta la SPA encima. Así el HTML único (H1, marcador, fecha, competición, condición, goles, historial y prev/next) sigue visible después de ejecutar JavaScript. El homepage (`/`) sí hidrata el archivo interactivo. Las query string compartibles (`/?view=rivales&rival=Alianza%20Lima`) siguen sirviendo `/` y no cambian de nombre.

El generador es `scripts/generate-public-pages.mjs`. Se ejecuta al final de `npm run build` y escribe, en `dist/`:

- `/index.html` (inicio: WebSite + SportsTeam + BreadcrumbList)
- `/partidos/index.html` y `/partidos/{id}/index.html` para cada partido (SportsEvent + BreadcrumbList, título/H1 únicos, prev/next)
- `/jugadores/index.html` y `/jugadores/{slug}/index.html` para cada goleador de Sporting Cristal (Person + ItemList de partidos con gol; sin autogoles)
- `/rivales/index.html` y `/rivales/{slug}/index.html` (listado completo vs. ese rival + ItemList)
- `/paises/index.html` y `/paises/{slug}/index.html`
- `/temporadas/index.html` y `/temporadas/{año}/index.html` (cada partido de la temporada)
- `/404.html` para URLs desconocidas (`noindex`)
- `/og-image.png` (1200×630)
- `/sitemap.xml` (índice) más `sitemap-pages.xml`, `sitemap-players.xml`, `sitemap-rivals.xml`, `sitemap-countries.xml`, `sitemap-seasons.xml` y `sitemap-matches.xml`
- `/robots.txt`

No se inventan partidos, jugadores, rivales, países ni temporadas: solo salen valores que ya están en el archivo. Los autogoles (`Name (71og)`) no generan ficha. Los parámetros compartibles (`view`, `rival`, `country`, `year`, …) no cambian. Cada página pública enlaza a `/?view=…` como “archivo interactivo” con `rel="nofollow"` para no pasar equidad a una variante de query.

El homepage hidratado y el nav principal conservan enlaces reales a `/partidos`, `/jugadores`, `/rivales`, `/paises` y `/temporadas`. Cada fila de partido del SPA apunta a `/partidos/{id}`. Los nombres de goleadores del archivo enlazan a `/jugadores/{slug}`. Las fichas de rival/país del SPA enlazan a su página pública. Cada partido prerenderizado enlaza a su rival, su temporada, prev/next cronológico, prev/next del mismo rival y unos partidos del mismo torneo, con migas de pan visibles y `BreadcrumbList` JSON-LD.

## Vercel

`vercel.json` **no** reescribe `/(.*)` hacia `/index.html`. Solo existen archivos HTML para rutas conocidas. Cualquier otra URL cae en `404.html` con status 404 (Vercel sirve ese archivo cuando no hay rewrite catch-all). Las query string (`/?view=rivales&rival=Alianza%20Lima`) siguen funcionando porque piden `/`, que sí es un archivo real.

Canonicales (un solo URL absoluto por documento, igual al sitemap):

- `trailingSlash: false` (308 de `/ruta/` a `/ruta`)
- redirects permanentes de `/index.html` y `/:path/index.html` a la ruta limpia
- `www.celeste.sebiche.com` redirige a `https://celeste.sebiche.com`
- cada HTML auto-canonicaliza `https://celeste.sebiche.com` + path sin barra final (salvo el homepage)
- 308 de variantes: mayúsculas en rutas de archivo, `/celeste/…`, prefijos `/en` y `/es`, alias en inglés/singular (`/matches`, `/partido`, `/rivals`, `/seasons`, `/countries`, `/players`, `/goleadores`, …) y query string sobre páginas de archivo
- no hay rutas `/en` ni `/es` reales; el sitio es `es-PE`. `sebiche.com/celeste` no se sirve en este proyecto; `/celeste/…` en este host redirige al path canónico

`/api/*` permanece en las serverless functions. `middleware.js` aplica las mismas reglas de 308 que el verificador local.

## Sitemap y robots

El sitemap se genera en el build como **índice por tipo**. Cada `loc` es el canonical absoluto de esa página. Cada partido lleva `lastmod` igual a su fecha; índices usan la fecha de actualización del archivo; fichas de rival/país/temporada usan la fecha del partido más reciente de ese grupo. Si un grupo supera 50.000 URLs, se parte en `sitemap-{grupo}-1.xml`, `sitemap-{grupo}-2.xml`, … `robots.txt` apunta a `https://celeste.sebiche.com/sitemap.xml` y no indexa `/api/`.

## Verificación local

```bash
npm run build
```

`scripts/verify-seo-html.mjs` levanta un servidor estático con las mismas reglas (archivo real, 308 de duplicados o `404.html` con 404) y comprueba:

- `GET /` trae H1, canonical del homepage, `lang="es-PE"`, WebSite, SportsTeam y `twitter:card=summary_large_image`
- un partido, un jugador, un rival, un país y una temporada tienen canonical propio y contenido en el HTML
- cada partido enlaza a su rival, su temporada, partidos contiguos, el mismo torneo y BreadcrumbList, con SportsEvent (`homeTeam`, `awayTeam`, `startDate`)
- `GET /partidos/{id}/`, `.../index.html`, mayúsculas, `/matches/…`, `/en/…`, `/celeste/…` y `?utm=` responden 308 al canonical
- `GET /no-existe-esta-ruta` responde 404
- el sitemap índice lista todas las URLs públicas, con `lastmod` distinto entre partidos y `loc` igual al canonical
