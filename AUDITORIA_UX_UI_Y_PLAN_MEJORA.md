# Auditoría UX/UI y cierre de los cinco gates — Sebiche Celeste

> Fecha: 2026-08-04
>
> Alcance: producto completo, seis áreas, temas claro/oscuro y viewports 320/390/1440
>
> Estado: candidato desplegado y verificado en producción; validación humana, AT real y ventana RUM pendientes
>
> Puntaje bruto: **8.5/10**
>
> Puntaje confirmado: **8.4/10**
>
> Cap activo: **8.4** por ausencia de evidencia de campo y cobertura 73.3%
> Meta: **9.0 confirmado**, no estimado

## 1. Veredicto ejecutivo

El rediseño ya resolvió la crítica visual principal. La aplicación dejó de sentirse como una suma de tarjetas grandes y planas: ahora usa filas editoriales compactas, bandas comparables, fondos con jerarquía y paginación consistente. El header móvil mide 191 px a 320, el toggle alcanza 44×44 px y Rivales/Países montan un máximo de 18 partidos por página.

También cambió la base técnica: CRA 5 fue sustituido por Vite 7, `App.js` se redujo a un orquestador de 179 líneas, las seis vistas viven por feature, el dataset tiene metadata y auditor propio, y el audit completo de npm queda en cero vulnerabilidades. El build, 17 pruebas de aplicación/API, dos pruebas del auditor de datos y el lint están verdes.

La interfaz y el sistema visual ya califican **9.0**, y la calificación técnica combinada es **9.1**. La nota global no puede declararse 9 todavía porque faltan las cinco sesiones con usuarios, VoiceOver/TalkBack en dispositivos reales y una ventana de RUM posterior al despliegue. Esas evidencias no pueden fabricarse ni sustituirse con Lighthouse.

## 2. Evidencia ejecutada

| Evidencia | Resultado | Nivel |
|---|---|---:|
| `npm run check` | Lint limpio; auditor de datos; 2/2 pruebas del auditor; 17/17 tests; build Vite correcto | E3 |
| `npm audit` | 0 vulnerabilidades totales | E3 |
| Auditor de archivo | 1,936 registros; 1956-08-05 a 2026-08-02; esquema, fecha, temporada, marcador, resultado, club, país, torneo, duplicados y metadata válidos | E3 |
| Anomalía sembrada | El auditor falla ante incoherencia marcador/resultado | E3 |
| Axe | 6 áreas × 2 temas; 12 corridas; 0 violaciones WCAG A/AA/2.1 AA | E3 |
| Lighthouse móvil, 3 corridas | 97 Performance; 100 Accessibility; 100 Best Practices; 100 SEO en las tres | E3 |
| Web Vitals de laboratorio | LCP 2.405/2.406/2.416 s; TBT 0 ms; CLS 0 | E3 |
| Responsive extremo | 320 px, seis áreas y dos temas: 0 overflow; header 191 px; controles de acción ≥44 px | E3 |
| Colecciones largas | Alianza Lima 18/140 y Argentina 18/60; página independiente en URL; foco queda en Siguiente | E3 |
| Navegación por teclado | Primer Tab llega al skip link; Enter mueve foco a `#main-content` | E3 |
| RUM consentido | 0 requests antes de consentimiento; payload anónimo validado y endpoint cubierto por tests | E3 |
| Detector visual | `impeccable` devuelve 0 findings en App, features y componentes activos | E3 |
| GitHub | Commit desplegado `9ac541a`, PR draft #2 y job `quality` verde | E3 |
| Producción Vercel | `celeste.sebiche.com`; deployment `dpl_6jS8BTfZS72gpocY6eLKN2tZcLvM`; raíz/datos 200; RUM 202; inválidos 400; logs sin errores | E4 |
| Navegador de producción | Seis áreas a 390 px, 0 overflow, 0 errores/warnings; claro/oscuro y targets de 44 px en desktop | E4 |
| Usuarios, AT y campo | Protocolo preparado, sin sesiones ejecutadas | E0 |

Bundle de producción:

- App: 11.38 kB gzip.
- CSS: 7.95 kB gzip.
- Dataset diferido: 52.53 kB gzip.
- Charts diferidos: 59.68 kB gzip.
- Transferencia inicial observada por Lighthouse: 227 kB.

## 3. Scorecard reproducible

La entrada de cálculo está en `output/playwright/gates-score-input.json` y se procesa con el calculador del skill de auditoría.

