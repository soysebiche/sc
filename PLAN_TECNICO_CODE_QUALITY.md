# Plan técnico — fixes de la auditoría thermo-nuclear

Fecha: 2026-08-13  
Origen: `THERMO_NUCLEAR_CODE_QUALITY_REVIEW.md`  
Objetivo: aplicar todos los code judo del informe **sin cambiar comportamiento de producto**.

Este documento es el plan de ejecución. No es un rediseño visual, no es una migración a TypeScript y no toca el JSON publicado.

## Invariantes (no negociables)

Cualquier PR que rompa uno de estos se rechaza:

1. **URLs compartibles.** Nombres y semántica de query params se conservan:

   | Param | Default | Vista |
   |---|---|---|
   | `view` | `efemerides` | chrome |
   | `date` | hoy `YYYY-MM-DD` | efemérides |
   | `year`, `month`, `page` | vacío / `1` | partidos |
   | `tournament`, `decade` | `todos` / `all` | año |
   | `rival`, `rivalYear`, `rivalPage` | vacío / `1` | rivales |
   | `country`, `countryYear`, `countryPage` | vacío / `1` | países |

   `view` usa `history.push`. El resto, `replace`. Alias `Union Comercio` → `Unión Comercio` sigue normalizándose al hidratar.

2. **Contrato de publicación.** `historico_completo_sc.json` conserva las 13 claves en español y el orden actual. Los skills RSSSF/calendario siguen hablando ese contrato. El modelo interno nuevo se deriva; no se reescribe el archivo.

3. **Paginación.** `MATCHES_PER_PAGE = 18`. Alianza Lima 140 → 18 por página. Argentina 60 → 18.

4. **Consentimiento.** Cero GA4 / RUM antes de `accepted`. Payload de vitals sin texto de filtros.

5. **Gate.** Cada PR cierra con `npm run check` verde. `App.test.js` es el contrato de journeys; ampliarlo, no debilitarlo.

6. **Fuera de alcance.** TypeScript, React Router, remount de Trivia/Login, cambio de densidad visual, cambio de paleta, autenticación.

## Estrategia de corte

Cinco PRs apilados, cada uno mergeable solo. No mezclar borrado con refactor de dominio ni CSS con shell.

```
P1 legado/docs  →  P2 listas/DTO  →  P3 shell/URL  →  P4 parseMatch  →  P5 CSS
```

P4 puede empezar en paralelo a P3 si solo toca `domain/` + `scripts/audit-data.mjs` y deja las vistas para un follow-up. No mezclar P4 de vistas con P3: `MatchRow` migraría dos veces.

Estimación de invasividad (no de calendario):

| PR | Superficie | Riesgo de regresión | Por qué ese orden |
|---|---|---|---|
| P1 | delete + docs | bajo | quita ruido; nada vivo importa esos archivos |
| P2 | 6–8 archivos de UI/dominio | bajo-medio | unifica copias **antes** de mover estado |
| P3 | App + hook URL + 4 features | medio | el movimiento grande; entra más barato si P2 ya unificó |
| P4 | domain + auditor + MatchRow | medio | una frontera; las vistas ya están unificadas |
| P5 | CSS | medio visual | al final, cuando hay menos markup dual |

---

## P1 — Borrar el museo y alinear docs

### Qué desaparece

```
src/components/Login.js
src/components/Login.css
src/components/Trivia.js
src/components/ui/Card.js
src/components/ui/Button.js
src/components/ui/Badge.js
src/components/ui/index.js
src/data/triviaQuestions.js
src/services/authService.js
src/utils/icons.js
src/reportWebVitals.js
src/styles/design-system.css
src/legacy-manifest.json
normalize-rivals.js
normalize-teams.js
fix-team-countries.js
design-system-demo.html
```

Los one-off de raíz **se borran**, no se archivan. `RIVAL_ALIASES` + el skill RSSSF son el camino canónico. Git conserva el historial si hace falta un mapeo viejo.

