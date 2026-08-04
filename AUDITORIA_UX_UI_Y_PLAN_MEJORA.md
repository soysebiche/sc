# Auditoría UX/UI, arquitectura y plan de mejora de Sebiche Celeste

> Documento vivo.
>
> Fecha de línea base: 2026-08-04
> Última actualización: 2026-08-04 — ejecución de Fases 0–2 y cierre de PROD-01
> Alcance: estándar
> Estado observado: producción pública verificada en Vercel
> Puntaje bruto: 7.5/10
> Puntaje confirmado: 7.5/10
> Confianza: media-alta — cobertura de evidencia 76.5%
> Meta recomendada: 8.6/10
> Gate activo: ausencia de evidencia de campo, AT y RUM (cap 8.4)

## 1. Veredicto ejecutivo

**Sebiche Celeste pasó de una beta frágil de 5.4/10 a un producto público competente de 7.5/10.** Las tareas esenciales ya no dependen de Tailwind o tipografías externas, los filtros y vistas se pueden compartir por URL, el análisis anual es coherente, los aliases de rivales se reconcilian y las listas largas tienen búsqueda/paginación. El gate único `npm run check` quedó verde después de `npm ci`: lint sin warnings, 8/8 tests y build correcto. La misma entrega quedó desplegada y verificada en `https://sebiche-celeste.vercel.app`.

La mayor fortaleza sigue siendo la especificidad del archivo: 1,936 partidos y consultas propias del dominio. El mayor riesgo ya no es el deploy: son la procedencia editorial, Web Vitals de campo y el comportamiento con usuarios o lector de pantalla. El toolchain CRA también conserva 54 advisories en dependencias de desarrollo/build, aunque `npm audit --omit=dev` confirma cero vulnerabilidades en las dependencias que llegan al runtime.

La calificación técnica combinada de frontend, calidad y rendimiento es **7.7/10**. Nielsen suma **31.3/40**. El riesgo de AI Slop baja a **3.3/10 (leve)** y la autenticidad visual sube a **6.7/10**. La próxima fase útil es pequeña y concreta: retirar código residual, migrar gradualmente fuera de CRA, añadir procedencia/fecha de actualización y observar tareas reales. No conviene hacer un rebranding ni usar `npm audit fix --force`.

## 2. Alcance, método y límites

| Fuente | Disponible | Inspeccionada | Nivel | Limitación |
|---|---|---|---|---|
| Código, CSS, configuración y documentación | Sí | Sí | E2 | Revisión centrada en superficies activas y contratos de mayor riesgo |
| JSON histórico | Sí | Sí | E2 | Se validaron estructura y aliases conocidos; no cada partido contra fuentes primarias |
| Runtime y build local | Sí | Sí | E3 | No equivale a producción pública |
| Desktop 1440 px y móvil 390 px | Sí | Sí | E3 | Chromium; no dispositivo físico |
| Temas claro/oscuro | Sí | Sí | E3 | Tres superficies representativas por tema |
| Tests, lint, build y audit | Sí | Sí | E3 | Workflow CI creado; ejecución remota de GitHub no verificada |
| Axe y Lighthouse | Sí | Sí | E3 | No certifican WCAG ni Web Vitals de campo |
| Detector `impeccable` | Sí | Sí | E3 | Findings revisados manualmente |
| Producción pública | Sí | Sí | E4 | URL, deployment, HTTP, API y navegador verificados; Vercel aún no enlazado a CI remota |
| Analítica, RUM, usuarios y SUS | No hay evidencia | No | E0–E2 | No se inventan métricas de campo |
| Lector de pantalla, zoom 200% y dispositivo real | No | No | E0 | Claims de accesibilidad limitados a DOM, Axe, teclado focal y responsive |

### Evidencia ejecutada actual

