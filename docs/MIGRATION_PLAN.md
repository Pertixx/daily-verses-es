# Plan de Migración: Mimo (Afirmaciones) → Versículo (Versículos Diarios)

## Resumen Ejecutivo

Migrar la app **Mimo** (afirmaciones diarias) a **Versículo** (versículos bíblicos diarios) para el público religioso. El cambio debe ser **notorio** en la estética y la experiencia debe ser más directa con un onboarding reducido.

---

## 1. IDENTIDAD Y BRANDING

### Estado Actual
- **Nombre:** Mimo
- **Slug:** mimo
- **Bundle ID:** com.startnode.mimo
- **Dominio:** mimoafirmacionesdiarias.com
- **Mascota:** "Mimo" (personaje ilustrado con variantes: greetings, stamp, sleeps, peeking)
- **Tono:** Motivacional, wellness, autoayuda

### Estado Objetivo
- **Nombre:** Versículo
- **Slug:** versiculo
- **Bundle ID:** com.startnode.versiculo (o mantener mimo si se prefiere evitar nuevo registro)
- **Tono:** Espiritual, devocional, sereno, esperanzador
- **Mascota:** Eliminar — reemplazar con iconografía religiosa sutil (paloma, cruz, libro abierto, etc.)

### Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `app.json` | name, slug, scheme, bundleIdentifier, package, íconos, splash |
| `eas.json` | Configuración de builds |
| `package.json` | name |

---

## 2. PALETA DE COLORES Y ESTÉTICA

### Estado Actual (Mimo)
- **Primario:** `#FF9A56` (naranja cálido)
- **Secundario:** `#FFE5B4` (durazno suave)
- **Terciario:** `#FFF5EB` (crema claro)
- **Accent:** `#FF8A3D` (naranja hover)
- **Vibe:** Energético, cálido, juvenil

### Estado Objetivo (Versículo)
Propuesta de paleta espiritual/devocional:

- **Primario:** `#5B7FCC` (azul sereno — confianza, fe, cielo)
- **Secundario:** `#C9A96E` (dorado cálido — divinidad, sabiduría)
- **Terciario:** `#F5F0E8` (pergamino claro — tradición, pureza)
- **Accent:** `#4A6BB5` (azul profundo — hover/active)
- **Success:** `#059669` (mantener)
- **Info:** `#2563EB` (mantener)

#### Light Mode
| Token | Actual | Nuevo |
|-------|--------|-------|
| primary | `#FF9A56` | `#5B7FCC` |
| secondary | `#FFE5B4` | `#D4C5A0` |
| tertiary | `#FFF5EB` | `#F5F0E8` |
| accent | `#FF8A3D` | `#4A6BB5` |
| text | `#1F2937` | `#2D3748` |
| textSecondary | `#6B7280` | `#718096` |
| background | `#F3F4F6` | `#FAF8F5` |
| backgroundSecondary | `#FFFFFF` | `#FFFFFF` |
| surface | `#FFFFFF` | `#FFFFFF` |
| surfaceSecondary | `#F9FAFB` | `#F7F4EF` |
| cardBackground | `#FFFFFF` | `#FFFFFF` |
| buttonPrimaryBg | `#FF9A56` | `#5B7FCC` |
| buttonPrimaryText | `#FFFFFF` | `#FFFFFF` |
| buttonSecondaryBg | `#FFE5B4` | `#E8E0D0` |
| buttonSecondaryText | `#FF9A56` | `#5B7FCC` |
| selectedCardBg | `#FFF5EB` | `#EDE8DC` |
| badgePrimaryBg | `#FFE5B4` | `#DDD5C3` |
| badgePrimaryText | `#FF9A56` | `#5B7FCC` |

#### Dark Mode
| Token | Actual | Nuevo |
|-------|--------|-------|
| primary | `#FF9A56` | `#7B9FE0` |
| secondary | `#FFE5B4` | `#B8A67A` |
| tertiary | `#FFF5EB` | `#3D3528` |
| accent | `#FF8A3D` | `#6B8FD0` |
| text | `#F9FAFB` | `#F7F4EF` |
| textSecondary | `#E5E7EB` | `#D4CFC5` |
| background | `#1A1A1A` | `#1A1915` |
| backgroundSecondary | `#2D2D2D` | `#2A2820` |
| surface | `#2D2D2D` | `#2A2820` |
| surfaceSecondary | `#404040` | `#3D3A30` |
| cardBackground | `#2D2D2D` | `#2A2820` |
| buttonPrimaryBg | `#FF9A56` | `#5B7FCC` |
| buttonSecondaryBg | `#5A4A3F` | `#3D3A30` |
| buttonSecondaryText | `#FFE5B4` | `#C9A96E` |
| selectedCardBg | `#4A3B2F` | `#3D3528` |
| badgePrimaryBg | `#4A3B2F` | `#3D3528` |
| badgePrimaryText | `#FFD4A3` | `#C9A96E` |

### Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `constants/theme.ts` | BaseColors, LightColors, DarkColors, Colors legacy |
| `components/AppBackgroundSelector.tsx` | Nuevos fondos con estética religiosa |
| `app.json` | splash backgroundColor |

---

## 3. TIPOGRAFÍA

### Estado Actual
- **Fuente:** Nunito (todas las variantes)
- **Vibe:** Redondeada, amigable, infantil

### Estado Objetivo
- **Fuente principal:** Mantener Nunito por ahora (es legible y funcional)
- **Alternativa futura:** Considerar Lora (serif, más bíblica) para títulos de versículos o Merriweather
- **Acción inmediata:** Ningún cambio de fuente, solo ajustar textos/copies

---

## 4. CONTENIDO: DE AFIRMACIONES A VERSÍCULOS

### Estado Actual
- 12 categorías de afirmaciones (amor propio, confianza, motivación, etc.)
- ~80 afirmaciones por categoría en archivos JSON
- Cada afirmación tiene: id, text, audio_source, audio_source_duration
- Estructura en `constants/*_affirmations.json`

### Estado Objetivo
- Nuevas categorías bíblicas:
  - **Fe y Confianza** (Salmos, Proverbios)
  - **Fortaleza** (Isaías, Josué)
  - **Amor** (1 Corintios, Juan)
  - **Esperanza** (Romanos, Jeremías)
  - **Paz** (Filipenses, Juan)
  - **Gratitud** (Salmos, 1 Tesalonicenses)
  - **Sabiduría** (Proverbios, Santiago)
  - **Protección** (Salmos, Deuteronomio)
  - **Sanación** (Salmos, Jeremías)
  - **Provisión** (Mateo, Filipenses)
  - **Perdón** (Efesios, Colosenses)
  - **Alabanza** (Salmos, Apocalipsis)

### Estructura del Versículo
```typescript
interface Verse {
  id: string;
  text: string;           // "Porque de tal manera amó Dios al mundo..."
  reference: string;      // "Juan 3:16"
  book: string;           // "Juan"
  chapter: number;        // 3
  verseNumber: number;    // 16
  audioSource?: string;
  audioDuration?: number;
}
```

### Archivos a Crear/Modificar
| Archivo | Cambio |
|---------|--------|
| `constants/*.json` | Reemplazar archivos de afirmaciones por versículos por categoría |
| `types/index.ts` | Nuevo tipo `Verse`, renombrar `AffirmationCategory` → `VerseCategory` |
| `services/affirmation.service.ts` | Renombrar a `verse.service.ts`, adaptar lógica |
| `services/category.service.ts` | Simplificar — ya no se calculan por perfil psicológico |
| `components/AffirmationCard.tsx` | Renombrar, agregar campo de referencia bíblica |

---

## 5. ONBOARDING — SIMPLIFICACIÓN RADICAL

### Estado Actual: 31 pantallas
```
welcome → name → age → gender → relationship → employment → 
affirmation_1 → familiarity → daily_habit → affirmation_2 → 
notifications → daily_affirmations → theme → amazing → mood → 
activities → future → manifestation → app_icon → vibe → 
affirmation_preview → improve → let_go → confrontations → 
researches → goals → focus → personalized_categories → 
free_trial → free_trial_reminder → trial_paywall → widget
```

### Estado Objetivo: ~7 pantallas
```
welcome → name → theme → appIcon → notifications → widget → complete
```

### Pantallas a MANTENER (con ajuste de textos/estética)
| Pantalla | Cambio |
|----------|--------|
| `welcome.tsx` | Nuevo diseño, icono religioso, texto "Tu versículo diario te espera" |
| `name.tsx` | Mantener lógica, cambiar copy a tono devocional |
| `theme.tsx` | Mantener, nueva paleta |
| `appIcon.tsx` | Nuevos íconos religiosos |
| `notifications.tsx` | Cambiar copy: "Recibe tu versículo diario" |
| `widget.tsx` | Cambiar copy: "Versículo en tu pantalla" |

