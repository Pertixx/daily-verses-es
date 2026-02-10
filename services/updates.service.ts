// ============================================================================
// Updates Service - Gestión de actualizaciones OTA con expo-updates
// ============================================================================

import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

class UpdatesService {
  /**
   * Verifica si hay actualizaciones disponibles y las aplica
   * @param silent - Si es true, no muestra alertas al usuario
   */
  async checkForUpdates(silent: boolean = false): Promise<void> {
    // En desarrollo, expo-updates no funciona
    if (__DEV__) {
      console.log('📦 Updates: Modo desarrollo, saltando verificación');
      return;
    }

    try {
      console.log('📦 Verificando actualizaciones...');
      
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('📦 Actualización disponible, descargando...');
        
        // Descargar la actualización
        const fetchResult = await Updates.fetchUpdateAsync();
        
        if (fetchResult.isNew) {
          console.log('📦 Actualización descargada, lista para aplicar');
          
          if (silent) {
            // Aplicar silenciosamente al siguiente inicio
            console.log('📦 La actualización se aplicará al reiniciar la app');
          } else {
            // Preguntar al usuario si quiere reiniciar
            Alert.alert(
              '¡Actualización disponible!',
              'Hay una nueva versión disponible. ¿Deseas reiniciar la app para aplicarla?',
              [
                {
                  text: 'Más tarde',
                  style: 'cancel',
                  onPress: () => {
                    console.log('📦 Usuario pospuso la actualización');
                  },
                },
                {
                  text: 'Reiniciar',
                  onPress: async () => {
                    console.log('📦 Reiniciando para aplicar actualización...');
                    await Updates.reloadAsync();
                  },
                },
              ],
              { cancelable: false }
            );
          }
        }
      } else {
        console.log('📦 No hay actualizaciones disponibles');
      }
    } catch (error) {
      console.warn('📦 Error al verificar actualizaciones:', error);
      // No mostrar error al usuario, es un proceso de background
    }
  }

  /**
   * Obtiene información sobre la actualización actual
   */
  getCurrentUpdateInfo() {
    if (__DEV__) {
      return {
        isEmbeddedLaunch: true,
        updateId: 'development',
        channel: 'development',
      };
    }

    return {
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      updateId: Updates.updateId,
      channel: Updates.channel,
      createdAt: Updates.createdAt,
      runtimeVersion: Updates.runtimeVersion,
    };
  }

  /**
   * Fuerza el reinicio de la app para aplicar actualizaciones pendientes
   */
  async reloadApp(): Promise<void> {
    if (__DEV__) {
      console.log('📦 Updates: Modo desarrollo, no se puede recargar');
      return;
    }

    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('📦 Error al recargar la app:', error);
    }
  }
}

export const updatesService = new UpdatesService();
