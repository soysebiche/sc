# Medición GA4 (opcional)

Sebiche Celeste envía eventos a Google Analytics 4 solo después de consentimiento explícito. Sin `VITE_GA_MEASUREMENT_ID` válido, `enableAnalytics()` queda inerte.

## Variable de entorno

En Vercel: **Settings → Environment Variables**.

```
Name: VITE_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX
Environment: Production, Preview, Development
```

Localmente, copiar `env.example` a `.env.local`. Formato aceptado: `G-` seguido de 6 a 16 caracteres alfanuméricos.

No usar `REACT_APP_*`. Este proyecto es Vite.

## Consentimiento

`src/components/MeasurementConsent.js` guarda `accepted` o `declined` en `localStorage` (`sc-measurement-consent`). Hasta `accepted`:

- no se carga `gtag.js`
- no se envían page views ni filtros
- RUM (`/api/vitals`) permanece apagado

Al declinar o retirar el permiso se llama `disableAnalytics()` y se borran cookies `_ga` / `_ga_*`.

## Eventos reales (`src/services/analytics.js`)

| Evento | Cuándo | Payload |
|---|---|---|
| `page_view` | Vista activa con consentimiento | `page_title`, `page_location` (origen + path, sin query), `page_path` (`/efemerides`, etc.) |
| `archive_filter` | Query param de filtro distinto del default | `filter_name`, `is_active` |
| `archive_pagination` | `page`, `rivalPage` o `countryPage` | `collection` |
| `theme_change` | Toggle claro/oscuro | `theme`: `dark` \| `light` |
| `calendar_subscribe` | Clic en suscripción | `calendar_client`: `webcal` \| `unknown` |
| `archive_load_error` | Fallo al cargar el JSON | `error_code`: `archive_unavailable` |

Filtros allowlisteados: `date`, `year`, `month`, `tournament`, `decade`, `rival`, `rivalYear`, `country`, `countryYear`. Cualquier otra key de URL se ignora.

No se envían nombres de rivales, texto de búsqueda ni valores de query.

## Verificación

1. Variable `VITE_GA_MEASUREMENT_ID` en Vercel y redeploy.
2. Aceptar medición en el footer.
3. GA4 → Reports → Realtime.
4. Sin consentimiento, Network no debe mostrar `gtag/js` ni `/api/vitals`.