### Pantallas a ELIMINAR
| Pantalla | Razón |
|----------|-------|
| `age.tsx` | No relevante para experiencia de versículos |
| `gender.tsx` | No relevante |
| `relationship.tsx` | No relevante |
| `employment.tsx` | No relevante |
| `familiarity.tsx` | No relevante |
| `dailyHabit.tsx` | No relevante |
| `mood.tsx` | No relevante |
| `activities.tsx` | No relevante |
| `future.tsx` | No relevante |
| `manifestation.tsx` | No relevante |
| `improve.tsx` | No relevante |
| `letGo.tsx` | No relevante |
| `confrontations.tsx` | No relevante |
| `researches.tsx` | No relevante |
| `goals.tsx` | No relevante |
| `focus.tsx` | No relevante |
| `personalizedCategories.tsx` | No relevante (categorías bíblicas son fijas) |
| `affirmation.tsx` | Pantalla de muestra intermedia innecesaria |
| `affirmationPreview.tsx` | Innecesaria en nuevo flujo |
| `amazing.tsx` | Pantalla motivacional innecesaria |
| `dailyAffirmations.tsx` | Config avanzada innecesaria en onboarding |
| `vibe.tsx` | No aplica |
| `freeTrial.tsx` | Evaluar si se mantiene — por ahora eliminar del flujo |
| `freeTrialReminder.tsx` | Eliminar del flujo |
| `trialPaywall.tsx` | Evaluar si se mantiene como pantalla separada |
| `complete.tsx` | Se puede mantener o modificar |

### Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `app/(onboarding)/_layout.tsx` | Reducir Stack.Screens |
| `constants/onboarding.ts` | Reducir ONBOARDING_PROGRESS_STEPS y ONBOARDING_STEP_MAP |
| `types/index.ts` | Simplificar OnboardingStep, UserProfile, eliminar tipos no usados |
| `services/category.service.ts` | Simplificar `calculateAssignedCategories` (ya no basado en perfil psicológico) |

---

## 6. PANTALLAS PRINCIPALES

### Home (index.tsx)
| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Título | "Tu afirmación de hoy" | Ninguno o "Tu versículo de hoy" |
| Card | Texto de afirmación | Texto del versículo + referencia bíblica |
| Favorito | Corazón | Corazón o ícono de bookmark |
| Audio | Voz narrada | Se puede mantener o posponer |
| Swipe | Vertical entre afirmaciones | Vertical entre versículos |

### Categorías (categories.tsx)
| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Secciones | Mix personalizado, por categoría, favoritos, frases propias | Categorías bíblicas, favoritos |
| Mixes custom | Usuarios crean sus propios mixes | Simplificar — quizás eliminar por ahora |
| Categorías premium | 7 de 12 son premium | Definir nuevo esquema premium |

### Perfil (profile.tsx)
| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Streak | Racha de afirmaciones | Racha de versículos |
| Ajustes | Nombre, género, tema, notificaciones, favoritos | Nombre, tema, notificaciones, favoritos |
| Premium | Banner premium | Mantener/adaptar |
| Legal | mimoafirmacionesdiarias.com | Actualizar URLs |

### Paywall (paywall.tsx)
| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Features | Categorías, temas, audio, mixes | Adaptar a versículos |
| Copy | "Mimo Premium" | "Versículo Premium" |
| Branding | Iconos naranja | Nueva paleta |

### Share (share.tsx)
| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Card | Afirmación + outfit de Mimo | Versículo + referencia bíblica |
| Mascota | Mimo variants | Eliminar mascota, usar diseño limpio |
| Fondos | Sunset, ocean, etc. | Adaptar o crear nuevos |

### Favoritos (favorites.tsx)
- Cambiar "afirmaciones favoritas" → "versículos favoritos"
- Agregar campo de referencia bíblica

---

## 7. SERVICIOS

### Renombramiento y Adaptación
| Servicio Actual | Servicio Nuevo | Cambios |
|-----------------|----------------|---------|
| `affirmation.service.ts` | `verse.service.ts` | Renombrar, misma lógica de carga de JSON |
| `audio.service.ts` | `audio.service.ts` | Mantener sin cambios |
| `category.service.ts` | `category.service.ts` | Simplificar — asignar categorías default sin perfil |
| `notification.service.ts` | `notification.service.ts` | Cambiar textos de notificación |
| `widget.service.ts` | `widget.service.ts` | Cambiar "afirmaciones" → "versículos" |
| `storage.service.ts` | `storage.service.ts` | Adaptar tipos |
| `analytics.service.ts` | `analytics.service.ts` | Renombrar eventos |
| `revenuecat.service.ts` | `revenuecat.service.ts` | Mantener |
| `deeplink.service.ts` | `deeplink.service.ts` | Adaptar scheme |
| `appIcon.service.ts` | `appIcon.service.ts` | Nuevos íconos |