| Área | Peso normalizado | Score | Evidencia | Lectura |
|---|---:|---:|---:|---|
| Estrategia de producto y módulos | 11.1% | 8.2 | E3 | Archivo específico, procedencia y correcciones; faltan usuarios |
| Arquitectura de información y journeys | 13.3% | 8.8 | E3 | Seis rutas, estado en URL y colecciones consistentes |
| Interacción y heurísticas | 13.3% | 8.8 | E3 | Eficiencia, foco y recuperación sólidos en laboratorio |
| UI y sistema de diseño | 11.1% | 9.0 | E3 | Densidad editorial, contraste y jerarquía ya distintivos |
| Accesibilidad y responsive | 13.3% | 8.7 | E3 | Axe limpio y reflow; faltan dos stacks AT reales |
| Arquitectura frontend | 11.1% | 9.1 | E3 | Vite, features, dominio y primitives compartidos |
| Calidad, confiabilidad y seguridad | 11.1% | 9.2 | E3 | Gates verdes, datos auditables y supply chain limpia |
| Rendimiento y operabilidad | 8.9% | 8.9 | E3 | Lighthouse estable y RUM listo; falta ventana real |
| Medición y evidencia de usuario | 6.7% | 4.5 | E2 | Instrumentación/protocolo listos; no hay resultados de campo |
| **Total bruto** | **100%** | **8.5/10** |  |  |
| **Total confirmado** |  | **8.4/10** |  | **Cap de evidencia activo** |

## 4. Estado de los cinco gates

| Gate | Estado | Qué quedó cerrado | Qué falta para salida formal |
|---|---|---|---|
| 1. Densidad y eficiencia responsive | **Cerrado** | Header 191 px; toggle 44 px; 18 filas; URL/foco; 320 sin overflow | Nada local |
| 2. Confianza editorial y datos | **Cerrado** | Fuente, fecha, cobertura, método, límites, canal de corrección y auditor canónico | Procedencia partido por partido es una mejora futura, no un bloqueo declarado |
| 3. Arquitectura y toolchain | **Cerrado** | CRA→Vite, features, dominio, primitives, 0 advisories y CI Node 22 verde en PR #2 | Nada técnico |
| 4. Usuarios y accesibilidad profunda | **Parcial** | Axe, teclado focal, responsive y protocolo completo | 5 participantes, zoom nativo 200%, VoiceOver desktop y VoiceOver/TalkBack móvil |
| 5. Release y evidencia operativa | **Parcial** | Producción trazable, HTTP/API/journeys/logs limpios, Lighthouse estable, consentimiento y endpoint RUM | Completar una ventana RUM con volumen, p75 y sesgo declarados |

Los Gates 4 y 5 no se marcan cerrados porque todavía exigen evidencia de campo. El archivo `VALIDACION_CAMPO_9.md` contiene la matriz que debe completarse.

## 5. Nielsen

Escala 0–4. El total actual de laboratorio es **36.6/40**.

| # | Heurística | Score | Evidencia |
|---:|---|---:|---|
| 1 | Visibilidad del estado | 3.8 | Loading, errores, rangos, página y selección explícitos |
| 2 | Correspondencia con el mundo real | 3.7 | V/E/P, torneos, fuentes, método y limitaciones |
| 3 | Control y libertad | 3.7 | URL, back/forward, filtros reversibles y páginas independientes |
| 4 | Consistencia y estándares | 3.8 | Una representación compartida para partido, balance y paginación |
| 5 | Prevención de errores | 3.5 | Valores restringidos, canonicalización y auditor de datos |
| 6 | Reconocimiento antes que recuerdo | 3.8 | Labels, estados, datalist, badges y jerarquía estable |
| 7 | Flexibilidad y eficiencia | 3.7 | Máximo 18 filas, filtros y deep links |
| 8 | Diseño estético y minimalista | 3.8 | Densidad corregida sin decoración gratuita |
| 9 | Diagnóstico y recuperación | 3.6 | Error humano y reintento probado |
| 10 | Ayuda y documentación | 3.2 | Procedencia visible, README y canal de corrección |

Ninguna heurística obtiene 4 sin observación de campo.

## 6. AI Slop y autenticidad visual

- Riesgo AI Slop: **1.4/10 — bajo**.
- Autenticidad visual/editorial: **8.6/10**.
- Detector: 0 findings en la superficie activa.

| Dimensión | Riesgo 0–2 | Lectura |
|---|---:|---|
| Composición genérica | 0.4 | Archivo editorial y bandas sustituyen el bento repetitivo |
| Clichés visuales | 0.2 | No hay glass, orbs, gradientes decorativos ni motion gratuito |
| Repetición de componentes | 0.3 | Repetición funcional y semántica, no una card universal |
| Marca/copy genéricos | 0.3 | Sporting Cristal, cobertura y metodología son explícitos |
| Falta de especificidad | 0.2 | Fecha, temporada, rival, país, torneo y procedencia dominan la UI |

La mejora de autenticidad proviene de información y jerarquía, no de añadir adornos ni noticias sensibles sin fuente.

## 7. Cambios entregados por gate

### Gate 1

