// ============================================================================
// Widget Service - Sincronización de datos con iOS Widget via App Groups
// ============================================================================

import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { affirmationService } from './affirmation.service';
import { revenueCatService } from './revenuecat.service';
import type { AffirmationCategory } from '@/types';
import { getAvailableCategories } from './category.service';

// App Group ID - debe coincidir con el de app.json y expo-target.config.js
const APP_GROUP_ID = 'group.com.startnode.tito';

// Crear instancia de ExtensionStorage
const widgetStorage = new ExtensionStorage(APP_GROUP_ID);

// Keys para el storage compartido
const WIDGET_KEYS = {
  AFFIRMATIONS: 'widgetAffirmations',
  LAST_UPDATED: 'widgetLastUpdated',
} as const;

// Cantidad de afirmaciones a enviar al widget
const WIDGET_AFFIRMATIONS_COUNT = 20;

/**
 * Interfaz de datos del widget
 */
interface WidgetAffirmation {
  id: string;
  text: string;
}

/**
 * Servicio para manejar la sincronización de datos con el iOS Widget
 */
class WidgetService {
  /**
   * Sincroniza las afirmaciones del mix activo al widget
   */
  async syncAffirmationsToWidget(): Promise<boolean> {
    // Solo ejecutar en iOS
    if (Platform.OS !== 'ios') {
      console.log('📱 Widget sync: No es iOS, omitiendo...');
      return false;
    }

    try {
      console.log('📱 Widget sync: Iniciando sincronización...');

      // Verificar si el usuario es premium
      let isPremium = false;
      try {
        isPremium = await revenueCatService.hasActiveSubscription();
      } catch (error) {
        console.log('📱 Widget sync: Error verificando premium, asumiendo false');
      }

      // Helper para filtrar categorías premium si el usuario no es premium
      const allCategories = await getAvailableCategories();
      const filterCategoriesByAccess = (categories: AffirmationCategory[]): AffirmationCategory[] => {
        if (isPremium) return categories;
        return categories.filter(catId => {
          const catConfig = allCategories.find(c => c.id === catId);
          return catConfig && !catConfig.isPremium;
        });
      };

      // Obtener categorías del mix activo
      const rawCategories = await this.getActiveCategories();

      if (rawCategories.length === 0) {
        console.log('📱 Widget sync: No hay categorías activas');
        return false;
      }

      // Filtrar categorías según acceso del usuario
      const categories = filterCategoriesByAccess(rawCategories);

      if (categories.length === 0) {
        console.log('📱 Widget sync: No hay categorías accesibles (usuario no premium)');
        // Usar categorías por defecto gratuitas
        const profile = await storageService.getProfile();
        const defaultCategories = profile?.assignedCategories ?? ['self_love', 'motivation', 'positivity'];
        const accessibleDefaults = filterCategoriesByAccess(defaultCategories);
        if (accessibleDefaults.length === 0) {
          return false;
        }
        const allAffirmations = await affirmationService.getAffirmationsByCategories(accessibleDefaults);
        return this.saveAndReloadWidget(allAffirmations);
      }

      // Obtener afirmaciones para esas categorías
      const allAffirmations = await affirmationService.getAffirmationsByCategories(categories);

      if (allAffirmations.length === 0) {
        console.log('📱 Widget sync: No hay afirmaciones disponibles');
        return false;
      }

      return this.saveAndReloadWidget(allAffirmations);
    } catch (error) {
      console.error('📱 Widget sync: Error al sincronizar:', error);
      return false;
    }
  }

  /**
   * Guarda las afirmaciones en el widget y lo recarga
   */
  private async saveAndReloadWidget(allAffirmations: { id: string; text: string; title?: string }[]): Promise<boolean> {
    // Mezclar y tomar solo las necesarias para el widget
    const shuffled = this.shuffleArray([...allAffirmations]);
    const selectedAffirmations = shuffled.slice(0, WIDGET_AFFIRMATIONS_COUNT);

    // Preparar datos para el widget (solo id y text, usando title si existe)
    const widgetAffirmations: WidgetAffirmation[] = selectedAffirmations.map(a => ({
      id: a.id,
      text: a.title || a.text,
    }));

    // Guardar en el storage compartido
    await widgetStorage.set(
      WIDGET_KEYS.AFFIRMATIONS,
      JSON.stringify(widgetAffirmations)
    );

    await widgetStorage.set(
      WIDGET_KEYS.LAST_UPDATED,
      new Date().toISOString()
    );

    // Recargar el widget para que muestre las nuevas afirmaciones
    await ExtensionStorage.reloadWidget('TitoVerseWidget');

    console.log(`📱 Widget sync: ${widgetAffirmations.length} afirmaciones sincronizadas`);
    return true;
  }

