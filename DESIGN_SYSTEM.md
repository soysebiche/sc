# Cristal Archive 2026 - Design System
## Editorial Luxury × Sports Heritage

---

## 🎯 Concepto de Diseño

El nuevo design system adopta una estética **Editorial Luxury** con influencias **Art Deco**, inspirada en revistas deportivas premium y archivos de museo. Es audaz, distintivo y memorable.

### Filosofía
- **Audacia sobre seguridad**: No más diseños genéricos
- **Jerarquía clara**: Tipografía editorial dramática
- **Detalles refinados**: Cada píxel tiene propósito
- **Movimiento intencional**: Animaciones que deleitan

---

## 🎨 Paleta de Colores

### Colores Principales
| Color | Hex | Uso |
|-------|-----|-----|
| **Picton Blue** | `#3CBEEF` | Color primario, acciones, acentos |
| **Biscay** | `#1B265C` | Fondos oscuros, texto principal |
| **White** | `#FFFFFF` | Fondos, contraste |

### Variaciones
- **Celeste Dark**: `#1A9FD1` - Para hover states
- **Celeste Light**: `#6DD4F7` - Para gradientes
- **Biscay Light**: `#2A3A7A` - Para variaciones oscuras

### Colores Semánticos
- **Victoria**: `#10B981` (Verde)
- **Derrota**: `#EF4444` (Rojo)
- **Empate**: `#F59E0B` (Naranja)

---

## ✍️ Tipografía

### Fuente Display: Clash Display
```css
font-family: 'Clash Display', Georgia, serif;
```
- **Peso**: 400, 500, 600, 700
- **Uso**: Títulos, headings, números importantes
- **Carácter**: Moderna, editorial, audaz

### Fuente Body: Satoshi
```css
font-family: 'Satoshi', 'Helvetica Neue', sans-serif;
```
- **Peso**: 400, 500, 700
- **Uso**: Texto de cuerpo, párrafos, UI
- **Carácter**: Legible, contemporánea, elegante

### Fuente Mono: Spline Sans Mono
```css
font-family: 'Spline Sans Mono', monospace;
```
- **Peso**: 400
- **Uso**: Labels, metadata, datos
- **Carácter**: Técnica, precisa, moderna

### Jerarquía Tipográfica

| Elemento | Fuente | Tamaño | Peso |
|----------|--------|--------|------|
| Title Hero | Clash Display | 5rem (clamp) | 700 |
| Title Section | Clash Display | 4rem (clamp) | 600 |
| Title Card | Clash Display | 2rem (clamp) | 600 |
| Body Large | Satoshi | 1.125rem (clamp) | 400 |
| Body | Satoshi | 1rem (clamp) | 400 |
| Label | Spline Sans Mono | 0.75rem | 500 |

---

## 🎴 Componentes

### Botones

#### Variantes
- **Primary**: Fondo celeste con gradiente
- **Secondary**: Outline biscay
- **Tertiary**: Ghost button
- **Dark**: Fondo biscay
- **Win/Loss/Draw**: Estados semánticos

#### Tamaños
- `btn-xs`: Compacto
- `btn-sm`: Pequeño
- `btn` (default): Medio
- `btn-lg`: Grande
- `btn-xl`: Extra grande

#### Características
- Border-radius completo (pill shape)
- Efecto ripple al hacer click
- Transiciones suaves (ease-out-expo)
- Soporte para iconos

### Tarjetas

#### Variantes
- **Default**: Fondo blanco con sombra suave
- **Elevated**: Sombra pronunciada
- **Glass**: Efecto cristal con backdrop-filter
- **Dark**: Gradiente oscuro
- **Win/Loss/Draw**: Indicadores de resultado
- **Highlight**: Borde celeste destacado

#### Estados
- Hover: Elevación y sombra aumentada
- Transiciones: 400ms ease-out-expo

### Badges

#### Variantes
- `badge-celeste`: Fondo celeste suave
- `badge-biscay`: Fondo biscay
- `badge-win/loss/draw`: Estados de partido
- `badge-glass`: Transparente con blur

#### Características
- Fuente mono mayúsculas
- Letter-spacing: 0.1em
- Border-radius completo

### Formularios

#### Inputs
- Border: 2px solid gray-200
- Border-radius: 16px (xl)
- Focus: Border celeste + glow
- Transiciones suaves

#### Selects
- Flecha personalizada SVG
- Mismo estilo que inputs
- Padding derecho aumentado

---

## 🎬 Animaciones

