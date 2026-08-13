# Thermo-Nuclear Code Quality Review — Sebiche Celeste

Fecha: 2026-08-13  
Alcance: repositorio completo en `main` (`6af7edb`), no un diff de feature.  
Rúbrica: `thermo-nuclear-code-quality-review` (simplificación estructural, code judo, archivos gigantes, spaghetti, fronteras de dominio).

## Veredicto

**No aprueba.** El producto vivo es un archivo estático coherente y las vistas activas ya están razonablemente partidas. Eso no basta. El repo conserva un segundo producto muerto, un orquestador que calcula las seis vistas a la vez, dos historiales casi idénticos y un modelo de dominio que sigue siendo la hoja de cálculo.

La barra de esta rúbrica no es “funciona y Lighthouse está verde”. Es: ¿el diseño se siente inevitable? Hoy no. Hay caminos claros para borrar capas enteras sin cambiar comportamiento.

Lo que sí está bien y no hay que deshacer:

- `src/domain/matches.js` es el lugar canónico correcto para reglas de marcador, rival y paginación.
- Las seis áreas de producto existen; no hay un `App.js` de 2.000 líneas de JSX.
- El auditor de datos en `scripts/audit-data.mjs` es un contrato real, no un script decorativo.
- Las pruebas de `App.test.js` cubren journeys de producto, no el boilerplate de CRA.

## 1. Regresión estructural: el repo carga un museo junto al archivo

`src/legacy-manifest.json` declara prototipos “not-mounted”. ESLint los ignora. Siguen dentro de `src/`.

| Archivo | Líneas | Rol real |
|---|---:|---|
| `src/data/triviaQuestions.js` | 10.612 | Preguntas generadas. Nadie las importa en el árbol vivo. |
| `src/utils/icons.js` | 360 | Mapa de emojis. Cero imports. |
| `src/components/Trivia.js` | 186 | UI de un producto distinto. |
| `src/components/Login.css` | 383 | Estilos de un login que no se monta. |
| `src/components/Login.js` + `src/services/authService.js` | 143 | Auth Bearer contra un dataset público. |
| `src/components/ui/{Card,Button,Badge}` | 65 | Wrappers de una clase CSS. Solo los usa Trivia. |
| `src/reportWebVitals.js` | 13 | CRA + `getFID`. El runtime usa `observability/webVitals.js` (`onINP`). |
| `src/styles/design-system.css` | 2 | Stub vacío. Solo lo enlaza `design-system-demo.html`. |
| `normalize-rivals.js`, `normalize-teams.js`, `fix-team-countries.js` | 240 | Scripts de raíz que **escriben** `historico_completo_sc.json`. |

Eso son ~12.000 líneas que un lector tiene que clasificar como “no existen” usando un manifiesto. El code judo aquí no es “organizar el legado”. Es **borrarlo o sacarlo de `src/`**. Mientras viva al lado del archivo, cada búsqueda, cada review y cada agente vuelve a tropezar con Login, Trivia y `process.env.REACT_APP_*`.

`authService.js` todavía lee `process.env.REACT_APP_API_URL` en un proyecto Vite. No está montado, pero el contrato de agentes (`AGENTS.md`) todavía habla de CRA, del test “learn react” y de `API_SECRET_TOKEN`. Esa documentación miente y va a hacer que el siguiente agente implemente el pasado.

**Remedio:** borrar el manifiesto y todo lo que lista. Mover mutaciones one-shot a `scripts/one-off/` o eliminarlas: el auditor y `RIVAL_ALIASES` ya son el camino canónico. Actualizar `AGENTS.md` para que describa Vite, `npm run check` y el dataset estático.

## 2. Code judo: `App.js` calcula las seis vistas aunque solo se ve una

`App` no es un shell. Es el dueño de:

- carga de datos y retry
- tema
- consentimiento + analytics + web vitals
- 8 parámetros de URL
- overview, años, meses, partidos filtrados, paginación, efemérides, décadas, stats anuales, sort, chart y año efectivo

Aunque `activeTab === 'efemerides'`, se ejecutan `calculateYearlyStats`, `filterMatchesByYearAndMonth`, `calculateArchiveOverview` y el resto. Los `useMemo` evitan trabajo sucio en cada keystroke; no evitan que el módulo mezcle seis features.

Además, `useUrlState` registra un `popstate` **por clave**. Solo `App` abre 8 listeners; Rivales y Países suman 6 más. El estado compartible es el producto correcto. La implementación es N relojes independientes sobre el mismo `search`.

**Remedio (un solo movimiento, no un refactor ornamental):**

1. `App` carga el dataset, pinta chrome y despacha la vista activa.
2. Cada vista lee sus propios params de URL y deriva sus propias agregaciones.
3. Un único store de search params (un listener, un `URLSearchParams`) reemplaza N `useUrlState`.

