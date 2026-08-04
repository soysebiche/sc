---
name: update-cristal-rsssf
description: Audita y prepara actualizaciones del historico de Sporting Cristal desde las paginas anuales de RSSSF Peru. Usar para revisar resultados recientes o temporadas completas, extraer solo Primera Division y Copa de la Liga, normalizar equipos y goleadores, comparar contra src/data/historico_completo_sc.json, investigar una segunda fuente y generar cambios seguros para revision humana.
---

# Actualizar Cristal desde RSSSF

Mantener el histórico doméstico de Sporting Cristal mediante extracción determinista, contraste independiente y revisión humana.

## Flujo obligatorio

1. Trabajar desde la raíz del repositorio Cristal y comprobar `git status --short`. Preservar cualquier cambio local existente.
2. Ejecutar primero el auditor, sin modificar el histórico:

   ```bash
   python3 .agents/skills/update-cristal-rsssf/scripts/rsssf_cristal.py audit \
     --year 2026 \
     --historico src/data/historico_completo_sc.json
   ```

3. Leer `references/data-contract.md` antes de interpretar conflictos o preparar registros.
4. Revisar todos los elementos con estado `review_manual`. No convertirlos en altas automáticas.
5. Confirmar cada partido nuevo en una segunda fuente. Preferir, en este orden:
   - Liga1 o FPF para Primera División.
   - Sitio oficial de Sporting Cristal para Copa de la Liga y goleadores.
   - ESPN o 365Scores solo como respaldo estructurado.
6. Exigir coincidencia de fecha, local, visitante y marcador. Para publicar goleadores, exigir además una fuente que identifique los autores; una búsqueda de Google no cuenta como fuente por sí sola.
7. Preparar los registros faltantes con `stage`. Este comando escribe un artefacto de revisión, nunca el histórico:

   ```bash
   python3 .agents/skills/update-cristal-rsssf/scripts/rsssf_cristal.py stage \
     --year 2026 \
     --historico src/data/historico_completo_sc.json \
     --output /tmp/cristal-rsssf-2026.json
   ```

8. Presentar altas, diferencias, fuentes y advertencias al usuario. Esperar aprobación explícita antes de editar el JSON, crear un commit, hacer push o desplegar.
9. Tras una aprobación, aplicar solo los registros confirmados con `apply_patch`. Mantener las 13 claves y el orden de claves definidos en el contrato. No reordenar todo el archivo.
10. Validar el JSON, ejecutar `npm run build` y resumir el resultado real. No llamar operativa a la web solo porque el build o un despliegue terminó.

## Límites de alcance

- Incluir únicamente las secciones RSSSF `Primera División` y `Copa de la Liga`.
- Incluir únicamente partidos terminados donde participe Sporting Cristal.
- Ignorar Segunda División, Liga 3, ligas distritales, tablas, goleadores generales, `bye` y fixtures sin marcador final.
- No importar Libertadores, Sudamericana ni amistosos con este skill.
- Usar RSSSF como fuente primaria de extracción, no como autoridad infalible. Detener la escritura cuando otra fuente discrepe.
- Mantener el modo de revisión manual. No hacer commit ni push automáticos.

## Reglas de seguridad de datos

- Identificar un partido por fecha, torneo, equipo local y equipo visitante; comparar el marcador como contenido mutable que puede corregirse.
- Tratar fechas en rango, rondas desconocidas, goleadores ausentes, conteos de goleadores incompatibles, nombres sin normalizar y duplicados como `review_manual`.
- Aplicar solo alias exactos de `references/aliases.json`. No usar coincidencias difusas ni inventar nombres.
- Conservar `Resultado` como `V`, `E` o `P`; calcularlo desde el marcador y la localía.
- Usar cadena vacía cuando Sporting Cristal no marcó. No usar `-`, `null` ni goleadores del rival.
- Conservar minutos RSSSF como `45+2`, `76pen` y `35og`.
- Registrar goles en propia puerta únicamente si beneficiaron a Sporting Cristal. Si el orden de RSSSF produce un conteo imposible, detenerse.

## Recurrencia recomendada

Ejecutar los martes a las 06:00 en `America/Lima`. Si no hay novedades, reportar un no-op. Si RSSSF todavía no actualizó la fecha, informar que falta la fuente; no inferir el resultado desde memoria. Durante las primeras cuatro ejecuciones, toda alta requiere revisión humana aun cuando las fuentes coincidan.
