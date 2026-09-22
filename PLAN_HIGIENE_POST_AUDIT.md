# Plan de higiene post-auditoría

Fecha: 2026-08-13  
Origen: re-auditoría thermo-nuclear en `main` (`08b7711`). El skill **aprueba**. Esto no es P6.  
Objetivo: borrar residuo de migración **sin cambiar comportamiento de producto**.

Un PR. Cuatro cortes. Si uno se enreda, se saca del PR; no se “aprovecha” para tocar CSS ni el store de URL.

## Invariantes (iguales que P1–P5)

1. Query params: `view`, `date`, `year`/`month`/`page`, `tournament`/`decade`, `rival`/`rivalYear`/`rivalPage`, `country`/`countryYear`/`countryPage`.
2. JSON publicado: 13 claves en español, mismo orden.
3. `MATCHES_PER_PAGE = 18`. Anchors de `App.test.js` (Alianza 140, Unión Comercio 32, Argentina 60, tabla 2026→1956, “1937 Partidos”).
4. Cero GA4 / RUM antes de `accepted`.
5. Gate: `npm run check` verde.
6. **Fuera de alcance:** TypeScript, React Router, CSS, `useUrlState`, paginar efemérides, un solo pass en `calculateArchiveOverview`, borrar `/api/data`.

## Por qué un PR y no cinco

P1–P5 boraban capas. Esto borra **líneas**. Separarlo en PRs apilados solo alarga el review: no hay frontera nueva ni riesgo de merge conflict entre los cortes.

Orden de aplicación **dentro** del PR (por si hay que revertir un corte):

```
H1 getters  →  H2 canonicalize  →  H3 DTO rivales  →  H4 chrome App  →  H5 fecha verificada
```

H5 es copy ligado a metadata. Va al final porque es el único cambio visible (el día pasa de 4 a 8 de agosto, que es lo que ya dice el JSON).

---

## H1 — Borrar getters de identidad

Hoy en `src/domain/matches.js`:

```js
export const getOpponent = match => match.opponent;
export const getYearFromMatch = match => match.year;
export const getScore = match => (/* { valid, scGoals, opponentGoals } */);
export const getResultCode = match => match.resultCode;
```

Uso real: una línea en `EntityHistory` (`getYearFromMatch`) y los tests de dominio. Producto no los necesita.

**Qué hacer**

- Borrar los cuatro exports.
- En `EntityHistory`: `String(match.year) === selectedYear`.
- En `matches.test.js`: afirmar `homeWin.opponent`, `.year`, `.scGoals` / `.opponentGoals`, `.resultCode`. El caso de penales ya cubre `parseMatch(...).resultCode` y `resultFromScoreAndNote`.

**Listo cuando:** grep de esos cuatro nombres da cero en `src/`.

---

## H2 — `canonicalize` opcional

`COUNTRIES_HISTORY` declara `canonicalize: value => value`. Es otra identidad.

**Qué hacer**

```js
const canonicalize = config.canonicalize || (value => value);
```

en `EntityHistory` (lectura y `setSelectedEntity`). Quitar la clave de `COUNTRIES_HISTORY`. Dejar `canonicalize: canonicalizeRival` en rivales: esa sí hace trabajo (`Union Comercio` → `Unión Comercio`).

**Listo cuando:** países no tienen `canonicalize`; rivales sí.

---

## H3 — Un vocabulario para mejor/peor rival

`summarizeMatches` habla `total` / `victories` / `draws` / `defeats`.  
`calculateArchiveOverview` arma `{ jugados, ganados, empatados, perdidos }` y `DashboardView` lo pinta.

**Qué hacer**

Acumular con las mismas claves:

```js
{ total: 0, victories: 0, draws: 0, defeats: 0 }
```

Elegibilidad: `stats.total >= 5`.  
Ratios: `victories / total`, `defeats / total`.  
Dashboard: `` `${best.victories}V · ${best.draws}E · ${best.defeats}P` ``.

No reusar `summarizeMatches` por rival dentro del loop: eso sería N pases. El acumulador local se queda; solo cambia el nombre de los campos.

**Listo cuando:** grep de `ganados|empatados|perdidos|jugados` en `src/domain` y `src/features` da cero (salvo copy en español de la UI: “Países jugados”, “Partidos jugados en esta fecha”).

---

## H4 — Chrome fuera de `App.js`

`App.js` mide 188 líneas porque Sun/Moon y `useTheme` viven ahí. El shell no tiene que conocer paths SVG.

**Qué hacer**

- `src/components/ThemeIcons.js`: `SunIcon`, `MoonIcon` (mismo markup, `aria-hidden`).
- `src/hooks/useTheme.js`: `readInitialTheme` + `useTheme` (timeout de 350 ms, `data-theme`, `localStorage`, `trackThemeChange`). Seguir escribiendo `dataset.revision` desde metadata: eso ya está en el efecto actual; no inventar otro dueño.
- `App.js` importa y usa. Nombrar las vistas de entidad evita el arrow en `TABS`:

```js
function RivalsView(props) { return <EntityHistory {...props} config={RIVALS_HISTORY} />; }
function CountriesView(props) { return <EntityHistory {...props} config={COUNTRIES_HISTORY} />; }
```

Constantes de módulo, no componentes definidos en render.

No extraer header/footer a un layout. No tocar carga de archivo ni consentimiento.

**Listo cuando:** `App.js` no declara SVG ni `setTimeout`. Sigue despachando `ActiveView`.

---

## H5 — Fecha verificada desde el JSON

`UpcomingMatches` imprime “Verificado el 4 de agosto de 2026”.  
`src/data/upcoming-fixtures.json` tiene `calendar.lastVerifiedAt` = `2026-08-08T06:37:01Z`.

**Qué hacer**

Formatear `lastVerifiedAt` con `es-PE` y `America/Lima` (la misma zona que el resto del componente). Copy: `Verificado el {fecha} en {sourceName}`. El enlace sigue siendo `sourceUrl`.

El único cambio de producto: el pie pasa del 4 al 8 de agosto. Eso es corrección, no restyle. Si un test busca el 4, actualizarlo.

**Listo cuando:** no hay día de mes hardcodeado en `UpcomingMatches.js`.

---

## Fuera de este PR (a propósito)

| Ítem | Por qué no |
|---|---|
| API `setParams({ year, page: '1' })` | Reabre el store de URL. El skill lo vetó. |
| Extraer más CSS / quitar Tailwind de layout | Reabre P5. |
| `MatchList` sin paginación para efemérides | No borra un concepto; ahorra ~8 líneas. |
| Un solo `forEach` en overview | 1937 filas; no duele. |
| Exportar `parseScoreLabel` al auditor | Packaging Node vs Vite; no es leak de UI. |
| `"type": "module"` en `package.json` | Efecto colateral en toda la app. |

---

## Gate

```bash
npm run check
```

Grep de control:

```bash
rg "getOpponent|getYearFromMatch|getScore|getResultCode" src/
rg "ganados|empatados|perdidos|jugados" src/domain src/features
rg "Verificado el 4 de agosto" src/
```

Los tres deben quedar vacíos (salvo las frases de UI listadas en H3).

## Aprobación del plan

Este PR de higiene está bien cuando el lector de dominio ve un partido y un resumen, no cuatro aliases; el dashboard habla el mismo DTO que el balance; `App.js` es shell; y la fecha del fixture sale del JSON. Si el diff toca `useUrlState.js` o `*.css`, se rechaza.
