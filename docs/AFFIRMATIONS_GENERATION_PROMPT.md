# 🧠 Prompt para Generar Afirmaciones - Mimo App

## Contexto

Mimo es una aplicación móvil de afirmaciones diarias en **español argentino**. La app ayuda a los usuarios a mejorar su bienestar mental y emocional a través de afirmaciones positivas personalizadas.

### Tono y Estilo

- **Idioma:** Español argentino (usar "vos" en lugar de "tú", conjugaciones como "sos", "tenés", "podés")
- **Tono:** Cálido, cercano, motivador pero no exagerado
- **Longitud:** Afirmaciones de 1-2 oraciones (máximo 150 caracteres idealmente)
- **Evitar:** Frases cliché, promesas irreales, tono condescendiente
- **Incluir:** Afirmaciones en primera persona ("Yo soy...", "Merezco...", "Elijo...")

---

## Estructura del JSON

Para cada categoría, genera un archivo JSON con la siguiente estructura:

```json
{
  "category": "self_love",
  "categoryName": "Amor Propio",
  "affirmations": [
    {
      "id": "self_love_001",
      "text": "Me acepto completamente tal como soy hoy",
      "tags": ["aceptación", "presente"]
    },
    {
      "id": "self_love_002", 
      "text": "Merezco amor y respeto, empezando por el mío propio",
      "tags": ["merecimiento", "respeto"]
    }
  ]
}
```

### Campos requeridos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único: `{category}_{número_3_dígitos}` |
| `text` | string | La afirmación en español argentino |
| `tags` | string[] | 1-3 palabras clave relevantes |

---

## Categorías a Generar

Genera **80 afirmaciones por categoría** (total: 960 afirmaciones).

### 1. `self_love` - Amor Propio 💖
**Descripción:** Afirmaciones para amarte y aceptarte tal como sos.
**Temas a cubrir:**
- Aceptación del cuerpo y apariencia
- Valoración personal
- Perdón hacia uno mismo
- Reconocimiento de logros propios
- Merecimiento de cosas buenas

**Ejemplos de estilo:**
- "Me abrazo con compasión en mis días difíciles"
- "Mi valor no depende de la opinión de los demás"
- "Soy suficiente exactamente como soy ahora"

---

### 2. `confidence` - Confianza 💪
**Descripción:** Fortalecé tu seguridad y autoestima.
**Temas a cubrir:**
- Confianza en las propias capacidades
- Seguridad al tomar decisiones
- Superación del miedo al fracaso
- Voz propia y asertividad
- Confianza en el proceso de vida

**Ejemplos de estilo:**
- "Confío en mi capacidad para resolver cualquier situación"
- "Mi voz merece ser escuchada"
- "Tengo todo lo necesario para alcanzar mis metas"

---

### 3. `motivation` - Motivación 🔥
**Descripción:** Impulsá tu energía y determinación.
**Temas a cubrir:**
- Inicio de nuevos proyectos
- Persistencia ante obstáculos
- Energía y vitalidad
- Acción sobre procrastinación
- Celebración del progreso

**Ejemplos de estilo:**
- "Cada paso que doy me acerca a donde quiero estar"
- "Hoy elijo actuar, no postergar"
- "Mi determinación es más fuerte que mis excusas"

---

### 4. `peace_calm` - Calma y Paz 🧘
**Descripción:** Encontrá tranquilidad en tu día a día.
**Temas a cubrir:**
- Manejo del estrés y ansiedad
- Soltar el control
- Respiración y centro
- Paz interior
- Aceptación de lo que no se puede cambiar

**Ejemplos de estilo:**
- "En este momento, estoy a salvo y en paz"
- "Elijo soltar lo que no puedo controlar"
- "Mi mente se calma, mi cuerpo se relaja"

---

### 5. `gratitude` - Gratitud 🙏
**Descripción:** Cultivá el agradecimiento por lo que tenés.
**Temas a cubrir:**
- Apreciar lo cotidiano
- Gratitud por el cuerpo y salud
- Agradecer relaciones
- Reconocer abundancia presente
- Gratitud por lecciones difíciles

**Ejemplos de estilo:**
- "Agradezco las pequeñas cosas que hacen grande mi día"
- "Mi vida está llena de bendiciones, algunas aún por descubrir"
- "Doy gracias por todo lo que tengo y todo lo que vendrá"

---

### 6. `success` - Éxito y Abundancia ✨
**Descripción:** Atraé prosperidad y logros a tu vida.
**Temas a cubrir:**
- Mentalidad de abundancia
- Merecimiento del éxito
- Atracción de oportunidades
- Prosperidad financiera
- Logro de metas

**Ejemplos de estilo:**
- "Estoy abierto/a a recibir abundancia en todas sus formas"
- "El éxito fluye naturalmente hacia mí"
- "Merezco prosperidad y la acepto con gratitud"

---

### 7. `relationships` - Relaciones ❤️
**Descripción:** Mejorá tus vínculos con los demás.
**Temas a cubrir:**
- Comunicación efectiva
- Límites saludables
- Atracción de relaciones positivas
- Perdón a otros
- Amor y conexión

