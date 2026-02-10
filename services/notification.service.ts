// ============================================================================
// Notification Service - Manejo de notificaciones locales
// ============================================================================

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { verseService } from './verse.service';
import { revenueCatService } from './revenuecat.service';
import { analytics } from './analytics.service';
import type { NotificationSettings, Verse, VerseCategory } from '@/types';
import { VERSE_CATEGORIES } from '@/types';

/**
 * Configuración del comportamiento de notificaciones
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Trackear que se recibió una notificación
    const data = notification.request.content.data;
    const notificationType = (data?.type as string) || 'verse';
    analytics.track('notification_received', { 
      notification_type: notificationType,
      verse_id: data?.verseId as string | undefined
    });
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

/**
 * Servicio para manejar notificaciones locales
 */
class NotificationService {
  /**
   * Obtiene versículos aleatorios del mix activo del usuario
   * @param count - Cantidad de versículos a obtener
   */
  private async getRandomVersesFromActiveMix(count: number): Promise<Verse[]> {
    try {
      const activeMix = await storageService.getActiveMix();
      const profile = await storageService.getProfile();
      const defaultCategories = profile?.assignedCategories || ['faith', 'strength', 'love'];
      
      // Verificar si el usuario es premium
      let isPremium = false;
      try {
        isPremium = await revenueCatService.hasActiveSubscription();
      } catch (error) {
        console.error('Error checking premium status for notifications:', error);
      }

      // Helper para filtrar categorías premium si el usuario no es premium
      const filterCategoriesByAccess = (categories: VerseCategory[]): VerseCategory[] => {
        if (isPremium) return categories;
        return categories.filter(catId => {
          const catConfig = VERSE_CATEGORIES.find(c => c.id === catId);
          return catConfig && !catConfig.isPremium;
        });
      };
      
      let allVerses: Verse[] = [];

      if (!activeMix || activeMix.mixType === 'personalized') {
        // Mix personalizado del onboarding - filtrar categorías premium
        const accessibleCategories = filterCategoriesByAccess(defaultCategories);
        allVerses = verseService.getVersesByCategories(accessibleCategories);
      } else if (activeMix.mixType === 'category') {
        // Mix de una sola categoría - verificar si tiene acceso
        const categoryId = activeMix.mixId.replace('category-', '') as VerseCategory;
        const catConfig = VERSE_CATEGORIES.find(c => c.id === categoryId);
        if (catConfig?.isPremium && !isPremium) {
          // No tiene acceso, usar categorías por defecto filtradas
          const accessibleCategories = filterCategoriesByAccess(defaultCategories);
          allVerses = verseService.getVersesByCategories(accessibleCategories);
        } else {
          allVerses = verseService.getVersesByCategory(categoryId);
        }
      } else if (activeMix.mixType === 'favorites') {
        // Mix de favoritos
        const favorites = await storageService.getFavorites();
        allVerses = favorites.map((fav) => ({
          id: fav.id,
          text: fav.text,
          reference: (fav as any).reference || '',
          audioSource: undefined,
          audioDuration: undefined,
        }));
      } else if (activeMix.mixType === 'custom_phrases') {
        // Mix de frases propias (solo premium)
        if (!isPremium) {
          const accessibleCategories = filterCategoriesByAccess(defaultCategories);
          allVerses = verseService.getVersesByCategories(accessibleCategories);
        } else {
          const customPhrases = await storageService.getCustomPhrases();
          allVerses = customPhrases.map((phrase) => ({
            id: phrase.id,
            text: phrase.text,
            reference: '',
            audioSource: undefined,
            audioDuration: undefined,
          }));
        }
      } else if (activeMix.mixType === 'user_custom') {
        // Mix custom del usuario (solo premium)
        if (!isPremium) {
          const accessibleCategories = filterCategoriesByAccess(defaultCategories);
          allVerses = verseService.getVersesByCategories(accessibleCategories);
        } else {
          const userMixes = await storageService.getUserCustomMixes();
          const userMix = userMixes.find((m) => m.id === activeMix.mixId);
          if (userMix && userMix.categories.length > 0) {
            // Premium users tienen acceso a todas las categorías de su mix
            allVerses = verseService.getVersesByCategories(userMix.categories);
          } else {
            allVerses = verseService.getVersesByCategories(defaultCategories);
          }
        }
      } else {
        const accessibleCategories = filterCategoriesByAccess(defaultCategories);
        allVerses = verseService.getVersesByCategories(accessibleCategories);
      }

      // Si no hay versículos, usar los por defecto
      if (allVerses.length === 0) {
        allVerses = verseService.getVersesByCategories(defaultCategories);
      }

      // Mezclar y tomar la cantidad necesaria
      const shuffled = this.shuffleArray([...allVerses]);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    } catch (error) {
      console.error('Error al obtener versículos para notificaciones:', error);
      return [];
    }
  }

