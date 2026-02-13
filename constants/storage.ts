// ============================================================================
// Storage Constants - Keys para AsyncStorage
// ============================================================================

export const STORAGE_KEYS = {
  /** Datos completos del usuario */
  USER_DATA: '@tito_user_data',
  /** Solo el ID del usuario */
  USER_ID: '@tito_user_id',
  /** Estado del onboarding */
  ONBOARDING_STATE: '@tito_onboarding_state',
  /** Tema seleccionado */
  THEME: '@tito_theme',
  /** Configuración de notificaciones */
  NOTIFICATION_SETTINGS: '@tito_notification_settings',
  /** Datos de racha */
  STREAK_DATA: '@tito_streak_data',
  /** Versículos favoritos */
  FAVORITES: '@tito_favorites',
  /** Frases personalizadas del usuario */
  CUSTOM_PHRASES: '@tito_custom_phrases',
  /** Mixes custom creados por el usuario */
  USER_CUSTOM_MIXES: '@tito_user_custom_mixes',
  /** Mix activo */
  ACTIVE_MIX: '@tito_active_mix',
  /** IDs de versículos reproducidos por audio (para límite de usuarios no premium) */
  AUDIO_PLAYED_AFFIRMATIONS: '@tito_audio_played',
  /** Flag redundante de onboarding completado (protección contra pérdida de datos) */
  ONBOARDING_COMPLETED_BACKUP: '@tito_onboarding_done',
} as const;