### Easing Functions
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframes Disponibles
- `fadeIn`: Opacidad 0 a 1
- `fadeInUp`: Entrada desde abajo
- `fadeInDown`: Entrada desde arriba
- `scaleIn`: Entrada con escala
- `slideInLeft/Right`: Entrada lateral
- `float`: Flotación continua
- `pulse`: Pulso de opacidad
- `shimmer`: Efecto de brillo

### Clases de Animación
- `.animate-fadeInUp`
- `.animate-scaleIn`
- `.animate-slideInLeft`
- `.animate-float`
- `.animate-pulse`

### Stagger Delays
- `.stagger-1` a `.stagger-5`
- Delays: 100ms a 500ms

---

## 🎭 Efectos Visuales

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
```

### Gradientes
- **Primary**: `linear-gradient(135deg, #3CBEEF, #1A9FD1)`
- **Text**: `linear-gradient(135deg, #3CBEEF, #1B265C)`
- **Background**: `linear-gradient(180deg, #FAFBFC, #F4F6F8, #E8EBF0)`

### Sombras
- **Editorial**: Sombras sutiles con color biscay
- **Celeste**: Sombras con tinte azul
- **Glow**: Efectos de brillo suave

### Texturas
- Noise overlay opcional
- Grid patterns en headers
- Gradient orbs animados

---

## 📁 Archivos del Sistema

```
src/
├── styles/
│   └── design-system.css    # Sistema completo
├── index.css                 # Estilos globales
├── App.css                   # Estilos específicos de app
└── components/
    ├── ui/
    │   ├── Button.jsx
    │   └── Card.jsx

public/
└── index.html               # Con fuentes Fontshare

design-system-demo.html      # Demo interactivo
```

---

## 🚀 Mejoras Clave vs. Versión Anterior

### Antes (Genérico)
- ❌ Fuentes comunes (Inter, Roboto)
- ❌ Diseño seguro y predecible
- ❌ Sombras estándar
- ❌ Sin personalidad distintiva

### Ahora (Editorial Luxury)
- ✅ **Clash Display** - Display font única y audaz
- ✅ **Satoshi** - Body font contemporánea
- ✅ **Spline Sans Mono** - Mono font distintiva
- ✅ Gradientes y glassmorphism
- ✅ Animaciones con easing premium
- ✅ Jerarquía tipográfica dramática
- ✅ Efectos visuales memorables
- ✅ Sombras con color (tinting)
- ✅ Glow effects sutiles
- ✅ Componentes con carácter

---

## 📱 Responsive

### Breakpoints
- **Mobile**: < 480px
- **Tablet**: < 768px
- **Desktop**: > 768px

### Estrategia
- `clamp()` para tipografía fluida
- Grid con `auto-fit` y `minmax()`
- Padding adaptativo
- Componentes que se apilan en móvil

---

## ♿ Accesibilidad

- `prefers-reduced-motion` respetado
- Contraste WCAG AA
- Focus states visibles
- Labels semánticos
- Screen reader support

---

## 🎨 Variables CSS

Todas las variables están definidas en `:root` y son personalizables:

```css
:root {
  /* Colores */
  --color-celeste: #3CBEEF;
  --color-biscay: #1B265C;
  
  /* Tipografía */
  --font-editorial: 'Clash Display', serif;
  --font-body: 'Satoshi', sans-serif;
  --font-mono: 'Spline Sans Mono', monospace;
  
  /* Espaciado */
  --space-4: 1rem;
  --space-8: 2rem;
  
  /* Sombras */
  --shadow-lg: 0 10px 15px -3px rgba(27, 38, 92, 0.1);
  
  /* Transiciones */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-base: 250ms;
}
```

---

## 🎓 Uso

### HTML/CSS Puro
```html
<link rel="stylesheet" href="src/styles/design-system.css">

<button class="btn btn-primary">Click me</button>
<div class="card card-hover">Content</div>
```

### React
```jsx
import '../styles/design-system.css';

const MyComponent = () => (
  <button className="btn btn-primary">
    Click me
  </button>
);
```

---

## 🌟 Demo

Abre `design-system-demo.html` en tu navegador para ver todos los componentes en acción.

---

## 📝 Créditos

**Design System**: Cristal Archive 2026  
**Concepto**: Editorial Luxury × Sports Heritage  
**Fuentes**: Fontshare (Clash Display, Satoshi, Spline Sans Mono)  
**Colores**: Sporting Cristal Brand

---

*Hecho con ❤️ para los hinchas del club más grande del Perú.*