**Ejemplos de estilo:**
- "Atraigo personas que me valoran y respetan"
- "Mis relaciones se nutren de amor y honestidad"
- "Tengo el derecho de poner límites saludables"

---

### 8. `health_wellness` - Salud y Bienestar 🌿
**Descripción:** Cuidá tu cuerpo y tu mente.
**Temas a cubrir:**
- Amor al cuerpo
- Hábitos saludables
- Energía y vitalidad
- Descanso y recuperación
- Conexión mente-cuerpo

**Ejemplos de estilo:**
- "Mi cuerpo es mi hogar y lo trato con amor"
- "Elijo alimentos y hábitos que me nutren"
- "Merezco descanso y lo tomo sin culpa"

---

### 9. `positivity` - Positividad ☀️
**Descripción:** Transformá tu perspectiva hacia lo positivo.
**Temas a cubrir:**
- Pensamientos positivos
- Optimismo realista
- Encontrar lo bueno en situaciones
- Energía positiva
- Sonrisa y alegría

**Ejemplos de estilo:**
- "Elijo ver las oportunidades en cada desafío"
- "Mi energía positiva contagia a quienes me rodean"
- "Hoy busco lo bueno y lo bueno me encuentra"

---

### 10. `personal_growth` - Crecimiento Personal 🌱
**Descripción:** Evolucioná y convertite en tu mejor versión.
**Temas a cubrir:**
- Aprendizaje continuo
- Salir de la zona de confort
- Evolución personal
- Nuevas perspectivas
- Versión mejorada de uno mismo

**Ejemplos de estilo:**
- "Cada día soy una mejor versión de mí mismo/a"
- "Los errores son maestros disfrazados"
- "Abrazo el cambio como oportunidad de crecimiento"

---

### 11. `overcoming` - Superación 🦋
**Descripción:** Dejá ir el pasado y seguí adelante.
**Temas a cubrir:**
- Soltar el pasado
- Superar traumas y heridas
- Resiliencia
- Nuevos comienzos
- Transformación personal

**Ejemplos de estilo:**
- "Mi pasado no define mi futuro"
- "Tengo la fuerza para superar cualquier obstáculo"
- "Cada final es un nuevo comienzo disfrazado"

---

### 12. `mindfulness` - Presente 🌸
**Descripción:** Viví el momento con plenitud.
**Temas a cubrir:**
- Vivir el presente
- Atención plena
- Soltar pasado y futuro
- Disfrutar el ahora
- Consciencia del momento

**Ejemplos de estilo:**
- "Este momento es todo lo que tengo y es suficiente"
- "Respiro profundo y vuelvo al aquí y ahora"
- "Mi poder está en el presente, no en el ayer ni el mañana"

---

## Instrucciones de Generación

1. **Genera un archivo JSON por categoría** con el nombre: `{category}.json`
2. **80 afirmaciones por categoría** - variadas y no repetitivas
3. **IDs únicos** siguiendo el formato `{category}_{001-080}`
4. **Tags relevantes** (1-3 por afirmación)
5. **Evitar repeticiones** de conceptos o estructuras similares
6. **Mezclar longitudes** - algunas cortas y directas, otras más elaboradas
7. **Incluir variedad** de pronombres cuando sea natural (yo, mi vida, mis...)

## Ejemplo de Output Esperado

Archivo: `self_love.json`

```json
{
  "category": "self_love",
  "categoryName": "Amor Propio",
  "version": "1.0",
  "totalAffirmations": 80,
  "affirmations": [
    {
      "id": "self_love_001",
      "text": "Me acepto completamente tal como soy hoy",
      "tags": ["aceptación", "presente"]
    },
    {
      "id": "self_love_002",
      "text": "Merezco amor y respeto, empezando por el mío propio",
      "tags": ["merecimiento", "respeto"]
    },
    {
      "id": "self_love_003",
      "text": "Mi cuerpo es perfecto en su imperfección",
      "tags": ["cuerpo", "aceptación"]
    }
    // ... 77 más
  ]
}
```

---

## Notas Adicionales

- **No usar:** "debes", "tienes que", "hay que" - evitar tono imperativo externo
- **Preferir:** "elijo", "merezco", "soy", "tengo" - empoderamiento interno
- **Incluir:** Algunas afirmaciones específicas para mañana, tarde y noche cuando sea relevante
- **Considerar:** Diversidad de situaciones de vida (trabajo, familia, soledad, transiciones)

---

## Archivos a Generar

| Archivo | Categoría | Cantidad |
|---------|-----------|----------|
| `self_love.json` | Amor Propio | 80 |
| `confidence.json` | Confianza | 80 |
| `motivation.json` | Motivación | 80 |
| `peace_calm.json` | Calma y Paz | 80 |
| `gratitude.json` | Gratitud | 80 |
| `success.json` | Éxito y Abundancia | 80 |
| `relationships.json` | Relaciones | 80 |
| `health_wellness.json` | Salud y Bienestar | 80 |
| `positivity.json` | Positividad | 80 |
| `personal_growth.json` | Crecimiento Personal | 80 |
| `overcoming.json` | Superación | 80 |
| `mindfulness.json` | Presente | 80 |

**Total: 960 afirmaciones únicas**

---

*Prompt generado para Mimo App - Enero 2026*