  /**
   * Mezcla un array usando Fisher-Yates
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Solicita permisos de notificaciones al usuario
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificaciones denegados');
        return false;
      }

      // Configuración específica de Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Versículos Diarios',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#5B7FCC',
        });
      }

      console.log('✅ Permisos de notificaciones concedidos');
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de notificaciones:', error);
      return false;
    }
  }

  /**
   * Programa las notificaciones de versículos según la configuración del usuario
   */
  async scheduleVerseNotifications(
    settings: NotificationSettings
  ): Promise<boolean> {
    try {
      if (!settings.enabled) {
        await this.cancelAllVerseNotifications();
        return true;
      }

      // Cancelar notificaciones previas
      await this.cancelAllVerseNotifications();

      // Obtener versículos reales del mix activo del usuario
      const verses = await this.getRandomVersesFromActiveMix(settings.frequency);

      // Parsear horas
      const [startHour, startMinute] = settings.startTime.split(':').map(Number);
      const [endHour, endMinute] = settings.endTime.split(':').map(Number);

      // Calcular intervalo entre notificaciones
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      const totalMinutes = endTotalMinutes - startTotalMinutes;
      const intervalMinutes = Math.floor(totalMinutes / settings.frequency);

      // Programar cada notificación con un versículo real
      for (let i = 0; i < settings.frequency; i++) {
        const notificationMinutes = startTotalMinutes + (intervalMinutes * i);
        const hour = Math.floor(notificationMinutes / 60);
        const minute = notificationMinutes % 60;

        // Usar el versículo correspondiente o reciclar si hay menos versículos que notificaciones
        const verse = verses[i % verses.length];
        const verseText = verse?.text || 'Es momento de leer la Palabra de Dios ✝️';

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '✝️ Tu versículo del día',
            body: verseText,
            data: { type: 'verse', index: i, verseId: verse?.id },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }

      console.log(
        `✅ Programadas ${settings.frequency} notificaciones con versículos`
      );
      return true;
    } catch (error) {
      console.error('Error al programar notificaciones:', error);
      return false;
    }
  }

  /**
   * Programa el recordatorio diario de racha
   */
  async scheduleStreakReminder(settings: NotificationSettings): Promise<boolean> {
    try {
      if (!settings.dailyStreakReminder) {
        await this.cancelStreakReminder();
        return true;
      }

      // Cancelar recordatorio previo
      await this.cancelStreakReminder();

      const [hour, minute] = settings.streakReminderTime.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        identifier: 'streak-reminder',
        content: {
          title: '🔥 ¡No pierdas tu racha!',
          body: 'Aún no leíste tu versículo de hoy. ¡Mantené el hábito!',

          data: { type: 'streak-reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      console.log('✅ Recordatorio de racha programado');
      return true;
    } catch (error) {
      console.error('Error al programar recordatorio de racha:', error);
      return false;
    }
  }

  /**
   * Cancela todas las notificaciones de versículos
   */
  async cancelAllVerseNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'verse' || notification.content.data?.type === 'affirmation') {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }
    } catch (error) {
      console.error('Error al cancelar notificaciones de versículos:', error);
    }
  }

  /**
   * Cancela el recordatorio de racha
   */
  async cancelStreakReminder(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync('streak-reminder');
    } catch (error) {
      console.error('Error al cancelar recordatorio de racha:', error);
    }
  }

  /**
   * Programa una notificación de recordatorio de trial (día 2 del trial de 3 días)
   * Se dispara 2 días después de activar el trial
   */
  async scheduleTrialReminder(trialDays: number = 3): Promise<boolean> {
    try {
      // Cancelar recordatorio previo si existe
      await this.cancelTrialReminder();

      // Calcular la fecha del recordatorio (día 2 = 1 día después del inicio)
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + (trialDays - 1)); // Para 3 días, notificar en día 2
      reminderDate.setHours(10, 0, 0, 0); // A las 10:00 AM

      await Notifications.scheduleNotificationAsync({
        identifier: 'trial-reminder',
        content: {
          title: '⏰ Tu prueba gratis termina mañana',
          body: 'Recordatorio: tu período de prueba gratuita de Versículo termina mañana. ¡Seguí disfrutando de todos los beneficios!',

          data: { type: 'trial-reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });

      console.log(`✅ Recordatorio de trial programado para ${reminderDate.toLocaleDateString()}`);
      return true;
    } catch (error) {
      console.error('Error al programar recordatorio de trial:', error);
      return false;
    }
  }

  /**
   * Cancela el recordatorio de trial
   */
  async cancelTrialReminder(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync('trial-reminder');
    } catch (error) {
      // Es normal que falle si no existe
    }
  }

  /**
   * Cancela todas las notificaciones
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
    }
  }

  /**
   * Obtiene todas las notificaciones programadas (útil para debugging)
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }

  /**
   * Actualiza todas las notificaciones según la configuración guardada
   */
  async updateNotificationsFromStorage(): Promise<boolean> {
    try {
      const settings = await storageService.getNotificationSettings();
      if (!settings) return false;

      await this.scheduleVerseNotifications(settings);
      await this.scheduleStreakReminder(settings);

      return true;
    } catch (error) {
      console.error('Error al actualizar notificaciones:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService();