- `npm ci && npm run check` → exit 0; lint sin warnings, 2 suites/8 tests verdes y build correcto.
- Bundle: principal 67.94 kB gzip; datos 109.06 kB y Recharts 49.41 kB en chunks diferidos; CSS 6.95 kB.
- `npm audit --omit=dev --json` → 0 vulnerabilidades de runtime. Audit completo → 54 del toolchain CRA: 11 bajas, 13 moderadas, 28 altas y 2 críticas.
- Lighthouse 12.8.2, compatible con Node 22.15, tres corridas aisladas → Performance 72/98/98 (mediana 98), LCP 5.8/2.4/2.4 s (mediana 2.4), TBT 217.5/0/0 ms (mediana 0), Accessibility/Best Practices/SEO 100 en las tres. La dispersión impide tratar una sola corrida como campo.
- Axe → 0 violaciones en Efemérides, Rivales y Año, en claro y oscuro.
- Runtime → 18 partidos por página; deep links, paginación, sort anual y back/forward reproducidos.
- Alias desde URL → `Union Comercio` se normaliza a `Unión Comercio` y muestra 32 partidos.
- Red del happy path → solo requests a `127.0.0.1`; no Tailwind CDN, Fontshare ni otro tercero esencial.
- Teclado → primer Tab enfoca “Saltar al contenido”; Enter mueve foco a `#main-content`.
- Reduced motion → media query activa y duración efectiva `0.00001 s`; sin overflow a 390 px.
- `impeccable` → 0 findings en los cuatro módulos visuales activos; el scan completo conserva 2 warnings en Login/Trivia no montados.
- Producción Vercel → deployment `dpl_93LwL1DhyAi8bTM9zYk7cRNDhZDh`, target `production`, estado `Ready` y alias `https://sebiche-celeste.vercel.app`.
- Smoke HTTP → `/`, logo WebP y manifest 200; `/api/data?type=completo` 200 con 1,936 registros; tipo inválido 400 y método POST 405.
- Smoke de navegador en producción → Efemérides 4 resultados; Partidos 2024, página 2, 18 de 36; rival canónico `Unión Comercio`, 32; Año con gráfica y tabla; consola 0 errores/0 warnings y sin overflow en 1280 o 390 px.
- Logs del deployment después del smoke → cero eventos de nivel error en la ventana consultada.

### Evidencia visual

- [Después — desktop 1440](output/playwright/after-desktop-1440.png)
- [Después — móvil 390](output/playwright/after-mobile-390.png)
- [Resumen Lighthouse](output/playwright/lighthouse-summary.json)
- [Línea base — fallo sin dependencias externas](output/playwright/mobile-external-deps-blocked.png)
- [Producción — desktop](output/playwright/production-desktop.png)
- [Producción — móvil 390](output/playwright/production-mobile.png)

## 3. Scorecard

`Backend` es N/A: el producto activo es un archivo público estático. El endpoint serverless se mantiene como fallback público, no como límite de seguridad.

| Área | Peso normalizado | Score | Evidencia | Diagnóstico actual |
|---|---:|---:|---:|---|
| Estrategia de producto y módulos | 11.1% | 7.0 | E2 | Propuesta clara; faltan procedencia y usuarios observados |
| Arquitectura de información y journeys | 13.3% | 8.0 | E3 | Seis áreas, deep links, back/forward, búsqueda y paginación |
| Interacción y heurísticas | 13.3% | 8.1 | E3 | Flujos coherentes con loading/error/empty; queda ayuda contextual |
| UI y sistema de diseño | 11.1% | 7.4 | E3 | Identidad consistente y tokens accesibles; aún card-heavy |
| Accesibilidad y responsive | 13.3% | 8.4 | E3 | Axe 0, teclado focal, claro/oscuro y 390 px; falta AT/dispositivo |
| Arquitectura frontend | 11.1% | 7.4 | E3 | Dominio/URL/data/chart separados; `App.js` aún concentra vistas |
| Calidad, confiabilidad y seguridad | 11.1% | 7.4 | E3 | Gate reproducible y runtime audit limpio; CRA dev debt abierta |
| Rendimiento y operabilidad | 8.9% | 8.5 | E3 | Mediana Lighthouse 98/LCP 2.4 s, con una muestra lenta; falta RUM |
| Medición y evidencia de usuario | 6.7% | 3.0 | E2 | No hay eventos validados ni investigación de campo |
| **Total** | **100%** | **7.5/10** |  | **Producto competente y publicado; campo aún no probado** |

