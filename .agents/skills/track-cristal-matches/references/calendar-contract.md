# Contrato de Google Calendar

## Calendario y zona horaria

- Usar el calendario propietario llamado exactamente `Sporting Cristal` de la cuenta conectada.
- No usar el calendario principal ni crear otro calendario con nombre parecido.
- Mantener la zona general y de visualización de Google Calendar en `America/Chicago`.
- Interpretar la programación publicada por las fuentes como `America/Lima`, salvo que la fuente declare expresamente otra zona.
- Guardar cada evento con zona de evento `America/Lima`; Google Calendar hará la conversión para mostrarlo en Chicago.
- Calcular automatizaciones pospartido en Lima, convertir el instante resultante a `America/Chicago` para comunicarlo y a UTC para codificar el RRULE. El motor cron observado interpreta `BYHOUR` y `BYMINUTE` en UTC.
- Verificar tras cada escritura que `automation.toml` conserva la fecha/hora UTC esperada y `COUNT=1`; una llamada sin respuesta o sin persistencia no prueba que exista la automatización.
- No usar abreviaturas ambiguas (`CST`, `CDT`, `PET`) ni offsets fijos. Lima permanece en UTC-5; Chicago alterna entre UTC-5 y UTC-6.
- Usar color de evento celeste cuando el conector permita elegirlo; no es requisito para publicar.

Ejemplos:

- Agosto: 20:00 Lima se muestra 20:00 Chicago porque ambas ciudades están en UTC-5.
- Diciembre: 20:00 Lima se muestra 19:00 Chicago porque Chicago está en UTC-6.
- Una comprobación a las 22:15 Lima en diciembre debe programarse a las 21:15 Chicago.

## Evento programado

- Título: `⚽ Local vs Sporting Cristal` o `⚽ Sporting Cristal vs Visita`.
- Inicio: hora oficial de saque inicial.
- Fin: inicio + 2 h 15 min.
- Eliminatoria con posible prórroga: inicio + 3 h.
- Ubicación: nombre oficial del estadio y ciudad cuando esté confirmada.
- Transparencia: ocupado.

Descripción mínima:

```text
Torneo: Clausura 2026
Fecha: 4
Estado: PROGRAMADO
Duración estimada: 2 h 15 min
Hora oficial: 20:00 America/Lima
Vista del calendario: America/Chicago (conversión automática)
Clave: 2026-08-07|Clausura|Universitario|Sporting Cristal

Fuentes:
- https://fuente-oficial.example/partido
- https://fuente-independiente.example/partido
```

## Evento finalizado

- Título: `FINAL · Local X–Y Visita`.
- Mantener ubicación original. Mantener inicio y fin salvo que dos fuentes estructuradas independientes coincidan en una hora real distinta; en ese caso corregir inicio y fin, conservar la hora programada anterior en la descripción y enlazar ambas fuentes.
- Estado: `PUBLICADO` solo después de verificar web de producción.
- Añadir resultado desde la perspectiva de Cristal, goleadores confirmados, URL de producción y hash del commit.

Si el partido terminó pero la publicación no, mantener el título programado y usar `Estado: PUBLICACIÓN PENDIENTE` con el motivo. No usar `FINAL` como sinónimo de publicación exitosa.

## Idempotencia

Buscar por ventana temporal y clave estable antes de crear. Si el evento existe:

- actualizar campos que hayan cambiado;
- conservar notas manuales ajenas al bloque administrado;
- reutilizar su `event_id` para el cierre;
- nunca crear un segundo evento para una reprogramación.
