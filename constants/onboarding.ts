// ============================================================================
// Onboarding Constants
// ============================================================================

/**
 * Número total de pasos del onboarding que muestran progreso
 * (excluyendo welcome y complete)
 */
export const ONBOARDING_PROGRESS_STEPS = 11;

/**
 * Mapeo de pantallas a número de paso
 * Flujo: welcome → name → theme → appIcon → vibe → affirmationPreview → notifications → dailyAffirmations → freeTrial → freeTrialReminder → trialPaywall → widget
 */
export const ONBOARDING_STEP_MAP = {
  name: 1,
  theme: 2,
  app_icon: 3,
  vibe: 4,
  affirmation_preview: 5,
  notifications: 6,
  daily_affirmations: 7,
  free_trial: 8,
  free_trial_reminder: 9,
  trial_paywall: 10,
  widget: 11,
} as const;