### Docs y config

- `eslint.config.mjs`: eliminar `legacyFiles` entero, incluidas rutas fantasma (`useAnalytics.js`, `analyticsService.js`).
- `AGENTS.md`: quitar la nota de `legacy-manifest.json` (este PR ya lo corrigió en parte).
- `VERCEL_ANALYTICS_SETUP.md`: reescribir contra `VITE_GA_MEASUREMENT_ID` y los eventos reales (`page_view`, `archive_filter`, `archive_pagination`, `theme_change`, `calendar_subscribe`, `archive_load_error`). El doc actual lista eventos que el código no dispara.
- `.agents/skills/track-cristal-matches/references/publication-contract.md`: dejar de pedir `CI=true npm test` y el mito de “learn react”. Gate: `npm run test:ci` + `npm run test:data`.
- `SETUP_SIMPLE.md` / `SETUP_VERCEL_FUNCTIONS.md`: solo si aún hablan de CRA o `API_SECRET_TOKEN`.

### Extra barato en el mismo PR

`src/services/vercelDataService.js` → una función:

```js
export async function loadArchive() {
  const module = await import('../data/historico_completo_sc.json');
  return module.default;
}
```

`App` usa `loadArchive()` y deja de leer `{ completo }`. Borrar la clase.

### Tests

- `npm run check`.
- Grep de control: cero imports a `Login`, `Trivia`, `authService`, `reportWebVitals`, `triviaQuestions`.
- Bundle: el chunk de trivia no debe aparecer en `dist/`.

### Done

`src/` no contiene prototipos. Un agente nuevo no puede “arreglar” Login. Docs de medición coinciden con `analytics.js`.

---

## P2 — Un historial, una lista, un DTO de resumen

### 2.1 `MatchesView` usa `PaginatedMatchList`

Hoy `MatchesView` copia kicker + `MatchRow` + `Pagination`. Sustituir el bloque por:

```js
<PaginatedMatchList
  matches={matches}
  page={page}
  setPage={setPage}
  label="Paginación del archivo de partidos"
  emptyTitle="No hay partidos con esos filtros"
  emptyMessage="Prueba otro año o mes."
/>
```

Filtros año/mes se quedan en `MatchesView`. Paginación deja de calcularse en `App` (si P3 aún no movió estado, `App` puede seguir pasando `matches` + `page`; no pasar `pagination`).

### 2.2 `EntityHistory` reemplaza Rivales y Países

Nuevo: `src/features/EntityHistory.js`.

Contrato (un componente, dos configs):

```js
const RIVALS = {
  title: 'HISTORIAL VS RIVALES',
  subtitle: 'El registro completo frente a cada rival',
  entityKey: 'rival',
  yearKey: 'rivalYear',
  pageKey: 'rivalPage',
  control: 'combobox',
  entityLabel: 'Buscar rival',
  emptyPrompt: 'Selecciona un rival para ver el historial completo de enfrentamientos',
  collect(matches) { /* unique getOpponent, countryMap, sorted */ },
  matches(match, selected) { return getOpponent(match) === selected; },
  canonicalize: canonicalizeRival,
  countryOf: (option, countryMap) => countryMap[option],
};

const COUNTRIES = {
  title: 'HISTORIAL VS PAÍSES',
  /* country / countryYear / countryPage, control: 'select' */
  collect(matches) { /* País !== Perú */ },
  matches(match, selected) { return match.País === selected; },
};
```

`App` (o, tras P3, el mapa de vistas) renderiza `<EntityHistory matches={data} config={RIVALS} />`.

Borrar `src/components/RivalHistory.js` y `src/components/CountryHistory.js`.

Comportamiento que hay que clonar con tests, no “aproximar”:

- Input `list` + datalist con país no peruano en `<option>`.
- Select de países, sin Perú.
- Reset de página a `1` al cambiar entidad o año.
- Año deshabilitado sin entidad.
- Copy de empty states y `Balance vs X (año)`.

