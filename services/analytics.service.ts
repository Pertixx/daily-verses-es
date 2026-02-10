// ============================================================================
// Analytics Service - Contentor Integration
// ============================================================================

import { Platform } from 'react-native';
import * as Application from 'expo-application';
import {
  AnalyticsEvent,
  AnalyticsEventProperties,
  AnalyticsEventPayload,
  AnalyticsConfig,
} from '@/types';

// Configuración por defecto
const DEFAULT_CONFIG: AnalyticsConfig = {
  feedId: 'op16l3kbxp3jvd2',
  batchSize: 10,
  flushInterval: 30000, // 30 segundos
  enabled: true,
  debug: __DEV__,
};

class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEventPayload[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;
  private deviceId: string | null = null;
  private globalProperties: AnalyticsEventProperties = {};

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initDeviceId();
    this.startFlushTimer();
  }

  // ===========================================================================
  // Inicialización
  // ===========================================================================

  /**
   * Obtiene el device ID del dispositivo
   */
  private async initDeviceId(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        this.deviceId = await Application.getIosIdForVendorAsync();
      } else if (Platform.OS === 'android') {
        this.deviceId = Application.getAndroidId();
      }
      this.log('Device ID initialized:', this.deviceId);
    } catch (error) {
      this.log('Failed to get device ID:', error);
    }
  }

  // ===========================================================================
  // Configuración
  // ===========================================================================

  /**
   * Actualiza la configuración del servicio
   */
  configure(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reiniciar timer si cambió el intervalo
    if (config.flushInterval) {
      this.stopFlushTimer();
      this.startFlushTimer();
    }
  }

  /**
   * Habilita o deshabilita el tracking
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.eventQueue = [];
    }
  }

  /**
   * Establece el ID del usuario para asociar eventos
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
    this.log('User ID set:', userId);
  }

  /**
   * Establece propiedades globales que se añaden a todos los eventos
   */
  setGlobalProperties(properties: AnalyticsEventProperties): void {
    this.globalProperties = { ...this.globalProperties, ...properties };
  }

  /**
   * Limpia las propiedades globales
   */
  clearGlobalProperties(): void {
    this.globalProperties = {};
  }

  // ===========================================================================
  // Tracking
  // ===========================================================================

  /**
   * Trackea un evento
   */
  track(event: AnalyticsEvent, properties?: AnalyticsEventProperties): void {
    if (!this.config.enabled) return;

    const payload: AnalyticsEventPayload = {
      event,
      properties: { ...this.globalProperties, ...properties },
      timestamp: Date.now(),
    };

    this.eventQueue.push(payload);
    this.log('Event queued:', event, properties);

    // Flush inmediato si alcanzamos el tamaño del batch
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // ===========================================================================
  // Métodos de conveniencia para eventos comunes
  // ===========================================================================

  /**
   * Trackea apertura de la app
   */
  trackAppOpened(): void {
    this.track('app_opened');
  }

  /**
   * Trackea que la app pasó a background
   */
  trackAppBackgrounded(): void {
    this.track('app_backgrounded');
  }

  /**
   * Trackea un paso del onboarding completado
   */
  trackOnboardingStep(step: string, stepNumber: number): void {
    this.track('onboarding_step_completed', { step, step_number: stepNumber });
  }

  /**
   * Trackea onboarding completado
   */
  trackOnboardingCompleted(durationMs?: number): void {
    this.track('onboarding_completed', { duration_ms: durationMs });
  }

  /**
   * Trackea visualización de paywall
   */
  trackPaywallViewed(source?: string): void {
    this.track('paywall_viewed', { source });
  }

  /**
   * Trackea intención de compra
   */
  trackPurchaseIntent(productId: string, source?: string): void {
    this.track('purchase_intent', { product_id: productId, source });
  }

  /**
   * Trackea compra completada
   */
  trackPurchaseCompleted(productId: string, price?: number, currency?: string): void {
    this.track('purchase_completed', { product_id: productId, price, currency });
  }

  /**
   * Trackea error
   */
  trackError(errorType: string, message: string, context?: string): void {
    this.track('error_occurred', { error_type: errorType, message, context });
  }

  /**
   * Trackea visualización de versículo
   */
  trackVerseViewed(verseId: string, category: string): void {
    this.track('verse_viewed', { verse_id: verseId, category });
  }

  /** @deprecated Usar trackVerseViewed */
  trackAffirmationViewed(affirmationId: string, category: string): void {
    this.trackVerseViewed(affirmationId, category);
  }

  /**
   * Trackea cambio de tema
   */
  trackThemeChanged(theme: string): void {
    this.track('theme_changed', { theme });
  }

  /**
   * Trackea milestone de racha
   */
  trackStreakMilestone(streakDays: number): void {
    this.track('streak_milestone_reached', { streak_days: streakDays });
  }

  // ===========================================================================
  // Flush y envío
  // ===========================================================================

  /**
   * Envía todos los eventos pendientes
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    this.log('Flushing', eventsToSend.length, 'events');

    try {
      await Promise.all(eventsToSend.map(event => this.sendEvent(event)));
      this.log('Flush completed successfully');
    } catch (error) {
      // Re-agregar eventos fallidos a la cola
      this.eventQueue = [...eventsToSend, ...this.eventQueue];
      this.log('Flush failed, events re-queued:', error);
    }
  }

  /**
   * Envía un evento individual a Contentor
   */
  private async sendEvent(payload: AnalyticsEventPayload): Promise<void> {
    const data: Record<string, unknown> = {
      feed: this.config.feedId,
      event: payload.event,
      timestamp: payload.timestamp,
      device_id: this.deviceId,
      ...payload.properties,
    };

    if (this.userId) {
      data.user = this.userId;
    }

    const url = `https://ticks.contentor.io/?d=${encodeURIComponent(JSON.stringify(data))}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.log('Event sent:', payload.event);
    } catch (error) {
      this.log('Failed to send event:', payload.event, error);
      throw error;
    }
  }

  // ===========================================================================
  // Timer management
  // ===========================================================================

  private startFlushTimer(): void {
    if (this.flushTimer) return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // ===========================================================================
  // Utilidades
  // ===========================================================================

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[Analytics]', ...args);
    }
  }

  /**
   * Obtiene el número de eventos en cola
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Limpia la cola de eventos
   */
  clearQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Destruye el servicio (limpia timers)
   */
  destroy(): void {
    this.stopFlushTimer();
    this.flush(); // Intenta enviar eventos pendientes
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Export class for testing or custom instances
export { AnalyticsService };
