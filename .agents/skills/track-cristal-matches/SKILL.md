---
name: track-cristal-matches
description: Sincroniza los partidos competitivos del primer equipo de Sporting Cristal con Google Calendar y cierra partidos terminados en el historico del proyecto. Usar para buscar programaciones nuevas o modificadas, crear o actualizar eventos con hora y estadio, verificar resultados y goleadores tras el pitazo final, publicar altas confirmadas en src/data/historico_completo_sc.json, actualizar el evento con el marcador final y auditar despues contra RSSSF.
---

# Seguir partidos de Sporting Cristal

Mantener un flujo rápido y verificable desde la programación oficial hasta la publicación del resultado. RSSSF es auditor tardío, no la fuente que bloquea la actualización.

## Elegir el modo

- `sync-fixtures`: buscar la programación confirmada de las próximas tres semanas y sincronizar el calendario.
- `finalize-match`: después del final estimado, verificar un partido, actualizar el histórico y cerrar el evento.
- `audit-rsssf`: contrastar posteriormente los partidos publicados mediante `$update-cristal-rsssf`, sin duplicarlos ni sobrescribir evidencia más fuerte.

Leer antes de actuar:

- Para fuentes y umbrales: `references/source-policy.md`.
- Para títulos, duración y campos de calendario: `references/calendar-contract.md`.
- Para escrituras, Git y producción: `references/publication-contract.md`.
- Para las 13 claves del JSON: `../update-cristal-rsssf/references/data-contract.md`.

## Reglas comunes

1. Trabajar desde la raíz del repositorio y revisar `git status --short --branch`. Preservar cambios ajenos.
2. Incluir solo el primer equipo masculino y partidos competitivos: Apertura, Clausura, Liga 1 Playoff, Copa de la Liga, Libertadores y Sudamericana.
3. Excluir amistosos, Tarde Celeste, reserva, juveniles y fútbol femenino.
4. Resolver el calendario por perfil y nombre: cuenta conectada del usuario, calendario propietario llamado exactamente `Sporting Cristal`. No publicar en el calendario principal ni hardcodear credenciales.
5. Tratar `America/Lima` como zona de origen y `America/Chicago` como zona de visualización y del programador local. Guardar el evento en Lima; Google lo muestra convertido en Chicago.
6. Convertir zonas con identificadores IANA y la fecha real. Nunca copiar la hora del reloj ni usar una diferencia fija: Lima no cambia por horario de verano y Chicago sí. El motor cron observado interpreta `BYHOUR`/`BYMINUTE` en UTC aunque la interfaz se visualice en Chicago: convertir el instante final también a UTC antes de codificar el RRULE y verificar el próximo disparo persistido.
7. Identificar un partido por la fecha local de Lima, torneo, local y visitante. Guardar esta identidad estable en la descripción del evento aunque en Chicago pudiera verse otra fecha.
8. No duplicar. Buscar primero eventos del calendario en una ventana que cubra al menos 30 días alrededor del partido y actualizar el existente cuando coincida la identidad.
9. Reportar fuentes consultadas, coincidencias, conflictos, escrituras y validaciones reales.

## Modo `sync-fixtures`