### Gates del score

| Gate | Estado | Cap | Evidencia para cerrarlo |
|---|---|---:|---|
| Runtime local relevante | Cerrado | — | Build y flujos desktop/móvil ejecutados |
| Gate principal reproducible | Cerrado local | — | `npm ci && npm run check` verde; GitHub Actions aún no ejecutado remotamente |
| Accesibilidad crítica dinámica | Cerrado para laboratorio | — | Axe claro/oscuro + teclado focal; no equivale a certificación |
| Cobertura 76.5% | Cerrado | — | Producción añadió evidencia E4; aún faltan AT y campo |
| Evidencia de campo | Abierto | 8.4 | Protocolo de cinco tareas y RUM con muestra/ventana |

## 4. Línea base preservada y avance

| Indicador | Línea base | Actual | Estado |
|---|---:|---:|---|
| Puntaje confirmado | 5.4/10 | 7.5/10 | Mejoró 2.1 |
| Calificación técnica | 4.7/10 | 7.7/10 | Gates y performance recuperados |
| Nielsen | 22.8/40 | 31.3/40 | Control, consistencia y eficiencia mejoraron |
| AI Slop | 4.6/10 | 3.3/10 | De moderado a leve |
| Autenticidad | 5.4/10 | 6.7/10 | Dominio y sistema pesan más que los clichés |
| Tests | 0/1 útiles; rojo | 8/8; verde | Completado local |
| Lighthouse Performance | 57 | mediana 98 (72–98) | Gate mediano superado; variación documentada |
| LCP laboratorio | 9.6 s | mediana 2.4 s (2.4–5.8) | Gate mediano superado; no equivale a campo |
| Axe | Labels/contraste serious | 0 violaciones en 6 corridas | Gate automatizado superado |
| Runtime audit | 54 mezcladas con CRA | 0 runtime; 54 dev/build | Riesgo clasificado, no eliminado |

## 5. Mapa actual del producto

| Tarea | UI/estado | Dominio/datos | Persistencia | Prueba | Riesgo restante |
|---|---|---|---|---|---|
| Efeméride | Fecha + loading/error/empty | helpers + JSON diferido | `date` en URL | App test + runtime | Sin fuente/actualización visible |
| Resumen histórico | Dashboard | cálculo local canónico | `view` en URL | Runtime | Métricas aún muy card-like |
| Explorar partidos | Año/mes + 18 por página | helpers | `year`, `month`, `page` | Runtime 36 resultados/2 páginas | Sin búsqueda de texto/torneo |
| Analizar año | Década/torneo/sort/resumen/chart | stats consistentes + chart lazy | `decade`, `tournament` | Test + runtime asc/desc | `App.js` conserva agregación |
| Consultar rival | Input searchable + datalist | alias canónico | `rival`, `rivalYear` | Unit + deep link runtime | Solo aliases conocidos |
| Consultar país | Selects nombrados | helpers compartidos | `country`, `countryYear` | Axe/runtime | Markup aún duplicado con Rival |
| Tema | Toggle | tokens CSS | `localStorage` | Test + Axe claro/oscuro | No probado con AT real |
| Calidad | CI declarativa | scripts npm | GitHub Actions | `npm ci && npm run check` | CI remota no observada |

Arquitectura activa: `URL/usuario → App/feature → helpers de dominio → import dinámico de JSON → DOM`; Recharts solo se descarga al abrir Año.

## 6. Flujos críticos

| Flujo | Resultado actual | Evidencia | Estado |
|---|---|---|---|
| Primera visita → efeméride | Loading explícito, contenido o empty; error con reintento | Runtime/Axe | Correcto local |
| Partidos 2024 → página 2 | 36 resultados, 18 por página, URL `page=2` | Runtime | Correcto |
| Año 2020s → ordenar | 2026→2020 cambia a 2020→2026; tabla/chart usan filtro | Test/runtime | Correcto |
| Abrir alias compartido | URL antigua se canoniza y conserva 32 resultados | Test/runtime | Correcto |
| Cambiar vista → atrás | `aria-current=page` regresa a Partidos con filtros | Runtime | Correcto |
| Navegar sin mouse | Skip link y acciones esenciales focusables | Teclado focal + DOM | Parcialmente probado |
| Cargar sin terceros | Requests esenciales locales; layout sin overflow | Network/runtime | Correcto local |