- `Pagination` y `PaginatedMatchList` unifican el contrato de 18 resultados.
- `rivalPage` y `countryPage` preservan contexto sin colisionar con Partidos.
- El header móvil usa una matriz 3×2 compacta y el logo deja de dominar la entrada.
- Balance y Dashboard usan bandas/separadores; MatchRow concentra fecha, resultado, equipos, marcador, torneo y goleadores.

### Gate 2

- `archive-metadata.json` declara revisión, cobertura, fuentes, método y límites.
- `ArchiveProvenance` aparece en las seis áreas.
- La plantilla de issue formaliza correcciones de datos.
- `scripts/audit-data.mjs` forma parte de `npm run check`.
- El cálculo ya trata una tanda de penales documentada como resultado definitivo, corrigiendo el resumen histórico.

### Gate 3

- Vite 7 + Vitest 4 + ESLint 9 sustituyen CRA.
- `App.js` orquesta; Dashboard, Efemérides, Partidos y Año viven en `src/features`.
- Agregaciones y paginación son funciones puras con pruebas.
- El runtime carga el dataset con `loadArchive()`; no hay prototipos Login/Trivia en `src/`.
- `vercel.json` sirve `dist`; CI usa Node 22.

### Gate 4

- Semántica, foco, skip link, contraste y targets se verificaron en las seis vistas y dos temas.
- Axe quedó limpio en 12 corridas.
- Las pruebas humanas y AT reales permanecen intencionalmente en blanco hasta ejecutarse.

### Gate 5

- Web Vitals se activa solo con consentimiento explícito.
- Se aceptan exclusivamente CLS, INP y LCP; strings están acotados y no se recibe identidad/contenido de consulta.
- El endpoint responde 202 a payload válido, 400 a payload inválido y 405 a métodos no permitidos.
- La inserción tardía del footer fue corregida: CLS pasó de 0.0914 a 0 en tres corridas finales.
- El commit `9ac541a` fue promovido a producción y validado en `celeste.sebiche.com` con seis journeys, API, consola y logs.

## 8. Hallazgos abiertos

### RESEARCH-01 — Cinco sesiones observadas

- Prioridad: P2.
- Estado: pendiente externo.
- Cierre: ≥23/25 tareas sin ayuda crítica, con tiempo, error, ayuda y evidencia.

### RESEARCH-02 — Tecnologías asistivas reales

- Prioridad: P2.
- Estado: pendiente externo.
- Cierre: seis áreas a 200% nativo, VoiceOver + Safari desktop y un stack móvil VoiceOver/TalkBack; cero bloqueos y cero critical/serious.

### OBS-01 — Ventana de RUM

- Prioridad: P2.
- Estado: instrumentado, sin campo.
- Cierre: declarar ventana, navegaciones válidas, sesgo y p75; LCP <2.5 s, INP <200 ms y CLS <0.1.

No hay P0/P1 técnicos o visuales abiertos en producción.

## 9. Plan exacto para confirmar 9.0

1. Usar la producción trazable ya publicada y ejecutar las cinco tareas con cinco participantes.
2. Completar VoiceOver/TalkBack y zoom nativo; corregir y repetir cualquier bloqueo.
3. Corregir y desplegar cualquier hallazgo del Gate 4 usando el mismo gate CI y smoke.
4. Observar una ventana RUM declarada y recalcular con evidencia E4.

Con Gate 4 cerrado, el puntaje bruto actual de 8.5 puede subir hacia 8.8–8.9 por evidencia, no por cosmética. El 9.0 se confirma cuando producción y RUM demuestran que el mismo candidato sostiene la calidad. El 9.5 requiere varias ventanas/releases sin regresión y evidencia longitudinal de utilidad.

## 10. Evidencia visual y artefactos

- `output/playwright/gates-mobile-320-fixed.png`
- `output/playwright/gates-mobile-390-fixed.png`
- `output/playwright/gates-desktop-1440-fixed.png`
- `output/playwright/gates-desktop-dark-fixed.png`
- `output/playwright/gates-lighthouse-cls-check.json`
- `output/playwright/gates-lighthouse-final-2.json`
- `output/playwright/gates-lighthouse-final-3.json`
- `output/playwright/gates-score-input.json`
- `output/playwright/production-gates-mobile-390.png`
- `output/playwright/production-gates-desktop-1440.png`
- `output/playwright/production-gates-desktop-dark.png`
- `VALIDACION_CAMPO_9.md`

## 11. Límites de la auditoría

- No se declara conformidad WCAG completa sin AT real.
- Lighthouse y Axe son evidencia de laboratorio, no comportamiento humano ni field data.
- La exactitud partido por partido de 1,936 registros no fue contrastada individualmente contra una fuente primaria; el QA comprueba consistencia interna y metadata.
- Una muestra RUM insuficiente debe seguir reportándose como “no verificada”.
- Noticias o renuncias del club no entran al archivo sin fuente, fecha y contrato editorial explícito.
