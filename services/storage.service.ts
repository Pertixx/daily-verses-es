// ============================================================================
// Storage Service - Manejo de AsyncStorage con tipos seguros
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { createDefaultUserData } from '@/constants/defaults';
import { analytics } from './analytics.service';
import type {
  UserData,
  UserProfile,
  NotificationSettings,
  StreakData,
  FavoriteAffirmation,
  Theme,
  OnboardingState,
  UserCustomMix,
  ActiveMixReference,
  CustomPhrase,
} from '@/types';

/**
 * Servicio para manejar el almacenamiento local de datos
 */
class StorageService {
  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Ejecuta una operación async con reintentos
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${context} - intento ${attempt}/${maxRetries} falló:`, error);
        
        if (attempt < maxRetries) {
          // Backoff exponencial: 300ms, 600ms, 900ms (iOS necesita más tiempo para recuperar SQLite)
          await new Promise(resolve => setTimeout(resolve, 300 * attempt));
        }
      }
    }
    
    throw lastError;
  }

  // ==========================================================================
  // User Data
  // ==========================================================================

  /**
   * Obtiene todos los datos del usuario (con reintentos)
   */
  async getUserData(): Promise<UserData | null> {
    try {
      return await this.withRetry(async () => {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
      }, 3, 'getUserData');
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene datos del usuario distinguiendo entre "no hay datos" y "error de storage".
   * Esto es CRÍTICO para no confundir un fallo temporal de AsyncStorage con un usuario nuevo.
   */
  async getUserDataSafe(): Promise<{ data: UserData | null; error: boolean }> {
    try {
      const data = await this.withRetry(async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return raw ? JSON.parse(raw) : null;
      }, 3, 'getUserDataSafe');
      return { data, error: false };
    } catch (error) {
      console.error('❌ Error al obtener datos del usuario (safe):', error);
      return { data: null, error: true };
    }
  }

  /**
   * Guarda todos los datos del usuario (con reintentos)
   */
  async setUserData(userData: UserData): Promise<boolean> {
    try {
      const updatedData = {
        ...userData,
        updatedAt: new Date().toISOString(),
      };
      
      await this.withRetry(async () => {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(updatedData)
        );
      }, 3, 'setUserData');
      
      return true;
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
      return false;
    }
  }

  /**
   * Inicializa los datos del usuario con valores por defecto
   */
  async initializeUserData(userId: string): Promise<UserData> {
    const userData = createDefaultUserData(userId);
    await this.setUserData(userData);
    return userData;
  }

  /**
   * Actualiza parcialmente los datos del usuario
   */
  async updateUserData(
    updates: Partial<UserData>
  ): Promise<UserData | null> {
    try {
      const currentData = await this.getUserData();
      if (!currentData) return null;

      const updatedData: UserData = {
        ...currentData,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.setUserData(updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      return null;
    }
  }

  // ==========================================================================
  // User ID
  // ==========================================================================

  /**
   * Obtiene el ID del usuario
   */
  async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error al obtener ID del usuario:', error);
      return null;
    }
  }

  /**
   * Guarda el ID del usuario
   */
  async setUserId(userId: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      return true;
    } catch (error) {
      console.error('Error al guardar ID del usuario:', error);
      return false;
    }
  }

  // ==========================================================================
  // Onboarding
  // ==========================================================================

  /**
   * Verifica si el onboarding fue completado
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const userData = await this.getUserData();
      return userData?.onboardingCompleted ?? false;
    } catch (error) {
      console.error('Error al verificar onboarding:', error);
      return false;
    }
  }

  /**
   * Marca el onboarding como completado (con verificación)
   */
  async completeOnboarding(): Promise<boolean> {
    try {
      const updated = await this.updateUserData({
        onboardingCompleted: true,
      });
      
      if (updated === null) {
        console.error('❌ updateUserData retornó null');
        return false;
      }
      
      // Verificar que realmente se guardó
      const verification = await this.getUserData();
      if (verification?.onboardingCompleted !== true) {
        console.error('❌ Verificación fallida: onboardingCompleted no es true');
        return false;
      }
      
      // Guardar flag redundante como protección contra pérdida del blob principal
      await this.setOnboardingCompletedBackup();
      
      console.log('✅ Onboarding marcado como completado y verificado (con backup)');
      return true;
    } catch (error) {
      console.error('Error al completar onboarding:', error);
      return false;
    }
  }

  /**
   * Obtiene el estado del onboarding
   */
  async getOnboardingState(): Promise<OnboardingState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener estado del onboarding:', error);
      return null;
    }
  }

  /**
   * Guarda el estado del onboarding
   */
  async setOnboardingState(state: OnboardingState): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_STATE,
        JSON.stringify(state)
      );
      return true;
    } catch (error) {
      console.error('Error al guardar estado del onboarding:', error);
      return false;
    }
  }

  /**
   * Guarda flag redundante de onboarding completado.
   * Este flag es una key separada (no dentro del blob JSON de USER_DATA)
   * para proteger contra pérdida/corrupción del blob principal.
   */
  async setOnboardingCompletedBackup(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED_BACKUP, 'true');
    } catch (error) {
      console.warn('⚠️ Error al guardar flag backup de onboarding:', error);
    }
  }

  /**
   * Lee el flag redundante de onboarding completado.
   * Usado como fallback cuando el blob principal de USER_DATA no se puede leer.
   */
  async isOnboardingCompletedBackup(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED_BACKUP);
      return value === 'true';
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // User Profile
  // ==========================================================================

  /**
   * Obtiene el perfil del usuario
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const userData = await this.getUserData();
      return userData?.profile ?? null;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      const currentData = await this.getUserData();
      if (!currentData) return false;

      const updatedProfile: UserProfile = {
        ...currentData.profile,
        ...profile,
      };

      const updated = await this.updateUserData({ profile: updatedProfile });
      return updated !== null;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return false;
    }
  }

  // ==========================================================================
  // Theme
  // ==========================================================================

  /**
   * Obtiene el tema seleccionado
   */
  async getTheme(): Promise<Theme> {
    try {
      const userData = await this.getUserData();
      return userData?.theme ?? 'auto';
    } catch (error) {
      console.error('Error al obtener tema:', error);
      return 'auto';
    }
  }

  /**
   * Guarda el tema seleccionado
   */
  async setTheme(theme: Theme): Promise<boolean> {
    try {
      const updated = await this.updateUserData({ theme });
      return updated !== null;
    } catch (error) {
      console.error('Error al guardar tema:', error);
      return false;
    }
  }

  // ==========================================================================
  // Notification Settings
  // ==========================================================================

  /**
   * Obtiene la configuración de notificaciones
   */
  async getNotificationSettings(): Promise<NotificationSettings | null> {
    try {
      const userData = await this.getUserData();
      return userData?.notificationSettings ?? null;
    } catch (error) {
      console.error('Error al obtener configuración de notificaciones:', error);
      return null;
    }
  }

  /**
   * Guarda la configuración completa de notificaciones
   */
  async setNotificationSettings(
    settings: NotificationSettings
  ): Promise<boolean> {
    try {
      const updated = await this.updateUserData({
        notificationSettings: settings,
      });
      return updated !== null;
    } catch (error) {
      console.error('Error al guardar configuración de notificaciones:', error);
      return false;
    }
  }

  /**
   * Habilita o deshabilita las notificaciones (solo el flag enabled)
   */
  async setNotificationsEnabled(enabled: boolean): Promise<boolean> {
    try {
      const currentSettings = await this.getNotificationSettings();
      const settings: NotificationSettings = currentSettings ?? {
        enabled,
        frequency: 3,
        startTime: '09:00',
        endTime: '21:00',
        dailyStreakReminder: true,
        streakReminderTime: '20:00',
      };
      
      const updated = await this.updateUserData({
        notificationSettings: { ...settings, enabled },
      });
      return updated !== null;
    } catch (error) {
      console.error('Error al cambiar estado de notificaciones:', error);
      return false;
    }
  }

  /**
   * Actualiza la configuración de notificaciones (sin cambiar el flag enabled)
   */
  async updateNotificationSchedule(
    schedule: Pick<NotificationSettings, 'frequency' | 'startTime' | 'endTime' | 'dailyStreakReminder' | 'streakReminderTime'>
  ): Promise<boolean> {
    try {
      const currentSettings = await this.getNotificationSettings();
      if (!currentSettings) return false;

      const updated = await this.updateUserData({
        notificationSettings: { ...currentSettings, ...schedule },
      });
      return updated !== null;
    } catch (error) {
      console.error('Error al actualizar horario de notificaciones:', error);
      return false;
    }
  }

  // ==========================================================================
  // Streak Data
  // ==========================================================================

  /**
   * Obtiene los datos de racha
   */
  async getStreakData(): Promise<StreakData | null> {
    try {
      const userData = await this.getUserData();
      return userData?.streak ?? null;
    } catch (error) {
      console.error('Error al obtener datos de racha:', error);
      return null;
    }
  }

  /**
   * Guarda los datos de racha
   */
  async setStreakData(streak: StreakData): Promise<boolean> {
    try {
      const updated = await this.updateUserData({ streak });
      return updated !== null;
    } catch (error) {
      console.error('Error al guardar datos de racha:', error);
      return false;
    }
  }

  /**
   * Formatea una fecha a ISO string (YYYY-MM-DD) usando timezone local
   */
  private formatDateToLocalISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Incrementa la racha del usuario
   */
  async incrementStreak(): Promise<StreakData | null> {
    try {
      const currentStreak = await this.getStreakData();
      if (!currentStreak) return null;

      const today = this.formatDateToLocalISO(new Date());
      // Parsear lastActivityDate y convertir a fecha local
      const lastActivityDate = new Date(currentStreak.lastActivityDate);
      const lastActivity = this.formatDateToLocalISO(lastActivityDate);

      // Si ya se registró hoy, no hacer nada
      if (today === lastActivity) return currentStreak;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = this.formatDateToLocalISO(yesterday);

      let newCurrentStreak = currentStreak.currentStreak;
      let newStreakStartDate = currentStreak.streakStartDate;

      // Si la última actividad fue ayer, incrementar racha
      if (lastActivity === yesterdayStr) {
        newCurrentStreak += 1;
      } else {
        // Si no, reiniciar racha
        // Trackear pérdida de racha solo si tenía racha mayor a 1
        if (currentStreak.currentStreak > 1) {
          analytics.track('streak_lost', { 
            previous_streak: currentStreak.currentStreak,
            days_since_last_activity: Math.floor((new Date().getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
          });
        }
        newCurrentStreak = 1;
        newStreakStartDate = today;
      }

      const newStreakData: StreakData = {
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(newCurrentStreak, currentStreak.longestStreak),
        lastActivityDate: new Date().toISOString(),
        streakStartDate: newStreakStartDate,
        completedDays: [...currentStreak.completedDays, today],
      };

      await this.setStreakData(newStreakData);
      
      // Trackear actualización de racha
      analytics.track('streak_updated', {
        current_streak: newCurrentStreak,
        longest_streak: newStreakData.longestStreak,
        is_new_record: newCurrentStreak > currentStreak.longestStreak
      });
      
      return newStreakData;
    } catch (error) {
      console.error('Error al incrementar racha:', error);
      return null;
    }
  }

  // ==========================================================================
  // Favorites
  // ==========================================================================

  /**
   * Obtiene las afirmaciones favoritas
   */
  async getFavorites(): Promise<FavoriteAffirmation[]> {
    try {
      const userData = await this.getUserData();
      return userData?.favorites ?? [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  }

  /**
   * Agrega una afirmación a favoritos
   */
  async addFavorite(affirmation: Omit<FavoriteAffirmation, 'favoritedAt'>): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      
      // Verificar si ya existe
      if (favorites.some(f => f.id === affirmation.id)) {
        return true; // Ya está en favoritos
      }

      const newFavorite: FavoriteAffirmation = {
        ...affirmation,
        favoritedAt: new Date().toISOString(),
      };

      const updated = await this.updateUserData({
        favorites: [...favorites, newFavorite],
      });

      return updated !== null;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      return false;
    }
  }

  /**
   * Remueve una afirmación de favoritos
   */
  async removeFavorite(affirmationId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const updated = await this.updateUserData({
        favorites: favorites.filter(f => f.id !== affirmationId),
      });
      return updated !== null;
    } catch (error) {
      console.error('Error al remover favorito:', error);
      return false;
    }
  }

  // ==========================================================================
  // Custom Phrases
  // ==========================================================================

  /**
   * Obtiene las frases personalizadas del usuario
   */
  async getCustomPhrases(): Promise<CustomPhrase[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PHRASES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener frases personalizadas:', error);
      return [];
    }
  }

  /**
   * Guarda las frases personalizadas del usuario
   */
  async setCustomPhrases(phrases: CustomPhrase[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_PHRASES, JSON.stringify(phrases));
      return true;
    } catch (error) {
      console.error('Error al guardar frases personalizadas:', error);
      return false;
    }
  }

  // ==========================================================================
  // User Custom Mixes (Premium)
  // ==========================================================================

  /**
   * Obtiene los mixes personalizados creados por el usuario
   */
  async getUserCustomMixes(): Promise<UserCustomMix[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_CUSTOM_MIXES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener mixes del usuario:', error);
      return [];
    }
  }

  /**
   * Guarda un nuevo mix personalizado del usuario
   */
  async addUserCustomMix(mix: UserCustomMix): Promise<boolean> {
    try {
      const mixes = await this.getUserCustomMixes();
      const updatedMixes = [...mixes, mix];
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CUSTOM_MIXES, JSON.stringify(updatedMixes));
      return true;
    } catch (error) {
      console.error('Error al agregar mix del usuario:', error);
      return false;
    }
  }

  /**
   * Actualiza un mix personalizado del usuario
   */
  async updateUserCustomMix(mixId: string, updates: Partial<UserCustomMix>): Promise<boolean> {
    try {
      const mixes = await this.getUserCustomMixes();
      const updatedMixes = mixes.map(mix => 
        mix.id === mixId 
          ? { ...mix, ...updates, updatedAt: new Date().toISOString() }
          : mix
      );
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CUSTOM_MIXES, JSON.stringify(updatedMixes));
      
      // Track mix update
      analytics.track('mix_updated', {
        mix_id: mixId,
        updated_fields: Object.keys(updates).join(','),
      });
      
      return true;
    } catch (error) {
      console.error('Error al actualizar mix del usuario:', error);
      return false;
    }
  }

  /**
   * Elimina un mix personalizado del usuario
   */
  async deleteUserCustomMix(mixId: string): Promise<boolean> {
    try {
      const mixes = await this.getUserCustomMixes();
      const deletedMix = mixes.find(mix => mix.id === mixId);
      const updatedMixes = mixes.filter(mix => mix.id !== mixId);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CUSTOM_MIXES, JSON.stringify(updatedMixes));
      
      // Track mix deletion
      if (deletedMix) {
        analytics.track('mix_deleted', {
          mix_id: mixId,
          mix_name: deletedMix.name,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar mix del usuario:', error);
      return false;
    }
  }

  // ==========================================================================
  // Active Mix
  // ==========================================================================

  /**
   * Obtiene el mix activo
   */
  async getActiveMix(): Promise<ActiveMixReference | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_MIX);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener mix activo:', error);
      return null;
    }
  }

  /**
   * Establece el mix activo
   */
  async setActiveMix(mixRef: ActiveMixReference): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_MIX, JSON.stringify(mixRef));
      return true;
    } catch (error) {
      console.error('Error al establecer mix activo:', error);
      return false;
    }
  }

  // ==========================================================================
  // Audio Playback Tracking (para límite de usuarios no premium)
  // ==========================================================================

  /**
   * Obtiene los IDs de afirmaciones que ya fueron reproducidas por audio
   */
  async getPlayedAudioAffirmations(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUDIO_PLAYED_AFFIRMATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener afirmaciones reproducidas:', error);
      return [];
    }
  }

  /**
   * Agrega un ID de afirmación a la lista de reproducidas
   * @returns true si se agregó (era nueva), false si ya existía
   */
  async addPlayedAudioAffirmation(affirmationId: string): Promise<boolean> {
    try {
      const played = await this.getPlayedAudioAffirmations();
      if (played.includes(affirmationId)) {
        return false; // Ya estaba en la lista
      }
      played.push(affirmationId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUDIO_PLAYED_AFFIRMATIONS,
        JSON.stringify(played)
      );
      return true;
    } catch (error) {
      console.error('Error al agregar afirmación reproducida:', error);
      return false;
    }
  }

  /**
   * Obtiene la cantidad de afirmaciones distintas reproducidas
   */
  async getPlayedAudioCount(): Promise<number> {
    const played = await this.getPlayedAudioAffirmations();
    return played.length;
  }

  /**
   * Verifica si una afirmación ya fue reproducida
   */
  async hasPlayedAffirmation(affirmationId: string): Promise<boolean> {
    const played = await this.getPlayedAudioAffirmations();
    return played.includes(affirmationId);
  }

  /**
   * Limpia el historial de reproducciones (útil para testing o cuando se vuelve premium)
   */
  async clearPlayedAudioAffirmations(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUDIO_PLAYED_AFFIRMATIONS);
      return true;
    } catch (error) {
      console.error('Error al limpiar historial de reproducciones:', error);
      return false;
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Limpia todos los datos almacenados (útil para testing o reset)
   */
  async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const storageService = new StorageService();