## 7. Hallazgos y cierres

### TECH-01 — Layout dependiente de Tailwind CDN

- Prioridad / severidad: P1 / 4 de 4.
- Estado: **Completado**.
- Evidencia de cierre: Tailwind 3.4.17 compilado localmente; CDN retirado; red solo local; 390 px sin overflow; build verde.
- Impacto residual: el CSS generado depende todavía de CRA/PostCSS, no de red externa.

### UX-01 — Orden y filtros anuales incoherentes

- Prioridad / severidad: P1 / 3 de 4.
- Estado: **Completado**.
- Evidencia de cierre: derivación inmutable; tabla usa el mismo filtro; 2026→2020 y 2020→2026 reproducidos; test de regresión verde.

### A11Y-01 / A11Y-02 — Equivalencia y contraste

- Prioridad / severidad: P1 / 3 de 4.
- Estado: **Completado para el gate de laboratorio**.
- Evidencia de cierre: labels programáticos, `nav`, `aria-current`, `aria-sort`, botones de año, articles, skip link, foco visible, tokens AA y 0 violaciones Axe en seis corridas.
- Límite: no se ejecutó lector de pantalla ni dispositivo físico; no declarar conformidad WCAG total.

### QUALITY-01 — Gate de calidad rojo

- Prioridad / severidad: P1 / 3 de 4.
- Estado: **Completado local; CI remota no verificada**.
- Evidencia de cierre: 8/8 tests, lint 0 warnings, build correcto, script `check` y workflow `.github/workflows/ci.yml`.

### TECH-02 — CRA 5 conserva deuda de build

- Prioridad / severidad: P1 / 3 de 4.
- Estado: **En progreso; no bloqueante para el bundle estático actual**.
- Evidencia: dependencias runtime correctamente separadas y audit limpio; 54 advisories permanecen en dev/build y Browserslist está desactualizado.
- Recomendación: migración incremental a Vite u otro build mantenido, protegida por el gate actual; no usar `--force`.
- Aceptación: build equivalente, 8/8 tests y audit del toolchain sin críticas/altas alcanzables.

### DATA-01 — Aliases fragmentaban rivales

- Prioridad / severidad: P2 / 3 de 4.
- Estado: **Completado para aliases conocidos**.
- Evidencia: helper canónico con unit tests; 157 opciones únicas; una opción por UTC, Unión Comercio, Cantolao y Los Chankas; alias de URL probado.
- Riesgo residual: no existe pipeline editorial que detecte automáticamente nuevas variantes.

### PERF-01 / UI-01 — Carga y tipografía externa

- Prioridad / severidad: P2 / 2 de 4.
- Estado: **Completado en laboratorio**.
- Evidencia: system fonts sin requests/CORS; logo WebP 12 kB con preload; JSON/Recharts diferidos; mediana Lighthouse 98/LCP 2.4 s en tres muestras.
- Límite: no hay p75 real.

### UX-02 / UX-03 — Continuidad y listas largas

- Prioridad / severidad: P2 / 2 de 4.
- Estado: **UX-02 completado; UX-03 en progreso**.
- Evidencia: vista/filtros/deep link/back/forward en URL; rival searchable; Partidos paginado.
- Falta: probar con usuarios la meta de consulta en tres interacciones y decidir búsqueda global/torneo.

### ARCH-01 — Monolito y superficies residuales

- Prioridad / severidad: P2 / 2 de 4.
- Estado: **En progreso**.
- Evidencia: `domain/matches`, `useUrlState`, `YearChart` y servicio de datos ya separados.
- Falta: extraer agregaciones/vistas de `App.js` y retirar o aislar Login, Trivia, analytics y primitives no montados.

