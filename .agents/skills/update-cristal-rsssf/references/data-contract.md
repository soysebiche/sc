# Contrato de datos y validación

## Registro canónico

Cada partido conserva exactamente estas claves y en este orden:

1. `Año`: entero derivado de `Fecha`.
2. `Mes`: nombre en español.
3. `Dia`: entero sin tilde en la clave, por compatibilidad histórica.
4. `Día de la Semana`: nombre en español.
5. `Fecha`: `YYYY-MM-DD`.
6. `Torneo`: `Apertura`, `Clausura`, `Liga 1 Playoff`, `Libertadores Playoff` o `Copa de la Liga`.
7. `Número de Fecha`: texto. Usar el número RSSSF; numerar secuencialmente los partidos del `Libertadores Playoff` para conservar la convención histórica; para Copa usar `Grupo J - 1`, `Octavos`, `Cuartos`, `Semifinal - Ida`, `Semifinal - Vuelta` o `Final`.
8. `Equipo Local`: nombre canónico.
9. `Equipo Visita`: nombre canónico.
10. `Marcador`: goles locales y visitantes como `X-Y`. No incluir penales.
11. `Resultado`: `V`, `E` o `P` desde la perspectiva de Sporting Cristal.
12. `Goles (Solo SC)`: `Nombre (minuto[, minuto])`, separado por coma entre jugadores.
13. `País`: `Perú` para estas competiciones domésticas.

## Estados

- `confirmed_source`: RSSSF produjo un registro estructuralmente válido. Todavía necesita segunda fuente.
- `review_manual`: existe cualquier ambigüedad o inconsistencia; no aplicar.
- `missing`: RSSSF contiene un partido que el JSON no contiene.
- `different`: el partido existe, pero uno o más campos difieren.
- `duplicate`: hay más de un registro histórico para la misma identidad.
- `extra`: el JSON contiene un partido doméstico sin equivalente RSSSF.
- `matched`: los campos comparados coinciden.

## Normalización

Aplicar solamente reemplazos exactos de `aliases.json`, después de normalizar Unicode NFC y espacios. Un nombre desconocido se conserva para el informe, pero exige revisión antes de incorporarse al histórico.

No confundir:

- El marcador de la tanda de penales con el marcador del partido.
- Un autogol a favor de Cristal con un gol marcado para el rival.
- Una sección de tabla o goleadores con una línea de partido.
- `Apertura` con `Clausura` cuando RSSSF mantiene partidos aplazados bajo la sección original.

## Evidencia mínima para aprobar

Por partido, conservar en el reporte:

- URL RSSSF anual.
- URL secundaria directa.
- Fecha de consulta.
- Campos confirmados por cada fuente.
- Explicación de cualquier normalización aplicada.

Si una fuente secundaria solo confirma el marcador, dejar los goleadores pendientes. No rellenarlos desde snippets, memoria o inferencia.