### Storage Keys
Considerar migración de keys (de `@nubi_*` a `@versiculo_*`) o mantener para no perder datos de usuarios existentes.

---

## 8. TIPOS (types/index.ts)

### Tipos a Renombrar
| Actual | Nuevo |
|--------|-------|
| `Affirmation` | `Verse` |
| `AffirmationCategory` | `VerseCategory` |
| `AffirmationFile` | `VerseFile` |
| `AffirmationWithMeta` | `VerseWithMeta` |
| `FavoriteAffirmation` | `FavoriteVerse` |
| `AFFIRMATION_CATEGORIES` | `VERSE_CATEGORIES` |
| `CategoryConfig` | `CategoryConfig` (mantener) |

### Tipos a ELIMINAR
- `AgeRange`, `RelationshipStatus`, `EmploymentStatus`
- `FamiliarityLevel`, `DailyHabitLevel`, `MoodStatus`, `ActivityType`
- `FutureValue`, `ManifestationBeliefValue`
- `ImprovementArea`, `LetGoArea`, `ConfrontationType`, `Goals`, `focusArea`

### Campos a ELIMINAR de UserProfile
- `ageRange`, `gender`, `relationshipStatus`, `employmentStatus`
- `familiarity`, `dailyHabits`, `mood`, `activities`
- `future`, `manifestation`, `improvementArea`, `letGoArea`
- `confrontationTypes`, `goals`, `focusArea`

### Campos que QUEDAN en UserProfile
```typescript
interface UserProfile {
  name: string;
  appIcon?: AppIconType;
  appBackground?: AppBackgroundType;
  assignedCategories?: VerseCategory[];
}
```

---

## 9. ASSETS

### Íconos de App
- Diseñar nuevos íconos con estética religiosa (cruz, paloma, libro, etc.)
- Reemplazar variantes de Mimo

### Imágenes
- `assets/icons/Mimo*.png` → Reemplazar con nuevo branding
- `assets/images/backgrounds/` → Evaluar si se mantienen o crean nuevos

### Animaciones (Lottie)
- Evaluar si hay animaciones de Mimo que deben reemplazarse

---

## 10. ORDEN DE EJECUCIÓN (FASES)

### Fase 1: Estética y Colores ← **EMPEZAR AQUÍ**
1. **`constants/theme.ts`** — Nueva paleta completa (BaseColors, LightColors, DarkColors)
2. **`app.json`** — Splash screen colors
3. Verificar que toda la app refleja los nuevos colores automáticamente via el theme system

### Fase 2: Contenido y Tipos
1. **`types/index.ts`** — Definir `Verse`, `VerseCategory`, nueva `CategoryConfig[]`, simplificar `UserProfile`
2. **`constants/*.json`** — Crear archivos de versículos por categoría
3. **`services/verse.service.ts`** — Renombrar y adaptar
4. **`services/category.service.ts`** — Simplificar

### Fase 3: Onboarding Reducido
1. **`constants/onboarding.ts`** — Reducir pasos
2. **`app/(onboarding)/_layout.tsx`** — Eliminar pantallas innecesarias
3. **`app/(onboarding)/welcome.tsx`** — Rediseñar
4. **`app/(onboarding)/name.tsx`** — Cambiar copy
5. Ajustar navegación entre pantallas restantes
6. Eliminar archivos de pantallas removidas

### Fase 4: Pantallas Principales
1. **`app/index.tsx`** — Adaptar Home a versículos (mostrar referencia bíblica)
2. **`app/categories.tsx`** — Nuevas categorías bíblicas
3. **`app/favorites.tsx`** — Adaptar a versículos
4. **`app/share.tsx`** — Rediseñar card de compartir (sin Mimo)
5. **`app/profile.tsx`** — Adaptar textos y eliminar opciones innecesarias
6. **`app/paywall.tsx`** — Adaptar features y copy

### Fase 5: Servicios y Notificaciones
1. **`services/notification.service.ts`** — Cambiar textos
2. **`services/widget.service.ts`** — Adaptar a versículos
3. **`services/storage.service.ts`** — Adaptar tipos
4. **`constants/storage.ts`** — Evaluar migración de keys

### Fase 6: Assets y Branding
1. Nuevos íconos de app
2. Nuevo splash screen
3. Nuevos fondos de pantalla (si aplica)
4. Actualizar `app.json` con nueva configuración

### Fase 7: Limpieza
1. Eliminar archivos de pantallas de onboarding no usadas
2. Eliminar archivos JSON de afirmaciones viejas
3. Eliminar assets de Mimo (imágenes del personaje)
4. Limpiar tipos no usados
5. Actualizar analytics events