Eso borra el bloque de `useMemo` de las líneas 117–137, deja de pasar 12 props a `AnnualAnalysisView`, y hace que Rivales/Países dejen de ser la excepción “porque ya tenían estado interno”.

Hoy el diseño es inconsistente a propósito:

- Dashboard / Efemérides / Partidos / Año: estado y datos viven en `App`.
- Rivales / Países: estado y datos viven en el componente.

Eso no es arquitectura. Es sedimentación.

## 3. Spaghetti por copia: tres listas de partidos, dos historiales

`PaginatedMatchList` ya sabe paginar, anunciar el rango y renderizar `MatchRow`. `MatchesView` vuelve a escribir el mismo markup (~20 líneas idénticas). Eso no es una variación de producto; es un fork.

`RivalHistory` (118 líneas) y `CountryHistory` (96 líneas) son el mismo flujo:

1. Selector de entidad + año opcional.
2. Filtrar + `summarizeMatches`.
3. `BalanceSummary` + `PaginatedMatchList`.
4. Empty state.

La única diferencia real es cómo se obtiene la entidad (`getOpponent` vs `match.País !== 'Perú'`) y si el control es `<input list>` o `<select>`. Mantener dos archivos garantiza que el siguiente filtro (torneo, local/visita) se aplique en uno y se olvide en el otro.

`DashboardView` recalcula `winRate` / `drawRate` / `lossRate` aunque `summarizeMatches` ya devuelve `winPercentage`. `calculateArchiveOverview` aplana ese resumen a `{ totalMatches, victories, ... }` y el dashboard lo vuelve a porcentualizar. `DistributionBar` acepta **dos contratos** (`stats` o `{wins, draws, losses, total}`) para tapar esa divergencia.

**Remedio:** un `EntityHistory` parametrizado por `{ id, label, options, matchEntity }`. `MatchesView` usa `PaginatedMatchList`. `DistributionBar` solo recibe el objeto de `summarizeMatches`. `calculateArchiveOverview` deja de inventar un DTO paralelo: o reutiliza el resumen o añade `bestRival` / `worstRival` encima, sin renombrar `total` a `totalMatches`.

## 4. Frontera de dominio: la hoja de cálculo *es* el modelo

El contrato de 13 claves en español (`Equipo Local`, `Goles (Solo SC)`, `País`, `Dia` sin tilde vs `Día de la Semana`) es correcto **en el JSON**. No debería ser el tipo que cruzan UI, agregaciones y tests.

Hoy `MatchRow`, `RivalHistory`, `CountryHistory`, `MatchesView`, `EfemeridesView` y `domain/matches.js` todos hablan `match['Equipo Local']`. No hay un `Match` canónico con `home`, `away`, `date`, `score`, `goalsNote`. Cada vista reimplementa trozos de parseo de fecha:

```js
new Date(`${match.Fecha}T00:00:00`)
```

aparece en `getYearFromMatch`, `getUniqueMonths`, `filterMatchesByYearAndMonth`, `formatMatchDate`, `sortMatchesNewest` y en JSX de efemérides.

`getResultCode` mete un caso especial de penales con regex sobre texto libre en medio de la comparación de goles. El auditor duplica esa misma regex. Si el copy cambia de “Perdió 5-4 en penales” a otro fraseo, UI y auditor divergen.

`RIVAL_ALIASES` vive en dominio (bien). Los scripts de raíz (`normalize-teams.js`, `fix-team-countries.js`) son otro diccionario, otro runtime y escriben el dataset canónico sin pasar por el auditor.

**Remedio:** un `parseMatch(record)` en `domain/` que salga con un objeto plano en inglés (o al menos sin brackets). El JSON crudo queda detrás de esa frontera. Extraer `parseMatchDate` y `resultFromScoreAndNote` y usarlos en el auditor. Los one-off de normalización no deben poder mutar `src/data/` sin `npm run test:data`.

Esto no pide TypeScript. Pide un tipo de hecho: una sola forma de partido después de entrar al dominio.

## 5. Tamaño y capas que no se ganan su sitio

Ningún archivo vivo cruza 1.000 líneas. El problema de tamaño está en **triviaQuestions.js (10.612)** y en CSS partido:

- `src/index.css`: 766 líneas (tokens + sistema).
- `src/App.css`: 947 líneas (layout + componentes).
- Tailwind se importa y se usa a ratos (`space-y-4`, `w-full`, `sr-only`) mientras el look real vive en CSS a mano e `style={{ color: 'var(--text-secondary)' }}`.

`src/components/ui/*` son identity wrappers: `Card` = `div.card-static`, `Button` = `button.btn`. No simplifican nada. El runtime activo ni los usa.

`src/services/vercelDataService.js` es una clase con dos métodos para un `import()` del JSON. `fetchAllData()` envuelve el resultado en `{ completo }` — residuo de cuando había más tipos. `App` solo necesita el array.

Rivales y Países viven en `components/` aunque son features del mismo rango que `MatchesView`. El lector busca la sexta y séptima vista en `features/` y no están.

