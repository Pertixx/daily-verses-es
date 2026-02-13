// ============================================================================
// Deep Link Service - Manejo de deep links desde widget y notificaciones
// ============================================================================

import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { analytics } from './analytics.service';

type DeepLinkHandler = (affirmationId: string) => void;

/**
 * Servicio para manejar deep links desde widget y notificaciones
 */
class DeepLinkService {
  private pendingAffirmationId: string | null = null;
  private handler: DeepLinkHandler | null = null;
  private notificationSubscription: Notifications.EventSubscription | null = null;
  private linkingSubscription: { remove: () => void } | null = null;

  /**
   * Registra un handler para cuando se recibe un deep link con affirmationId
   */
  registerHandler(handler: DeepLinkHandler): void {
    this.handler = handler;
    
    // Si hay un ID pendiente, procesarlo inmediatamente
    if (this.pendingAffirmationId) {
      handler(this.pendingAffirmationId);
      this.pendingAffirmationId = null;
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
        const notificationType = (data?.type as string) || 'affirmation';
        
        // Trackear que el usuario abrió la app desde una notificación
        analytics.track('notification_opened', { 
          notification_type: notificationType,
          affirmation_id: data?.affirmationId as string | undefined
        });
        
        if (data?.affirmationId) {
          this.processAffirmationId(data.affirmationId as string);
        }
      }
    );

    // Verificar si la app se abrió desde una notificación
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        const notificationType = (data?.type as string) || 'affirmation';
        
        // Trackear que el usuario abrió la app desde una notificación
        analytics.track('notification_opened', { 
          notification_type: notificationType,
          affirmation_id: data?.affirmationId as string | undefined,
          is_cold_start: true
        });
        
        if (data?.affirmationId) {
          this.processAffirmationId(data.affirmationId as string);
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
   *   - tito://?id={id} (formato widget - recomendado)
   *   - tito://?affirmationId={id} (formato alternativo)
   *   - tito://affirmation/{id} (formato legacy)
   */
  private handleUrl(url: string): void {
    try {
      const parsed = Linking.parse(url);

      console.log('📱 Deep link recibido:', url);
      console.log('📱 Parsed queryParams:', JSON.stringify(parsed.queryParams));

      // Formato widget: tito://?id={id}
      if (parsed.queryParams?.id) {
        const affirmationId = parsed.queryParams.id as string;
        if (affirmationId) {
          console.log('📱 Deep link: id encontrado:', affirmationId);
          this.processAffirmationId(affirmationId);
          return;
        }
      }

      // Formato alternativo: tito://?affirmationId={id}
      if (parsed.queryParams?.affirmationId) {
        const affirmationId = parsed.queryParams.affirmationId as string;
        if (affirmationId) {
          console.log('📱 Deep link: affirmationId encontrado:', affirmationId);
          this.processAffirmationId(affirmationId);
          return;
        }
      }

      // Formato legacy: tito://affirmation/{id}
      if (parsed.hostname === 'affirmation' && parsed.path) {
        const affirmationId = parsed.path.replace(/^\//, '');
        if (affirmationId) {
          console.log('📱 Deep link: id encontrado en path:', affirmationId);
          this.processAffirmationId(affirmationId);
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
   * Procesa el ID de afirmación recibido
   */
  private processAffirmationId(affirmationId: string): void {
    console.log('📱 Deep link recibido con affirmationId:', affirmationId);
    
    if (this.handler) {
      this.handler(affirmationId);
    } else {
      // Guardar para procesarlo cuando se registre el handler
      this.pendingAffirmationId = affirmationId;
    }
  }

  /**
   * Obtiene el ID de afirmación pendiente (si existe)
   */
  getPendingAffirmationId(): string | null {
    return this.pendingAffirmationId;
  }

  /**
   * Limpia el ID pendiente
   */
  clearPendingAffirmationId(): void {
    this.pendingAffirmationId = null;
  }
}

// Exportar instancia singleton
export const deepLinkService = new DeepLinkService();
