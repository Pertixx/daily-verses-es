// ============================================================================
// Deep Link Service - Manejo de deep links desde widget y notificaciones
// ============================================================================

import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { analytics } from './analytics.service';

type DeepLinkHandler = (verseId: string) => void;

/**
 * Servicio para manejar deep links desde widget y notificaciones
 */
class DeepLinkService {
  private pendingVerseId: string | null = null;
  private handler: DeepLinkHandler | null = null;
  private notificationSubscription: Notifications.EventSubscription | null = null;
  private linkingSubscription: { remove: () => void } | null = null;

  /**
   * Registra un handler para cuando se recibe un deep link con verseId
   */
  registerHandler(handler: DeepLinkHandler): void {
    this.handler = handler;
    
    // Si hay un ID pendiente, procesarlo inmediatamente
    if (this.pendingVerseId) {
      handler(this.pendingVerseId);
      this.pendingVerseId = null;
    }
  }

  /**
   * Desregistra el handler
   */
  unregisterHandler(): void {
    this.handler = null;
  }

  /**
   * Inicializa los listeners de deep links y notificaciones
   * @param initialUrl URL inicial capturada antes del mount (opcional)
   */
  initialize(initialUrl?: string | null): void {
    // Escuchar deep links (desde widget)
    this.linkingSubscription = Linking.addEventListener('url', (event) => {
      this.handleUrl(event.url);
    });

    // Procesar URL inicial si fue pasada como parámetro
    if (initialUrl) {
      console.log('📱 Procesando URL inicial pasada:', initialUrl);
      this.handleUrl(initialUrl);
    }

    // Escuchar respuestas a notificaciones (cuando el usuario toca una notificación)
    this.notificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const notificationType = (data?.type as string) || 'verse';
        
        // Trackear que el usuario abrió la app desde una notificación
        analytics.track('notification_opened', { 
          notification_type: notificationType,
          verse_id: (data?.verseId || data?.affirmationId) as string | undefined
        });
        
        if (data?.verseId || data?.affirmationId) {
          this.processVerseId((data?.verseId || data?.affirmationId) as string);
        }
      }
    );

    // Verificar si la app se abrió desde una notificación
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        const notificationType = (data?.type as string) || 'verse';
        
        // Trackear que el usuario abrió la app desde una notificación
        analytics.track('notification_opened', { 
          notification_type: notificationType,
          verse_id: (data?.verseId || data?.affirmationId) as string | undefined,
          is_cold_start: true
        });
        
        if (data?.verseId || data?.affirmationId) {
          this.processVerseId((data?.verseId || data?.affirmationId) as string);
        }
      }
    });
  }

  /**
   * Limpia los listeners
   */
  cleanup(): void {
    if (this.linkingSubscription) {
      this.linkingSubscription.remove();
      this.linkingSubscription = null;
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }
  }

  /**
   * Procesa una URL de deep link
   * Formatos soportados:
   *   - versiculo://?id={id} (formato widget - recomendado)
   *   - versiculo://?verseId={id} (formato nuevo)
   *   - mimo://?id={id} (formato legacy widget)
   *   - mimo://?affirmationId={id} (formato legacy alternativo)
   *   - mimo://affirmation/{id} (formato legacy)
   */
  private handleUrl(url: string): void {
    try {
      const parsed = Linking.parse(url);

      console.log('📱 Deep link recibido:', url);
      console.log('📱 Parsed queryParams:', JSON.stringify(parsed.queryParams));

      // Formato widget: versiculo://?id={id} o mimo://?id={id}
      if (parsed.queryParams?.id) {
        const verseId = parsed.queryParams.id as string;
        if (verseId) {
          console.log('📱 Deep link: id encontrado:', verseId);
          this.processVerseId(verseId);
          return;
        }
      }

      // Formato nuevo: versiculo://?verseId={id}
      if (parsed.queryParams?.verseId) {
        const verseId = parsed.queryParams.verseId as string;
        if (verseId) {
          console.log('📱 Deep link: verseId encontrado:', verseId);
          this.processVerseId(verseId);
          return;
        }
      }

      // Formato legacy: mimo://?affirmationId={id}
      if (parsed.queryParams?.affirmationId) {
        const verseId = parsed.queryParams.affirmationId as string;
        if (verseId) {
          console.log('📱 Deep link: affirmationId (legacy) encontrado:', verseId);
          this.processVerseId(verseId);
          return;
        }
      }

      // Formato legacy: mimo://affirmation/{id}
      if (parsed.hostname === 'affirmation' && parsed.path) {
        const verseId = parsed.path.replace(/^\//, '');
        if (verseId) {
          console.log('📱 Deep link: id encontrado en path (legacy):', verseId);
          this.processVerseId(verseId);
          return;
        }
      }

      // Si llegamos aquí, la URL es válida pero sin ID (solo abre la app)
      console.log('📱 Deep link: URL sin ID, abriendo app normalmente');
    } catch (error) {
      console.error('Error parsing deep link URL:', error);
    }
  }

  /**
   * Procesa el ID de versículo recibido
   */
  private processVerseId(verseId: string): void {
    console.log('📱 Deep link recibido con verseId:', verseId);
    
    if (this.handler) {
      this.handler(verseId);
    } else {
      // Guardar para procesarlo cuando se registre el handler
      this.pendingVerseId = verseId;
    }
  }

  /**
   * Obtiene el ID de versículo pendiente (si existe)
   */
  getPendingVerseId(): string | null {
    return this.pendingVerseId;
  }

  /**
   * Limpia el ID pendiente
   */
  clearPendingVerseId(): void {
    this.pendingVerseId = null;
  }
}

// Exportar instancia singleton
export const deepLinkService = new DeepLinkService();
