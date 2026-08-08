# Validación de campo para confirmar 9.0

> Estado: preparado, sin participantes ejecutados todavía.
>
> No usar este documento para afirmar éxito de tarea, accesibilidad con lector de pantalla o Web Vitals de campo hasta completar las tablas con evidencia real.

## Muestra mínima

- Cinco participantes que consulten estadísticas de Sporting Cristal al menos ocasionalmente.
- Registrar dispositivo, navegador, familiaridad con el club y necesidad de accesibilidad relevante.
- No incluir nombres, correos ni otros datos personales en este archivo.

## Tareas y criterio observable

| ID | Tarea | Éxito observable |
|---|---|---|
| T1 | Consultar los partidos jugados un 4 de agosto | Identifica cantidad y al menos un marcador sin ayuda |
| T2 | Encontrar un partido de 2024 usando año, mes y página | Llega al registro y comparte una URL que conserva el estado |
| T3 | Consultar el balance contra Alianza Lima y avanzar de página | Interpreta V/E/P y ve solo 18 registros por página |
| T4 | Consultar el historial de Argentina | Identifica total y navega la colección sin perder el país |
| T5 | Comparar dos temporadas en Año | Cambia orden/resumen y explica qué temporada está seleccionada |

Umbral del gate: al menos 23 de 25 tareas completadas sin ayuda crítica; registrar igualmente tiempo, errores, ayuda, abandono y comentario.

## Registro de sesiones

| Participante | Contexto/dispositivo | T1 | T2 | T3 | T4 | T5 | Errores/ayuda | Evidencia |
|---|---|---:|---:|---:|---:|---:|---|---|
| Pendiente |  |  |  |  |  |  |  |  |

## Protocolo de accesibilidad profunda

| Prueba | Stack | Resultado | Hallazgos | Retest/evidencia |
|---|---|---|---|---|
| Teclado, seis áreas | Chrome/Safari desktop | Pendiente |  |  |
| Zoom 200%, seis áreas | Chrome/Safari desktop | Pendiente |  |  |
| Lector de pantalla escritorio | VoiceOver + Safari | Pendiente |  |  |
| Lector de pantalla móvil | VoiceOver + Safari o TalkBack + Chrome | Pendiente |  |  |

Gate: cero bloqueos de tarea y cero hallazgos críticos/serios sin corregir.

## RUM

La aplicación solicita consentimiento explícito antes de enviar CLS, INP, LCP, vista y revisión a `/api/vitals`. El endpoint no acepta identificadores personales. Para evaluar el gate registrar:

| Ventana | Navegaciones válidas | LCP p75 | INP p75 | CLS p75 | Errores | Sesgo/limitación |
|---|---:|---:|---:|---:|---:|---|
| Pendiente | 0 | — | — | — | — | Sin candidato desplegado ni ventana de campo |

Umbrales internos: LCP p75 <2.5 s, INP p75 <200 ms y CLS p75 <0.1. Una muestra insuficiente se conserva como “No verificado”.
