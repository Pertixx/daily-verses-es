// ============================================================================
// Default Values - Valores por defecto para configuraciones
// ============================================================================

import { NotificationSettings, StreakData, UserData, UserProfile } from '@/types';

/**
 * Perfil por defecto del usuario
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
};

/**
 * Configuración por defecto de notificaciones
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  frequency: 3, // 3 versículos por día
  startTime: '09:00',
  endTime: '21:00',
  dailyStreakReminder: true,
  streakReminderTime: '20:00',
};

/**
 * Datos por defecto de racha
 */
export const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: '',
  streakStartDate: '',
  completedDays: [],
};

/**
 * Crea un objeto UserData con valores por defecto
 */
export const createDefaultUserData = (userId: string): UserData => ({
  userId,
  onboardingCompleted: false,
  profile: DEFAULT_USER_PROFILE,
  theme: 'auto',
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  streak: DEFAULT_STREAK_DATA,
  favorites: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
