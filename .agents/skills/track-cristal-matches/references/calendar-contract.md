# Contrato de Google Calendar

## Calendario y zona horaria

- Usar el calendario propietario llamado exactamente `Sporting Cristal` de la cuenta conectada.
- No usar el calendario principal ni crear otro calendario con nombre parecido.
- Guardar cada evento con zona `America/Lima`.
- Usar color de evento celeste cuando el conector permita elegirlo; no es requisito para publicar.

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
Zona horaria: America/Lima
Clave: 2026-08-07|Clausura|Universitario|Sporting Cristal

Fuentes:
- https://fuente-oficial.example/partido
- https://fuente-independiente.example/partido
```

## Evento finalizado

- Título: `FINAL · Local X–Y Visita`.
- Mantener inicio, fin y ubicación originales.
- Estado: `PUBLICADO` solo después de verificar web de producción.
- Añadir resultado desde la perspectiva de Cristal, goleadores confirmados, URL de producción y hash del commit.

Si el partido terminó pero la publicación no, mantener el título programado y usar `Estado: PUBLICACIÓN PENDIENTE` con el motivo. No usar `FINAL` como sinónimo de publicación exitosa.

## Idempotencia

Buscar por ventana temporal y clave estable antes de crear. Si el evento existe:

- actualizar campos que hayan cambiado;
- conservar notas manuales ajenas al bloque administrado;
- reutilizar su `event_id` para el cierre;
- nunca crear un segundo evento para una reprogramación.
