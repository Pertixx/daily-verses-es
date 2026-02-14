// ============================================================================
// Affirmation Sync Service - Sincronización con Backend
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Affirmation, BackendEntity } from '@/types';
import { analytics } from './analytics.service';
import { clearCategoryCache } from './category.service';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://cnt.sh/b/tito';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const FEED_ID = process.env.EXPO_PUBLIC_FEED_ID;

/**
 * Storage keys para sincronización
 */
const SYNC_KEYS = {
  AFFIRMATIONS_PREFIX: 'affirmations_synced_',
  ENTITIES: 'synced_entities',
  LAST_SYNC_TIMESTAMP: 'affirmations_last_sync_timestamp',
  SYNC_VERSION: 'affirmations_sync_version',
  SYNC_SUCCESS_COUNT: 'affirmations_sync_success_count',
  SYNC_ERROR_COUNT: 'affirmations_sync_error_count',
} as const;

/**
 * Versión del esquema de sincronización
 * Incrementar si cambia la estructura de datos
 */
const CURRENT_SYNC_VERSION = '2.0.0';

/**
 * IDs de categorías del esquema anterior (v1) para migración
 */
const LEGACY_CATEGORY_IDS = [
  'self_love', 'confidence', 'motivation', 'peace_calm',
  'gratitude', 'success', 'relationships', 'health_wellness',
  'positivity', 'personal_growth', 'overcoming', 'mindfulness',
];

/**
 * Metadata de sincronización
 */
export interface SyncMetadata {
  lastSyncTimestamp: number | null;
  syncVersion: string;
  successCount: number;
  errorCount: number;
  categoriesSynced: string[];
}

/**
 * Mapeo estático de entidades del backend (name → id)
 * El endpoint /entities no existe en la API de Contentor,
 * así que usamos este mapeo fijo. Si se agregan nuevas categorías
 * en el backend, actualizar aquí y en DEFAULT_CATEGORY_UI_MAP.
 */
const BACKEND_ENTITIES: BackendEntity[] = [
  { id: 'ozk69vyke0', name: 'Esperanza', display_name: 'Esperanza', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'p0m08pzkzr', name: 'Paz', display_name: 'Paz', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'q61oxpg10p', name: 'Ansiedad', display_name: 'Ansiedad', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: '9jmg43bmqv', name: 'Fortaleza', display_name: 'Fortaleza', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: '70mleojko8', name: 'Animo', display_name: 'Ánimo', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: '28m22n5mzr', name: 'Gratitud', display_name: 'Gratitud', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: '4j1qlnqkxd', name: 'Amor', display_name: 'Amor', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'obmrpz31ex', name: 'Perdon', display_name: 'Perdón', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: '02kpld71dx', name: 'Familia', display_name: 'Familia', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'ydmdb5v1j4', name: 'Confianza en Dios', display_name: 'Confianza en Dios', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: '4j1qlnzkxd', name: 'Miedo', display_name: 'Miedo', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'obmrpzz1ex', name: 'Tristeza', display_name: 'Tristeza', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: '02kpldz1dx', name: 'Sabiduria', display_name: 'Sabiduría', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'ydmdb581j4', name: 'Proposito', display_name: 'Propósito', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'jyknzd0k92', name: 'Maniana', display_name: 'Mañana', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'jqmz03012y', name: 'Noche', display_name: 'Noche', slug: null, emoji: null, metadata: '', articles_count: 100 },
  { id: 'drmj7g5m2b', name: 'Antes de dormir', display_name: 'Antes de dormir', slug: null, emoji: null, metadata: '', articles_count: 100 },
];

/**
 * Respuesta del API de afirmaciones por categoría
 */
interface AffirmationsApiResponse {
  articles: Array<{
    hashid: string;
    title: string;
    body: string;
    slug: string;
    is_premium: boolean;
    audios: Array<{
      id: string;
      url: string;
      duration: number;
      voice_id?: string;
      voice_name?: string;
    }>;
  }>;
  total_count: number;
  randomized: boolean;
  limit: number;
  offset: number;
}

/**
 * Servicio de sincronización de afirmaciones con backend
 */
class AffirmationSyncService {
  private isSyncing = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL_HOURS = 24;
  private readonly REQUEST_TIMEOUT_MS = 10000;

  // ===========================================================================
  // Public Methods
  // ===========================================================================

