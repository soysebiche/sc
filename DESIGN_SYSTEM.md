# Sebiche Celeste: design system del sitio

> Proyecto independiente de hinchas. Sin relación oficial con el Club Sporting Cristal.

Este documento cuenta cómo aplica el sitio la guía de marca (`brand/guide/GUIA_DE_MARCA.md`). Si los dos no coinciden, manda la guía. Nunca se usa el escudo del club, y nunca se arman lockups con SEBICHE ni se insinúa respaldo.

## 1. Fuente única de tokens

Todos los tokens salen de `brand/tokens/tokens.json`, que se edita a mano. A partir de ese archivo, `brand/scripts/gen_tokens.py` genera:

- `brand/tokens/tokens.css`: variables `--sc-*`. `src/index.css` las importa directo (`@import '../brand/tokens/tokens.css'`), sin copias.
- `brand/tokens/tailwind.preset.cjs`: `tailwind.config.js` lo carga en `presets`. Las clases son `bg-sc-noche-950`, `text-sc-celeste-700`, `font-display` y similares.

Las variables antiguas (`--color-celeste`, `--bg-primary`, `--text-primary`, `--color-win`, `--radius-*`, `--font-*` y el resto) siguen existiendo, pero solo como **alias** de los `--sc-*`, para no tocar los componentes. Los colores nuevos se piden siempre como `var(--sc-…)` y nunca como un hex suelto.

El tema se controla con `data-theme="light|dark"` en `<html>`. El script inline de `index.html` lo define siempre, ya sea desde localStorage `sc-theme` o desde `prefers-color-scheme`.

## 2. Color

| Token | Hex | Uso en el sitio |
|---|---|---|
| `--sc-noche-950` | #0B1230 | Fondo del tema oscuro |
| `--sc-noche-900` | #111A40 | Superficies y tarjetas en oscuro |
| `--sc-noche-800` | #1B265C | Header (`--sc-header`) y versión tinta |
| `--sc-celeste-400` | #3CBEEF | Acento en oscuro y banderín |
| `--sc-celeste-700` | #086A8C | Acento y enlaces en claro (`--sc-accent`) |
| `--sc-celeste-300` | #7ED4F5 | Texto de acento sobre el header noche y foco en oscuro |
| `--sc-papel-50` | #F7FAFB | Fondo del tema claro |
| `--sc-tinta-900` | #121A3A | Texto en claro |
| `--sc-oro-400` | #F1AA19 | Oro del banderín y destacados en oscuro |
| `--sc-oro-800` | #7A4E00 | Destacados en claro (`--sc-highlight`) |
| `--sc-rojo-600` | #D10F21 | Rojo del banderín, solo decorativo |

Los colores del banderín v2 tienen tokens propios: `--sc-brand-banderin-celeste` #3CBEEF, `--sc-brand-banderin-gold` #F1AA19, `--sc-brand-banderin-red` #D10F21 y `--sc-brand-banderin-white` #FFFFFF. En el sitio también están como alias `--color-banderin-*` y en Tailwind como `sc-brand-banderin-*`. Sirven para identidad y filetes, **nunca para texto sobre fondo claro**.

### Resultados

| | Claro | Oscuro |
|---|---|---|
| Victoria (`--sc-win`) | #04724F | #3DDC97 |
| Empate (`--sc-draw`) | #8A4B00 | #F6C344 |
| Derrota (`--sc-loss`) | #B4232C | #FF8A8A |

- Un resultado nunca se comunica solo con color: siempre va con su letra. En la guía las letras son V/E/D. En el sitio, la derrota se marca **P** (perdido), porque así viene el código en `src/domain/matches.js`.
- Los chips usan el mismo color sobre un tinte de ese color al 12 % (15 % en oscuro). Las barras usan siempre el tono claro con texto blanco.
- Todos cumplen AA (≥ 4,5:1). Chip en claro: V 5,0 · E 5,7 · P 5,4. Chip en oscuro: 7,0 · 7,5 · 5,8. Barra con texto blanco: 6,0 · 6,8 · 6,5. Detalle en `brand/tokens/contrast-report.md`.

## 3. Tipografía

Las tres fuentes son OFL y están auto-alojadas en `public/fonts/`, declaradas en `src/styles/brand-fonts.css`. Inter y Barlow Bold se precargan. Avenir ya no se usa.

- **Barlow Condensed 500–800** (`--font-display`): titulares, marcadores y pestañas. Va en mayúsculas y con interlineado de 0,92 en titulares.
- **Inter** (`--font-body`): textos y UI.
- **IBM Plex Mono** (`--font-mono`): fechas, etiquetas y datos, con un tracking de +0,1 em.
- Los números van con `tabular-nums`.

La escala es la de `--sc-text-xs … --sc-text-3xl` (0,75 / 0,875 / 1 / 1,25 / 1,75 / 2,5 / 4 rem).

## 4. Espacio, radios y composición

- Cuadrícula de 8 px, con espaciado `--sc-space-1 … --sc-space-24` (de 4 a 96 px).
- Radios pequeños: `--sc-radius-sm` 4 px y `--sc-radius-md` 8 px. Los alias `--radius-md/--radius/--radius-lg/--radius-xl` apuntan a 8 px, y `--radius-full` queda solo para píldoras y avatares.
- La franja rojo-blanco-rojo se puede usar como filete superior de 4 px.
- Las áreas táctiles miden al menos 44 px, el foco es visible con `--sc-focus` y se respeta `prefers-reduced-motion`.

## 5. Logo y banderín v2

- **Logo (wordmark):** `public/sebiche-celeste-logo.webp` en el header. Es un trazo fiel al original y no se modifica.
- **Banderín v2**, aprobado el 24 oct 2026:
  - Cuerpo celeste #3CBEEF, filete interior blanco y tres estrellas oro rellenas, en orden pequeña-grande-pequeña.
  - Barra superior rojo-blanco-rojo en tres tramos iguales, con **exactamente el ancho del banderín** (no sobresale).
  - Master: `brand/logo/svg/sebiche-celeste-banderin-master.svg`, generado por `brand/scripts/pen_v2.py`. Los SVG del sitio están en `public/brand/`.
  - Para 64 px o menos (favicons e iconos de `public/icons`) se usa la variante de filete grueso. En favicon las estrellas se leen como un punto oro, y eso es aceptado.
- **Versiones:**
  - Color: sobre noche.
  - Color con placa: sobre fondos claros.
  - Tinta: #1B265C, con barra blanca, filete y estrellas calados.
  - Reverso: blanco.
  - Las versiones no se pasan a escala de grises. Para una sola tinta se usa la versión tinta.
- **No:**
  - deformar, rotar ni recolorear fuera de las versiones aprobadas;
  - agregar contornos o sombras;
  - hacer que la barra sobresalga;
  - volver a usar el banderín pixel art v1, que quedó en `brand/_archive/banderin-v1/`.
- **Área de respeto:** 1x por lado, donde x es el ancho de la estrella pequeña. **Mínimos:** logo 120 px, banderín 24 px y favicon 16 px.

## 6. Voz y aviso legal

Habla un hincha que sabe de datos: con cariño, exacto y sin agrandar las cosas. Cada cifra sale del archivo. El aviso de no afiliación aparece en el footer y en cualquier pieza pública.

## 7. Verificación

- `npx vite build` tiene que pasar.
- Las capturas antes/después están en `brand/site-sync/`: `before/`, `after/` y `before-after.png`. Se generan con `node brand/scripts/site_shots.js <url> <outDir>`.
