# ☁️ Mimo Design System

## Sobre Mimo

Mimo es una aplicación móvil de afirmaciones y motivación en español. Este sistema de diseño está inspirado en aplicaciones como Headspace y Duolingo, con un enfoque en la simplicidad, claridad y experiencia del usuario.

---

## 🎨 Paleta de Colores

### Colores Principales

| Color | Hex | Uso | Preview |
|-------|-----|-----|---------|
| **Primary Orange** | `#FF9A56` | Botones principales, CTAs, acentos | ![#FF9A56](https://via.placeholder.com/100x30/FF9A56/FF9A56) |
| **Soft Peach** | `#FFE5B4` | Botones secundarios, fondos suaves | ![#FFE5B4](https://via.placeholder.com/100x30/FFE5B4/FFE5B4) |
| **Light Cream** | `#FFF5EB` | Fondos destacados, estados seleccionados | ![#FFF5EB](https://via.placeholder.com/100x30/FFF5EB/FFF5EB) |

### Colores Neutrales (Light Mode)

| Color | Hex | Uso |
|-------|-----|-----|
| **Dark Gray** | `#1F2937` | Texto principal |
| **Medium Gray** | `#6B7280` | Texto secundario, descripciones |
| **Light Gray** | `#F9FAFB` | Fondos, separadores |
| **Border Gray** | `#E5E7EB` | Bordes, divisores |
| **White** | `#FFFFFF` | Fondos de tarjetas y secciones |
| **Background** | `#F8F9FA` | Fondo principal de la app |

### Colores Neutrales (Dark Mode)

| Color | Hex | Uso |
|-------|-----|-----|
| **Light Text** | `#F9FAFB` | Texto principal en dark mode |
| **Medium Text** | `#E5E7EB` | Labels y texto destacado |
| **Secondary Text** | `#9CA3AF` | Texto secundario |
| **Dark Background** | `#1A1A1A` | Fondo principal y tarjetas |
| **Section Background** | `#2D2D2D` | Fondos de secciones |
| **Dark Border** | `#404040` | Bordes en dark mode |

### Colores Dark Mode Específicos

| Color | Hex | Uso |
|-------|-----|-----|
| **Secondary Button BG** | `#4A3B2F` | Fondo de botones secundarios |
| **Secondary Button Text** | `#FFD4A3` | Texto de botones secundarios |
| **Selected Card BG** | `#3A2F26` | Fondo de tarjetas seleccionadas |

### Colores de Estado

| Color | Hex | Uso | Light Mode BG | Dark Mode BG |
|-------|-----|-----|---------------|--------------|
| **Success Green** | `#059669` | Completado, éxito | `#D1FAE5` | `#1A4D3A` |
| **Info Blue** | `#2563EB` | Información, popular | `#DBEAFE` | `#1E3A5F` |
| **Success Green Alt** | `#6EE7B7` | Texto en dark mode | - | Para badges |
| **Info Blue Alt** | `#93C5FD` | Texto en dark mode | - | Para badges |

---

## 📝 Tipografía

### Fuente Principal: Nunito

**CDN:** `https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap`

### Escala Tipográfica

| Nivel | Tamaño | Peso | Uso | CSS |
|-------|--------|------|-----|-----|
| **Display** | 48px | 800 (Extra Bold) | Títulos principales, branding | `font-size: 48px; font-weight: 800;` |
| **H1** | 32px | 700 (Bold) | Títulos de sección | `font-size: 32px; font-weight: 700;` |
| **H2** | 28px | 800 (Extra Bold) | Subtítulos importantes | `font-size: 28px; font-weight: 800;` |
| **H3** | 20px | 700 (Bold) | Títulos de tarjetas | `font-size: 20px; font-weight: 700;` |
| **Body Large** | 18px | 600 (Semi Bold) | Descripciones destacadas | `font-size: 18px; font-weight: 600;` |
| **Body** | 16px | 400 (Regular) | Texto general | `font-size: 16px; font-weight: 400;` |
| **Small** | 14px | 600 (Semi Bold) | Labels, badges, metadatos | `font-size: 14px; font-weight: 600;` |

### Line Height

- **Títulos:** 1.2
- **Cuerpo de texto:** 1.6

---

## 🔘 Botones

### Botón Primario

**Light Mode:**
```css
background: #FF9A56;
color: #FFFFFF;
padding: 16px 32px;
border-radius: 16px;
border: none;
font-weight: 700;
font-size: 16px;

/* Hover */
background: #FF8A3D;
box-shadow: 0 8px 16px rgba(255, 154, 86, 0.3);
transform: translateY(-2px);
```

**Dark Mode:** (igual que light mode)

### Botón Secundario

**Light Mode:**
```css
background: #FFE5B4;
color: #FF9A56;
padding: 16px 32px;
border-radius: 16px;
border: none;
font-weight: 700;
font-size: 16px;

/* Hover */
background: #FFD89B;
transform: translateY(-2px);
```

**Dark Mode:**
```css
background: #4A3B2F;
color: #FFD4A3;

/* Hover */
background: #5A4B3F;
```

### Botón Outline

**Light Mode:**
```css
background: transparent;
border: 2px solid #FF9A56;
color: #FF9A56;
padding: 16px 32px;
border-radius: 16px;
font-weight: 700;
font-size: 16px;

/* Hover */
background: #FF9A56;
color: #FFFFFF;
transform: translateY(-2px);
```

**Dark Mode:** (igual que light mode)

### Botón con Icono

```html
<button class="btn btn-primary">
  <span>✨</span>
  <span>Texto del botón</span>
</button>
```

```css
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
```

---

## 📝 Campos de Texto

### Input Field

**Light Mode:**
```css
width: 100%;
padding: 16px;
border: 2px solid #E5E7EB;
border-radius: 12px;
font-size: 16px;
background: #FFFFFF;
color: #1F2937;

/* Focus */
border-color: #FF9A56;
box-shadow: 0 0 0 3px rgba(255, 154, 86, 0.1);
outline: none;
```

**Dark Mode:**
```css
background: #1A1A1A;
border-color: #404040;
color: #F9FAFB;

/* Focus */
border-color: #FF9A56;
box-shadow: 0 0 0 3px rgba(255, 154, 86, 0.1);
```

### Label

**Light Mode:**
```css
display: block;
font-weight: 700;
color: #374151;
margin-bottom: 8px;
font-size: 14px;
```

**Dark Mode:**
```css
color: #E5E7EB;
```

### Placeholder

**Light Mode:** `color: #9CA3AF;`
**Dark Mode:** `color: #6B7280;`

---

## 🎯 Tarjetas de Selección (Radio Cards)

### Estado Normal

**Light Mode:**
```css
border: 2px solid #E5E7EB;
border-radius: 16px;
padding: 20px;
background: #FFFFFF;
cursor: pointer;

/* Hover */
border-color: #FF9A56;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
```

**Dark Mode:**
```css
border-color: #404040;
background: #2D2D2D;
```

### Estado Seleccionado

**Light Mode:**
```css
border-color: #FF9A56;
background: #FFF5EB;
```

**Dark Mode:**
```css
border-color: #FF9A56;
background: #3A2F26;
```

### Estructura HTML

```html
<div class="radio-card">
  <div class="icon">🌅</div>
  <div class="radio-title">Mañana</div>
</div>
```

---

## 🏷️ Badges

### Badge Primario

**Light Mode:**
```css
background: #FFE5B4;
color: #FF9A56;
padding: 8px 16px;
border-radius: 20px;
font-weight: 700;
font-size: 14px;
```

**Dark Mode:**
```css
background: #4A3B2F;
color: #FFD4A3;
```

### Badge Success

**Light Mode:**
```css
background: #D1FAE5;
color: #059669;
```

**Dark Mode:**
```css
background: #1A4D3A;
color: #6EE7B7;
```

### Badge Info

**Light Mode:**
```css
background: #DBEAFE;
color: #2563EB;
```

**Dark Mode:**
```css
background: #1E3A5F;
color: #93C5FD;
```

---

## 🃏 Tarjetas de Contenido

### Card Container

**Light Mode:**
```css
background: #FFFFFF;
border-radius: 20px;
padding: 24px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
```

**Dark Mode:**
```css
background: #1A1A1A;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
```

### Card Title

**Light Mode:**
```css
font-size: 20px;
font-weight: 800;
color: #1F2937;
margin-bottom: 8px;
```

**Dark Mode:**
```css
color: #F9FAFB;
```

### Card Text

**Light Mode:**
```css
color: #6B7280;
line-height: 1.6;
font-size: 16px;
```

**Dark Mode:**
```css
color: #9CA3AF;
```

---

## 📐 Espaciado y Bordes

### Border Radius

| Elemento | Radio |
|----------|-------|
| Botones | 16px |
| Input fields | 12px |
| Tarjetas | 20px |
| Secciones grandes | 24px |
| Badges | 20px |

### Espaciado

| Nombre | Valor | Uso |
|--------|-------|-----|
| xs | 4px | Espaciado mínimo |
| sm | 8px | Gap entre iconos y texto |
| md | 12px | Margin bottom para labels |
| lg | 16px | Padding de inputs y botones |
| xl | 20px | Padding de tarjetas |
| 2xl | 24px | Padding de tarjetas grandes, gaps |
| 3xl | 30px | Margin bottom de secciones |
| 4xl | 40px | Padding de secciones |
| 5xl | 60px | Espaciado entre secciones principales |

---

## 🎭 Sombras

### Light Mode

```css
/* Sombra suave para tarjetas */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

/* Sombra media para tarjetas destacadas */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* Sombra hover para botones */
box-shadow: 0 8px 16px rgba(255, 154, 86, 0.3);
```

### Dark Mode

```css
/* Sombra suave */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

/* Sombra media */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
```

---

## 🌓 Implementación de Dark Mode

### Toggle Dark Mode

```javascript
// Agregar/remover clase 'dark' al body
document.body.classList.toggle('dark');
```

### CSS Base

```css
body {
  background: #F8F9FA;
  transition: background 0.3s ease;
}

body.dark {
  background: #1A1A1A;
}
```

### Patrón de Implementación

Todos los elementos deben tener estilos para ambos modos:

```css
/* Light mode por defecto */
.elemento {
  background: #FFFFFF;
  color: #1F2937;
}

/* Dark mode con clase en body */
body.dark .elemento {
  background: #2D2D2D;
  color: #F9FAFB;
}
```

---

## 🎨 Iconografía

### Emojis Recomendados

**Categorías de Afirmaciones:**
- 💪 Motivación
- 🧘 Calma / Meditación
- ❤️ Amor propio
- 🎯 Enfoque / Productividad
- 🌟 Confianza
- 🌱 Crecimiento personal
- 😊 Felicidad
- 💭 Reflexión

**Tiempo del día:**
- 🌅 Mañana
- ☀️ Tarde
- 🌙 Noche

**Estados y acciones:**
- ✨ Nuevo / Especial
- ✓ Completado
- 🔥 Tendencia / Racha
- 📖 Leer
- ⭐ Favorito / Premium
- 🎉 Celebración / Logro

---

## 📱 Guías de Uso

### Estructura de Pantalla

```
┌─────────────────────────┐
│  Header (24px padding)  │
├─────────────────────────┤
│                         │
│  Content Area           │
│  (20px horizontal pad)  │
│                         │
│  Cards con 16-24px gap  │
│                         │
├─────────────────────────┤
│  Bottom Nav (opcional)  │
└─────────────────────────┘
```

### Jerarquía Visual

1. **Título principal** (48px, Extra Bold) + Mascota ☁️
2. **Sección importante** (28px, Extra Bold)
3. **Tarjetas de contenido** (20px Bold para títulos)
4. **Texto descriptivo** (16px Regular)
5. **Metadata/Labels** (14px Semi Bold)

### Principios de Diseño

✅ **Hazlo:**
- Usa espacios generosos entre elementos
- Mantén consistencia en border radius
- Usa emojis para dar personalidad
- Prioriza la legibilidad
- Implementa ambos temas desde el inicio

❌ **Evita:**
- Gradientes (usa colores sólidos)
- Demasiados colores en una pantalla
- Texto muy pequeño (<14px)
- Bordes muy delgados (<2px)
- Elementos clickeables muy juntos

---

## 🚀 Exportación a Figma

### Variables de Color

Crea variables de color en Figma con los nombres:
- `primary/orange`
- `primary/peach`
- `primary/cream`
- `neutral/dark-gray`
- `neutral/medium-gray`
- `neutral/light-gray`
- etc.

### Componentes Clave

1. **Button/Primary** (con variantes light/dark)
2. **Button/Secondary**
3. **Button/Outline**
4. **Input/Text**
5. **Input/Textarea**
6. **Card/Selection** (con estado normal/selected)
7. **Card/Content**
8. **Badge** (con variantes primary/success/info)

### Auto Layout

Todos los componentes deben usar Auto Layout con:
- Padding apropiado según las guías
- Gap consistente (8px para iconos, 16-24px para grids)
- Responsive cuando sea posible

---

## 📞 Soporte

Para preguntas o sugerencias sobre el sistema de diseño, contacta al equipo de Mimo.

---

**Versión:** 1.0  
**Última actualización:** Enero 2026  
**Mantenido por:** Equipo Mimo ☁️