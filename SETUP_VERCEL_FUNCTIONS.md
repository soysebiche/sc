# Endpoint Vercel opcional

`GET /api/data?type=completo` sirve el mismo dataset público que utiliza el bundle. Es una ruta de compatibilidad y no participa en el flujo principal.

## Contrato

- Método permitido: `GET`.
- Tipo permitido: `completo`; es el valor por defecto.
- Respuesta: arreglo JSON del archivo `src/data/historico_completo_sc.json`.
- Cache: un día en CDN y una semana de `stale-while-revalidate`.
- Autenticación: ninguna; el dataset es público.

No configurar `API_SECRET_TOKEN`: un secreto entregado al navegador no protege un recurso público.

## Verificación local de la aplicación

La UI no necesita esta función para desarrollo:

```bash
npm ci
npm start
```

La función debe probarse en un runtime compatible con Vercel antes de afirmar que está operativa en producción.
