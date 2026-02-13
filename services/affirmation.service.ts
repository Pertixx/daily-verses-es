// ============================================================================
// Affirmation Service - Manejo de afirmaciones
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Affirmation, AffirmationCategory, AffirmationFile } from '@/types';
import { getAvailableCategories } from './category.service';

// Importar archivos de versículos bundled (fallback)
import amorVerses from '@/constants/amor.json';
import animoVerses from '@/constants/animo.json';
import ansiedadVerses from '@/constants/ansiedad.json';
import confianzaVerses from '@/constants/confianza_en_dios.json';
import esperanzaVerses from '@/constants/esperanza.json';
import familiaVerses from '@/constants/familia.json';
import fortalezaVerses from '@/constants/fortaleza.json';
import gratitudVerses from '@/constants/gratitud.json';
import miedoVerses from '@/constants/miedo.json';
import pazVerses from '@/constants/paz.json';
import perdonVerses from '@/constants/perdon.json';
import tristezaVerses from '@/constants/tristeza.json';

// Storage key prefix (debe coincidir con affirmation-sync.service.ts)
const SYNC_KEYS = {
  AFFIRMATIONS_PREFIX: 'affirmations_synced_',
} as const;

// Mapeo de categoría local a archivo bundled (fallback)
const AFFIRMATION_FILES: Record<string, AffirmationFile> = {
  amor: amorVerses as AffirmationFile,
  animo: animoVerses as AffirmationFile,
  ansiedad: ansiedadVerses as AffirmationFile,
  confianza_en_dios: confianzaVerses as AffirmationFile,
  esperanza: esperanzaVerses as AffirmationFile,
  familia: familiaVerses as AffirmationFile,
  fortaleza: fortalezaVerses as AffirmationFile,
  gratitud: gratitudVerses as AffirmationFile,
  miedo: miedoVerses as AffirmationFile,
  paz: pazVerses as AffirmationFile,
  perdon: perdonVerses as AffirmationFile,
  tristeza: tristezaVerses as AffirmationFile,
};

/**
 * Servicio para manejar las afirmaciones
 */
class AffirmationService {
  private cache: Map<string, Affirmation[]> = new Map();

  /**
   * Obtiene todas las afirmaciones de una categoría
   * Intenta cargar desde AsyncStorage primero (datos sincronizados),
   * luego hace fallback a JSONs bundled
   */
  async getAffirmationsByCategory(category: AffirmationCategory): Promise<Affirmation[]> {
    // Verificar cache
    if (this.cache.has(category)) {
      console.log(`[AffirmationService] Loaded ${this.cache.get(category)!.length} affirmations from CACHE for ${category}`);
      return this.cache.get(category)!;
    }

    let affirmations: Affirmation[] = [];

    // 1. Resolver el entity name para esta categoría
    const categories = await getAvailableCategories();
    const categoryConfig = categories.find(c => c.id === category);
    const entityName = categoryConfig?.entityName;

    // 2. Intentar cargar desde AsyncStorage con entity name key
    if (entityName) {
      try {
        const key = `${SYNC_KEYS.AFFIRMATIONS_PREFIX}${entityName}`;
        console.log(`[AffirmationService] Trying to load from AsyncStorage with key: ${key}`);
        const syncedData = await AsyncStorage.getItem(key);

        if (syncedData) {
          affirmations = JSON.parse(syncedData);
          console.log(`[AffirmationService] Loaded ${affirmations.length} affirmations from AsyncStorage for ${category} (entity: ${entityName})`);
        }
      } catch (error) {
        console.warn(`[AffirmationService] Failed to load synced affirmations for ${category}:`, error);
      }
    }

    // 3. Fallback: intentar con key legacy (periodo de migración)
    if (affirmations.length === 0) {
      try {
        const oldKey = `${SYNC_KEYS.AFFIRMATIONS_PREFIX}${category}`;
        const oldData = await AsyncStorage.getItem(oldKey);
        if (oldData) {
          affirmations = JSON.parse(oldData);
          console.log(`[AffirmationService] Loaded ${affirmations.length} affirmations from legacy key for ${category}`);
        }
      } catch (error) {
        // ignorar
      }
    }

    // 4. Fallback a JSONs bundled (solo para las 12 categorías conocidas)
    if (affirmations.length === 0 && AFFIRMATION_FILES[category]) {
      console.log(`[AffirmationService] Falling back to bundle for ${category}`);
      affirmations = this.loadFromBundle(category);
    }

    // Guardar en cache
    if (affirmations.length > 0) {
      this.cache.set(category, affirmations);
    }

    return affirmations;
  }