### PROD-01 — Producción

- Prioridad: P2.
- Estado: **Completado**.
- Evidencia: URL pública, deployment `Ready`, assets, deep links, endpoint, desktop/móvil, consola y logs verificados.
- Límite: el release salió directamente con target `production`; no se creó un preview separado para promoción.
- Higiene pendiente: enlazar cada futuro deployment a su commit y ejecución de CI remota; este release se construyó con Vercel CLI.

### RESEARCH-01 — Campo

- Prioridad: P3.
- Estado: **Pendiente**.
- Falta: RUM con consentimiento y cinco tareas observadas, incluyendo teclado/AT.

## 8. Nielsen

Escala de calidad: 0 = ausente, 4 = excelente. Ningún 4 se concede sin producción/casos límite.

| # | Heurística | Score | Evidencia actual |
|---:|---|---:|---|
| 1 | Visibilidad del estado | 3.5 | Loading, error/retry, empty y conteos/página |
| 2 | Correspondencia con el mundo real | 3.2 | Efemérides, torneos, V/E/P y copy corregido; falta metodología |
| 3 | Control y libertad | 3.5 | URL, refresh, back/forward y filtros reversibles |
| 4 | Consistencia y estándares | 3.2 | Una fuente de filtros/tabla, labels y docs alineadas |
| 5 | Prevención de errores | 3.0 | Valores restringidos, validación de tab y aliases conocidos |
| 6 | Reconocimiento antes que recuerdo | 3.5 | Labels, datalist, estados activos y ayuda breve |
| 7 | Flexibilidad y eficiencia | 3.2 | Search, deep links, sort y paginación |
| 8 | Diseño estético y minimalista | 3.2 | Jerarquía clara; repetición de tiles todavía visible |
| 9 | Diagnóstico y recuperación | 3.0 | Error de datos con explicación y reintento; no se forzó en producción |
| 10 | Ayuda y documentación | 2.0 | README mejorado; falta fuente, frescura y metodología dentro del producto |
| **Total** |  | **31.3/40 (78.3%)** | **Buena usabilidad local con evidencia operativa limitada** |

## 9. Autenticidad visual y AI Slop

- Riesgo AI Slop: **3.3/10** — leve.
- Autenticidad visual: **6.7/10**.
- Evidencia/confianza: E3 / alta para runtime local.

| Dimensión | Riesgo | Lectura |
|---|---:|---|
| Composición genérica | 1.0 | Dashboard convencional, pero subordinado al archivo |
| Clichés visuales | 0.3 | Se retiraron acentos laterales; no hay glass/orbs/decoración gratuita |
| Repetición de componentes | 1.1 | Tiles/cards siguen dominando métricas e historiales |
| Marca y copy genéricos | 0.6 | Logo/paleta/lenguaje propios; voz editorial aún breve |
| Falta de especificidad del dominio | 0.3 | Efemérides, torneos, rivales y resultados sostienen autenticidad |

`impeccable` reporta 0 findings en App, RivalHistory, CountryHistory y YearChart. El scan completo conserva dos warnings contextuales en Login/Trivia, módulos no montados; son deuda de limpieza, no evidencia de la experiencia activa.

**¿Sería inmediatamente creíble que la UI fue generada por IA?** Ya no de forma inmediata: la identidad y las tareas deportivas pesan más que los clichés. Aún podría parecer una plantilla de dashboard por la repetición de tiles. La mejora correcta es más provenance, cronología y narrativa de archivo, no más decoración.

## 10. Accesibilidad y responsive

### Confirmado

- `h1`, landmarks, navegación nombrada, estado activo y skip link.
- Inputs/selects nombrados; tabla sortable con `aria-sort`; selección anual por botón.
- Resultados V/E/P tienen nombre textual y color con contraste suficiente.
- Axe sin violaciones en tres vistas × dos temas; Lighthouse Accessibility 100.
- 390 px sin overflow; targets principales de 44 px; reduced motion efectivo.
- Skip link probado con teclado y foco trasladado a `main`.

### No verificado

