// ============================================================================
// RevenueCat Service - Manejo de suscripciones y user ID
// ============================================================================

import Purchases, { LOG_LEVEL, PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import { storageService } from './storage.service';

const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
  android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
};

/**
 * Servicio para manejar RevenueCat y suscripciones
 */
class RevenueCatService {
  private isInitialized = false;

  /**
   * Verifica si RevenueCat está configurado y listo
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Alias para compatibilidad
   */
  canMakePurchases(): boolean {
    return this.isInitialized;
  }

  /**
   * Configura RevenueCat
   * Debe llamarse al inicio de la app
   */
  async configure(): Promise<void> {
    if (this.isInitialized) return;

    const apiKey = Platform.select({
      ios: REVENUECAT_API_KEYS.ios,
      android: REVENUECAT_API_KEYS.android,
    });

    if (!apiKey) {
      console.warn('⚠️ RevenueCat API Key no encontrada para esta plataforma');
      console.warn('   Asegúrate de tener EXPO_PUBLIC_REVENUECAT_API_KEY_IOS en tu .env');
      return;
    }

    try {
      console.log('🔧 Configurando RevenueCat...');
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      await Purchases.configure({ apiKey });
      this.isInitialized = true;
      console.log('✅ RevenueCat configurado exitosamente');
    } catch (error) {
      console.error('❌ Error al configurar RevenueCat:', error);
    }
  }

  /**
   * Obtiene o crea el ID único del usuario
   */
  async getOrCreateUserId(): Promise<string> {
    try {
      // Primero verificar si ya tenemos un userId guardado
      const storedUserId = await storageService.getUserId();
      if (storedUserId) {
        return storedUserId;
      }

      // Si RevenueCat está configurado, obtener el ID de RevenueCat
      if (this.isInitialized) {
        const customerInfo = await Purchases.getCustomerInfo();
        const userId = customerInfo.originalAppUserId;
        await storageService.setUserId(userId);
        console.log('✅ UserId obtenido de RevenueCat:', userId);
        return userId;
      }

      // Fallback: generar un ID único
      const fallbackId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storageService.setUserId(fallbackId);
      console.log('⚠️ Usando ID local:', fallbackId);
      return fallbackId;
    } catch (error) {
      console.error('Error al obtener userId:', error);
      const fallbackId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storageService.setUserId(fallbackId);
      return fallbackId;
    }
  }

  /**
   * Obtiene las ofertas disponibles
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isInitialized) {
      console.log('⚠️ RevenueCat no inicializado');
      return null;
    }
    
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current ?? null;
    } catch (error) {
      console.error('Error al obtener ofertas:', error);
      return null;
    }
  }

  /**
   * Obtiene información del cliente
   */
  async getCustomerInfo(): Promise<{ isPremium: boolean; customerInfo: CustomerInfo } | null> {
    if (!this.isInitialized) return null;
    
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;
      return { isPremium, customerInfo };
    } catch (error) {
      console.error('Error al obtener customer info:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene una suscripción activa
   */
  async hasActiveSubscription(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }
    
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
      return false;
    }
  }

  /**
   * Compra un paquete
   */
  async purchasePackage(packageToPurchase: any): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('⚠️ RevenueCat no inicializado');
      return false;
    }
    
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Error al realizar compra:', error);
      }
      return false;
    }
  }

  /**
   * Restaura compras previas
   */
  async restorePurchases(): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('⚠️ RevenueCat no inicializado');
      return false;
    }
    
    try {
      const customerInfo = await Purchases.restorePurchases();
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error) {
      console.error('Error al restaurar compras:', error);
      return false;
    }
  }

  /**
   * Agrega listener para cambios en la suscripción
   */
  addCustomerInfoUpdateListener(callback: (isPremium: boolean) => void): void {
    if (!this.isInitialized) return;
    
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;
      callback(isPremium);
    });
  }
}

// Exportar instancia singleton
export const revenueCatService = new RevenueCatService();
