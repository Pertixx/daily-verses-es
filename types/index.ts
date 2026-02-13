// ============================================================================
// Type Definitions - Tito App (Versículos Diarios)
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
export type AppIconType = 'default' | 'variant-1' | 'variant-2' | 'variant-3' | 'variant-4' | 'variant-5' | 'variant-6';

/**
 * Fondos de pantalla disponibles
 */
export type AppBackgroundType =
  | 'default'      // Fondo sólido del tema actual
  | 'sunset'       // Gradiente naranja/rosa
  | 'ocean'        // Gradiente azul
  | 'forest'       // Gradiente verde
  | 'lavender'     // Gradiente púrpura
  | 'midnight';    // Gradiente oscuro

/**
 * Categoría de versículos - acepta valores dinámicos del backend
 */
export type AffirmationCategory = string;

/**
 * Entidad del backend (respuesta de /entities)
 */
export interface BackendEntity {
  id: string;
  name: string;
  display_name: string;
  slug: string | null;
  emoji: string | null;
  metadata: string;
  articles_count: number;
}

/**
 * Configuración de cada categoría
 */
export interface CategoryConfig {
  id: AffirmationCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPremium?: boolean;
  entityId?: string;
  entityName?: string;
}

/**
 * Defaults de UI para categorías conocidas, indexados por entity.name del backend
 */
export const DEFAULT_CATEGORY_UI_MAP: Record<string, {
  localId: string;
  description: string;
  icon: string;
  color: string;
  isPremium: boolean;
}> = {
  'Esperanza': { localId: 'esperanza', description: 'Versículos que renuevan tu esperanza', icon: 'sun-o', color: '#F59E0B', isPremium: false },
  'Paz': { localId: 'paz', description: 'Encontrá tranquilidad en la Palabra de Dios', icon: 'leaf', color: '#10B981', isPremium: false },
  'Ansiedad': { localId: 'ansiedad', description: 'Versículos para calmar tu corazón', icon: 'cloud', color: '#6366F1', isPremium: true },
  'Fortaleza': { localId: 'fortaleza', description: 'Fortalecé tu espíritu con la Palabra', icon: 'shield', color: '#3B82F6', isPremium: true },
  'Animo': { localId: 'animo', description: 'Palabras de aliento para tu día', icon: 'bolt', color: '#F97316', isPremium: false },
  'Gratitud': { localId: 'gratitud', description: 'Cultivá el agradecimiento a Dios', icon: 'gift', color: '#10B981', isPremium: false },
  'Amor': { localId: 'amor', description: 'El amor de Dios en cada versículo', icon: 'heart', color: '#EF4444', isPremium: false },
  'Perdon': { localId: 'perdon', description: 'Versículos sobre el perdón y la gracia', icon: 'handshake-o', color: '#8B5CF6', isPremium: true },
  'Familia': { localId: 'familia', description: 'Versículos para bendecir tu familia', icon: 'home', color: '#D97706', isPremium: true },
  'Confianza en Dios': { localId: 'confianza_en_dios', description: 'Confiá en el plan de Dios para tu vida', icon: 'star', color: '#C9A96E', isPremium: true },
  'Miedo': { localId: 'miedo', description: 'Versículos para vencer el miedo', icon: 'eye', color: '#475569', isPremium: true },
  'Tristeza': { localId: 'tristeza', description: 'Consuelo y esperanza en tiempos difíciles', icon: 'tint', color: '#64748B', isPremium: true },
  'Sabiduria': { localId: 'sabiduria', description: 'La sabiduría que viene de lo alto', icon: 'book', color: '#7C3AED', isPremium: true },
  'Proposito': { localId: 'proposito', description: 'Descubrí el propósito de Dios para vos', icon: 'compass', color: '#0891B2', isPremium: true },
  'Maniana': { localId: 'maniana', description: 'Empezá tu mañana con la Palabra', icon: 'coffee', color: '#FB923C', isPremium: true },
  'Noche': { localId: 'noche', description: 'Cerrá tu día con versículos de paz', icon: 'moon-o', color: '#4338CA', isPremium: true },
  'Antes de Dormir': { localId: 'antes_de_dormir', description: 'Descansá en las promesas de Dios', icon: 'star-o', color: '#A78BFA', isPremium: true }
};

