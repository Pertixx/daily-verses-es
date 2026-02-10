// ============================================================================
// Type Definitions - Versículo App
// ============================================================================

// URLs legales y de soporte
export const LEGAL_URLS = {
  termsOfService: 'https://mimoafirmacionesdiarias.com/terms.html',
  privacyPolicy: 'https://mimoafirmacionesdiarias.com/privacy.html',
  iOSEulaPolicy: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
} as const;

/**
 * Tema de la aplicación
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Íconos de app disponibles
 */
export type AppIconType = 'default' | 'variant-1' | 'variant-2' | 'variant-3' | 'variant-4' | 'variant-5';

/**
 * Fondos de pantalla disponibles
 */
export type AppBackgroundType = 
  | 'default'      // Fondo sólido del tema actual
  | 'sunset'       // Gradiente cálido
  | 'ocean'        // Gradiente azul
  | 'forest'       // Gradiente verde
  | 'lavender'     // Gradiente púrpura
  | 'midnight';    // Gradiente oscuro

// ============================================================================
// Categorías de Versículos
// ============================================================================

/**
 * Categorías de versículos bíblicos disponibles
 */
export type VerseCategory = 
  | 'faith'             // Fe y Confianza
  | 'strength'          // Fortaleza
  | 'love'              // Amor
  | 'hope'              // Esperanza
  | 'peace'             // Paz
  | 'gratitude'         // Gratitud
  | 'wisdom'            // Sabiduría
  | 'protection'        // Protección
  | 'healing'           // Sanación
  | 'provision'         // Provisión
  | 'forgiveness'       // Perdón
  | 'praise';           // Alabanza

/**
 * Configuración de cada categoría
 */
export interface CategoryConfig {
  id: VerseCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPremium?: boolean;
}

/**
 * Configuración de todas las categorías de versículos
 */
export const VERSE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'faith',
    name: 'Fe y Confianza',
    description: 'Versículos para fortalecer tu fe en Dios',
    icon: 'shield',
    color: '#5B7FCC',
    isPremium: false,
  },
  {
    id: 'strength',
    name: 'Fortaleza',
    description: 'Palabras de fuerza para los momentos difíciles',
    icon: 'bolt',
    color: '#E67E22',
    isPremium: false,
  },
  {
    id: 'love',
    name: 'Amor',
    description: 'El amor de Dios expresado en su Palabra',
    icon: 'heart',
    color: '#E74C3C',
    isPremium: false,
  },
  {
    id: 'hope',
    name: 'Esperanza',
    description: 'Promesas de esperanza para tu vida',
    icon: 'star',
    color: '#C9A96E',
    isPremium: false,
  },
  {
    id: 'peace',
    name: 'Paz',
    description: 'Versículos para encontrar calma y serenidad',
    icon: 'leaf',
    color: '#8B5CF6',
    isPremium: false,
  },
  {
    id: 'gratitude',
    name: 'Gratitud',
    description: 'Agradecimiento al Señor por sus bendiciones',
    icon: 'gift',
    color: '#10B981',
    isPremium: false,
  },
  {
    id: 'wisdom',
    name: 'Sabiduría',
    description: 'Sabiduría divina para guiar tu camino',
    icon: 'book',
    color: '#3B82F6',
    isPremium: true,
  },
  {
    id: 'protection',
    name: 'Protección',
    description: 'La protección de Dios sobre tu vida',
    icon: 'umbrella',
    color: '#6366F1',
    isPremium: true,
  },
  {
    id: 'healing',
    name: 'Sanación',
    description: 'Promesas de sanidad y restauración',
    icon: 'heartbeat',
    color: '#22C55E',
    isPremium: true,
  },
  {
    id: 'provision',
    name: 'Provisión',
    description: 'Dios provee para todas tus necesidades',
    icon: 'sun-o',
    color: '#F59E0B',
    isPremium: true,
  },
  {
    id: 'forgiveness',
    name: 'Perdón',
    description: 'El perdón y la misericordia de Dios',
    icon: 'hand-peace-o',
    color: '#14B8A6',
    isPremium: true,
  },
  {
    id: 'praise',
    name: 'Alabanza',
    description: 'Versículos de alabanza y adoración',
    icon: 'music',
    color: '#EC4899',
    isPremium: true,
  },
];

// ============================================================================
// User Profile (simplificado para Versículo)
// ============================================================================

/**
 * Perfil del usuario
 */
