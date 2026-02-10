// ============================================================================
// Verse Service - Manejo de versículos bíblicos
// ============================================================================

import type { Verse, VerseCategory, VerseFile } from '@/types';

// Importar todos los archivos de versículos
import faithVerses from '@/constants/faith_verses.json';
import strengthVerses from '@/constants/strength_verses.json';
import loveVerses from '@/constants/love_verses.json';
import hopeVerses from '@/constants/hope_verses.json';
import peaceVerses from '@/constants/peace_verses.json';
import gratitudeVerses from '@/constants/gratitude_verses.json';
import wisdomVerses from '@/constants/wisdom_verses.json';
import protectionVerses from '@/constants/protection_verses.json';
import healingVerses from '@/constants/healing_verses.json';
import provisionVerses from '@/constants/provision_verses.json';
import forgivenessVerses from '@/constants/forgiveness_verses.json';
import praiseVerses from '@/constants/praise_verses.json';

// Mapeo de categoría a archivo
const VERSE_FILES: Record<VerseCategory, VerseFile> = {
  faith: faithVerses as VerseFile,
  strength: strengthVerses as VerseFile,
  love: loveVerses as VerseFile,
  hope: hopeVerses as VerseFile,
  peace: peaceVerses as VerseFile,
  gratitude: gratitudeVerses as VerseFile,
  wisdom: wisdomVerses as VerseFile,
  protection: protectionVerses as VerseFile,
  healing: healingVerses as VerseFile,
  provision: provisionVerses as VerseFile,
  forgiveness: forgivenessVerses as VerseFile,
  praise: praiseVerses as VerseFile,
};

/**
 * Servicio para manejar los versículos bíblicos
 */
class VerseService {
  private cache: Map<VerseCategory, Verse[]> = new Map();

  /**
   * Obtiene todos los versículos de una categoría
   */
  getVersesByCategory(category: VerseCategory): Verse[] {
    // Verificar cache
    if (this.cache.has(category)) {
      return this.cache.get(category)!;
    }

    const file = VERSE_FILES[category];
    if (!file) {
      console.warn(`No se encontró archivo de versículos para: ${category}`);
      return [];
    }

    const verses: Verse[] = file.verses.map((verse) => ({
      id: verse.id,
      text: verse.text,
      reference: verse.reference,
      audioSource: verse.audio_source,
      audioDuration: verse.audio_source_duration,
    }));

    // Guardar en cache
    this.cache.set(category, verses);

    return verses;
  }

  /**
   * Obtiene versículos de múltiples categorías mezclados
   */
  getVersesByCategories(categories: VerseCategory[]): Verse[] {
    const allVerses: Verse[] = [];

    for (const category of categories) {
      const verses = this.getVersesByCategory(category);
      allVerses.push(...verses);
    }

    return allVerses;
  }

  /**
   * Obtiene versículos paginados y mezclados de múltiples categorías
   */
  getVersesPaginated(
    categories: VerseCategory[],
    offset: number = 0,
    limit: number = 10,
    shuffle: boolean = true
  ): { verses: Verse[]; hasMore: boolean; total: number } {
    let allVerses = this.getVersesByCategories(categories);

    if (shuffle) {
      allVerses = this.shuffleArray([...allVerses]);
    }

    const total = allVerses.length;
    const verses = allVerses.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return { verses, hasMore, total };
  }

  /**
   * Obtiene un versículo aleatorio de las categorías especificadas
   */
  getRandomVerse(categories: VerseCategory[]): Verse | null {
    const allVerses = this.getVersesByCategories(categories);
    
    if (allVerses.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * allVerses.length);
    return allVerses[randomIndex];
  }

  /**
   * Obtiene un versículo por su ID
   */
  getVerseById(id: string): Verse | null {
    for (const category of Object.keys(VERSE_FILES) as VerseCategory[]) {
      const verses = this.getVersesByCategory(category);
      const found = verses.find((v) => v.id === id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * Obtiene la categoría a la que pertenece un versículo
   */
  getCategoryForVerse(id: string): VerseCategory | null {
    for (const category of Object.keys(VERSE_FILES) as VerseCategory[]) {
      const verses = this.getVersesByCategory(category);
      const found = verses.find((v) => v.id === id);
      if (found) {
        return category;
      }
    }
    return null;
  }

  /**
   * Busca versículos por texto
   */
  searchVerses(
    query: string,
    categories?: VerseCategory[]
  ): Verse[] {
    const categoriesToSearch = categories || (Object.keys(VERSE_FILES) as VerseCategory[]);
    const allVerses = this.getVersesByCategories(categoriesToSearch);
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return allVerses.filter((verse) =>
      verse.text.toLowerCase().includes(normalizedQuery) ||
      verse.reference.toLowerCase().includes(normalizedQuery)
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
   * Limpia el cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtiene el total de versículos disponibles
   */
  getTotalCount(categories?: VerseCategory[]): number {
    const categoriesToCount = categories || (Object.keys(VERSE_FILES) as VerseCategory[]);
    let total = 0;

    for (const category of categoriesToCount) {
      const file = VERSE_FILES[category];
      if (file) {
        total += file.total;
      }
    }

    return total;
  }

  // ============================================================================
  // Backward Compatibility - Métodos con nombre antiguo
  // (Mantener hasta actualizar todos los consumidores)
  // ============================================================================

  /** @deprecated Usar getVersesByCategory */
  getAffirmationsByCategory(category: VerseCategory): Verse[] {
    return this.getVersesByCategory(category);
  }

  /** @deprecated Usar getVersesByCategories */
  getAffirmationsByCategories(categories: VerseCategory[]): Verse[] {
    return this.getVersesByCategories(categories);
  }

  /** @deprecated Usar getVersesPaginated */
  getAffirmationsPaginated(
    categories: VerseCategory[],
    offset: number = 0,
    limit: number = 10,
    shuffle: boolean = true
  ): { affirmations: Verse[]; hasMore: boolean; total: number } {
    const result = this.getVersesPaginated(categories, offset, limit, shuffle);
    return { affirmations: result.verses, hasMore: result.hasMore, total: result.total };
  }

  /** @deprecated Usar getRandomVerse */
  getRandomAffirmation(categories: VerseCategory[]): Verse | null {
    return this.getRandomVerse(categories);
  }

  /** @deprecated Usar getVerseById */
  getAffirmationById(id: string): Verse | null {
    return this.getVerseById(id);
  }

  /** @deprecated Usar getCategoryForVerse */
  getCategoryForAffirmation(id: string): VerseCategory | null {
    return this.getCategoryForVerse(id);
  }

  /** @deprecated Usar searchVerses */
  searchAffirmations(query: string, categories?: VerseCategory[]): Verse[] {
    return this.searchVerses(query, categories);
  }
}

// Exportar instancia singleton del servicio
export const verseService = new VerseService();

/** @deprecated Usar verseService */
export const affirmationService = verseService;