  /**
   * Obtiene las categorías del mix activo
   */
  private async getActiveCategories(): Promise<AffirmationCategory[]> {
    try {
      const activeMix = await storageService.getActiveMix();

      if (!activeMix) {
        // Si no hay mix activo, usar las categorías asignadas del perfil
        const profile = await storageService.getProfile();
        return profile?.assignedCategories ?? [];
      }

      switch (activeMix.mixType) {
        case 'personalized': {
          // Mix personalizado: usar categorías asignadas
          const profile = await storageService.getProfile();
          return profile?.assignedCategories ?? [];
        }

        case 'category': {
          // Mix de categoría: extraer la categoría del mixId
          // El formato es "category-{categoryId}"
          const categoryId = activeMix.mixId.replace('category-', '') as AffirmationCategory;
          return [categoryId];
        }

        case 'user_custom': {
          // Mix custom del usuario: obtener las categorías del mix
          const customMixes = await storageService.getUserCustomMixes();
          const customMix = customMixes.find(m => m.id === activeMix.mixId);
          return customMix?.categories ?? [];
        }

        case 'favorites': {
          // Mix de favoritos: no tiene categorías fijas, usar las asignadas
          const profile = await storageService.getProfile();
          return profile?.assignedCategories ?? [];
        }

        case 'custom_phrases': {
          // Frases personalizadas: no tienen categorías
          // Retornar vacío ya que las frases custom se manejan diferente
          return [];
        }

        default:
          const profile = await storageService.getProfile();
          return profile?.assignedCategories ?? [];
      }
    } catch (error) {
      console.error('📱 Widget: Error al obtener categorías:', error);
      return [];
    }
  }

  /**
   * Sincroniza afirmaciones personalizadas (favoritos o frases custom)
   */
  async syncCustomAffirmationsToWidget(affirmations: { id: string; text: string }[]): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      const widgetAffirmations = affirmations.slice(0, WIDGET_AFFIRMATIONS_COUNT);

      await widgetStorage.set(
        WIDGET_KEYS.AFFIRMATIONS,
        JSON.stringify(widgetAffirmations)
      );

      await widgetStorage.set(
        WIDGET_KEYS.LAST_UPDATED,
        new Date().toISOString()
      );

      await ExtensionStorage.reloadWidget('TitoVerseWidget');

      console.log(`📱 Widget sync: ${widgetAffirmations.length} afirmaciones custom sincronizadas`);
      return true;
    } catch (error) {
      console.error('📱 Widget sync: Error al sincronizar custom:', error);
      return false;
    }
  }

  /**
   * Recarga el widget forzadamente
   */
  async reloadWidget(): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      await ExtensionStorage.reloadWidget('TitoVerseWidget');
      console.log('📱 Widget: Recargado');
    } catch (error) {
      console.error('📱 Widget: Error al recargar:', error);
    }
  }

  /**
   * Limpia los datos del widget
   */
  async clearWidgetData(): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      await widgetStorage.remove(WIDGET_KEYS.AFFIRMATIONS);
      await widgetStorage.remove(WIDGET_KEYS.LAST_UPDATED);
      await ExtensionStorage.reloadWidget('TitoVerseWidget');
      console.log('📱 Widget: Datos limpiados');
    } catch (error) {
      console.error('📱 Widget: Error al limpiar datos:', error);
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
   * Sincroniza widgets en ambas plataformas
   */
  async syncAllPlatforms(): Promise<void> {
    if (Platform.OS === 'ios') {
      await this.syncAffirmationsToWidget();
    } else if (Platform.OS === 'android') {
      const { androidWidgetService } = await import('./android-widget.service');
      await androidWidgetService.syncAffirmationsToWidget();
    }
  }

  /**
   * Recarga widgets en ambas plataformas
   */
  async reloadAllPlatforms(): Promise<void> {
    if (Platform.OS === 'ios') {
      await this.reloadWidget();
    } else if (Platform.OS === 'android') {
      const { androidWidgetService } = await import('./android-widget.service');
      await androidWidgetService.reloadWidgets();
    }
  }
}

// Exportar instancia singleton
export const widgetService = new WidgetService();
