# 📊 Configuración de Google Analytics en Vercel

## 🎯 Resumen

Se ha implementado Google Analytics 4 (GA4) en tu aplicación web de Sporting Cristal Stats Viewer.

## 🔧 Configuración Requerida

### 1. Crear Cuenta de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una nueva cuenta o usa una existente
3. Crea una nueva propiedad para tu web
4. Selecciona "Web" como plataforma
5. Completa la información de tu sitio

### 2. Obtener Measurement ID

1. En tu propiedad de GA4, ve a **Admin** (⚙️)
2. En **Data Streams**, haz clic en tu stream web
3. Copia el **Measurement ID** (formato: G-XXXXXXXXXX)

### 3. Configurar Variables de Entorno en Vercel

1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega esta variable:

```
Name: REACT_APP_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX (tu Measurement ID real)
Environment: Production, Preview, Development
```

## 📱 Eventos que se Trackean

### 🔄 Navegación
- **Tab Navigation**: Cambios entre tabs (Efemérides, Temporadas, etc.)
- **Page Views**: Cada vista de página

### 🔍 Filtros y Búsquedas
- **Year Filter**: Selección de año
- **Month Filter**: Selección de mes
- **Date Search**: Búsquedas por fecha específica

### 📊 Estadísticas
- **Stats Viewed**: Visualización de estadísticas por año
- **Data Load Success**: Carga exitosa de datos
- **Load Time**: Tiempo de carga de la aplicación

### ⚠️ Errores
- **Data Load Error**: Errores al cargar datos
- **Error Occurred**: Otros errores de la aplicación

### 👤 Interacciones del Usuario
- **User Interaction**: Clicks, hovers, etc.

## 🚀 Verificación

### 1. Verificar en Vercel
- Confirma que la variable `REACT_APP_GA_MEASUREMENT_ID` esté configurada
- Haz redeploy de la aplicación

### 2. Verificar en Google Analytics
- Ve a **Reports** > **Realtime**
- Abre tu web en otra pestaña
- Deberías ver actividad en tiempo real

### 3. Verificar en la Consola
- Abre la consola del navegador
- Deberías ver: "✅ Google Analytics inicializado"

## 📈 Métricas Disponibles

### 👥 Usuarios
- Usuarios activos en tiempo real
- Usuarios nuevos vs recurrentes
- Sesiones por usuario

### 📱 Comportamiento
- Páginas más visitadas
- Tiempo en página
- Tasa de rebote

### 🎯 Eventos Personalizados
- Navegación entre tabs
- Uso de filtros
- Búsquedas de fechas
- Tiempo de carga

### 🌍 Demografía
- Ubicación geográfica
- Dispositivos utilizados
- Navegadores

## 🔒 Privacidad y Cumplimiento

### ✅ Implementado
- No se trackean datos personales
- Solo eventos de uso de la aplicación
- Cumple con GDPR básico

### 📋 Recomendaciones
- Agregar política de privacidad
- Banner de cookies (si es necesario)
- Opt-out para usuarios

## 🛠️ Personalización

### Agregar Nuevos Eventos
```javascript
// En cualquier componente
const analytics = useAnalytics();

analytics.trackEvent('custom_event', {
  custom_parameter: 'value'
});
```

### Modificar Eventos Existentes
Edita `src/services/analyticsService.js` para agregar nuevos métodos.

## 📚 Recursos Adicionales

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [React Analytics Best Practices](https://developers.google.com/analytics/devguides/collection/ga4/react)

---

**🎉 ¡Listo!** Tu aplicación ahora tiene analytics completos para entender mejor el comportamiento de los usuarios.
