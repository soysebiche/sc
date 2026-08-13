# Sistema de diseño de Sebiche Celeste

Esta es la referencia normativa del runtime activo. Los tokens viven en `src/index.css` y los componentes editoriales en `src/styles/archive.css`.

## Dirección

Archivo deportivo editorial: identidad de Sporting Cristal, alta legibilidad de datos y jerarquía basada en consultas reales. La interfaz evita decoración sin función y no pretende simular un dashboard SaaS genérico.

## Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-celeste` | `#08769A` | `#3CBEEF` | Texto/acento de marca con contraste por tema |
| `--color-biscay` | `#1B265C` | `#1B265C` | Header e identidad |
| `--text-primary` | `#1B265C` | `#F1F5F9` | Texto principal |
| `--text-secondary` | `#475569` | `#94A3B8` | Texto auxiliar |
| `--color-win` | `#047857` | `#34D399` | Victoria |
| `--color-draw` | `#92400E` | `#FBBF24` | Empate |
| `--color-loss` | `#B91C1C` | `#F87171` | Derrota |

Los colores V/E/P siempre se acompañan de texto o abreviatura nombrada. Los tonos de barra usan variantes oscuras con texto blanco.

## Tipografía

No existen requests de fuentes externas.

```css
--font-display: 'Avenir Next Condensed', 'Arial Narrow', 'Avenir Next', sans-serif;
--font-body: 'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SFMono-Regular', 'SF Mono', 'Roboto Mono', monospace;
```

- Display: títulos y cifras principales.
- Body: controles y lectura continua.
- Mono: metadata, labels y datos compactos.

## Componentes activos

- `tab`: navegación primaria; mínimo 44 px y `aria-current`.
- `card-static`: agrupación de una sección, sin click implícito.
- `stat-tile`: una métrica; el color comunica estado, no jerarquía completa.
- `match-card`: elemento semántico `article`.
- `badge`: resultado V/E/P con nombre accesible.
- `distribution-bar`: proporción de resultados con leyenda textual.
- `table-sort-button`: control de orden dentro de `th[aria-sort]`.
- `pagination`: anterior/siguiente y página anunciada.

## Interacción

- Foco global visible con outline celeste.
- Skip link como primer control de teclado.
- Animaciones breves de opacity/transform.
- `prefers-reduced-motion` reduce animaciones y transiciones a duración efectiva mínima.
- No animar width/height para progreso o distribución.

## Responsive

- Viewport mínimo verificado: 390 px sin overflow horizontal del documento.
- Grids colapsan a una o dos columnas antes de desktop.
- La tabla anual usa un contenedor de scroll propio.
- Listas de partidos muestran 18 elementos por página.

## Accesibilidad

La línea base automatizada actual tiene 0 violaciones Axe en Efemérides, Rivales y Año, en temas claro y oscuro. Lighthouse Accessibility obtuvo 100 en laboratorio.

Esto no equivale a conformidad WCAG completa. Faltan lector de pantalla, zoom 200%, dispositivo físico y tareas completas con usuarios de tecnologías de asistencia.

## Autenticidad

Motivos propios que deben preservarse:

- logo y paleta celeste/biscay;
- efemérides como puerta de entrada;
- torneos, fechas, rivales y resultados como material de archivo;
- densidad informativa antes que decoración.

Evitar side-tabs repetidos, glassmorphism, glows, gradientes decorativos, cards dentro de cards y copy genérico. La siguiente mejora visual debe aportar procedencia, cronología o comparación deportiva.