/**
 * Defaults genéricos para categorías nuevas del backend sin config local
 */
export const GENERIC_CATEGORY_DEFAULTS = {
  icon: 'star-o',
  color: '#6B7280',
  description: 'Versículos para tu bienestar',
  isPremium: true,
};

/**
 * Configuración fallback de todas las categorías conocidas
 */
export const AFFIRMATION_CATEGORIES: CategoryConfig[] = [
  {
    id: 'esperanza',
    name: 'Esperanza',
    description: 'Versículos que renuevan tu esperanza',
    icon: 'sun-o',
    color: '#F59E0B',
    isPremium: false,
    entityName: 'Esperanza',
  },
  {
    id: 'paz',
    name: 'Paz',
    description: 'Encontrá tranquilidad en la Palabra de Dios',
    icon: 'leaf',
    color: '#10B981',
    isPremium: false,
    entityName: 'Paz',
  },
  {
    id: 'ansiedad',
    name: 'Ansiedad',
    description: 'Versículos para calmar tu corazón',
    icon: 'cloud',
    color: '#6366F1',
    isPremium: true,
    entityName: 'Ansiedad',
  },
  {
    id: 'fortaleza',
    name: 'Fortaleza',
    description: 'Fortalecé tu espíritu con la Palabra',
    icon: 'shield',
    color: '#3B82F6',
    isPremium: true,
    entityName: 'Fortaleza',
  },
  {
    id: 'animo',
    name: 'Ánimo',
    description: 'Palabras de aliento para tu día',
    icon: 'bolt',
    color: '#F97316',
    isPremium: false,
    entityName: 'Animo',
  },
  {
    id: 'gratitud',
    name: 'Gratitud',
    description: 'Cultivá el agradecimiento a Dios',
    icon: 'gift',
    color: '#10B981',
    isPremium: false,
    entityName: 'Gratitud',
  },
  {
    id: 'amor',
    name: 'Amor',
    description: 'El amor de Dios en cada versículo',
    icon: 'heart',
    color: '#EF4444',
    isPremium: false,
    entityName: 'Amor',
  },
  {
    id: 'perdon',
    name: 'Perdón',
    description: 'Versículos sobre el perdón y la gracia',
    icon: 'handshake-o',
    color: '#8B5CF6',
    isPremium: true,
    entityName: 'Perdon',
  },
  {
    id: 'familia',
    name: 'Familia',
    description: 'Versículos para bendecir tu familia',
    icon: 'home',
    color: '#D97706',
    isPremium: true,
    entityName: 'Familia',
  },
  {
    id: 'confianza_en_dios',
    name: 'Confianza en Dios',
    description: 'Confiá en el plan de Dios para tu vida',
    icon: 'star',
    color: '#C9A96E',
    isPremium: true,
    entityName: 'Confianza en Dios',
  },
  {
    id: 'miedo',
    name: 'Miedo',
    description: 'Versículos para vencer el miedo',
    icon: 'eye',
    color: '#475569',
    isPremium: true,
    entityName: 'Miedo',
  },
  {
    id: 'tristeza',
    name: 'Tristeza',
    description: 'Consuelo y esperanza en tiempos difíciles',
    icon: 'tint',
    color: '#64748B',
    isPremium: true,
    entityName: 'Tristeza',
  },
  {
    id: 'sabiduria',
    name: 'Sabiduría',
    description: 'La sabiduría que viene de lo alto',
    icon: 'book',
    color: '#7C3AED',
    isPremium: true,
    entityName: 'Sabiduria',
  },
  {
    id: 'proposito',
    name: 'Propósito',
    description: 'Descubrí el propósito de Dios para vos',
    icon: 'compass',
    color: '#0891B2',
    isPremium: true,
    entityName: 'Proposito',
  },
  {
    id: 'maniana',
    name: 'Mañana',
    description: 'Empezá tu mañana con la Palabra',
    icon: 'coffee',
    color: '#FB923C',
    isPremium: true,
    entityName: 'Maniana',
  },
  {
    id: 'noche',
    name: 'Noche',
    description: 'Cerrá tu día con versículos de paz',
    icon: 'moon-o',
    color: '#4338CA',
    isPremium: true,
    entityName: 'Noche',
  },
  {
    id: 'antes_de_dormir',
    name: 'Antes de Dormir',
    description: 'Descansá en las promesas de Dios',
    icon: 'star-o',
    color: '#A78BFA',
    isPremium: true,
    entityName: 'Antes de Dormir',
  }
];

