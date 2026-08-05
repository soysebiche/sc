# Sebiche Celeste

Archivo público y estático para consultar 1,936 partidos y estadísticas históricas de Sporting Cristal.

## Capacidades

- Efemérides por día y mes.
- Resumen histórico de resultados y goles.
- Partidos filtrados por año y mes, con paginación.
- Análisis anual por década y tipo de torneo.
- Historial consolidado por rival y país.
- Vistas y filtros compartibles mediante parámetros de URL.
- Tema claro/oscuro y soporte para reduced motion.

## Arquitectura

- React 19 sobre Vite 7.
- Tailwind CSS 3 y Autoprefixer compilados localmente con PostCSS.
- Recharts cargado solo al abrir la vista Año.
- Dataset cargado como chunk diferido desde `src/data/historico_completo_sc.json`.
- Metadata editorial en `src/data/archive-metadata.json` y auditor reproducible en `scripts/audit-data.mjs`.
- Helpers y agregaciones de dominio en `src/domain/matches.js`.
- Seis vistas separadas por feature; balances, paginación y filas de partido compartidos.
- Estado compartible en `src/hooks/useUrlState.js`.
- Web Vitals opcionales y consentidos hacia `/api/vitals`; no se envían identificadores personales ni el contenido de consultas.

El dataset es público: el navegador debe recibirlo para ejecutar las consultas. No se requiere autenticación ni backend. `/api/data?type=completo` es un endpoint público opcional para compatibilidad; la UI no depende de él.

## Desarrollo local

Requisitos: Node.js 20 o posterior y npm.

```bash
npm ci
npm start
```

La aplicación de desarrollo abre en `http://localhost:5173` salvo que Vite elija otro puerto disponible.

## Gates de calidad

```bash
npm run lint
npm run test:ci
npm run build
npm run check
```

`npm run check` ejecuta lint, auditoría y pruebas del dataset, pruebas de interfaz/dominio y el build de producción. El mismo gate está declarado en `.github/workflows/ci.yml`.

Para distinguir riesgo servido de deuda del toolchain:

```bash
npm audit --omit=dev
npm audit
```

El primer comando audita las dependencias de runtime. El segundo incluye las herramientas de build y testing. Ambos deben mantenerse sin vulnerabilidades altas o críticas alcanzables.

## Variables de entorno

No hay variables obligatorias para ejecutar el archivo. `VITE_GA_MEASUREMENT_ID` activa GA4 únicamente después del consentimiento explícito del visitante; la medición de rendimiento propia usa la misma preferencia.

## Deployment

El repositorio contiene `vercel.json` para servir `/api/data`, assets estáticos y el fallback SPA. Configuración esperada:

- Build: `npm run build`
- Output: `dist`
- Framework: Vite

Producción verificada el 2026-08-04:

- URL canónica: <https://celeste.sebiche.com>
- Commit desplegado: `9ac541a7c1a23327d6a40f0863f28c9a348478dd`
- Deployment Vercel: `sc-p1rwbuzxf-sebbs21s-projects.vercel.app` (`dpl_6jS8BTfZS72gpocY6eLKN2tZcLvM`)

- Smoke: documento y dataset respondieron 200; dataset inválido 400; RUM válido 202 e inválido 400.
- Navegador: las seis áreas cargaron a 390 px sin overflow ni errores/warnings de consola; claro/oscuro y targets de 44 px verificados en desktop.
- Logs: cero eventos de nivel error después del smoke; el payload RUM de prueba quedó registrado con la revisión correcta.

El estado `Ready` del proveedor no sustituye estas comprobaciones: repetir el smoke HTTP, los journeys, la consola y los logs después de cada release.

### Próximos partidos y calendario

Los partidos confirmados viven en `src/data/upcoming-fixtures.json`. `npm run generate:calendar` valida esos datos y publica `public/sporting-cristal.ics`, un feed iCalendar de solo lectura que no depende de una cuenta de Google ni expone calendarios personales. Solo deben añadirse partidos del primer equipo con fecha, hora y estadio confirmados por la autoridad de la competencia.

### Medición anónima

GA4 se carga únicamente después del consentimiento explícito y solo si existe `VITE_GA_MEASUREMENT_ID`. Los eventos usan una lista cerrada de secciones, filtros y paginaciones; nunca se envían textos escritos ni valores de búsqueda. La preferencia puede revocarse desde el pie de página.

## Documentación

- `AUDITORIA_UX_UI_Y_PLAN_MEJORA.md`: auditoría y backlog vivo.
- `DESIGN_SYSTEM.md`: tokens y patrones activos.
- `SETUP_SIMPLE.md`: contrato de datos actual.
- `SETUP_VERCEL_FUNCTIONS.md`: alcance del endpoint opcional.
- `VALIDACION_CAMPO_9.md`: protocolo y registro obligatorio para confirmar el 9.0.
