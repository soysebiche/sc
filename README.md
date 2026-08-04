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

- React 19 y Create React App 5.
- Tailwind CSS 3 compilado localmente.
- Recharts cargado solo al abrir la vista Año.
- Dataset cargado como chunk diferido desde `src/data/historico_completo_sc.json`.
- Helpers de dominio en `src/domain/matches.js`.
- Estado compartible en `src/hooks/useUrlState.js`.

El dataset es público: el navegador debe recibirlo para ejecutar las consultas. No se requiere autenticación ni backend. `/api/data?type=completo` es un endpoint público opcional para compatibilidad; la UI no depende de él.

## Desarrollo local

Requisitos: Node.js 20 o posterior y npm.

```bash
npm ci
npm start
```

La aplicación de desarrollo abre en `http://localhost:3000`.

## Gates de calidad

```bash
npm run lint
npm run test:ci
npm run build
npm run check
```

`npm run check` ejecuta lint, las 8 pruebas actuales y el build de producción. El mismo gate está declarado en `.github/workflows/ci.yml`.

Para distinguir riesgo servido de deuda del toolchain:

```bash
npm audit --omit=dev
npm audit
```

El primer comando audita las dependencias de runtime. El segundo incluye CRA y todas las herramientas de build. No se recomienda `npm audit fix --force` sin una migración probada.

## Variables de entorno

No hay variables obligatorias. `REACT_APP_GA_MEASUREMENT_ID` está documentada en `env.example`, pero solo tendrá efecto si se conecta explícitamente una integración de analítica.

## Deployment

El repositorio contiene `vercel.json` para servir `/api/data`, assets estáticos y el fallback SPA. Configuración esperada:

- Build: `npm run build`
- Output: `build`
- Framework: Create React App

Producción verificada el 2026-08-04:

- URL canónica: <https://celeste.sebiche.com>
- Commit desplegado: `32e453e336a4c5e15373eddb87e442026239cec8`
- Deployment Vercel: `sc-ev0oz0wzn-sebbs21s-projects.vercel.app`
- Smoke: documento, logo, manifest, deep links y `/api/data?type=completo` respondieron correctamente.
- Navegador: Efemérides, Partidos, Año y Rivales cargaron sin errores de consola ni overflow a 390 px.

El estado `Ready` del proveedor no sustituye estas comprobaciones. Repetir el smoke después de cada release.

## Documentación

- `AUDITORIA_UX_UI_Y_PLAN_MEJORA.md`: auditoría y backlog vivo.
- `DESIGN_SYSTEM.md`: tokens y patrones activos.
- `SETUP_SIMPLE.md`: contrato de datos actual.
- `SETUP_VERCEL_FUNCTIONS.md`: alcance del endpoint opcional.