/**
 * Perfil del usuario (información recolectada en onboarding)
 */
export interface UserProfile {
  /** Nombre del usuario */
  name: string;
  /** Ícono de app seleccionado */
  appIcon?: AppIconType;
  /** Fondo de pantalla seleccionado */
  appBackground?: AppBackgroundType;
  /** Categorías de versículos asignadas */
  assignedCategories?: AffirmationCategory[];
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
 * Afirmación favorita
 */
export interface FavoriteAffirmation {
  /** ID único de la afirmación */
  id: string;
  /** Texto de la afirmación */
  text: string;
  /** Título/referencia bíblica del versículo */
  title?: string;
  /** Categoría de la afirmación */
  category: string;
  /** Fecha en que se marcó como favorita (ISO string) */
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
  /** Afirmaciones favoritas */
  favorites: FavoriteAffirmation[];
  /** Fecha de creación de la cuenta local (ISO string) */
  createdAt: string;
  /** Última actualización (ISO string) */
  updatedAt: string;
}

/**
 * Paso del onboarding - Orden de las pantallas
 */
export type OnboardingStep =
  | 'welcome'
  | 'name'
  | 'theme'
  | 'app_icon'
  | 'vibe'
  | 'affirmation_preview'
  | 'notifications'
  | 'daily_affirmations'
  | 'free_trial'
  | 'free_trial_reminder'
  | 'trial_paywall'
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
  'vibe',
  'affirmation_preview',
  'notifications',
  'daily_affirmations',
  'free_trial',
  'free_trial_reminder',
  'trial_paywall',
  'widget',
  'complete'
];

/**
 * Estado del onboarding
 */
export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}

// ============================================================================
// Affirmation Types
// ============================================================================

/**
 * Un versículo individual
 */
export interface Affirmation {
  /** ID único del versículo */
  id: string;
  /** Texto del versículo */
  text: string;
  /** Título/referencia bíblica del versículo */
  title?: string;
  /** URL del audio narrado */
  audioSource?: string;
  /** Duración del audio en segundos */
  audioDuration?: number;
}

/**
 * Estructura del archivo JSON de afirmaciones
 */
export interface AffirmationFile {
  /** Lista de versículos */
  versiculos: Array<{
    id: string;
    title?: string;
    text: string;
    audio_source?: string;
    audio_source_duration?: number;
  }>;
  /** Nombre de la entidad/categoría */
  entity: string;
  /** ID de la entidad */
  entity_id: string;
  /** Total de versículos */
  total: number;
}

/**
 * Afirmación con metadata adicional para la UI
 */
export interface AffirmationWithMeta extends Affirmation {
  /** Si está marcada como favorita */
  isFavorite: boolean;
}

// ============================================================================
// Mix Types - Sistema de Mezclas de Afirmaciones
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
  /** Categorías incluidas en el mix */
  categories: AffirmationCategory[];
}

/**
 * Mix de una categoría específica
 */
