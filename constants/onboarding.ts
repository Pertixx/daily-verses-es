// ============================================================================
// Onboarding Constants - Versículo (flujo simplificado)
// ============================================================================

/**
 * Número total de pasos del onboarding que muestran progreso
 * (excluyendo welcome y complete)
 */
export const ONBOARDING_PROGRESS_STEPS = 5;

/**
 * Mapeo de pantallas a número de paso
 */
export const ONBOARDING_STEP_MAP = {
  name: 1,
  theme: 2,
  app_icon: 3,
  notifications: 4,
  widget: 5,
} as const;