### 2.3 Un contrato de `summarizeMatches`

`calculateArchiveOverview` deja de renombrar:

```js
return {
  ...summarizeMatches(matches),
  maxScGoals,
  bestRival,
  worstRival,
  totalIntlCountries,
};
```

`DashboardView` usa `overview.total`, `overview.goalsFor`, `overview.winPercentage`. No recalcula tasas.

`DistributionBar({ stats })` únicamente. Quitar `wins` / `draws` / `losses` / `total`. `DashboardView` y `BalanceSummary` pasan el mismo objeto.

`maxScGoals` hoy se calcula y **no se pinta**. O se muestra en dashboard o se deja de calcular. Preferencia: dejar de calcularlo. Si aparece en metadata/auditoría, no es de esta vista.

### Tests P2

Existentes (no romper):

- rival URL + alias Unión Comercio + 32 partidos
- paginación Alianza 140 → `rivalPage=2`
- países Argentina 60 → `countryPage=2`

Nuevos:

- `DistributionBar` sin props sueltas: un test de dominio o de componente que falle si reaparece el contrato dual.
- Overview: `calculateArchiveOverview` expone `total` y `winPercentage`, no `totalMatches`.

### Done

Un archivo de historial. Una lista paginada. Un shape de resumen. Cero `totalMatches` en UI.

---

## P3 — `App` como shell y un store de URL

Este es el PR que cambia cómo se razona el runtime. El producto se ve igual.

### 3.1 Store de search params

Reemplazar N `useUrlState` por un provider con **un** `popstate` y **un** `URLSearchParams`.

```js
// src/hooks/urlState.js
<UrlStateProvider>
  // lee window.location.search una vez
  // subscribe(listener)
  // set({ key: value, ... }, { history: 'replace' | 'push' })
</UrlStateProvider>

useUrlParam(key, defaultValue, { validate, history })
```

Reglas:

- `set` atómico: cambiar año y resetear `page` es **una** escritura a `history`, no dos `replaceState` seguidos.
- Defaults se omiten de la URL (igual que hoy).
- `validate` inválido → default, no se persiste basura.
- `trackUrlControl` **no** vive en el hook. Un único efecto en `App` (o `useArchiveAnalytics`) compara el snapshot anterior de keys allowlisteadas y dispara eventos. El allowlist actual en `analytics.js` se reutiliza.

Tests de hook **antes** de migrar vistas:

- hidratar `?view=rivales&rival=Alianza%20Lima`
- borrar param al volver al default
- `push` vs `replace`
- un `popstate` actualiza todas las keys
- set batch `year` + `page`

Mantener `useUrlState` como wrapper de una línea durante la migración, luego borrar.

### 3.2 `App` solo chrome + dataset

Estado que se queda en `App`:

- `matches` (archivo cargado)
- `dataStatus` (`loading` | `ready` | `error`)
- `theme`
- `measurementChoice`
- `view` (URL)

Estado que **sale** de `App`:

- date, year/month/page, tournament/decade, sort, selected year for stats
- todos los `useMemo` de las líneas 117–137

Carga:

```js
const reload = () => {
  setDataStatus('loading');
  loadArchive().then(setMatches, onError);
};
```

Sin contador `loadAttempt`. Cleanup de carrera con `isActive` se conserva.

Tema: extraer `useTheme`. El `setTimeout(350)` de `theme-transition` se cancela en unmount. El script inline de `index.html` se queda (anti-FOUC); `App` no vuelve a adivinar el valor inicial distinto al del DOM.

### 3.3 Dispatcher de vistas

```js
const VIEWS = {
  efemerides: EfemeridesView,
  dashboard: DashboardView,
  partidos: MatchesView,
  'analisis-anual': AnnualAnalysisView,
  rivales: (props) => <EntityHistory {...props} config={RIVALS} />,
  paises: (props) => <EntityHistory {...props} config={COUNTRIES} />,
};

const View = VIEWS[activeTab];
{dataStatus === 'ready' && <View matches={matches} />}
```

