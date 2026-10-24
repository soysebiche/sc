# Sebiche Celeste — Brand kit v1 (oct 2026)

> Proyecto independiente de hinchas. Sin relación oficial con el Club Sporting Cristal.

| Carpeta | Contenido |
|---|---|
| `logo/` | Logo trazado píxel a píxel (diff en `trace/diff-report.json`) y banderín v2 dibujado a mano (`scripts/pen_v2.py`), más variantes color, placa, tinta y reverso, en PNG @1x/@2x |
| `banderin-v2/` | Opciones exploradas y `opcion-d-final` (aprobada el 24 oct) |
| `_archive/banderin-v1/` | Banderín pixel art anterior, con su calco y sus iconos (no usar) |
| `tokens/` | `tokens.json` como fuente de verdad, más `tokens.css`, `tailwind.preset.cjs` y `contrast-report.md` |
| `fonts/` | Barlow Condensed, Inter e IBM Plex Mono (OFL) |
| `icons/` | favicon (ico, svg, png), apple-touch, PWA 192/512, maskable y manifest |
| `social/` | Efeméride, previa y resultado, cada uno en post, story y X (HTML editable más PNG) |
| `og/` | OG de efemérides, rivales y año |
| `ics/` | Gráfica de suscripción al calendario e icono |
| `sheets/` | Láminas de área de respeto y de reglas de uso |
| `guide/` | `GUIA_DE_MARCA.md`, `guia-de-marca.html` y `.pdf` |
| `ui-kit/` | Componentes React (`components/index.jsx`), `ui-kit.css` y `showcase.html/.png` (claro y oscuro) |
| `press/` | Press kit / caso de estudio (md, html, pdf) |
| `scripts/` | Generadores reproducibles (`python3 scripts/gen_*.py`, render con Chrome vía Playwright) |

**Filas Claude Design hechas en código:** social, OG, gráfica .ics, láminas, guía (maquetación), showcase del UI kit y press kit. Son piezas finales en HTML: se pueden abrir y refinar en Claude Design sin tocar el logo ni el banderín.

**Repo:** rama local `brand/celeste-identity`, con iconos, manifest, fuentes y tokens conectados. No se ha hecho push ni deploy.