- Lector de pantalla, zoom 200%, tablet y dispositivo físico.
- Seis tareas completas con usuarios exclusivamente de teclado/AT.
- WCAG completo o comportamiento con AT real en producción.

## 11. Arquitectura y calidad técnica

### Mejoras confirmadas

- Contrato público estático explícito; endpoint serverless sirve solo dataset completo con cache.
- Tailwind y system fonts locales; ninguna dependencia de layout externa.
- Helpers canónicos para fecha, rival, marcador, resultado y años con tests.
- Estado compartible mediante `useUrlState` y `popstate`.
- Datos y Recharts fuera del bundle inicial; logo responsivo y prioritario.
- Gate único `lint → test → build`; CI declarativa.
- Dependencias de build/testing movidas a `devDependencies`, separando audit runtime de toolchain.

### Deuda restante

- `App.js` mantiene agregaciones y varias vistas; Rival/Country comparten markup pero no primitives.
- Login/Trivia/auth/analytics y otros módulos no montados mantienen una arquitectura histórica ambigua.
- CRA 5 y parte de su cadena están deprecados/vulnerables en contexto de build.
- No hay RUM/alertas ni ensayo documentado de rollback; el smoke post-deploy sí quedó ejecutado.
- El release público todavía no está enlazado automáticamente a una ejecución de GitHub Actions.

Arquitectura objetivo incremental: `domain/selectors → features por vista → primitives semánticos → data adapter`, preservando URL y tests. No se justifica una reescritura total.

## 12. Plan actualizado

### Fase 0 — Verdad y línea base reproducible: completada localmente

- Tailwind/fuentes locales, sort/filtros coherentes, contrato público, tests y gate.
- Gate: `npm ci && npm run check` verde y runtime sin terceros esenciales.

### Fase 1 — Flujos críticos y accesibilidad: completada en laboratorio

- Labels, navegación, tabla, contraste, h1/skip, estados y reduced motion.
- Gate: Axe 0 en seis corridas; Lighthouse Accessibility 100.

### Fase 2 — Encontrabilidad y continuidad: completada parcialmente

- URL state, back/forward, búsqueda de rival, paginación y aliases conocidos.
- Pendiente: procedencia visible, detección de aliases nuevos y task test con usuarios.

### Fase 3 — Modularidad y autenticidad: siguiente

- Extraer agregaciones/vistas, retirar código residual y reducir repetición semántica.
- Gate: un contrato por entidad, grafo activo limpio, AI Slop ≤3.0 y tests por feature.

### Fase 4 — Toolchain y campo

- Producción y smoke: completados con evidencia E4.
- Pendiente: migrar CRA de forma incremental, activar RUM con consentimiento y observar cinco tareas.
- Gate restante: toolchain sin riesgo alto alcanzable y evidencia de campo suficiente.

## 13. Backlog priorizado

| ID | Prioridad | Acción | Estado | Evidencia/criterio |
|---|---|---|---|---|
| TECH-01 | P1 | Tailwind local y layout autónomo | Completado | Network/build/390 px |
| UX-01 | P1 | Sort/filtro anual coherente | Completado | Test + runtime asc/desc |
| A11Y-01 | P1 | Nombres, semántica y teclado | Completado lab | Axe + skip/table runtime |
| A11Y-02 | P1 | Contraste por tema | Completado | Axe 0 claro/oscuro |
| QUALITY-01 | P1 | Tests y CI | Completado local | `npm ci && npm run check`; CI remota pendiente |
| TECH-02 | P1 | Migrar/asegurar toolchain CRA | En progreso | Runtime audit 0; dev audit 54 |
| DATA-01 | P2 | Canonizar aliases conocidos | Completado | Unit + 157 opciones únicas |
| UX-02 | P2 | URL/deep link/back | Completado | Runtime |
| UX-03 | P2 | Search/paginación/eficiencia | En progreso | Implementado; task test pendiente |
| PERF-01 | P2 | LCP/bundle/terceros | Completado lab | Mediana Perf 98/LCP 2.4 s; rango preservado |
| UI-01 | P2 | Tipografía y fuente normativa | Completado | System stack sin request externo |
| ARCH-01 | P2 | Features y retiro de residuales | En progreso | Dominio/chart/hooks extraídos |
| DATA-02 | P2 | Mostrar fuente y actualización | Pendiente | Provenance visible y auditable |
| PROD-01 | P2 | Verificar producción y smoke | Completado | URL + datos + release E4 |
| RESEARCH-01 | P3 | Observar cinco tareas | Pendiente | Éxito/tiempo/errores/ayuda |

