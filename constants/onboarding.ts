// ============================================================================
// Onboarding Constants
// ============================================================================

/**
 * Número total de pasos del onboarding que muestran progreso
 * (excluyendo welcome y complete)
 */
export const ONBOARDING_PROGRESS_STEPS = 10;

/**
 * Mapeo de pantallas a número de paso
 * Flujo: welcome → name → theme → vibe → affirmationPreview → notifications → dailyAffirmations → freeTrial → freeTrialReminder → trialPaywall → widget
 */
export const ONBOARDING_STEP_MAP = {
  name: 1,
  theme: 2,
  vibe: 3,
  affirmation_preview: 4,
  notifications: 5,
  daily_affirmations: 6,
  free_trial: 7,
  free_trial_reminder: 8,
  trial_paywall: 9,
  widget: 10,
} as const;