  /**
   * Obtiene afirmaciones de múltiples categorías mezcladas
   */
  async getAffirmationsByCategories(categories: AffirmationCategory[]): Promise<Affirmation[]> {
    const allAffirmations: Affirmation[] = [];

    for (const category of categories) {
      const affirmations = await this.getAffirmationsByCategory(category);
      allAffirmations.push(...affirmations);
    }

    return allAffirmations;
  }

  /**
   * Obtiene afirmaciones paginadas y mezcladas de múltiples categorías
   * @param categories - Categorías a incluir
   * @param offset - Índice de inicio
   * @param limit - Cantidad de afirmaciones a devolver
   * @param shuffle - Si se deben mezclar aleatoriamente
   */
  async getAffirmationsPaginated(
    categories: AffirmationCategory[],
    offset: number = 0,
    limit: number = 10,
    shuffle: boolean = true
  ): Promise<{ affirmations: Affirmation[]; hasMore: boolean; total: number }> {
    let allAffirmations = await this.getAffirmationsByCategories(categories);

    if (shuffle) {
      allAffirmations = this.shuffleArray([...allAffirmations]);
    }

    const total = allAffirmations.length;
    const affirmations = allAffirmations.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return { affirmations, hasMore, total };
  }

  /**
   * Obtiene una afirmación aleatoria de las categorías especificadas
   */
  async getRandomAffirmation(categories: AffirmationCategory[]): Promise<Affirmation | null> {
    const allAffirmations = await this.getAffirmationsByCategories(categories);

    if (allAffirmations.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * allAffirmations.length);
    return allAffirmations[randomIndex];
  }

  /**
   * Obtiene una afirmación por su ID
   */
  async getAffirmationById(id: string): Promise<Affirmation | null> {
    const categories = await getAvailableCategories();
    for (const cat of categories) {
      const affirmations = await this.getAffirmationsByCategory(cat.id);
      const found = affirmations.find((a) => a.id === id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * Obtiene la categoría a la que pertenece una afirmación
   */
  async getCategoryForAffirmation(id: string): Promise<AffirmationCategory | null> {
    const categories = await getAvailableCategories();
    for (const cat of categories) {
      const affirmations = await this.getAffirmationsByCategory(cat.id);
      const found = affirmations.find((a) => a.id === id);
      if (found) {
        return cat.id;
      }
    }
    return null;
  }

  /**
   * Busca afirmaciones por texto
   */
  async searchAffirmations(
    query: string,
    categories?: AffirmationCategory[]
  ): Promise<Affirmation[]> {
    const categoriesToSearch = categories || (await getAvailableCategories()).map(c => c.id);
    const allAffirmations = await this.getAffirmationsByCategories(categoriesToSearch);

    const normalizedQuery = query.toLowerCase().trim();

    return allAffirmations.filter((affirmation) =>
      affirmation.text.toLowerCase().includes(normalizedQuery)
    );
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
   * Carga afirmaciones desde JSON bundled (fallback)
   */
  private loadFromBundle(category: AffirmationCategory): Affirmation[] {
    const file = AFFIRMATION_FILES[category];
    if (!file) {
      console.warn(`[AffirmationService] No se encontró archivo bundled para: ${category}`);
      return [];
    }

    const affirmations: Affirmation[] = file.versiculos.map((verse) => ({
      id: verse.id,
      text: verse.text,
      title: verse.title,
      audioSource: verse.audio_source,
      audioDuration: verse.audio_source_duration,
    }));

    console.log(`[AffirmationService] Loaded ${affirmations.length} affirmations from bundle for ${category}`);
    return affirmations;
  }

  /**
   * Recarga todas las afirmaciones desde AsyncStorage/Bundle
   * Útil después de una sincronización exitosa
   */
  async reloadAffirmations(): Promise<void> {
    console.log('[AffirmationService] Reloading affirmations...');
    this.cache.clear();

    // Pre-cargar todas las categorías disponibles
    const categories = await getAvailableCategories();
    await Promise.all(
      categories.map(cat => this.getAffirmationsByCategory(cat.id))
    );

    console.log('[AffirmationService] Affirmations reloaded');
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtiene el total de afirmaciones disponibles
   */
  async getTotalCount(categories?: AffirmationCategory[]): Promise<number> {
    const categoriesToCount = categories || (await getAvailableCategories()).map(c => c.id);
    let total = 0;

    for (const category of categoriesToCount) {
      const affirmations = await this.getAffirmationsByCategory(category);
      total += affirmations.length;
    }

    return total;
  }
}

// Exportar instancia singleton del servicio
export const affirmationService = new AffirmationService();
