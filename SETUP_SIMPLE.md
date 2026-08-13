# Contrato de datos actual

Sebiche Celeste es una aplicación pública y estática.

- Fuente canónica del runtime: `src/data/historico_completo_sc.json`.
- Carga: `loadArchive()` en `src/services/archive.js`.
- Autenticación: no aplica.
- Variables obligatorias: ninguna.
- Endpoint `/api/data`: compatibilidad pública opcional; la UI no depende de él.

Los datos enviados a una aplicación web pueden ser descargados por sus visitantes. No describir este archivo como privado ni añadir un token cosmético al frontend.

## Inicio local

```bash
npm ci
npm start
```

## Verificación

```bash
npm run check
```

Para deployment y límites de evidencia, consultar `README.md` y `AUDITORIA_UX_UI_Y_PLAN_MEJORA.md`.