## 14. Objetivos y KRs

### Objetivo 1 — Mantener confiable la consulta histórica

- KR1: `npm run check` verde en cada cambio a main.
- KR2: cero divergencias chart/resumen/tabla para la matriz década/torneo/sort.
- KR3: cero aliases visibles duplicados para entidades incluidas en el diccionario.

### Objetivo 2 — Acceso equivalente

- KR1: cero violaciones Axe critical/serious en seis tabs y dos temas.
- KR2: seis tareas completables solo con teclado en protocolo registrado.
- KR3: prueba con lector de pantalla en al menos un stack de escritorio/móvil.

### Objetivo 3 — Rendimiento y operación reales

- KR1: mantener Lighthouse lab ≥90, LCP <2.5 s y TBT <200 ms.
- KR2: LCP p75 de campo <2.5 s con ventana y muestra declaradas.
- KR3: smoke de producción y rollback verificables por release.

## 15. Meta de calidad

| Hito | Score | Evidencia necesaria |
|---|---:|---|
| Línea base preservada | 5.4 | Auditoría inicial E2/E3 |
| Actual | 7.5 | Gates locales + producción desktop/móvil + API + Axe/Lighthouse |
| Fase 3 cerrada | 8.1–8.2 | Modularidad, deuda residual y autenticidad probadas |
| Meta recomendada | 8.6 | Producción, AT/usuarios, RUM y cero P1 |

Superar 9.0 exigiría resultados sostenidos en producción, accesibilidad profunda, procedencia editorial, operación madura y comparación real; no se justifica perseguir 10/10 por defecto.

## 16. Continuidad

### Log de decisiones

| Fecha | Decisión | Motivo | Evidencia |
|---|---|---|---|
| 2026-08-04 | Línea base 5.4 y cap 7.4 | Layout/accessibilidad bloqueantes | Auditoría inicial |
| 2026-08-04 | Elegir archivo público estático | El JSON ya se distribuye al navegador | Servicio activo + endpoint ajustado |
| 2026-08-04 | Compilar Tailwind y usar system fonts | Eliminar terceros críticos/CORS | Network/build |
| 2026-08-04 | Separar datos y chart | Reducir costo inicial sin reescritura | Chunks/build |
| 2026-08-04 | Separar runtime de dev audit | CRA es toolchain, no código servido | `npm audit --omit=dev` = 0 |
| 2026-08-04 | Confirmar 7.5, no potencial | Producción/campo siguen ausentes | Calculadora + gates |
| 2026-08-04 | Cerrar PROD-01 sin subir el score | El deploy y smoke elevan confianza, pero no sustituyen campo | Vercel + HTTP + navegador + logs |

### Próxima acción recomendada

Tomar **ARCH-01 + TECH-02** como un bloque protegido por `npm run check`: inventariar y retirar módulos no montados, extraer agregaciones de `App.js` y preparar una migración incremental de CRA. En paralelo, resolver **DATA-02** dentro de la UI antes de ampliar features.

### Qué desbloquea la siguiente décima

Cerrar una parte observable de ARCH-01 —grafo activo sin Login/Trivia/auth residuales y agregaciones puras con tests— o añadir procedencia/fecha de actualización visible con contrato editorial. No se concede por decoración.

### No verificado

- RUM, alertas y rollback ensayado en producción.
- Web Vitals de campo, tráfico, conversión, satisfacción o SUS.
- Lector de pantalla, zoom 200% y dispositivo físico.
- Exactitud y procedencia histórica partido por partido.
- Reachability concreta de cada advisory del toolchain CRA.