export interface UserProfile {
  /** Nombre del usuario */
  name: string;
  /** Ícono de app seleccionado */
  appIcon?: AppIconType;
  /** Fondo de pantalla seleccionado */
  appBackground?: AppBackgroundType;
  /** Categorías de versículos asignadas */
  assignedCategories?: VerseCategory[];
}

/**
 * Configuración de notificaciones del usuario
 */
export interface NotificationSettings {
  /** Si las notificaciones están habilitadas */
  enabled: boolean;
  /** Cantidad de notificaciones por día (1-5) */
  frequency: number;
  /** Hora de inicio (formato HH:mm, ej: "09:00") */
  startTime: string;
  /** Hora de fin (formato HH:mm, ej: "21:00") */
  endTime: string;
  /** Recordatorio diario de racha habilitado */
  dailyStreakReminder: boolean;
  /** Hora del recordatorio de racha (formato HH:mm) */
  streakReminderTime: string;
}

/**
 * Datos de racha del usuario
 */
export interface StreakData {
  /** Racha actual (días consecutivos) */
  currentStreak: number;
  /** Racha más larga alcanzada */
  longestStreak: number;
  /** Última fecha de actividad (ISO string) */
  lastActivityDate: string;
  /** Fecha de inicio de la racha actual (ISO string) */
  streakStartDate: string;
  /** Historial de días completados (ISO strings) */
  completedDays: string[];
}

/**
 * Versículo favorito
 */
export interface FavoriteVerse {
  /** ID único del versículo */
  id: string;
  /** Texto del versículo */
  text: string;
  /** Referencia bíblica (ej: "Juan 3:16") */
  reference: string;
  /** Categoría del versículo */
  category: string;
  /** Fecha en que se marcó como favorito (ISO string) */
  favoritedAt: string;
}

/**
 * Datos del usuario almacenados localmente
 */
export interface UserData {
  /** ID único del usuario (de RevenueCat) */
  userId: string;
  /** Si el onboarding fue completado */
  onboardingCompleted: boolean;
  /** Perfil del usuario */
  profile: UserProfile;
  /** Tema seleccionado */
  theme: Theme;
  /** Configuración de notificaciones */
  notificationSettings: NotificationSettings;
  /** Datos de racha */
  streak: StreakData;
  /** Versículos favoritos */
  favorites: FavoriteVerse[];
  /** Fecha de creación de la cuenta local (ISO string) */
  createdAt: string;
  /** Última actualización (ISO string) */
  updatedAt: string;
}

// ============================================================================
// Onboarding Types
// ============================================================================

/**
 * Paso del onboarding - Orden de las pantallas
 */
export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'theme'
  | 'app_icon'
  | 'notifications'
  | 'widget'
  | 'complete';

/**
 * Configuración de las pantallas de onboarding
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'name',
  'theme',
  'app_icon',
  'notifications',
  'widget',
  'complete',
];

/**
 * Número total de pasos del onboarding (excluyendo welcome y complete)
 */
export const ONBOARDING_PROGRESS_STEPS = ONBOARDING_STEPS.filter(
  step => step !== 'welcome' && step !== 'complete'
).length;

/**
 * Estado del onboarding
 */
export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}

// ============================================================================
// Verse Types
// ============================================================================

/**
 * Un versículo bíblico individual
 */
export interface Verse {
  /** ID único del versículo */
  id: string;
  /** Texto del versículo */
  text: string;
  /** Referencia bíblica completa (ej: "Juan 3:16") */
  reference: string;
  /** URL del audio narrado */
  audioSource?: string;
  /** Duración del audio en segundos */
  audioDuration?: number;
}

/**
 * Estructura del archivo JSON de versículos
 */
export interface VerseFile {
  /** Lista de versículos */
  verses: Array<{
    id: string;
    text: string;
    reference: string;
    audio_source?: string;
    audio_source_duration?: number;
  }>;
  /** Nombre de la categoría */
  category: string;
  /** Nombre visible de la categoría */
  category_name: string;
  /** Total de versículos */
  total: number;
}

/**
 * Versículo con metadata adicional para la UI
 */
export interface VerseWithMeta extends Verse {
  /** Si está marcado como favorito */
  isFavorite: boolean;
}

// ============================================================================
// Mix Types - Sistema de Mezclas de Versículos
// ============================================================================

/**
 * Tipos de mix disponibles
 */