1. Consultar una ventana móvil de 21 días desde hoy. Revisar también los últimos siete días para detectar reprogramaciones y partidos todavía no cerrados.
2. Empezar por la autoridad de la competición: Liga1/FPF para torneos peruanos y CONMEBOL para torneos internacionales. Contrastar con el club o una fuente estructurada independiente.
3. Para partidos dentro de las próximas 48 horas, revalidar fecha y hora contra la autoridad y al menos dos proveedores estructurados independientes. Si dos proveedores actuales coinciden en una nueva hora y la página de la autoridad parece desactualizada, actualizar el evento, documentar la discrepancia y reprogramar el cierre; no conservar ciegamente la hora antigua.
4. Crear un evento solo cuando fecha y hora estén confirmadas. Si existe únicamente una fecha o rango tentativo, reportarlo como `TBD` y volver a revisar en la siguiente ejecución.
5. Si dos fuentes difieren sin que exista la coincidencia reforzada del paso 3, conservar el evento existente, añadir una advertencia al reporte y no cambiar la hora hasta resolver el conflicto.
6. Crear o actualizar el evento según `references/calendar-contract.md`, incluyendo torneo, fecha, estadio, duración estimada y URLs directas.
7. Para cada evento confirmado, garantizar una comprobación pospartido a la hora final estimada. Calcular el instante en `America/Lima`, convertirlo a `America/Chicago` para reportarlo y a UTC para codificar el RRULE. La comprobación debe invocar este skill en modo `finalize-match` con la identidad y el identificador del evento.
8. Después de crear o actualizar una automatización, exigir respuesta exitosa y verificar `automation.toml`: identidad, fecha UTC, hora UTC y `COUNT=1`. Un intento sin persistencia no cuenta como programado.
9. Cuando cambie fecha, hora o estadio, actualizar el evento y reprogramar la comprobación pospartido correspondiente.

## Modo `finalize-match`

1. Ejecutar a los 135 minutos del inicio para un partido de 90 minutos. Para eliminatorias con posible prórroga, ejecutar a los 180 minutos.
2. Confirmar que el partido figura como finalizado. Si sigue en juego, está suspendido o una fuente no tiene estado final, no publicar; reintentar en 15 minutos.
3. Antes de decidir el gate temporal, consultar la hora de inicio real en dos fuentes estructuradas. Si ambas coinciden en una demora o reprogramación, usar esa hora real para la elegibilidad y corregir inicio/fin del evento al cerrar el partido.
4. Exigir dos fuentes independientes que coincidan en fecha, local, visitante, torneo y marcador final. No contar un buscador, snippet o réplica del mismo feed como fuente independiente.
5. Los goleadores de Sporting Cristal requieren dos fuentes coincidentes, o una fuente oficial más una fuente estructurada con eventos. Si el marcador está confirmado pero los goleadores no, publicar el partido con `Goles (Solo SC)` vacío y dejar una revisión pendiente.
6. Comparar contra `src/data/historico_completo_sc.json`. Si la identidad ya existe y el marcador coincide, tratarlo como no-op y cerrar únicamente el calendario si corresponde. Si difiere, detener la escritura y alertar.
7. Construir el registro con exactamente las 13 claves del contrato. Normalizar nombres solo con alias exactos ya documentados; cualquier jugador desconocido queda pendiente de revisión.
8. Aplicar el alta, validar JSON, ejecutar las pruebas pertinentes y `npm run build`.
9. Solo con todas las validaciones aprobadas: crear un commit limitado al partido, hacer push a `main`, comprobar el despliegue y verificar el partido en `https://celeste.sebiche.com`.
10. Actualizar el evento a `FINAL` únicamente después de confirmar el histórico publicado. Añadir marcador, resultado desde la perspectiva de Cristal, goleadores confirmados, URLs y commit.
11. Si falla Git, despliegue o verificación de producción, mantener el título programado, anotar `PUBLICACIÓN PENDIENTE` en la descripción y alertar. No presentar el partido como publicado.

## Modo `audit-rsssf`

1. Ejecutar `$update-cristal-rsssf` en modo auditor para la temporada activa.
2. Comparar solo Primera División y Copa de la Liga.
3. Tratar RSSSF como verificador tardío: una ausencia no invalida un partido ya confirmado por dos fuentes; una discrepancia sí genera revisión manual.
4. Nunca duplicar un registro ya publicado ni degradar goleadores confirmados a vacío.

## Criterio de finalización

Una sincronización termina con eventos creados, actualizados o sin cambios y una lista separada de fixtures `TBD`. Un cierre termina solo cuando el JSON, Git, producción y calendario concuerdan, o cuando queda una alerta explícita sin escritura parcial.
