# ✝️ Design System - App de Versículos Diarios

## 💡 Ideas de Nombre

| Nombre | Concepto | Disponibilidad sugerida |
|--------|----------|------------------------|
| **Fé** | Simple, directo, poderoso | ⭐ Recomendado |
| **Palabra** | La Palabra de Dios | |
| **Manna** | El alimento espiritual diario del desierto | |
| **Selah** | Pausa para reflexionar (término bíblico de Salmos) | |
| **Luz** | "Tu palabra es lámpara a mis pies" | |
| **Gracia** | Concepto central del evangelio | |
| **Camino** | "Yo soy el camino, la verdad y la vida" | |
| **Refugio** | "Dios es nuestro refugio" | |
| **Semilla** | La palabra como semilla que crece | |
| **Alba** | Nuevo día, nueva esperanza | |

**Recomendación:** **Fé** o **Selah** - son únicos, memorables y tienen profundidad espiritual.

---

## 🎨 Paleta de Colores

### Colores Principales

| Color | Hex | Uso | Preview |
|-------|-----|-----|---------|
| **Primary Gold** | `#D4A853` | Botones principales, CTAs, acentos | ![#D4A853](https://via.placeholder.com/100x30/D4A853/D4A853) |
| **Soft Gold** | `#F5E6C8` | Botones secundarios, fondos suaves | ![#F5E6C8](https://via.placeholder.com/100x30/F5E6C8/F5E6C8) |
| **Light Cream** | `#FBF8F3` | Fondos destacados, estados seleccionados | ![#FBF8F3](https://via.placeholder.com/100x30/FBF8F3/FBF8F3) |

### Colores Alternativos (Tema Azul Celestial)

| Color | Hex | Uso |
|-------|-----|-----|
| **Primary Blue** | `#5B8DBE` | Alternativa al dorado |
| **Soft Blue** | `#D6E5F3` | Fondos suaves |
| **Light Blue** | `#F0F6FB` | Estados seleccionados |

### Colores Neutrales (Light Mode)

| Color | Hex | Uso |
|-------|-----|-----|
| **Dark Brown** | `#2D2520` | Texto principal |
| **Medium Brown** | `#6B5D52` | Texto secundario, descripciones |
| **Light Gray** | `#F9F7F5` | Fondos, separadores |
| **Border** | `#E8E2DB` | Bordes, divisores |
| **White** | `#FFFFFF` | Fondos de tarjetas y secciones |
| **Background** | `#FAF8F5` | Fondo principal de la app |

### Colores Neutrales (Dark Mode)

| Color | Hex | Uso |
|-------|-----|-----|
| **Light Text** | `#F5F2EE` | Texto principal en dark mode |
| **Medium Text** | `#D9D3CC` | Labels y texto destacado |
| **Secondary Text** | `#A69E94` | Texto secundario |
| **Dark Background** | `#1A1816` | Fondo principal y tarjetas |
| **Section Background** | `#2A2724` | Fondos de secciones |
| **Dark Border** | `#3D3835` | Bordes en dark mode |

### Colores Dark Mode Específicos

| Color | Hex | Uso |
|-------|-----|-----|
| **Secondary Button BG** | `#3D3528` | Fondo de botones secundarios |
| **Secondary Button Text** | `#E8D5A8` | Texto de botones secundarios |
| **Selected Card BG** | `#332E25` | Fondo de tarjetas seleccionadas |

### Colores de Estado

| Color | Hex | Uso | Light Mode BG | Dark Mode BG |
|-------|-----|-----|---------------|--------------|
| **Success Green** | `#4A7C59` | Completado, éxito | `#E3F0E7` | `#1E3326` |
| **Info Blue** | `#5B8DBE` | Información | `#E3EEF7` | `#1E2D3D` |
| **Wisdom Purple** | `#7B68A6` | Sabiduría, especial | `#EDE8F4` | `#2A2438` |

---

## 📝 Tipografía

### Fuente Principal: Lora (Serif) + Inter (Sans)

**CDN:** 
```
https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap
```

**Uso:**
- **Lora (Serif)**: Versículos, citas bíblicas, títulos principales
- **Inter (Sans)**: UI, labels, botones, texto secundario

### Escala Tipográfica

| Nivel | Tamaño | Peso | Fuente | Uso |
|-------|--------|------|--------|-----|
| **Display** | 40px | 600 | Lora | Versículos destacados |
| **H1** | 28px | 700 | Lora | Títulos de sección |
| **H2** | 24px | 600 | Lora | Subtítulos importantes |
| **H3** | 18px | 600 | Inter | Títulos de tarjetas |
| **Body Large** | 18px | 400 | Lora | Versículos en cards |
| **Body** | 16px | 400 | Inter | Texto general |
| **Small** | 14px | 500 | Inter | Labels, referencias bíblicas |
| **Caption** | 12px | 500 | Inter | Metadatos, fechas |

### Line Height

- **Versículos:** 1.8 (mayor espaciado para lectura contemplativa)
- **Títulos:** 1.3
- **Cuerpo de texto:** 1.6

---

## 🔘 Botones

### Botón Primario

**Light Mode:**
```css
background: #D4A853;
color: #FFFFFF;
padding: 16px 32px;
border-radius: 12px;
border: none;
font-weight: 600;
font-size: 16px;
font-family: 'Inter', sans-serif;

/* Hover */
background: #C49943;
box-shadow: 0 8px 16px rgba(212, 168, 83, 0.25);
transform: translateY(-2px);
```

### Botón Secundario

**Light Mode:**
```css
background: #F5E6C8;
color: #8B7355;
```

**Dark Mode:**
```css
background: #3D3528;
color: #E8D5A8;
```

### Botón Outline

```css
background: transparent;
border: 2px solid #D4A853;
color: #D4A853;
```

---

## 🃏 Tarjeta de Versículo (Principal)

### Estructura

```
┌─────────────────────────────────┐
│                                 │
│  "Porque de tal manera amó     │
│   Dios al mundo, que ha dado   │
│   a su Hijo unigénito..."      │
│                                 │
│            — Juan 3:16         │
│                                 │
├─────────────────────────────────┤
│  ❤️  🔊  📤                     │
└─────────────────────────────────┘
```

**Light Mode:**
```css
background: #FFFFFF;
border-radius: 24px;
padding: 32px 24px;
box-shadow: 0 4px 20px rgba(45, 37, 32, 0.08);

/* Versículo */
.verse-text {
  font-family: 'Lora', serif;
  font-size: 22px;
  line-height: 1.8;
  color: #2D2520;
  text-align: center;
  font-style: italic;
}

/* Referencia */
.verse-reference {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #D4A853;
  text-align: center;
  margin-top: 16px;
}
```

**Dark Mode:**
```css
background: #2A2724;

.verse-text {
  color: #F5F2EE;
}
```

---

## 🏷️ Badges

### Badge Libro

```css
/* Génesis, Éxodo, etc. */
background: #F5E6C8;
color: #8B7355;
padding: 6px 12px;
border-radius: 16px;
font-size: 12px;
font-weight: 600;
```

### Badge Testamento

```css
/* Antiguo Testamento */
background: #E8DFD3;
color: #6B5D52;

/* Nuevo Testamento */
background: #D6E5F3;
color: #4A7090;
```

### Badge Tema

```css
/* Amor, Fe, Esperanza, etc. */
background: #EDE8F4;
color: #7B68A6;
```

---

## 🎯 Categorías de Versículos

### Temas Sugeridos

| Tema | Icono | Color |
|------|-------|-------|
| Amor | ❤️ | `#C25B5B` |
| Fe | ✝️ | `#D4A853` |
| Esperanza | 🌅 | `#E8A84C` |
| Fortaleza | 💪 | `#5B8DBE` |
| Paz | 🕊️ | `#7BB38E` |
| Sabiduría | 📖 | `#7B68A6` |
| Gratitud | 🙏 | `#D4A853` |
| Consuelo | 🤗 | `#B08DAB` |
| Guía | 🧭 | `#5B9EA6` |
| Alabanza | 🎵 | `#C9A857` |
| Promesas | ⭐ | `#D4A853` |
| Salmos | 📜 | `#8B7355` |

---

## 🎨 Iconografía

### Emojis/Iconos Recomendados

**Acciones:**
- ❤️ Favorito
- 🔊 Escuchar (audio)
- 📤 Compartir
- 📖 Leer más contexto
- 🔖 Guardar
- ✏️ Notas personales

**Tiempo del día:**
- 🌅 Devocional matutino
- ☀️ Versículo del día
- 🌙 Reflexión nocturna

**Estados:**
- ✨ Versículo nuevo
- 🔥 Racha de lectura
- ✓ Leído
- ⭐ Premium/Destacado

**Navegación:**
- 📜 Antiguo Testamento
- ✝️ Nuevo Testamento
- 📚 Todos los libros

---

## 📱 Estructura de Pantallas

### Home - Versículo del Día

```
┌─────────────────────────────────┐
│  ☰                    🔔  👤   │
├─────────────────────────────────┤
│                                 │
│        Domingo, 21 Enero        │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   "El Señor es mi        │  │
│  │    pastor, nada me       │  │
│  │    faltará."             │  │
│  │                           │  │
│  │        — Salmos 23:1     │  │
│  │                           │  │
│  │   ❤️    🔊    📤         │  │
│  └───────────────────────────┘  │
│                                 │
│  ← Anterior    ● ● ●   Siguiente →  │
│                                 │
├─────────────────────────────────┤
│  📚 Temas                       │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ❤️  │ │ 💪  │ │ 🕊️  │       │
│  │Amor │ │Fuerza│ │ Paz │       │
│  └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────┤
│  🏠      📖      ❤️      👤    │
└─────────────────────────────────┘
```

---

## 🔄 Mapeo de Componentes Mimo → Nueva App

### Cambios Necesarios

| Componente Mimo | Cambio | Nueva App |
|-----------------|--------|-----------|
| `AffirmationCard` | Renombrar + ajustar tipografía | `VerseCard` |
| `CategoryCard` | Renombrar + nuevos temas | `TopicCard` |
| `MixCard` | Adaptar para "Planes de lectura" | `ReadingPlanCard` |
| `theme.ts` | Nueva paleta de colores | `theme.ts` |
| `WeeklyStreakCalendar` | Mantener igual | `WeeklyStreakCalendar` |
| `FrequencySelector` | Mantener igual | `FrequencySelector` |

### 1. AffirmationCard → VerseCard

```typescript
// Cambios principales:

// Tipografía
fontFamily: 'Lora' // en vez de Nunito
fontStyle: 'italic' // para el versículo
lineHeight: 1.8 // más espaciado

// Nuevo campo
reference: string // "Juan 3:16" en vez de solo categoría

// Estructura del texto
<Text style={styles.verseText}>"{verse.text}"</Text>
<Text style={styles.reference}>— {verse.book} {verse.chapter}:{verse.verse}</Text>
```

### 2. CategoryCard → TopicCard

```typescript
// Cambios:
interface TopicCardProps {
  name: string; // "Amor", "Fe", "Esperanza"
  icon: string; // emoji o icono
  versesCount: number;
  color: string;
  testament?: 'old' | 'new' | 'both';
}
```

### 3. MixCard → ReadingPlanCard

```typescript
interface ReadingPlanCardProps {
  name: string; // "21 días de Fe"
  duration: string; // "21 días"
  progress: number; // 0-100
  icon: string;
  isActive: boolean;
}
```

### 4. Nuevos Componentes Necesarios

```typescript
// BookSelector - Selector de libro bíblico
interface BookSelectorProps {
  testament: 'old' | 'new';
  selectedBook: string;
  onSelect: (book: string) => void;
}

// ChapterSelector - Selector de capítulo
interface ChapterSelectorProps {
  book: string;
  selectedChapter: number;
  onSelect: (chapter: number) => void;
}

// VerseAudioPlayer - Reproductor de audio del versículo
interface VerseAudioPlayerProps {
  verseId: string;
  audioUrl: string;
}
```

---

## 📂 Estructura de Datos

### Versículo

```typescript
interface Verse {
  id: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  testament: 'old' | 'new';
  topics: string[]; // ['amor', 'fe', 'promesas']
  audioUrl?: string;
}

// Ejemplo
{
  id: "juan_3_16",
  text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
  book: "Juan",
  chapter: 3,
  verse: 16,
  testament: "new",
  topics: ["amor", "fe", "salvacion"],
}
```

### Plan de Lectura

```typescript
interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // días
  verses: string[]; // IDs de versículos
  icon: string;
  isPremium: boolean;
}
```

---

## 🎯 Diferencias Clave vs Mimo

| Aspecto | Mimo (Afirmaciones) | Nueva App (Versículos) |
|---------|---------------------|------------------------|
| **Tono** | Motivacional, energético | Contemplativo, reverente |
| **Tipografía** | Sans-serif (Nunito) | Serif (Lora) para contenido |
| **Colores** | Naranja vibrante | Dorado cálido, tonos tierra |
| **Iconografía** | Emojis modernos | Mix de emojis + iconos clásicos |
| **Contenido** | Frases de motivación | Versículos bíblicos con referencia |
| **Estructura** | Categorías simples | Libro > Capítulo > Versículo |
| **Audio** | TTS de afirmaciones | Audio de versículos (opcional) |
| **Extras** | Frases personalizadas | Notas personales, contexto bíblico |

---

## ✅ Checklist de Migración

### Fase 1: Configuración
- [ ] Crear nuevo proyecto Expo
- [ ] Copiar estructura de carpetas de Mimo
- [ ] Actualizar `theme.ts` con nueva paleta
- [ ] Instalar fuentes Lora e Inter

### Fase 2: Componentes
- [ ] Migrar `AffirmationCard` → `VerseCard`
- [ ] Migrar `CategoryCard` → `TopicCard`
- [ ] Migrar `MixCard` → `ReadingPlanCard`
- [ ] Crear `BookSelector`
- [ ] Crear `ChapterSelector`

### Fase 3: Datos
- [ ] Crear JSONs de versículos por libro
- [ ] Crear índice de temas
- [ ] Mapear versículos a temas

### Fase 4: Servicios
- [ ] Adaptar `affirmation.service.ts` → `verse.service.ts`
- [ ] Mantener `notification.service.ts` (cambiar textos)
- [ ] Mantener `analytics.service.ts`
- [ ] Mantener `storage.service.ts`

### Fase 5: Pantallas
- [ ] Adaptar onboarding (temas en vez de categorías)
- [ ] Adaptar home (versículo del día)
- [ ] Crear explorador de libros
- [ ] Adaptar favoritos
- [ ] Adaptar compartir

---

**Versión:** 1.0  
**Última actualización:** Enero 2026  
**Basado en:** Mimo Design System ☁️