export type MixType = 
  | 'personalized'    // Mix generado en el onboarding (no editable)
  | 'category'        // Mix de una sola categoría
  | 'favorites'       // Mix de favoritos del usuario
  | 'custom_phrases'  // Mix de frases propias del usuario
  | 'user_custom';    // Mix creado por el usuario (premium)

/**
 * Mix base - propiedades comunes
 */
export interface BaseMix {
  /** ID único del mix */
  id: string;
  /** Tipo de mix */
  type: MixType;
  /** Nombre del mix */
  name: string;
  /** Icono del mix (FontAwesome) */
  icon: string;
  /** Color del mix */
  color: string;
  /** Si requiere premium para activarse */
  isPremium: boolean;
  /** Fecha de creación (ISO string) */
  createdAt: string;
}

/**
 * Mix personalizado generado en onboarding
 */
export interface PersonalizedMix extends BaseMix {
  type: 'personalized';
  categories: VerseCategory[];
}

/**
 * Mix de una categoría específica
 */
export interface CategoryMix extends BaseMix {
  type: 'category';
  categoryId: VerseCategory;
}

/**
 * Mix de favoritos
 */
export interface FavoritesMix extends BaseMix {
  type: 'favorites';
  minRequired: number;
}

/**
 * Mix de frases propias
 */
export interface CustomPhrasesMix extends BaseMix {
  type: 'custom_phrases';
}

/**
 * Mix creado por el usuario (premium)
 */
export interface UserCustomMix extends BaseMix {
  type: 'user_custom';
  categories: VerseCategory[];
  updatedAt: string;
}

/**
 * Unión de todos los tipos de mix
 */
export type Mix = 
  | PersonalizedMix 
  | CategoryMix 
  | FavoritesMix 
  | CustomPhrasesMix 
  | UserCustomMix;

/**
 * Referencia al mix activo
 */
export interface ActiveMixReference {
  mixId: string;
  mixType: MixType;
}

/**
 * Límites del sistema de mixes
 */
export const MIX_LIMITS = {
  MAX_USER_CUSTOM_MIXES: 7,
  MIN_FAVORITES_REQUIRED: 7,
} as const;

/**
 * Límites de reproducción de audio
 */
export const AUDIO_LIMITS = {
  MAX_FREE_AUDIO_PLAYS: 20,
} as const;

/**
 * Frase personalizada del usuario
 */
export interface CustomPhrase {
  id: string;
  text: string;
  createdAt: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'app_opened'
  | 'app_backgrounded'
  | 'user_registered'
  | 'profile_updated'
  | 'affirmation_viewed'
  | 'affirmation_favorited'
  | 'affirmation_unfavorited'
  | 'affirmation_shared'
  | 'affirmation_audio_played'
  | 'mix_created'
  | 'mix_activated'
  | 'mix_deleted'
  | 'mix_updated'
  | 'category_viewed'
  | 'category_selected'
  | 'paywall_viewed'
  | 'paywall_dismissed'
  | 'purchase_intent'
  | 'purchase_started'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'purchase_restored'
  | 'trial_started'
  | 'notification_enabled'
  | 'notification_disabled'
  | 'notification_received'
  | 'notification_opened'
  | 'streak_updated'
  | 'streak_milestone_reached'
  | 'streak_lost'
  | 'theme_changed'
  | 'app_icon_changed'
  | 'app_background_changed'
  | 'custom_phrase_created'
  | 'custom_phrase_deleted'
  | 'widget_configured'
  | 'error_occurred';

export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEventPayload {
  event: AnalyticsEvent;
  properties?: AnalyticsEventProperties;
  timestamp: number;
}

export interface AnalyticsConfig {
  feedId: string;
  batchSize: number;
  flushInterval: number;
  enabled: boolean;
  debug: boolean;
}

// ============================================================================
// Backward Compatibility Aliases
// (Mantener hasta que se actualicen todos los consumidores en fases posteriores)
// ============================================================================

/** @deprecated Usar VerseCategory */
export type AffirmationCategory = VerseCategory;

/** @deprecated Usar VERSE_CATEGORIES */
export const AFFIRMATION_CATEGORIES = VERSE_CATEGORIES;

/** @deprecated Usar Verse */
export type Affirmation = Verse;

/** @deprecated Usar VerseFile */
export type AffirmationFile = VerseFile;

/** @deprecated Usar VerseWithMeta */
export type AffirmationWithMeta = VerseWithMeta;

/** @deprecated Usar FavoriteVerse */
export type FavoriteAffirmation = FavoriteVerse;
