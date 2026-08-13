# Thermo-Nuclear Code Quality Review — Sebiche Celeste

## Re-auditoría post P1–P5 — 2026-08-13

Alcance: árbol actual en `cursor/thermo-nuclear-code-quality-review-117f` (`78ca73e`), con P1–P5 ya aplicados.  
Rúbrica: la misma. La barra no bajó.

### Veredicto

**Aprueba.** Los bloqueos estructurales de la pasada anterior ya no están. El archivo se lee en un sitting: un loader, un store de URL, un historial parametrizado, un modelo parseado en la frontera, CSS en dos archivos. Lo que queda es residuo de migración, no un segundo diseño.

No es un 10. Hay wrappers de identidad y un poco de ceremonia en el shell. Ninguno de esos ítems vuelve a hacer el repo más enredado de lo que era esta mañana, y ninguno exige un sexto PR antes de merge.

### Barra, reaplicada

| Criterio | Antes | Ahora |
|---|---|---|
| Regresión estructural / museo en `src/` | Fallo (~12k líneas not-mounted) | Pasa. Ese árbol no existe. |
| Code judo evidente sin aplicar | Fallo (God-object, historiales gemelos) | Pasa. `App` despacha; las vistas derivan. |
| Archivo injustificado > 1k | Fallo (`triviaQuestions.js`) | Pasa. El JS vivo más largo es `matches.js` (229). `archive.css` tiene 959; no cruzó 1k. |
| Spaghetti por casos especiales | Fallo parcial (penales + DTO dual) | Pasa. Una regex de penales; un `DistributionBar({ stats })`. |
| Wrappers / magia inútil | Fallo (clase Vercel, `ui/Button`) | Reserva menor: ver §2. |
| Lógica en la capa canónica | Fallo parcial | Pasa. `parseMatch` es la frontera; el auditor valida el JSON crudo y reutiliza resultado/fecha. |
| Docs alineados al runtime | Fallo (CRA / `REACT_APP_*`) | Pasa para agentes y GA4. |

### 1. Lo que esta pasada ya no tiene que pedir

- No hay Login, Trivia, auth, wrappers `ui/`, emojis ni scripts de raíz que muten el JSON.
- `App` no calcula yearly stats ni paginación de partidos en la pestaña de efemérides.
- Rivales y Países no son forks. `MatchesView` no reescribe `PaginatedMatchList`.
- Las vistas no leen `match['Equipo Local']`. Eso vive solo en `parseMatch` y en el auditor del contrato de publicación.
- Un `popstate`. Sets atómicos año+página.
- Tokens en `index.css`, componentes en `styles/archive.css`. El único `style={{}}` de producto es el ancho de la barra de distribución, que es dato.

Eso era el code judo. Está hecho.

### 2. Residuo que aún se puede borrar (no bloquea el merge)

Estos ítems fallarían un nit de la rúbrica si aparecieran **nuevos** en un PR. En un re-audit del árbol completo no justifican revertir P1–P5.

**Wrappers de identidad en dominio.** `getOpponent`, `getYearFromMatch`, `getScore` y `getResultCode` ahora son `match => match.opponent` (y equivalentes). Solo los usan tests y una línea de `EntityHistory`. La rúbrica dice: *this abstraction seems unnecessary. can we just keep the direct flow?* Sí. Borrar los cuatro y leer el campo. `EntityHistory` ya tiene `canonicalize: value => value` en países: otra identidad; se puede omitir y tratar `canonicalize` como opcional.

**Ceremonia del shell.** `App.js` tiene 188 líneas porque Sun/Moon SVG y `useTheme` viven ahí. El plan pedía ~150. Extraer iconos y tema a módulos de chrome no cambia el diseño; solo adelgaza el archivo. `TABS.find` en cada render es un mapa `id → View` que ya está implícito en `TABS`.

**API de extras en URL.** `setYear(value, { page: { value: '1', defaultValue: '1' } })` funciona y es atómico, pero el shape es ruidoso. Un `setParams({ year, page: '1' })` con defaults registrados al suscribirse borraría esa anidación. No es spaghetti; es un contrato un poco mágico.

**Efemérides sigue mapeando `MatchRow` a mano.** No pagina (correcto: pocos partidos por día). Un `MatchList` sin paginación, o `PaginatedMatchList` con page fija, unificaría la última lista suelta. Impacto bajo.

**`calculateArchiveOverview` recorre dos veces.** Un `forEach` de rivales y luego `summarizeMatches`. Con 1937 filas no duele. Un solo pass sería más inevitable, no más urgente.

**Auditoría Node ↔ dominio.** `scripts/audit-data.mjs` importa `src/domain/matches.js` y Node avisa `MODULE_TYPELESS_PACKAGE_JSON`. No es un leak de frontera (el auditor *debe* ver el JSON crudo). Es un warning de packaging. No añadir `"type": "module"` al `package.json` de un Vite app solo por eso; un `matches.mjs` o dejar el warning es suficiente.

Nada de esto es un segundo producto, un God-object o un archivo de 10k líneas.

### 3. Qué no es hallazgo

- Claves en español en el JSON y en el auditor: contrato de publicación.
- Tailwind para `w-full` / `space-y-4` junto a CSS editorial: política de P5, documentada.
- `UpcomingMatches` con “Verificado el 4 de agosto de 2026” en markup: es copy de fixture, no complejidad de control flow. El calendario generado ya trae fuente; el copy estático se puede ligar a metadata en un alta de datos, no en este review.
- TypeScript: sigue sin hacer falta.

### Aprobación

Mergeable. Si hay un follow-up, que sea un PR chico de higiene: borrar los cuatro getters de identidad, opcionalizar `canonicalize`, y sacar los SVG del shell. No reabrir CSS ni el store de URL para eso.

---

## Auditoría original (pre P1–P5)

Fecha: 2026-08-13  
Alcance: repositorio completo en `main` (`6af7edb`), no un diff de feature.  
Rúbrica: `thermo-nuclear-code-quality-review` (simplificación estructural, code judo, archivos gigantes, spaghetti, fronteras de dominio).

## Veredicto original

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

Plan de ejecución (cinco PRs, invariantes, APIs y tests): `PLAN_TECNICO_CODE_QUALITY.md`.

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
