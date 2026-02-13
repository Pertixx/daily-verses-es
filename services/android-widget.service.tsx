// ============================================================================
// Android Widget Service - Sincronización de datos con Android Widgets
// ============================================================================

import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from './storage.service';
import { affirmationService } from './affirmation.service';
import { revenueCatService } from './revenuecat.service';
import type { AffirmationCategory } from '@/types';
import { getAvailableCategories } from './category.service';

// Keys para AsyncStorage (accesibles desde el widgetTaskHandler)
const WIDGET_KEYS = {
  AFFIRMATIONS: '@tito_widget_verses',
  LAST_UPDATED: '@tito_widget_last_updated',
} as const;

// Cantidad de afirmaciones a enviar al widget (idéntico a iOS)
const WIDGET_AFFIRMATIONS_COUNT = 20;

/**
 * Interfaz de datos del widget (idéntica a iOS)
 */
interface WidgetAffirmation {
  id: string;
  text: string;
}

/**
 * Servicio para manejar la sincronización de datos con Android Widgets
 * Lógica idéntica a services/widget.service.ts (iOS)
 */
class AndroidWidgetService {
  /**
   * Sincroniza las afirmaciones del mix activo al widget
   * (Lógica idéntica a widget.service.ts líneas 43-107)
   */
  async syncAffirmationsToWidget(): Promise<boolean> {
    // Solo ejecutar en Android
    if (Platform.OS !== 'android') {
      console.log('📱 Android Widget sync: No es Android, omitiendo...');
      return false;
    }

    try {
      console.log('📱 Android Widget sync: Iniciando sincronización...');

      // Verificar si el usuario es premium
      let isPremium = false;
      try {
        isPremium = await revenueCatService.hasActiveSubscription();
      } catch (error) {
        console.log('📱 Android Widget sync: Error verificando premium, asumiendo false');
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
        console.log('📱 Android Widget sync: No hay categorías activas');
        return false;
      }

      // Filtrar categorías según acceso del usuario
      const categories = filterCategoriesByAccess(rawCategories);

      if (categories.length === 0) {
        console.log('📱 Android Widget sync: No hay categorías accesibles (usuario no premium)');
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
        console.log('📱 Android Widget sync: No hay afirmaciones disponibles');
        return false;
      }

      return this.saveAndReloadWidget(allAffirmations);
    } catch (error) {
      console.error('📱 Android Widget sync: Error al sincronizar:', error);
      return false;
    }
  }

  /**
   * Guarda las afirmaciones en AsyncStorage y recarga widgets
   * (Lógica idéntica a widget.service.ts líneas 112-139)
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

    try {
      // Guardar en AsyncStorage (accesible desde el widgetTaskHandler)
      await AsyncStorage.setItem(
        WIDGET_KEYS.AFFIRMATIONS,
        JSON.stringify(widgetAffirmations)
      );

      await AsyncStorage.setItem(
        WIDGET_KEYS.LAST_UPDATED,
        new Date().toISOString()
      );

      // Recargar todos los widgets con una afirmación aleatoria
      await this.reloadWidgets();

      console.log(`📱 Android Widget sync: ${widgetAffirmations.length} afirmaciones sincronizadas`);
      return true;
    } catch (error) {
      console.error('📱 Android Widget: Error guardando datos:', error);
      return false;
    }
  }

  /**
   * Obtiene las categorías del mix activo
   * (Lógica idéntica a widget.service.ts líneas 144-195)
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
      console.error('📱 Android Widget: Error al obtener categorías:', error);
      return [];
    }
  }

  /**
   * Sincroniza afirmaciones personalizadas (favoritos o frases custom)
   */
  async syncCustomAffirmationsToWidget(affirmations: { id: string; text: string }[]): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const widgetAffirmations = affirmations.slice(0, WIDGET_AFFIRMATIONS_COUNT);

      await AsyncStorage.setItem(
        WIDGET_KEYS.AFFIRMATIONS,
        JSON.stringify(widgetAffirmations)
      );

      await AsyncStorage.setItem(
        WIDGET_KEYS.LAST_UPDATED,
        new Date().toISOString()
      );

      await this.reloadWidgets();

      console.log(`📱 Android Widget sync: ${widgetAffirmations.length} afirmaciones custom sincronizadas`);
      return true;
    } catch (error) {
      console.error('📱 Android Widget sync: Error al sincronizar custom:', error);
      return false;
    }
  }

  /**
   * Recarga todos los widgets forzadamente
   * Usa requestWidgetUpdate para cada widget
   */
  async reloadWidgets(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Obtener una afirmación aleatoria de las guardadas
      const affirmationsJson = await AsyncStorage.getItem(WIDGET_KEYS.AFFIRMATIONS);
      let affirmation: WidgetAffirmation | undefined;

      if (affirmationsJson) {
        const affirmations: WidgetAffirmation[] = JSON.parse(affirmationsJson);
        if (affirmations.length > 0) {
          const randomIndex = Math.floor(Math.random() * affirmations.length);
          affirmation = affirmations[randomIndex];
        }
      }

      // Importar dinámicamente los widgets para evitar errores en iOS
      const { SmallWidget } = await import('../android-widgets/widgets/SmallWidget');
      const { MediumWidget } = await import('../android-widgets/widgets/MediumWidget');
      const { LargeWidget } = await import('../android-widgets/widgets/LargeWidget');

      // Actualizar cada widget con la afirmación aleatoria
      await requestWidgetUpdate({
        widgetName: 'TitoSmallWidget',
        renderWidget: () => <SmallWidget affirmation={affirmation} />,
        widgetNotFound: () => {
          console.log('📱 Android Widget: TitoSmallWidget no encontrado en pantalla de inicio');
        },
      });

      await requestWidgetUpdate({
        widgetName: 'TitoMediumWidget',
        renderWidget: () => <MediumWidget affirmation={affirmation} />,
        widgetNotFound: () => {
          console.log('📱 Android Widget: TitoMediumWidget no encontrado en pantalla de inicio');
        },
      });

      await requestWidgetUpdate({
        widgetName: 'TitoLargeWidget',
        renderWidget: () => <LargeWidget affirmation={affirmation} />,
        widgetNotFound: () => {
          console.log('📱 Android Widget: TitoLargeWidget no encontrado en pantalla de inicio');
        },
      });

      console.log('📱 Android Widgets: Recargados');
    } catch (error) {
      console.error('📱 Android Widgets: Error al recargar:', error);
    }
  }

  /**
   * Limpia los datos de los widgets
   */
  async clearWidgetData(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await AsyncStorage.removeItem(WIDGET_KEYS.AFFIRMATIONS);
      await AsyncStorage.removeItem(WIDGET_KEYS.LAST_UPDATED);
      await this.reloadWidgets();
      console.log('📱 Android Widgets: Datos limpiados');
    } catch (error) {
      console.error('📱 Android Widgets: Error al limpiar datos:', error);
    }
  }

  /**
   * Mezcla un array usando Fisher-Yates (idéntico a iOS)
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// Exportar instancia singleton
export const androidWidgetService = new AndroidWidgetService();
