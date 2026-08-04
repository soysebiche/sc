# Contrato de publicación

## Antes de escribir

1. Confirmar dos fuentes independientes según `source-policy.md`.
2. Revisar `git status --short --branch` y no mezclar cambios ajenos.
3. Buscar la identidad completa en `src/data/historico_completo_sc.json`.
4. Detenerse ante duplicados, marcador distinto, torneo dudoso o nombres sin normalizar.

## Alta

- Editar únicamente `src/data/historico_completo_sc.json` con `apply_patch`.
- Mantener orden cronológico y las 13 claves del contrato existente.
- Incluir solo goles de Sporting Cristal.
- No reordenar ni reformatear el archivo completo.

## Validación

Como mínimo:

```bash
python3 -m json.tool src/data/historico_completo_sc.json >/dev/null
CI=true npm test -- --watchAll=false
npm run build
```

El fallo conocido de `src/App.test.js` por el texto `learn react` debe reportarse; no convertirlo en éxito. Ejecutar además las pruebas del skill RSSSF si el alta es doméstica.

## Git y producción

- Commit limitado al partido, con mensaje descriptivo.
- Push directo a `main` solo para un alta automática que cumpla todas las reglas de fuentes y validación.
- Verificar el despliegue y luego consultar la experiencia real en `https://celeste.sebiche.com`.
- Un build local o un despliegue `Ready` no prueban que el registro sea visible.
- Actualizar el calendario a `FINAL` solo después de verificar la página en producción.

Si cualquier paso falla, conservar la evidencia local, no repetir commits y alertar con el punto exacto de fallo.
