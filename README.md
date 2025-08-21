# 🏆 Sporting Cristal Stats Viewer

Una aplicación web moderna para visualizar las estadísticas históricas del Club Sporting Cristal, diseñada con React y un estilo visual del 2025.

## ✨ Características

- 📊 **Estadísticas Interactivas**: Visualización de datos históricos completos del club
- 🎨 **Diseño Moderno**: UI/UX del 2025 con efectos glassmorphism y gradientes
- 📱 **Responsive**: Adaptado para móviles, tablets y desktop
- 🔍 **Filtros**: Navegación por años para análisis específicos
- ⚡ **Performance**: Optimizado con React 19 y hooks modernos

## 🎯 Funcionalidades

### Estadísticas Disponibles
- Goles por minuto de juego
- Victorias y derrotas por día de la semana
- Rendimiento por meses del año
- Marcadores más comunes
- Máximo goleador histórico
- Curiosidades y datos únicos del club

### Diseño Visual
- **Colores**: Sky Blue (#00BFFF), Navy (#293146), White (#FFFFFF)
- **Tipografía**: Roboto (Google Fonts)
- **Efectos**: Sombras modernas, animaciones suaves, hover effects

## 🚀 Deployment Automático en Vercel

### Configuración Recomendada

**Opción 1: Deployment desde GitHub (Recomendado)**

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub: `https://github.com/soysebiche/sc`
4. Vercel detectará automáticamente que es un proyecto React
5. Configura el proyecto:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (o deja vacío)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Haz clic en "Deploy"

### Variables de Entorno (Opcional)
Si necesitas configurar variables de entorno, agrégalas en Vercel Dashboard:
```
REACT_APP_API_URL=tu_api_url_aqui
```

### Configuración Vercel (vercel.json)
El proyecto incluye un archivo `vercel.json` optimizado para SPA React:

```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Deploy Automático
- ✅ **Auto-deploy**: Cada push a `main` despliega automáticamente
- ✅ **Preview**: Las pull requests generan deploys de preview
- ✅ **Rollback**: Fácil rollback a versiones anteriores

## 💻 Desarrollo Local

### Prerequisitos
- Node.js 16+ 
- npm o yarn

### Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/soysebiche/sc.git
cd sc
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Inicia el servidor de desarrollo**
```bash
npm start
```

4. **Abre tu navegador**
Ve a [http://localhost:3000](http://localhost:3000)

### Scripts Disponibles

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