---

## 11. CONSIDERACIONES TÉCNICAS

### Migración de Datos
- Los usuarios existentes de Mimo tienen datos en AsyncStorage con keys `@nubi_*`
- Si se publica como app nueva: no hay migración necesaria
- Si se actualiza la app existente: considerar migration path para favoritos

### RevenueCat
- Configurar nuevo producto/entitlement en RevenueCat
- O mantener el existente si es el mismo plan de suscripción

### App Store / Google Play
- Si es app nueva: nuevo listing, nuevo bundle ID
- Si es update: cambiar nombre, screenshots, descripción

### Widget (iOS)
- Adaptar textos y estilo del widget
- Mantener App Group ID o crear nuevo

---

## 12. RESUMEN DE IMPACTO POR ARCHIVO

### Archivos CON CAMBIOS
| Archivo | Tipo de Cambio | Fase |
|---------|---------------|------|
| `constants/theme.ts` | Colores completos | 1 |
| `app.json` | Branding, splash | 1, 6 |
| `package.json` | Nombre | 6 |
| `types/index.ts` | Tipos, categorías, simplificar | 2 |
| `constants/onboarding.ts` | Reducir pasos | 3 |
| `constants/defaults.ts` | Adaptar defaults | 2 |
| `constants/storage.ts` | Evaluar keys | 5 |
| `services/affirmation.service.ts` → `verse.service.ts` | Renombrar, adaptar | 2 |
| `services/category.service.ts` | Simplificar | 2 |
| `services/notification.service.ts` | Copy | 5 |
| `services/widget.service.ts` | Copy | 5 |
| `services/storage.service.ts` | Tipos | 5 |
| `services/index.ts` | Exports | 2 |
| `app/_layout.tsx` | Mínimo | 4 |
| `app/(onboarding)/_layout.tsx` | Reducir screens | 3 |
| `app/(onboarding)/welcome.tsx` | Rediseñar | 3 |
| `app/(onboarding)/name.tsx` | Copy | 3 |
| `app/(onboarding)/theme.tsx` | Copy + nueva paleta auto | 3 |
| `app/(onboarding)/appIcon.tsx` | Nuevos íconos | 3, 6 |
| `app/(onboarding)/notifications.tsx` | Copy | 3 |
| `app/(onboarding)/widget.tsx` | Copy | 3 |
| `app/index.tsx` | Home completa | 4 |
| `app/categories.tsx` | Categorías bíblicas | 4 |
| `app/favorites.tsx` | Copy, referencia | 4 |
| `app/share.tsx` | Rediseñar sin Mimo | 4 |
| `app/profile.tsx` | Copy, eliminar opciones | 4 |
| `app/paywall.tsx` | Copy, features | 4 |
| `components/AffirmationCard.tsx` | Renombrar, agregar referencia | 4 |
| `components/AppBackground.tsx` | Posible ajuste | 4 |
| `components/AppBackgroundSelector.tsx` | Nuevos fondos | 4, 6 |
| `hooks/useTheme.tsx` | Sin cambios (sistema funciona) | - |

### Archivos a ELIMINAR (Fase 7)
- `app/(onboarding)/age.tsx`
- `app/(onboarding)/gender.tsx`
- `app/(onboarding)/relationship.tsx`
- `app/(onboarding)/employment.tsx`
- `app/(onboarding)/familiarity.tsx`
- `app/(onboarding)/dailyHabit.tsx`
- `app/(onboarding)/mood.tsx`
- `app/(onboarding)/activities.tsx`
- `app/(onboarding)/future.tsx`
- `app/(onboarding)/manifestation.tsx`
- `app/(onboarding)/improve.tsx`
- `app/(onboarding)/letGo.tsx`
- `app/(onboarding)/confrontations.tsx`
- `app/(onboarding)/researches.tsx`
- `app/(onboarding)/goals.tsx`
- `app/(onboarding)/focus.tsx`
- `app/(onboarding)/personalizedCategories.tsx`
- `app/(onboarding)/affirmation.tsx`
- `app/(onboarding)/affirmationPreview.tsx`
- `app/(onboarding)/amazing.tsx`
- `app/(onboarding)/dailyAffirmations.tsx`
- `app/(onboarding)/vibe.tsx`
- `app/(onboarding)/freeTrial.tsx`
- `app/(onboarding)/freeTrialReminder.tsx`
- `app/(onboarding)/trialPaywall.tsx`
- `constants/*_affirmations.json` (12 archivos)

---

## ¿Empezamos?

**Fase 1 lista para ejecutar:** Cambio de toda la paleta de colores en `constants/theme.ts`.