Cada vista:

| Vista | Qué deriva internamente |
|---|---|
| `DashboardView` | `calculateArchiveOverview(matches)` |
| `EfemeridesView` | `date` URL, `getMatchesForDayMonth`, `summarizeMatches` |
| `MatchesView` | `year`/`month`/`page`, `getUniqueYears/Months`, `filterMatchesByYearAndMonth` |
| `AnnualAnalysisView` | `decade`/`tournament`, sort local, chart, año efectivo |
| `EntityHistory` | ya lo hace |

`TABS` se genera de `Object.keys(VIEWS)` + labels, para que no exista un tab sin vista.

### Tests P3

- Toda `App.test.js` intacta, sobre todo URL de rivales/países y sort de año.
- Nuevo: `useUrlParam` / store (arriba).
- Nuevo: back del browser restaura `view` y filtros (hoy no está cubierto de forma explícita).
- Listeners: no hace falta assert de conteo; un test de `popstate` que cambie dos keys a la vez basta como prueba de un solo reloj.

### Done

`App.js` < ~150 líneas, sin imports de `calculateYearlyStats` ni `paginateMatches`. Una sola suscripción a `popstate`. Vistas independientes entre sí.

---

## P4 — Frontera de dominio: `parseMatch`

El JSON crudo no sale del loader. Las vistas no vuelven a escribir `match['Equipo Local']`.

### 4.1 Modelo interno

```js
parseMatch(record) => ({
  year: number | null,
  month: string | null,          // MONTH_NAMES
  date: string,                  // YYYY-MM-DD | 'TBD'
  tournament: string,
  home: string,
  away: string,
  opponent: string,              // ya canonicalizado
  country: string,
  scoreLabel: string,            // Marcador crudo para UI
  goalsNote: string | null,
  isHome: boolean,
  scGoals: number | null,
  opponentGoals: number | null,
  resultCode: 'V' | 'E' | 'P' | null,
})
```

Helpers extraídos y **únicos**:

- `parseCalendarDate(value)` → `{ valid, date, year, monthIndex }` o null. Adiós a `new Date(\`${x}T00:00:00\`)` suelto.
- `resultFromScoreAndNote({ scGoals, opponentGoals, resultField, goalsNote })` — misma regla que hoy, incluida la regex de penales.

`loadArchive()` mapea `records.map(parseMatch)` una vez.

`getScore` / `getOpponent` / `getYearFromMatch` sobre el record crudo quedan como adaptadores usados solo por el auditor y por tests de migración, o se reescriben contra el modelo interno. No mantener dos caminos.

### 4.2 Auditor

`scripts/audit-data.mjs` importa `resultFromScoreAndNote` y `parseCalendarDate` desde `src/domain/matches.js` (ESM, sin JSX: viable). Deja de copiar `/perdi[oó].*penal/`. Sigue validando las 13 claves del JSON crudo **antes** de parsear: el contrato de publicación no se diluye.

Vitest de dominio: el caso `0-0` + `(Perdió 5-4 en penales)` se corre contra `resultFromScoreAndNote` y contra `auditArchive` con el mismo fixture.

### 4.3 UI

`MatchRow`, filtros, efemérides y `EntityHistory` leen `match.home`, `match.date`, `match.resultCode`. Clave de lista: `${date}-${home}-${away}` (el índice de desempate solo si hace falta).

Efemérides: el copy “un 4 de agosto” usa `parseCalendarDate`, no `new Date` en JSX.

### Tests P4

- Todos los tests actuales de `matches.test.js` reescritos al modelo nuevo, mismos asserts.
- Un test de golden: 3 records reales del JSON (un local, un visita, un penal) dan el mismo `resultCode` que producción actual.
- `audit-data.test.mjs` sigue fallando ante marcador/resultado incoherente.

### Done

Grep: cero `match['Equipo Local']` y cero `T00:00:00` fuera de `parseCalendarDate`. Una regex de penales en el repo.