export interface CategoryMix extends BaseMix {
  type: 'category';
  /** ID de la categoría */
  categoryId: AffirmationCategory;
}

/**
 * Mix de favoritos
 */
export interface FavoritesMix extends BaseMix {
  type: 'favorites';
  /** Cantidad mínima de favoritos requerida para activar */
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
  /** Categorías seleccionadas por el usuario */
  categories: AffirmationCategory[];
  /** Fecha de última modificación (ISO string) */
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
  /** ID del mix activo */
  mixId: string;
  /** Tipo del mix (para recuperación rápida) */
  mixType: MixType;
}

/**
 * Límites del sistema de mixes
 */
export const MIX_LIMITS = {
  /** Máximo de mixes custom que puede crear un usuario premium */
  MAX_USER_CUSTOM_MIXES: 7,
  /** Mínimo de favoritos requeridos para activar el mix de favoritos */
  MIN_FAVORITES_REQUIRED: 7,
} as const;

/**
 * Límites de reproducción de audio
 */
export const AUDIO_LIMITS = {
  /** Máximo de versículos distintos que puede reproducir un usuario no premium */
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

/**
 * Eventos de analytics disponibles
 */
export type AnalyticsEvent =
  // Onboarding
  | 'onboarding_started' // Done
  | 'onboarding_step_completed' // Done
  | 'onboarding_completed' // Done
  | 'onboarding_skipped' // Done
  // Auth & User
  | 'app_opened'
  | 'app_backgrounded'
  | 'user_registered'
  | 'profile_updated'
  // Affirmations
  | 'affirmation_viewed' // Done
  | 'affirmation_favorited' // Done
  | 'affirmation_unfavorited' // Done
  | 'affirmation_shared' // Done
  | 'affirmation_audio_played' // Done
  | 'affirmation_explanation_viewed' // Done
  | 'affirmation_suggestion_tapped'
  | 'affirmations_sync_started'
  | 'affirmations_sync_completed'
  | 'affirmations_sync_failed'
  | 'affirmations_category_sync_failed'
  // Mixes
  | 'mix_created' // Done
  | 'mix_activated' // Done
  | 'mix_deleted' // Done
  | 'mix_updated' // Done
  // Categories
  | 'category_viewed'
  | 'category_selected'
  // Purchases
  | 'paywall_viewed' // Done
  | 'paywall_dismissed' // Done
  | 'purchase_intent' // Done
  | 'purchase_started' // Done
  | 'purchase_completed' // Done
  | 'purchase_failed' // Done
  | 'purchase_restored' // Done
  | 'trial_started' // Done
  // Notifications
  | 'notification_enabled' // Done
  | 'notification_disabled' // Done
  | 'notification_received' // Done
  | 'notification_opened' // Done
  // Streak
  | 'streak_updated' // Done
  | 'streak_milestone_reached' // Done
  | 'streak_lost' // Done
  // Settings
  | 'theme_changed' // Done
  | 'app_icon_changed' // Done
  | 'app_background_changed' // Done
  // Custom Phrases
  | 'custom_phrase_created' // Done
  | 'custom_phrase_deleted' // Done
  // Widget
  | 'widget_configured'
  // Errors
  | 'error_occurred';

/**
 * Propiedades adicionales de un evento
 */
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Evento de analytics completo
 */
export interface AnalyticsEventPayload {
  event: AnalyticsEvent;
  properties?: AnalyticsEventProperties;
  timestamp: number;
}

/**
 * Configuración del servicio de analytics
 */
export interface AnalyticsConfig {
  /** ID del feed de Contentor */
  feedId: string;
  /** Tamaño máximo del batch antes de enviar */
  batchSize: number;
  /** Intervalo en ms para flush automático */
  flushInterval: number;
  /** Si el tracking está habilitado */
  enabled: boolean;
  /** Si se debe loggear en consola (dev) */
  debug: boolean;
}
