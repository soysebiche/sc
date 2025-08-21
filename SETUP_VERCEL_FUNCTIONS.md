# 🚀 Configuración de Vercel Functions para Protección de Datos

## 📋 Resumen de Cambios

Se ha implementado un sistema de autenticación usando **Vercel Functions** para proteger los archivos JSON de estadísticas del Sporting Cristal.

## 🔐 Características de Seguridad

- ✅ **Datos protegidos**: Los archivos JSON ya no son accesibles públicamente
- ✅ **Autenticación por token**: Acceso controlado mediante tokens de API
- ✅ **Vercel Functions**: API serverless para servir datos de forma segura
- ✅ **Frontend protegido**: Solo usuarios autenticados pueden ver las estadísticas

## 🛠️ Configuración Requerida

### 1. Variables de Entorno en Vercel

Ve a tu dashboard de Vercel y agrega esta variable de entorno:

```
API_SECRET_TOKEN=tu_token_super_secreto_aqui_2024
```

**Recomendaciones para el token:**
- Usa al menos 32 caracteres
- Combina letras, números y símbolos
- Ejemplo: `SC_Stats_2024_Super_Secure_Token_!@#$%^&*()`

### 2. Estructura de Archivos

```
├── api/
│   └── data/
│       └── index.js          # Vercel Function principal
├── data/                     # Archivos JSON protegidos
│   ├── historico_completo_sc.json
│   ├── historico_conmebol_sc.json
│   └── historico_inca_sc.json
├── src/
│   ├── services/
│   │   ├── authService.js    # Servicio de autenticación
│   │   └── vercelDataService.js # Servicio de datos
│   └── components/
│       └── Login.js          # Componente de login
└── vercel.json               # Configuración de Vercel
```

## 🔑 Cómo Usar

### Para Usuarios Finales

1. **Acceder a la aplicación**
2. **Ingresar el token** en la pantalla de login
3. **Ver estadísticas** una vez autenticado
4. **Cerrar sesión** cuando termine

### Para Desarrolladores

1. **Configurar el token** en Vercel Dashboard
2. **Hacer deploy** de los cambios
3. **Probar la autenticación** con el token configurado

## 📡 API Endpoints

### GET `/api/data?type={tipo}`

**Parámetros:**
- `type`: Tipo de datos (`conmebol`, `inca`, `completo`)

**Headers requeridos:**
```
Authorization: Bearer {token}
```

**Ejemplos de uso:**
```bash
# Obtener datos de Conmebol
curl -H "Authorization: Bearer tu_token" \
     "https://tu-app.vercel.app/api/data?type=conmebol"

# Obtener datos de Copa del Inca
curl -H "Authorization: Bearer tu_token" \
     "https://tu-app.vercel.app/api/data?type=inca"

# Obtener datos completos
curl -H "Authorization: Bearer tu_token" \
     "https://tu-app.vercel.app/api/data?type=completo"
```

## 🚨 Consideraciones de Seguridad

### ✅ Implementado
- Autenticación por token
- Datos no accesibles públicamente
- Validación de headers de autorización
- Manejo de errores de autenticación

### 🔒 Recomendaciones Adicionales
- **Rate limiting** para prevenir abuso
- **JWT tokens** en lugar de tokens simples
- **HTTPS** obligatorio (ya incluido en Vercel)
- **Logs de auditoría** para monitorear accesos

## 🐛 Solución de Problemas

### Error: "Repository not found"
- Verifica que el remote apunte al repositorio correcto
- Confirma que tienes acceso al repositorio en GitHub

### Error: "Unauthorized - Token required"
- Verifica que la variable `API_SECRET_TOKEN` esté configurada en Vercel
- Confirma que el token en el frontend coincida con el configurado

### Error: "Data file not found"
- Verifica que los archivos JSON estén en el directorio `data/`
- Confirma que los archivos no estén en `.gitignore`

## 📚 Recursos Adicionales

- [Documentación de Vercel Functions](https://vercel.com/docs/functions)
- [Guía de Variables de Entorno en Vercel](https://vercel.com/docs/projects/environment-variables)
- [Mejores Prácticas de Seguridad](https://vercel.com/docs/guides/security)

## 🎯 Próximos Pasos

1. **Configurar el token** en Vercel Dashboard
2. **Hacer deploy** de los cambios
3. **Probar la autenticación**
4. **Compartir el token** con usuarios autorizados
5. **Monitorear** el uso de la API

---

**⚠️ Importante**: Nunca compartas o commits el token real. Solo usa el token de ejemplo para desarrollo local.