---

## P5 — CSS: dos archivos con oficio, no tres sistemas

No es un restyle. Es borrar ambigüedad.

### Política final

| Capa | Dónde |
|---|---|
| Tokens (`:root`, `[data-theme="dark"]`) | `src/index.css` |
| Componentes editoriales (header, match-row, tabs, table) | `src/App.css` o `src/styles/archive.css` (un archivo, nombre honesto) |
| Layout utilitario (`max-w-7xl`, `flex`, `sr-only`) | Tailwind, permitido |
| Color / tipografía en `style={{}}` | prohibido en JSX nuevo; migrar los existentes |

Acciones:

1. Borrar `src/styles/design-system.css` si P1 no lo hizo. `design-system-demo.html` fuera.
2. Quitar `!important` del header en `App.css`. Si el conflicto es Tailwind preflight, subir especificidad con `header.app-header`, no con `!important`.
3. Sustituir `style={{ color: 'var(--text-secondary)' }}` y similares en features/components por clases (`.section-subtitle`, `.stat-label`, etc.) que **ya existen**.
4. `DistributionBar` anchos de barra: esos `style={{ width }}` se quedan (son datos). Color vía clase, no inline, si no exige un mapa dinámico incómodo.
5. No introducir Framer, no tocar `DESIGN_VARIANCE`, no rehacer el header.

### Tests P5

- `npm run check`.
- Smoke manual mínimo: 390px, claro/oscuro, las seis vistas, skip link, targets 44px del toggle. No hace falta Lighthouse de nuevo si no cambió markup.
- Screenshot no requerido; si algo “se ve distinto”, revertir el selector, no parchear a ojo.

### Done

Un import de tokens + un import de componentes. Cero `!important` de marca. Cero `style=` de color en JSX de archivo.

---

## Trabajo transversal (se hace dentro del PR que lo toque)

| Ítem | PR |
|---|---|
| `loadArchive()` | P1 |
| Tema con cleanup de timeout | P3 |
| Analytics fuera del hook de URL | P3 |
| Mover historiales a `features/` | P2 |
| `api/data` | no se borra; sigue siendo endpoint público opcional del mismo JSON. Añadir un comentario de una línea en el handler si aún parece un segundo dataset |
| TypeScript | no |
| Renombrar params de URL | no |

## Contrato de tests a preservar (números actuales)

Estos asserts son anclas de dataset. Si el JSON crece, se actualizan con el alta de datos, **no** se aflojan en un PR de refactor:

- Header: `1937 Partidos` (hoy).
- Alianza Lima: 140 partidos, 18 en página 1.
- Unión Comercio: 32 partidos.
- Argentina: 60 partidos.
- Tabla anual: primer row 2026 desc; tras sort asc, 1956.
- Dos links de calendario con el mismo `aria-label`.

## Orden de implementación recomendado para un agente

1. P1 en un branch `cursor/purge-legacy-…`. Merge.
2. P2 sobre `main`. Merge.
3. P3: escribir tests del store **primero**, luego migrar `App`.
4. P4: extraer `parseCalendarDate` / `resultFromScoreAndNote` con tests, luego `parseMatch`, luego UI.
5. P5 al final, diff CSS aislado para review visual.

No abrir P3 y P4 a la vez sobre las mismas vistas.

## Definición de hecho del programa completo

La auditoría thermo-nuclear **aprueba** cuando:

- no queda árbol `not-mounted` en `src/`
- `App` no deriva stats de vistas inactivas
- Rivales y Países son configs, no forks
- el JSON crudo no cruza `MatchRow`
- docs de agentes y GA4 describen Vite y `VITE_*`
- `npm run check` verde y `App.test.js` sigue cubriendo las URLs de arriba

Hasta P3, el repo ya se puede leer en un sitting. P4 evita el próximo bug de penales. P5 evita que el siguiente cambio de color se haga en tres sitios.
