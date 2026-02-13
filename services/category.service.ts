// ============================================================================
// Category Service - Asignación de categorías basadas en el perfil
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, AffirmationCategory, BackendEntity, CategoryConfig } from '@/types';
import { AFFIRMATION_CATEGORIES, DEFAULT_CATEGORY_UI_MAP, GENERIC_CATEGORY_DEFAULTS } from '@/types';

const SYNCED_ENTITIES_KEY = 'synced_entities';

// Cache en memoria
let cachedCategories: CategoryConfig[] | null = null;

/**
 * Genera un slug a partir de un nombre de entidad
 */
function slugify(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Obtiene las categorías disponibles fusionando entidades del backend con config de UI local.
 * Si no hay entidades almacenadas, usa el fallback estático AFFIRMATION_CATEGORIES.
 */
export async function getAvailableCategories(): Promise<CategoryConfig[]> {
  if (cachedCategories) return cachedCategories;

  try {
    const stored = await AsyncStorage.getItem(SYNCED_ENTITIES_KEY);
    if (!stored) {
      cachedCategories = AFFIRMATION_CATEGORIES;
      return cachedCategories;
    }

    const entities: BackendEntity[] = JSON.parse(stored);
    cachedCategories = entities.map(entity => {
      const uiDefaults = DEFAULT_CATEGORY_UI_MAP[entity.name];

      if (uiDefaults) {
        return {
          id: uiDefaults.localId,
          name: entity.display_name || entity.name,
          description: uiDefaults.description,
          icon: uiDefaults.icon,
          color: uiDefaults.color,
          isPremium: uiDefaults.isPremium,
          entityId: entity.id,
          entityName: entity.name,
        };
      } else {
        return {
          id: slugify(entity.name),
          name: entity.display_name || entity.name,
          description: GENERIC_CATEGORY_DEFAULTS.description,
          icon: GENERIC_CATEGORY_DEFAULTS.icon,
          color: GENERIC_CATEGORY_DEFAULTS.color,
          isPremium: GENERIC_CATEGORY_DEFAULTS.isPremium,
          entityId: entity.id,
          entityName: entity.name,
        };
      }
    });

    return cachedCategories;
  } catch (error) {
    console.warn('[CategoryService] Error loading categories, using defaults:', error);
    cachedCategories = AFFIRMATION_CATEGORIES;
    return cachedCategories;
  }
}

/**
 * Limpia el cache de categorías (llamar después de un sync exitoso)
 */
export function clearCategoryCache(): void {
  cachedCategories = null;
}

// Categorías gratuitas (no premium) - calculadas desde el fallback estático
const FREE_CATEGORIES: AffirmationCategory[] = AFFIRMATION_CATEGORIES
  .filter(cat => !cat.isPremium)
  .map(cat => cat.id);

/**
 * Categorías por defecto para nuevos usuarios.
 * Ya no se calculan por perfil psicológico — se asignan las gratuitas.
 */
const DEFAULT_ASSIGNED_CATEGORIES: AffirmationCategory[] = [
  'esperanza',
  'paz',
  'amor',
  'gratitud',
  'animo',
  'fe_y_esperanza',
];

/**
 * Retorna las categorías asignadas por defecto.
 * En la versión anterior se calculaban basándose en el perfil psicológico del usuario.
 * Ahora simplemente se asignan las categorías gratuitas por defecto.
 */
export function calculateAssignedCategories(_profile: UserProfile): AffirmationCategory[] {
  return DEFAULT_ASSIGNED_CATEGORIES;
}
