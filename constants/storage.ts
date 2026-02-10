// ============================================================================
// Storage Constants - Keys para AsyncStorage
// ============================================================================

export const STORAGE_KEYS = {
  /** Datos completos del usuario */
  USER_DATA: '@nubi_user_data',
  /** Solo el ID del usuario */
  USER_ID: '@nubi_user_id',
  /** Estado del onboarding */
  ONBOARDING_STATE: '@nubi_onboarding_state',
  /** Tema seleccionado */
  THEME: '@nubi_theme',
  /** Configuración de notificaciones */
  NOTIFICATION_SETTINGS: '@nubi_notification_settings',
  /** Datos de racha */
  STREAK_DATA: '@nubi_streak_data',
  /** Versículos favoritos */
  FAVORITES: '@nubi_favorites',
  /** Frases personalizadas del usuario */
  CUSTOM_PHRASES: '@nubi_custom_phrases',
  /** Mixes custom creados por el usuario */
  USER_CUSTOM_MIXES: '@nubi_user_custom_mixes',
  /** Mix activo */
  ACTIVE_MIX: '@nubi_active_mix',
  /** IDs de versículos reproducidos por audio (para límite de usuarios no premium) */
  AUDIO_PLAYED_AFFIRMATIONS: '@nubi_audio_played_affirmations',
} as const;