**Remedio:** borrar el “design system” de wrappers. Dejar `vercelDataService` como `loadArchive()` de una función. Mover `RivalHistory` y `CountryHistory` a `features/` (o al `EntityHistory` de la sección 3). Unificar CSS: tokens en un archivo, componentes en otro, sin tercera fuente vacía y sin `!important` en el header.

## 6. Abstracciones que esconden un modelo simple

- **Tabs como router.** `TABS` + 6 condicionales `dataStatus === 'ready' && activeTab === ...` es un dispatcher. Un mapa `VIEW_BY_ID` elimina el bloque y hace imposible añadir un tab sin vista.
- **Tema.** `toggleTheme` mete una clase, hace `setTimeout(350)` y asume que nadie desmonta el árbol. Un listener de `prefers-color-scheme` no existe después del valor inicial. El inline script de `index.html` y el `useState` de `App` duplican la misma regla.
- **Carga de datos.** `loadAttempt` como dependencia de `useEffect` es un retry con estado extra. Un `reload()` que llama otra vez a `loadArchive()` es más directo.
- **Analytics.** `services/analytics.js` está bien acotado. `useUrlState` no debería conocer `trackUrlControl`. El hook de URL mezcla persistencia y telemetría; cada set de filtro dispara un evento desde la capa equivocada.

## 7. Legibilidad y deuda operativa

`AGENTS.md` describe Create React App, puerto 3000, `CI=true npm test` y un test de “learn react” que **ya no existe**. `README.md` describe Vite 7, puerto 5173 y `npm run check`. Cualquier agente que lea `AGENTS.md` primero va a diagnosticar mal el repo.

`VERCEL_ANALYTICS_SETUP.md` sigue hablando de `REACT_APP_GA_MEASUREMENT_ID`. El código usa `VITE_GA_MEASUREMENT_ID`. `env.example` ya está bien; los docs no.

`eslint.config.mjs` ignora archivos que ya no existen (`src/hooks/useAnalytics.js`, `src/services/analyticsService.js`) y archivos que no deberían existir. La ignore list es un cementerio.

`api/data/index.js` relee el JSON del source tree en runtime. La UI no lo usa. Está documentado como compatibilidad. Cada copia del dataset es otra frontera que puede divergir del chunk de Vite.

## Plan de code judo (orden de impacto, sin cambiar comportamiento)

1. **Borrar el legado.** Trivia, Login, auth, ui wrappers, icons, reportWebVitals, CSS stub, scripts de raíz que mutan el JSON. Quitar las ignores de ESLint. Actualizar `AGENTS.md`.
2. **Un solo historial de entidad + `MatchesView` sobre `PaginatedMatchList`.** Desaparece `CountryHistory` como archivo y el fork de paginación.
3. **`App` como shell.** Las vistas derivan sus datos. Un store de URL. Mapa de vistas en vez de 6 `&&`.
4. **`parseMatch` + fecha/resultado canónicos.** El auditor reutiliza las mismas funciones. Adiós regex duplicada y `new Date(\`${Fecha}T00:00:00\`)` en seis sitios.
5. **`loadArchive()` y `DistributionBar({ stats })`.** Se van la clase Vercel y el DTO paralelo del dashboard.
6. **CSS en un sistema, no en tres.** Tokens + componentes. Sin Tailwind a medias y sin `style=` de color.

Los pasos 1–2 son mecánicos y seguros. El 3 es el que hace que el código se sienta inevitable. El 4 es el que evita el próximo bug de penales o de mes mal parseado.

## Qué no es un hallazgo de esta rúbrica

- Que el JSON use claves en español: es el contrato de publicación. El problema es filtrarlo a toda la UI.
- Que no haya TypeScript: el tamaño del runtime vivo no lo exige. Un `parseMatch` sí.
- Cobertura de usuarios reales / VoiceOver: eso es la auditoría UX de 2026-08-04, no maintainability.
- Recharts en lazy load: está bien puesto.

## Barra de aprobación, aplicada

| Criterio | Estado |
|---|---|
| Sin regresión estructural | Fallo: museo de 12k líneas en `src/` |
| Sin code judo evidente sin aplicar | Fallo: shell vs God-object, historiales gemelos |
| Sin archivo injustificado > 1k | Fallo: `triviaQuestions.js` |
| Sin spaghetti por casos especiales | Fallo parcial: penales por regex + `DistributionBar` dual |
| Sin wrappers / magia inútil | Fallo: `VercelDataService`, `ui/Button`, `{ completo }` |
| Lógica en la capa canónica | Fallo parcial: dominio bueno, UI y scripts lo rodean |
| Docs alineados al runtime | Fallo: `AGENTS.md` describe otro proyecto |

Cuando 1–3 estén hechos, este repo pasa de “archivo que funciona con deuda de migración” a “código que un extraño puede leer en un sitting”. Hasta entonces, no aprueba.
