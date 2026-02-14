// ============================================================================
// App Icon Service - Manejo del cambio de ícono de la app
// ============================================================================

import { storageService } from './storage.service';
import type { AppIconType } from '@/types';

// Importación dinámica para evitar crash cuando el módulo nativo no está disponible
let AlternateAppIcons: typeof import('expo-alternate-app-icons') | null = null;
let isNativeModuleAvailable = false;

try {
  AlternateAppIcons = require('expo-alternate-app-icons');
  // supportsAlternateIcons es una propiedad booleana
  isNativeModuleAvailable = AlternateAppIcons?.supportsAlternateIcons ?? false;
  console.log('📱 expo-alternate-app-icons cargado, supportsAlternateIcons:', isNativeModuleAvailable);
} catch (error) {
  console.warn('⚠️ expo-alternate-app-icons no disponible (requiere development build)');
  isNativeModuleAvailable = false;
}

/**
 * Mapeo de tipos de íconos a nombres de íconos alternativos
 * El nombre debe coincidir con lo configurado en app.json
 */
const ICON_NAME_MAP: Record<AppIconType, string | null> = {
  'default': 'TitoDefault', // Configurado como ícono alternativo explícito para evitar problemas con null
  'variant-1': 'TitoVariant1',
  'variant-2': 'TitoVariant2',
  'variant-3': 'TitoVariant3',
  'variant-4': 'TitoVariant4',
  'variant-5': 'TitoVariant5',
  'variant-6': 'TitoVariant6',
};

/**
 * Servicio para manejar el cambio de ícono de la app
 */
class AppIconService {
  /**
   * Verifica si el dispositivo soporta cambio de íconos
   */
  isSupported(): boolean {
    return isNativeModuleAvailable;
  }

  /**
   * Obtiene el ícono actual de la app
   */
  async getCurrentIcon(): Promise<AppIconType> {
    try {
      if (!AlternateAppIcons) {
        return 'default';
      }
      
      const iconName = AlternateAppIcons.getAppIconName();
      
      // Buscar el tipo de ícono basado en el nombre
      for (const [type, name] of Object.entries(ICON_NAME_MAP)) {
        if (name === iconName) {
          return type as AppIconType;
        }
      }
      
      return 'default';
    } catch (error) {
      console.error('Error al obtener ícono actual:', error);
      return 'default';
    }
  }

  /**
   * Cambia el ícono de la app
   * @param iconType - El tipo de ícono a establecer
   * @returns true si el cambio fue exitoso
   */
  async setAppIcon(iconType: AppIconType): Promise<boolean> {
    try {
      // Siempre guardamos la preferencia, incluso si no podemos cambiar el ícono ahora
      await storageService.updateProfile({ appIcon: iconType });

      if (!AlternateAppIcons || !isNativeModuleAvailable) {
        console.warn('⚠️ No se puede cambiar el ícono (requiere development build)');
        return false;
      }

      const iconName = ICON_NAME_MAP[iconType];

      // Log adicional para debug
      console.log('🔍 Intentando cambiar a:', { iconType, iconName, isSupported: isNativeModuleAvailable });

      // Intentar obtener el ícono actual primero para verificar que el módulo funciona
      const currentIcon = AlternateAppIcons.getAppIconName();
      console.log('🔍 Ícono actual:', currentIcon);

      // Si el ícono ya está activo, no hacer nada
      if (currentIcon === iconName) {
        console.log('✅ El ícono ya está activo');
        return true;
      }

      // Delay para evitar rate limiting de iOS
      // iOS limita la frecuencia de cambios de ícono
      await new Promise(resolve => setTimeout(resolve, 500));

      await AlternateAppIcons.setAlternateAppIcon(iconName);

      console.log(`✅ Ícono de app cambiado a: ${iconType}`);
      return true;
    } catch (error) {
      console.error('❌ Error al cambiar ícono de app:', error);
      // Log más detallado del error
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      return false;
    }
  }

  /**
   * Aplica el ícono guardado en las preferencias del usuario
   * Útil para aplicar el ícono premium después de la compra
   */
  async applyUserPreferredIcon(): Promise<boolean> {
    try {
      const profile = await storageService.getProfile();
      const preferredIcon = profile?.appIcon ?? 'default';
      
      return await this.setAppIcon(preferredIcon);
    } catch (error) {
      console.error('Error al aplicar ícono preferido:', error);
      return false;
    }
  }

  /**
   * Resetea al ícono por defecto
   */
  async resetToDefaultIcon(): Promise<boolean> {
    return await this.setAppIcon('default');
  }
}

// Exportar instancia singleton
export const appIconService = new AppIconService();