  /**
   * Sincroniza todas las categorías si han pasado 24h
   * @returns true si sincronizó, false si está dentro del límite de 24h
   */
  async syncIfNeeded(): Promise<boolean> {
    // Evitar sincronizaciones concurrentes
    if (this.isSyncing) {
      console.log('[AffirmationSync] Sync already in progress, skipping');
      return false;
    }

    // Verificar si necesita migración
    await this.migrateIfNeeded();

    // Verificar límite de 24 horas
    const lastSyncTimestamp = await this.getLastSyncTimestamp();
    if (lastSyncTimestamp) {
      const hoursSinceLastSync = (Date.now() - lastSyncTimestamp) / (1000 * 60 * 60);
      if (hoursSinceLastSync < this.SYNC_INTERVAL_HOURS) {
        console.log(`[AffirmationSync] Sync skipped: ${hoursSinceLastSync.toFixed(1)}h since last sync`);
        return false;
      }
    }

    return await this.performSync();
  }

  /**
   * Fuerza sincronización ignorando límite de 24h
   * Útil para testing o refresh manual
   */
  async forceSync(): Promise<void> {
    await this.performSync();
  }

  /**
   * Obtiene metadata de la última sincronización
   */
  async getSyncMetadata(): Promise<SyncMetadata> {
    const [
      lastSyncTimestamp,
      syncVersion,
      successCount,
      errorCount,
    ] = await Promise.all([
      this.getLastSyncTimestamp(),
      AsyncStorage.getItem(SYNC_KEYS.SYNC_VERSION),
      AsyncStorage.getItem(SYNC_KEYS.SYNC_SUCCESS_COUNT),
      AsyncStorage.getItem(SYNC_KEYS.SYNC_ERROR_COUNT),
    ]);

    // Obtener entidades almacenadas para verificar categorías sincronizadas
    const categoriesSynced: string[] = [];
    const entities = await this.getStoredEntities();

    for (const entity of entities) {
      const key = `${SYNC_KEYS.AFFIRMATIONS_PREFIX}${entity.name}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        categoriesSynced.push(entity.name);
      }
    }

    return {
      lastSyncTimestamp,
      syncVersion: syncVersion || CURRENT_SYNC_VERSION,
      successCount: parseInt(successCount || '0', 10),
      errorCount: parseInt(errorCount || '0', 10),
      categoriesSynced,
    };
  }

  /**
   * Limpia todos los datos sincronizados
   * Útil para logout o reset
   */
  async clearSyncedData(): Promise<void> {
    console.log('[AffirmationSync] Clearing all synced data');

    const keysToRemove: string[] = [
      SYNC_KEYS.LAST_SYNC_TIMESTAMP,
      SYNC_KEYS.SYNC_VERSION,
      SYNC_KEYS.SYNC_SUCCESS_COUNT,
      SYNC_KEYS.SYNC_ERROR_COUNT,
      SYNC_KEYS.ENTITIES,
    ];

    // Agregar keys de entidades actuales
    const entities = await this.getStoredEntities();
    for (const entity of entities) {
      keysToRemove.push(`${SYNC_KEYS.AFFIRMATIONS_PREFIX}${entity.name}`);
    }

    // También limpiar keys legacy por si existen
    for (const legacyId of LEGACY_CATEGORY_IDS) {
      keysToRemove.push(`${SYNC_KEYS.AFFIRMATIONS_PREFIX}${legacyId}`);
    }

    await AsyncStorage.multiRemove(keysToRemove);
    clearCategoryCache();
    console.log('[AffirmationSync] Synced data cleared');
  }

  /**
   * DEBUG: Limpia solo el timestamp para forzar un nuevo sync
   */
  async clearSyncTimestamp(): Promise<void> {
    await AsyncStorage.removeItem(SYNC_KEYS.LAST_SYNC_TIMESTAMP);
    console.log('[AffirmationSync] DEBUG: Sync timestamp cleared - next syncIfNeeded() will run');
  }

  /**
   * DEBUG: Muestra el estado del AsyncStorage
   */
  async debugStorageState(): Promise<void> {
    console.log('[AffirmationSync] DEBUG: Storage State');
    console.log('=====================================');

    // Timestamp
    const timestamp = await AsyncStorage.getItem(SYNC_KEYS.LAST_SYNC_TIMESTAMP);
    if (timestamp) {
      const date = new Date(parseInt(timestamp));
      const hoursAgo = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
      console.log(`Last Sync: ${date.toISOString()} (${hoursAgo.toFixed(2)}h ago)`);
    } else {
      console.log('Last Sync: NEVER');
    }

    // Metadata
    const version = await AsyncStorage.getItem(SYNC_KEYS.SYNC_VERSION);
    const successCount = await AsyncStorage.getItem(SYNC_KEYS.SYNC_SUCCESS_COUNT);
    const errorCount = await AsyncStorage.getItem(SYNC_KEYS.SYNC_ERROR_COUNT);
    console.log(`Version: ${version || 'N/A'}`);
    console.log(`Success Count: ${successCount || '0'}`);
    console.log(`Error Count: ${errorCount || '0'}`);

    // Entidades y categorías sincronizadas
    const entities = await this.getStoredEntities();
    console.log(`\nStored Entities: ${entities.length}`);
    console.log('\nSynced Categories:');
    for (const entity of entities) {
      const key = `${SYNC_KEYS.AFFIRMATIONS_PREFIX}${entity.name}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const affirmations = JSON.parse(data);
        console.log(`  ${entity.name}: ${affirmations.length} affirmations (${data.length} bytes)`);
      } else {
        console.log(`  ${entity.name}: NO DATA`);
      }
    }
    console.log('=====================================');
  }

  // ===========================================================================
  // Private Methods - Sync Logic
  // ===========================================================================

  /**
   * Migra datos del esquema v1 al v2 si es necesario
   */
  private async migrateIfNeeded(): Promise<void> {
    const storedVersion = await AsyncStorage.getItem(SYNC_KEYS.SYNC_VERSION);
    if (storedVersion === CURRENT_SYNC_VERSION) return;

    // Solo migrar si hay datos del esquema anterior
    if (!storedVersion || storedVersion.startsWith('1.')) {
      console.log(`[AffirmationSync] Migrating from ${storedVersion || 'unknown'} to ${CURRENT_SYNC_VERSION}`);

      // Limpiar keys del esquema anterior
      const keysToRemove = LEGACY_CATEGORY_IDS.map(id => `${SYNC_KEYS.AFFIRMATIONS_PREFIX}${id}`);
      await AsyncStorage.multiRemove(keysToRemove);

      // Forzar un sync fresco limpiando el timestamp
      await AsyncStorage.removeItem(SYNC_KEYS.LAST_SYNC_TIMESTAMP);

      console.log('[AffirmationSync] Migration complete, old keys removed');
    }
  }

  /**
   * Ejecuta la sincronización completa
   */
  private async performSync(): Promise<boolean> {
    this.isSyncing = true;
    const startTime = Date.now();
    const entitiesSynced: string[] = [];

    console.log('[AffirmationSync] Starting sync...');

    // Track analytics
    const lastSyncTimestamp = await this.getLastSyncTimestamp();
    analytics.track('affirmations_sync_started', {
      lastSync: lastSyncTimestamp?.toString(),
    });

    try {
      // Paso 1: Usar entidades hardcodeadas (el endpoint /entities no existe en la API)
      const entities = BACKEND_ENTITIES;
      console.log(`[AffirmationSync] Using ${entities.length} hardcoded entities`);

      // Paso 2: Guardar lista de entidades en AsyncStorage
      await AsyncStorage.setItem(SYNC_KEYS.ENTITIES, JSON.stringify(entities));
      clearCategoryCache();

      // Paso 3: Iterar sobre entidades y sincronizar afirmaciones
      console.log(`[AffirmationSync] Total entities to sync: ${entities.length}`);
      for (const entity of entities) {
        try {
          console.log(`[AffirmationSync] Syncing entity: ${entity.name} (${entity.id})`);

          // Fetch paginado para esta entidad
          const affirmations = await this.fetchEntityAffirmations(entity);
          console.log(`[AffirmationSync] Fetched ${affirmations.length} affirmations for ${entity.name}`);

          // Validar datos
          this.validateAffirmations(affirmations);

          // Guardar en AsyncStorage con key basado en entity.name
          const key = `${SYNC_KEYS.AFFIRMATIONS_PREFIX}${entity.name}`;
          const jsonData = JSON.stringify(affirmations);
          await AsyncStorage.setItem(key, jsonData);

          entitiesSynced.push(entity.name);
          console.log(`[AffirmationSync] Entity ${entity.name} synced: ${affirmations.length} affirmations`);

          // Reset retry count en caso de éxito
          this.retryCount = 0;
        } catch (error: any) {
          // Skip entidad con error pero continuar
          console.error(`[AffirmationSync] Error syncing entity ${entity.name}:`, error);
          analytics.track('affirmations_category_sync_failed', {
            categoryId: entity.name,
            error: error.message || 'Unknown error',
          });
        }
      }

      // Actualizar metadata
      await AsyncStorage.setItem(
        SYNC_KEYS.LAST_SYNC_TIMESTAMP,
        Date.now().toString()
      );
      await AsyncStorage.setItem(
        SYNC_KEYS.SYNC_VERSION,
        CURRENT_SYNC_VERSION
      );

      // Incrementar contador de éxitos
      const successCount = await AsyncStorage.getItem(SYNC_KEYS.SYNC_SUCCESS_COUNT);
      await AsyncStorage.setItem(
        SYNC_KEYS.SYNC_SUCCESS_COUNT,
        (parseInt(successCount || '0', 10) + 1).toString()
      );

      const duration = Date.now() - startTime;
      console.log(`[AffirmationSync] Sync completed: ${entitiesSynced.length}/${entities.length} entities in ${duration}ms`);

      // Track analytics
      analytics.track('affirmations_sync_completed', {
        duration,
        categoriesSynced: entitiesSynced.length,
        categoriesTotal: entities.length,
      });

      return true;
    } catch (error: any) {
      // Error global de sincronización
      const duration = Date.now() - startTime;
      console.error('[AffirmationSync] Sync failed:', error);

      // Incrementar contador de errores
      const errorCount = await AsyncStorage.getItem(SYNC_KEYS.SYNC_ERROR_COUNT);
      await AsyncStorage.setItem(
        SYNC_KEYS.SYNC_ERROR_COUNT,
        (parseInt(errorCount || '0', 10) + 1).toString()
      );

      analytics.track('affirmations_sync_failed', {
        error: error.message || 'Unknown error',
        duration,
      });

      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fetch paginado de afirmaciones para una entidad desde el API
   */
  private async fetchEntityAffirmations(
    entity: BackendEntity
  ): Promise<Affirmation[]> {
    const allAffirmations: Affirmation[] = [];
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    console.log(`[AffirmationSync] Starting fetch for entity: ${entity.name} (id: ${entity.id})`);

    while (hasMore) {
      try {
        const url = `${API_BASE_URL}/versicles/by-categories?id=${encodeURIComponent(FEED_ID || '')}&entity_ids=${encodeURIComponent(entity.id)}&limit=${limit}&random=0&offset=${offset}`;
        console.log(`[AffirmationSync] Fetching versicles: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`[AffirmationSync] Versicles response status: ${response.status} for ${entity.name}`);

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          console.error(`[AffirmationSync] Versicles error body: ${body}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: AffirmationsApiResponse = await response.json();

        // Validar estructura de respuesta
        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error(`Invalid API response: missing 'articles' array`);
        }

        console.log(`[AffirmationSync] API Response: ${data.articles.length} articles, total: ${data.total_count}`);

        // Sanitizar y transformar a formato local
        const affirmations = this.sanitizeApiResponse(data);
        allAffirmations.push(...affirmations);

        // Verificar si hay más resultados
        hasMore = data.articles.length >= limit && offset + data.articles.length < data.total_count;

        offset += data.articles.length;

        // Límite de seguridad (evitar loops infinitos)
        if (offset >= 10000) {
          console.warn(`[AffirmationSync] Reached max offset limit (10000) for entity ${entity.name}`);
          break;
        }

        // Reset retry count en caso de éxito
        this.retryCount = 0;
      } catch (error: any) {
        // Retry con backoff exponencial
        if (this.retryCount < this.MAX_RETRIES) {
          const delay = Math.pow(2, this.retryCount) * 1000; // 1s, 2s, 4s
          console.warn(`[AffirmationSync] Retry ${this.retryCount + 1}/${this.MAX_RETRIES} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          this.retryCount++;
          continue; // Reintentar el mismo offset
        }
        throw error;
      }
    }

    return allAffirmations;
  }

  /**
   * Sanitiza la respuesta del API para extraer solo los campos necesarios
   */
  private sanitizeApiResponse(data: AffirmationsApiResponse): Affirmation[] {
    return data.articles.map((item) => {
      // Extraer información de audio si existe
      let audioSource: string | undefined;
      let audioDuration: number | undefined;

      if (item.audios && item.audios.length > 0) {
        const audio = item.audios[0];
        audioSource = audio.url;
        audioDuration = audio.duration;
      }

      return {
        id: item.hashid,
        title: item.title,
        text: item.body,
        audioSource,
        audioDuration,
      };
    });
  }

  /**
   * Valida estructura de datos de afirmaciones
   */
  private validateAffirmations(affirmations: Affirmation[]): void {
    if (!Array.isArray(affirmations)) {
      throw new Error('Affirmations must be an array');
    }

    for (const affirmation of affirmations) {
      if (!affirmation.id || typeof affirmation.id !== 'string') {
        throw new Error(`Affirmation missing valid id: ${JSON.stringify(affirmation)}`);
      }
      if (!affirmation.text || typeof affirmation.text !== 'string') {
        throw new Error(`Affirmation missing valid text: ${JSON.stringify(affirmation)}`);
      }
    }
  }

  // ===========================================================================
  // Private Methods - Helpers
  // ===========================================================================

  /**
   * Obtiene el timestamp de la última sincronización
   */
  private async getLastSyncTimestamp(): Promise<number | null> {
    const value = await AsyncStorage.getItem(SYNC_KEYS.LAST_SYNC_TIMESTAMP);
    return value ? parseInt(value, 10) : null;
  }

  /**
   * Obtiene las entidades almacenadas en AsyncStorage
   */
  private async getStoredEntities(): Promise<BackendEntity[]> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_KEYS.ENTITIES);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
}

// Exportar instancia singleton del servicio
export const affirmationSyncService = new AffirmationSyncService();
